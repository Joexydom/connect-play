import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { MessagesSquare, MonitorPlay, Phone, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import streamCyberpunk from "@/assets/stream-cyberpunk.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vibe — Watch, Chat & Call Together" },
      {
        name: "description",
        content:
          "Vibe is where friends hang out: watch videos together, chat, and jump into video calls in one place. Create your free account.",
      },
      { property: "og:title", content: "Vibe — Watch, Chat & Call Together" },
      {
        property: "og:description",
        content:
          "Vibe is where friends hang out: watch videos together, chat, and jump into video calls in one place. Create your free account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/app" });
    }
  },
  component: Landing,
});

const features = [
  { icon: MonitorPlay, title: "Watch together", text: "Stream videos side-by-side with live reactions." },
  { icon: MessagesSquare, title: "Chat that never sleeps", text: "Live chat rooms and DMs with your crew." },
  { icon: Phone, title: "Jump on a call", text: "One tap from chat to a face-to-face video call." },
];

function Landing() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background font-sans text-foreground">
      {/* Backdrop */}
      <img
        src={streamCyberpunk}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent font-display text-lg font-bold tracking-tighter text-background">
            V
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Vibe</span>
        </div>
        <Link
          to="/auth"
          className="rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-secondary"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl font-display text-5xl font-bold leading-tight tracking-tight">
          Watch, chat and call —{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            together
          </span>
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Vibe is your crew's living room on the internet. Create an account and bring your people.
        </p>
        <Link
          to="/auth"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Create your account
          <ArrowRight className="size-4" />
        </Link>

        <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/60 bg-background/50 p-5 text-left backdrop-blur-xl"
            >
              <f.icon className="size-6 text-accent" />
              <div className="mt-3 text-sm font-semibold">{f.title}</div>
              <p className="mt-1 text-xs text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
