import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, UserPlus, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { callRemote } from "@/lib/vibe-data";
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

  const endCall = () => {
    onEnd();
    setMicOn(true);
    setCameraOn(true);
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
            Jump into a video call with a friend or start a watch party room.
          </p>
          <button
            type="button"
            onClick={() => {
              onStart();
              toast("Calling Maya Chen...");
            }}
            className="mt-8 cursor-pointer rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground uppercase tracking-widest transition-opacity hover:opacity-90"
          >
            Start a Video Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-black">
      {/* Remote video */}
      <img
        src={callRemote}
        alt="Call participant"
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />

      {/* Top bar */}
      <div className="relative z-10 flex h-16 items-center justify-center">
        <div className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 backdrop-blur-md">
          <span className="size-2 animate-pulse rounded-full bg-accent" />
          <span className="font-display text-sm font-bold tracking-tight text-white">
            Maya Chen • {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Self tile */}
      <div className="absolute top-20 right-6 z-10 w-40 overflow-hidden rounded-2xl ring-1 ring-white/20">
        {cameraOn && !hasCameraError ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-[3/4] w-full object-cover"
          />
        ) : (
          <div className="aspect-[3/4] w-full bg-secondary/80 flex flex-col items-center justify-center text-center p-4">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
              <VideoOff className="size-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Camera off</p>
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="absolute right-0 bottom-12 left-0 z-10 flex justify-center px-8">
        <div className="flex items-center gap-4 rounded-full bg-white/10 px-6 py-3 ring-1 ring-white/10 backdrop-blur-xl">
          <button
            type="button"
            aria-label={micOn ? "Mute" : "Unmute"}
            onClick={() => setMicOn((m) => !m)}
            className={cn(
              "flex size-10 items-center justify-center rounded-full transition-colors",
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
              "flex size-10 items-center justify-center rounded-full transition-colors",
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
