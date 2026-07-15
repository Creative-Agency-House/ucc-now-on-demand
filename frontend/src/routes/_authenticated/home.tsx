import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Search, MonitorPlay, Home as HomeIcon, Bell, SlidersHorizontal, ChevronRight, Compass, Play, User, Heart, Star } from "lucide-react";
import logo from "@/assets/uccnow-logo.png";
import { VIDEOS, videosByTab, type Video } from "@/lib/videos";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [{ title: "Home — UCC Now On Demand" }],
  }),
  component: HomePage,
});

const TABS = ["Sermons", "Series", "Podcasts"] as const;

// Helper to determine mock rating
function getRating(id: string): string {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
  return (8.5 + (code % 15) / 10).toFixed(1);
}

function HomePage() {
  const navigate = useNavigate();
  useQueryClient();
  const [name, setName] = useState<string>("Friend");
  const [activeTab, setActiveTab] = useState<string>(TABS[0]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [continueList, setContinueList] = useState<{ video: Video; progress: number }[]>([]);

  // Choose first video as hero featured
  const heroVideo = VIDEOS[0];

  // Curated recommended sermons (different from hero)
  const recommendedVideos = VIDEOS.filter((v) => v.id !== heroVideo.id).slice(0, 4);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      const display = meta?.display_name || meta?.full_name || data.user?.email?.split("@")[0];
      if (display) setName(display);
    });

    if (typeof window !== "undefined") {
      // Load saved list
      const saved = localStorage.getItem("ucc_now_saved_videos");
      if (saved) setSavedIds(JSON.parse(saved));

      // Load continue watching list
      const continueStr = localStorage.getItem("ucc_now_continue_watching");
      let storedList = continueStr ? JSON.parse(continueStr) : [];
      
      // Seed default items if empty so section is visible
      if (storedList.length === 0) {
        storedList = [
          { id: "million-praise", progress: 0.45 },
          { id: "jesus-ministry", progress: 0.72 },
        ];
        localStorage.setItem("ucc_now_continue_watching", JSON.stringify(storedList));
      }

      const resolved = storedList
        .map((item: any) => {
          const v = VIDEOS.find((x) => x.id === item.id);
          return v ? { video: v, progress: item.progress } : null;
        })
        .filter(Boolean) as { video: Video; progress: number }[];

      setContinueList(resolved);
    }
  }, []);

  function handleToggleWatchlist(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    let list = [...savedIds];
    if (list.includes(id)) {
      list = list.filter((x) => x !== id);
      toast.success("Removed from Watchlist");
    } else {
      list.push(id);
      toast.success("Saved to Watchlist");
    }
    setSavedIds(list);
    localStorage.setItem("ucc_now_saved_videos", JSON.stringify(list));
  }

  // Filter content based on active tab
  const filteredVideos = VIDEOS.filter((v) => {
    if (activeTab === "Podcasts") return v.category === "Podcast";
    if (activeTab === "Series") return v.category === "Workshops" || v.category === "The Apostle's Doctrine 101";
    return v.category === "Inspirational"; // Sermons
  });

  return (
    <main className="min-h-screen bg-background text-foreground pb-28">
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        
        {/* Hero Banner Section */}
        <section className="relative w-full aspect-[3/4] overflow-hidden">
          <img
            src={heroVideo.img}
            alt={heroVideo.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/60" />

          {/* Header Overlay */}
          <header className="absolute top-0 inset-x-0 px-5 pt-6 pb-2 z-10 flex items-center justify-between">
            <Link to="/search" className="h-10 w-10 rounded-full bg-black/45 backdrop-blur flex items-center justify-center text-foreground hover:bg-black/65 transition" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            
            <div className="flex items-center gap-5 text-sm font-bold text-white/80">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`relative pb-1 transition cursor-pointer hover:text-white ${
                    activeTab === t ? "text-white after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary" : ""
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </header>

          {/* Hero Content */}
          <div className="absolute bottom-6 inset-x-0 px-5 flex flex-col justify-end">
            <div className="flex items-center gap-1.5">
              <img src={logo} alt="UCC NOW" className="h-5 w-auto" />
              <span className="text-[10px] tracking-widest uppercase font-extrabold text-white/70">Featured sermon</span>
            </div>
            
            <div className="mt-2 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-3xl font-extrabold tracking-tight drop-shadow leading-tight">{heroVideo.title}</h1>
                <p className="text-xs text-white/80 font-medium truncate mt-1">{heroVideo.speaker}</p>
              </div>

              <Link
                to="/video/$id"
                params={{ id: heroVideo.id }}
                className="h-14 w-14 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[var(--shadow-glow)] hover:scale-105 transition"
                aria-label="Play Featured"
              >
                <Play className="h-6 w-6 fill-current ml-0.5" />
              </Link>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5">
              <span className="h-1 w-5 rounded-full bg-primary" />
              <span className="h-1 w-1.5 rounded-full bg-white/40" />
              <span className="h-1 w-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        </section>

        {/* Content Rows */}
        <div className="space-y-8 mt-4">
          
          {/* Row 1: Sermons Selection */}
          <section>
            <div className="px-5 flex items-center justify-between">
              <h2 className="text-base font-extrabold tracking-tight">{activeTab} Selection</h2>
              <Link to="/explore" className="text-xs font-bold text-primary hover:underline">View All</Link>
            </div>
            
            <div className="mt-3 px-5 flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {filteredVideos.map((v) => {
                const isSaved = savedIds.includes(v.id);
                const rating = getRating(v.id);
                return (
                  <Link
                    key={v.id}
                    to="/video/$id"
                    params={{ id: v.id }}
                    className="shrink-0 w-36 flex flex-col group"
                  >
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-border bg-card shadow-lg">
                      <img
                        src={v.img}
                        alt={v.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      
                      <span className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-bold text-accent">
                        <Star className="h-2 w-2 fill-current text-yellow-500" /> {rating}
                      </span>

                      <button
                        onClick={(e) => handleToggleWatchlist(v.id, e)}
                        className={`absolute top-2 right-2 h-6 w-6 rounded-full backdrop-blur-md flex items-center justify-center transition border ${
                          isSaved 
                            ? "bg-primary/95 text-white border-primary/20" 
                            : "bg-black/60 text-white/80 border-white/10 hover:bg-black/80"
                        }`}
                        aria-label="Toggle Watchlist"
                      >
                        <Heart className={`h-3 w-3 ${isSaved ? "fill-current text-white" : ""}`} />
                      </button>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2.5 pt-6">
                        <p className="text-[10px] font-extrabold text-white leading-tight line-clamp-2">{v.title}</p>
                      </div>
                    </div>
                    <p className="mt-1 text-[9px] text-muted-foreground font-semibold truncate px-1">{v.speaker}</p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Row 2: Recommended */}
          <section>
            <div className="px-5 flex items-center justify-between">
              <h2 className="text-base font-extrabold tracking-tight">Recommended</h2>
              <Link to="/explore" className="text-xs font-bold text-primary hover:underline">View All</Link>
            </div>
            
            <div className="mt-3 px-5 flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {recommendedVideos.map((v) => {
                const isSaved = savedIds.includes(v.id);
                const rating = getRating(v.id);
                return (
                  <Link
                    key={v.id}
                    to="/video/$id"
                    params={{ id: v.id }}
                    className="shrink-0 w-36 flex flex-col group"
                  >
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-border bg-card shadow-lg">
                      <img
                        src={v.img}
                        alt={v.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      
                      <span className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-bold text-accent">
                        <Star className="h-2 w-2 fill-current text-yellow-500" /> {rating}
                      </span>

                      <button
                        onClick={(e) => handleToggleWatchlist(v.id, e)}
                        className={`absolute top-2 right-2 h-6 w-6 rounded-full backdrop-blur-md flex items-center justify-center transition border ${
                          isSaved 
                            ? "bg-primary/95 text-white border-primary/20" 
                            : "bg-black/60 text-white/80 border-white/10 hover:bg-black/80"
                        }`}
                        aria-label="Toggle Watchlist"
                      >
                        <Heart className={`h-3 w-3 ${isSaved ? "fill-current text-white" : ""}`} />
                      </button>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2.5 pt-6">
                        <p className="text-[10px] font-extrabold text-white leading-tight line-clamp-2">{v.title}</p>
                      </div>
                    </div>
                    <p className="mt-1 text-[9px] text-muted-foreground font-semibold truncate px-1">{v.speaker}</p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Row 3: Continue Watching */}
          {continueList.length > 0 && (
            <section>
              <div className="px-5 flex items-center justify-between">
                <h2 className="text-base font-extrabold tracking-tight">Continue Watching</h2>
              </div>
              
              <div className="mt-3 px-5 flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {continueList.map(({ video: v, progress }) => {
                  const isSaved = savedIds.includes(v.id);
                  const rating = getRating(v.id);
                  return (
                    <Link
                      key={v.id}
                      to="/video/$id"
                      params={{ id: v.id }}
                      className="shrink-0 w-36 flex flex-col group"
                    >
                      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-border bg-card shadow-lg">
                        <img
                          src={v.img}
                          alt={v.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        
                        <span className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-bold text-accent">
                          <Star className="h-2 w-2 fill-current text-yellow-500" /> {rating}
                        </span>

                        <button
                          onClick={(e) => handleToggleWatchlist(v.id, e)}
                          className={`absolute top-2 right-2 h-6 w-6 rounded-full backdrop-blur-md flex items-center justify-center transition border ${
                            isSaved 
                              ? "bg-primary/95 text-white border-primary/20" 
                              : "bg-black/60 text-white/80 border-white/10 hover:bg-black/80"
                          }`}
                          aria-label="Toggle Watchlist"
                        >
                          <Heart className={`h-3 w-3 ${isSaved ? "fill-current text-white" : ""}`} />
                        </button>

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-2.5 pt-6 pb-3">
                          <p className="text-[10px] font-extrabold text-white leading-tight line-clamp-2">{v.title}</p>
                        </div>

                        {/* Watch Progress Bar */}
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/25">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-[9px] text-muted-foreground font-semibold truncate px-1">{v.speaker}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

        </div>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 inset-x-0 z-20">
          <div className="mx-auto max-w-md px-6 pb-5 pt-3 bg-gradient-to-t from-background via-background/95 to-transparent">
            <div className="flex items-center justify-around bg-card/65 backdrop-blur-xl border border-border/50 py-2.5 px-4 rounded-3xl shadow-xl">
              {([
                { to: "/home", icon: HomeIcon, label: "Home", exact: true },
                { to: "/explore", icon: Compass, label: "Explore" },
                { to: "/notifications", icon: Bell, label: "Alerts" },
                { to: "/profile", icon: User, label: "Profile" },
              ] as const).map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  activeOptions={{ exact: (t as any).exact }}
                  className="flex items-center justify-center cursor-pointer"
                >
                  {({ isActive }) => (
                    isActive ? (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-[var(--shadow-glow)] animate-in fade-in duration-200">
                        <t.icon className="h-4 w-4" />
                        <span>{t.label}</span>
                      </span>
                    ) : (
                      <span className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-white transition duration-250">
                        <t.icon className="h-5 w-5" />
                      </span>
                    )
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </main>
  );
}