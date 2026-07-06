import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Search as SearchIcon, X, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { VIDEOS, CATEGORIES } from "@/lib/videos";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({ meta: [{ title: "Search — UCC Now On Demand" }] }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(term) ||
        v.speaker.toLowerCase().includes(term) ||
        v.category.toLowerCase().includes(term),
    );
  }, [q]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-24">
        <header className="px-5 pt-6 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/home" })} className="h-9 w-9 rounded-full border border-border flex items-center justify-center" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sermons, speakers…"
              className="w-full h-10 pl-9 pr-9 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-border text-foreground flex items-center justify-center" aria-label="Clear">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </header>

        {!q && (
          <section className="px-5 mt-3">
            <p className="text-[11px] uppercase tracking-wider text-accent font-bold mb-2">Browse categories</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c}
                  to="/category/$slug"
                  params={{ slug: encodeURIComponent(c) }}
                  className="px-3 h-9 rounded-full bg-card border border-border text-xs font-semibold text-foreground flex items-center"
                >
                  {c}
                </Link>
              ))}
            </div>
          </section>
        )}

        {q && results.length === 0 && (
          <p className="px-5 mt-8 text-center text-sm text-muted-foreground">No results for "{q}".</p>
        )}

        {results.length > 0 && (
          <div className="px-5 mt-4 space-y-3">
            {results.map((v) => (
              <Link key={v.id} to="/video/$id" params={{ id: v.id }} className="flex gap-3 group">
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-border">
                  <img src={v.img} alt={v.title} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold line-clamp-2">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{v.speaker}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{v.category} · {v.duration}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}