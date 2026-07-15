import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Mic, Sparkles, Wrench, BookOpen, Info, Search } from "lucide-react";
import { CATEGORIES, videosByCategory } from "@/lib/videos";

export const Route = createFileRoute("/_authenticated/explore")({
  head: () => ({ meta: [{ title: "Explore — UCC Now On Demand" }] }),
  component: Explore,
});

const ICONS: Record<string, typeof Mic> = {
  Podcast: Mic,
  Inspirational: Sparkles,
  Workshops: Wrench,
  "The Apostle's Doctrine 101": BookOpen,
  "About UCC Now": Info,
};

function Explore() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-24">
        <header className="px-5 pt-6 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="h-9 w-9 rounded-full border border-border text-foreground flex items-center justify-center"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight">Explore</h1>
          <div className="flex-1" />
          <button className="h-9 w-9 rounded-full border border-border text-muted-foreground flex items-center justify-center" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </header>

        <p className="px-5 mt-2 text-xs uppercase tracking-wider text-accent font-bold">To Watch?</p>

        <ul className="mt-3 px-2">
          {CATEGORIES.map((cat) => {
            const Icon = ICONS[cat] ?? Sparkles;
            const count = videosByCategory(cat).length;
            return (
              <li key={cat}>
                <Link
                  to="/category/$slug"
                  params={{ slug: encodeURIComponent(cat) }}
                  className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-card transition"
                >
                  <span className="h-12 w-12 shrink-0 rounded-full bg-card border border-border flex items-center justify-center text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{cat}</p>
                    <p className="text-xs text-muted-foreground">{count} {count === 1 ? "video" : "videos"}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}