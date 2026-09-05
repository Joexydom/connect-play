import { createFileRoute, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar, type View } from "@/components/vibe/AppSidebar";
import { WatchView } from "@/components/vibe/WatchView";
import { RoomsChatView } from "@/components/vibe/RoomsChatView";
import { PlaylistsView } from "@/components/vibe/PlaylistsView";
import { CallView } from "@/components/vibe/CallView";
import { MoviesView } from "@/components/vibe/MoviesView";
import { ChatsView } from "@/components/vibe/ChatsView";
import { ChatPanel } from "@/components/vibe/ChatPanel";
import { NotificationsPanel } from "@/components/vibe/NotificationsPanel";
import { liveChatMessages, liveChatReplies, liveChatReplier } from "@/lib/vibe-data";
import { useChatSimulation } from "@/lib/use-chat-simulation";
import { useProfile } from "@/hooks/use-profile";
import { useNotifications } from "@/hooks/use-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Vibe — Watch, Chat & Call Together" },
      {
        name: "description",
        content:
          "Vibe is where friends hang out: watch videos together, chat, and jump into video calls in one place.",
      },
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
  const { session } = useRouteContext({ from: "/_authenticated" });
  const profile = useProfile(session.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notifications = useNotifications(session.user.id);

  const [view, setView] = useState<View>("watch");
  const [theater, setTheater] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const startCall = () => {
    setView("calls");
    setInCall(true);
  };

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {!theater && (
        <AppSidebar
          active={view}
          onChange={setView}
          user={profile}
          onSignOut={handleSignOut}
          unread={notifications.unread}
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() => setNotificationsOpen((o) => !o)}
        />
      )}

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

      {view === "chats" && (
        <RoomsChatView userId={session.user.id} onStartCall={startCall} />
      )}

      {view === "movies" && <MoviesView onStartCall={startCall} />}

      {view === "direct" && <ChatsView onStartCall={startCall} />}

      {view === "playlists" && <PlaylistsView userId={session.user.id} />}

      {view === "calls" && (
        <CallView
          inCall={inCall}
          onStart={() => setInCall(true)}
          onEnd={() => setInCall(false)}
        />
      )}

      {notificationsOpen && !theater && (
        <NotificationsPanel
          items={notifications.items}
          unread={notifications.unread}
          onMarkAllRead={notifications.markAllRead}
          onDismiss={notifications.dismiss}
          onClose={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  );
}
