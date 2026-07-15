import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Radio, Calendar, Bell } from "lucide-react";
import { VIDEOS } from "@/lib/videos";

export const Route = createFileRoute("/_authenticated/live")({
  head: () => ({ meta: [{ title: "Live — UCC Now On Demand" }] }),
  component: Live,
});

const UPCOMING = [
  { id: "praise-night", when: "Friday · 7:00 PM" },
  { id: "your-time", when: "Sunday · 10:00 AM" },
  { id: "youth-rising", when: "Wed · 6:30 PM" },
];

function Live() {
  const navigate = useNavigate();
  const featured = VIDEOS[0];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-24">
        <header className="px-5 pt-6 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/home" })} className="h-9 w-9 rounded-full border border-border flex items-center justify-center" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight">Live</h1>
        </header>

        <Link to="/video/$id" params={{ id: featured.id }} className="block mx-5 mt-2 relative aspect-video overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
          <img src={featured.img} alt={featured.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
          <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-extrabold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live
          </span>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-base font-extrabold text-white drop-shadow">{featured.title}</p>
            <p className="text-xs text-white/80">{featured.speaker}</p>
          </div>
        </Link>

        <section className="mt-7">
          <p className="px-5 text-[11px] uppercase tracking-wider text-accent font-bold mb-3">Upcoming</p>
          <ul className="px-3 space-y-2">
            {UPCOMING.map((u) => {
              const v = VIDEOS.find((x) => x.id === u.id);
              if (!v) return null;
              return (
                <li key={u.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                  <span className="h-10 w-10 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{v.title}</p>
                    <p className="text-xs text-muted-foreground">{u.when}</p>
                  </div>
                  <button className="h-9 px-3 rounded-full border border-border text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5" /> Remind
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-7 px-5">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Radio className="h-3.5 w-3.5" /> Live streams are broadcast from the UCC sanctuary.
          </div>
        </section>
      </div>
    </main>
  );
}