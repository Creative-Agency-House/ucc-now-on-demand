import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Play } from "lucide-react";
import { videosByCategory } from "@/lib/videos";

export const Route = createFileRoute("/_authenticated/category/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${decodeURIComponent(params.slug)} — UCC Now On Demand` }],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const name = decodeURIComponent(slug);
  const items = videosByCategory(name);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-24">
        <header className="px-5 pt-6 pb-4 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/explore" })}
            className="h-9 w-9 rounded-full border border-border flex items-center justify-center"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-accent font-bold">Category</p>
            <h1 className="text-lg font-extrabold tracking-tight truncate">{name}</h1>
          </div>
        </header>

        {items.length === 0 ? (
          <p className="px-5 text-sm text-muted-foreground">No videos in this category yet.</p>
        ) : (
          <div className="px-5 space-y-3">
            {items.map((v) => (
              <Link
                key={v.id}
                to="/video/$id"
                params={{ id: v.id }}
                className="flex gap-3 group"
              >
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-border">
                  <img src={v.img} alt={v.title} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 m-auto h-8 w-8 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground line-clamp-2">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{v.speaker}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{v.duration}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}