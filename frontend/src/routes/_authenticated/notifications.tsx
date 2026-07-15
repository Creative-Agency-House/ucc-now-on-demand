import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ChevronLeft, Radio, Bell, Heart, Calendar } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — UCC Now On Demand" }] }),
  component: Notifications,
});

type N = { id: string; icon: typeof Bell; title: string; body: string; time: string; videoId?: string; unread: boolean };

const INITIAL: N[] = [
  { id: "1", icon: Radio, title: "Live now: Sunday Service", body: "Join Apostle Emmanuel live in the sanctuary.", time: "Just now", unread: true },
  { id: "2", icon: Bell, title: "New sermon released", body: "\"It's Power Time\" is now available to stream.", time: "2h ago", videoId: "power-time", unread: true },
  { id: "3", icon: Heart, title: "Saved for later", body: "A Million Praise was added to your watchlist.", time: "Yesterday", videoId: "million-praise", unread: false },
  { id: "4", icon: Calendar, title: "Upcoming event", body: "Praise Night Live streams Friday at 7pm.", time: "2d ago", videoId: "praise-night", unread: false },
];

function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL);

  function markAll() {
    setItems((arr) => arr.map((n) => ({ ...n, unread: false })));
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-24">
        <header className="px-5 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/home" })} className="h-9 w-9 rounded-full border border-border flex items-center justify-center" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight">Notifications</h1>
          <div className="flex-1" />
          <button onClick={markAll} className="text-xs font-semibold text-accent">Mark all read</button>
        </header>

        <ul className="px-3 space-y-2">
          {items.map((n) => {
            const Body = (
              <div className={`flex gap-3 p-3 rounded-2xl border transition ${n.unread ? "bg-card border-border" : "bg-transparent border-border/40"}`}>
                <span className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${n.unread ? "bg-primary/15 text-primary" : "bg-card text-muted-foreground"}`}>
                  <n.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate">{n.title}</p>
                    {n.unread && <span className="h-2 w-2 rounded-full bg-accent shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{n.time}</p>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {n.videoId ? (
                  <Link to="/video/$id" params={{ id: n.videoId }}>{Body}</Link>
                ) : (
                  Body
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}