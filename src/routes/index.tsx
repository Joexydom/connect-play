import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar, type View } from "@/components/vibe/AppSidebar";
import { WatchView } from "@/components/vibe/WatchView";
import { ChatsView } from "@/components/vibe/ChatsView";
import { CallView } from "@/components/vibe/CallView";
import { ChatPanel } from "@/components/vibe/ChatPanel";
import { liveChatMessages, liveChatReplies, liveChatReplier } from "@/lib/vibe-data";
import { useChatSimulation } from "@/lib/use-chat-simulation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vibe — Watch, Chat & Call Together" },
      {
        name: "description",
        content:
          "Vibe is where friends hang out: watch videos together, chat, and jump into video calls in one place.",
      },
      { property: "og:title", content: "Vibe — Watch, Chat & Call Together" },
      {
        property: "og:description",
        content:
          "Vibe is where friends hang out: watch videos together, chat, and jump into video calls in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VibeHome,
});

function LiveChatPanel() {
  const { messages, typing, send } = useChatSimulation(
    "live",
    liveChatMessages,
    liveChatReplies,
    liveChatReplier,
  );
  return (
    <ChatPanel
      title="Live Chat"
      messages={messages}
      typing={typing}
      typingAuthor={liveChatReplier.author}
      onSend={send}
    />
  );
}

function VibeHome() {
  const [view, setView] = useState<View>("watch");
  const [theater, setTheater] = useState(false);
  const [inCall, setInCall] = useState(false);

  const startCall = () => {
    setView("calls");
    setInCall(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {!theater && <AppSidebar active={view} onChange={setView} />}

      {view === "watch" && (
        <>
          <WatchView
            theater={theater}
            onToggleTheater={() => setTheater((t) => !t)}
            onStartCall={startCall}
          />
          {!theater && <LiveChatPanel />}
        </>
      )}

      {view === "chats" && <ChatsView onStartCall={startCall} />}

      {view === "calls" && (
        <CallView
          inCall={inCall}
          onStart={() => setInCall(true)}
          onEnd={() => setInCall(false)}
        />
      )}
    </div>
  );
}
