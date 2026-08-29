import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, UserPlus, Users, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { callRemote, friends } from "@/lib/vibe-data";
import { cn } from "@/lib/utils";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function CallView({
  inCall,
  onStart,
  onEnd,
}: {
  inCall: boolean;
  onStart: () => void;
  onEnd: () => void;
}) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [conference, setConference] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasCameraError, setHasCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer
  useEffect(() => {
    if (!inCall) {
      setDuration(0);
      return;
    }
    const id = window.setInterval(() => setDuration((d) => d + 1), 1000);
    return () => window.clearInterval(id);
  }, [inCall]);

  // Camera stream
  useEffect(() => {
    if (!inCall || !cameraOn) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }
    setHasCameraError(false);
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        setHasCameraError(true);
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [inCall, cameraOn]);

  const startCall = (isConference: boolean) => {
    setConference(isConference);
    onStart();
    if (isConference) {
      toast(`Conference started with ${friends.filter((f) => f.online).length} friends`);
    } else {
      toast("Calling Maya Chen...");
    }
  };

  const endCall = () => {
    onEnd();
    setMicOn(true);
    setCameraOn(true);
    setConference(false);
    setHasCameraError(false);
  };

  if (!inCall) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center bg-background px-8">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-secondary/50">
            <PhoneOff className="size-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">No active call</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Jump into a one-on-one video call or start a conference with the whole crew.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => startCall(false)}
              className="cursor-pointer rounded-full bg-accent px-6 py-3 text-sm font-bold tracking-widest text-accent-foreground uppercase transition-opacity hover:opacity-90"
            >
              Start a Video Call
            </button>
            <button
              type="button"
              onClick={() => startCall(true)}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold tracking-widest text-primary-foreground uppercase transition-opacity hover:opacity-90"
            >
              <Users className="size-4" />
              Start Conference
            </button>
          </div>
        </div>
      </div>
    );
  }

  const onlineFriends = friends.filter((f) => f.online);

  const selfTile = (
    <div className="relative h-full w-full overflow-hidden bg-secondary/80">
      {cameraOn && !hasCameraError ? (
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <VideoOff className="size-6 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">Camera off</p>
        </div>
      )}
      <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
        You
      </span>
    </div>
  );

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-black">
      {conference ? (
        /* Conference grid */
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 p-4 pb-28 lg:grid-cols-3">
          {onlineFriends.map((f, i) => (
            <div
              key={f.handle}
              className={cn(
                "relative overflow-hidden rounded-2xl ring-1 ring-white/10",
                i === 0 && onlineFriends.length % 2 === 1 && "lg:col-span-1",
              )}
            >
              <img src={f.avatar} alt={f.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                {f.name}
              </span>
              {i === 0 ? (
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                  <Mic className="size-3 text-accent" />
                </span>
              ) : (
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                  <MicOff className="size-3 text-muted-foreground" />
                </span>
              )}
            </div>
          ))}
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-accent/40">
            {selfTile}
          </div>
        </div>
      ) : (
        <>
          {/* Remote video */}
          <img
            src={callRemote}
            alt="Call participant"
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />

          {/* Self tile */}
          <div className="absolute top-20 right-6 z-10 aspect-[3/4] w-40 overflow-hidden rounded-2xl ring-1 ring-white/20">
            {selfTile}
          </div>
        </>
      )}

      {/* Top bar */}
      <div className="absolute top-0 right-0 left-0 z-10 flex h-16 items-center justify-center">
        <div className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 backdrop-blur-md">
          <span className="size-2 animate-pulse rounded-full bg-accent" />
          <span className="font-display text-sm font-bold tracking-tight text-white">
            {conference
              ? `Conference • ${onlineFriends.length + 1} people • ${formatDuration(duration)}`
              : `Maya Chen • ${formatDuration(duration)}`}
          </span>
        </div>
      </div>

      {/* Call controls */}
      <div className="absolute right-0 bottom-12 left-0 z-10 flex justify-center px-8">
        <div className="flex items-center gap-4 rounded-full bg-white/10 px-6 py-3 ring-1 ring-white/10 backdrop-blur-xl">
          <button
            type="button"
            aria-label={micOn ? "Mute" : "Unmute"}
            onClick={() => setMicOn((m) => !m)}
            className={cn(
              "flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors",
              micOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-destructive/20 text-destructive",
            )}
          >
            {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </button>
          <button
            type="button"
            aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
            onClick={() => setCameraOn((c) => !c)}
            className={cn(
              "flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors",
              cameraOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-destructive/20 text-destructive",
            )}
          >
            {cameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </button>
          <button
            type="button"
            onClick={() => toast.success("Invite sent to the group chat")}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
          >
            <UserPlus className="size-4" />
            Invite
          </button>
          <button
            type="button"
            onClick={endCall}
            className="flex size-12 cursor-pointer items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-transform hover:scale-105 active:scale-95"
            aria-label="End call"
          >
            <PhoneOff className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
