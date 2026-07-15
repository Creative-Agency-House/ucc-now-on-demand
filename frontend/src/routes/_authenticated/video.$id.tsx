import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { ChevronLeft, Play, Pause, Share2, Bookmark, Volume2, VolumeX, Maximize, Loader2, Heart, Star, Download, Plus, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getVideo, VIDEOS } from "@/lib/videos";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/video/$id")({
  head: ({ params }) => {
    const v = getVideo(params.id);
    return {
      meta: [
        { title: `${v?.title ?? "Video"} — UCC Now On Demand` },
        { name: "description", content: v?.description ?? "Watch on UCC Now On Demand." },
      ],
    };
  },
  loader: ({ params }) => {
    const video = getVideo(params.id);
    if (!video) throw notFound();
    return { video };
  },
  component: VideoDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">Video not found.</div>
  ),
});

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return h ? `${h}:${mm}:${String(s).padStart(2, "0")}` : `${mm}:${String(s).padStart(2, "0")}`;
}

// Helper to determine mock rating
function getRating(id: string): string {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
  return (8.5 + (code % 15) / 10).toFixed(1);
}

function VideoDetail() {
  const { video } = Route.useLoaderData();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const related = VIDEOS.filter((v) => v.id !== video.id).slice(0, 4);
  const rating = getRating(video.id);

  // Reset state when switching videos
  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setTotal(0);
    setError(null);
    const el = videoRef.current;
    if (el) {
      el.load();
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ucc_now_saved_videos');
      if (saved) {
        const ids = JSON.parse(saved) as string[];
        setIsSaved(ids.includes(video.id));
      } else {
        setIsSaved(false);
      }
    }
  }, [video.id]);

  // Fullscreen change listeners to auto-pause when exiting fullscreen
  useEffect(() => {
    const videoEl = videoRef.current;
    
    function onExitFullscreen() {
      const isFs = document.fullscreenElement || (document as any).webkitFullscreenElement;
      if (!isFs) {
        setPlaying(false);
        if (videoEl) {
          videoEl.pause();
        }
      }
    }

    document.addEventListener("fullscreenchange", onExitFullscreen);
    document.addEventListener("webkitfullscreenchange", onExitFullscreen);
    if (videoEl) {
      videoEl.addEventListener("webkitendfullscreen", onExitFullscreen);
    }

    return () => {
      document.removeEventListener("fullscreenchange", onExitFullscreen);
      document.removeEventListener("webkitfullscreenchange", onExitFullscreen);
      if (videoEl) {
        videoEl.removeEventListener("webkitendfullscreen", onExitFullscreen);
      }
    };
  }, []);

  // Exit fullscreen when playing is set to false (e.g. Back button clicked inside video player overlay)
  useEffect(() => {
    if (!playing) {
      const isFs = document.fullscreenElement || (document as any).webkitFullscreenElement;
      if (isFs) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    }
  }, [playing]);

  function scheduleHide() {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowControls(false), 2800);
  }

  function reveal() {
    setShowControls(true);
    if (playing) scheduleHide();
  }

  async function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    try {
      if (el.paused) {
        await el.play();
      } else {
        el.pause();
      }
    } catch (e) {
      setError("Playback was blocked. Tap play to try again.");
    }
  }

  function toggleMute() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = videoRef.current;
    if (!el || !total) return;
    const t = (Number(e.target.value) / 1000) * total;
    el.currentTime = t;
    setCurrent(t);
  }

  async function toggleFullscreen() {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    } else {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      }
    }
  }

  async function handlePlayClick() {
    setPlaying(true);
    const wrap = wrapRef.current;
    const videoElement = videoRef.current;
    
    if (videoElement) {
      try {
        await videoElement.play();
      } catch (e) {
        console.warn("Play request failed:", e);
      }
    }

    if (wrap) {
      try {
        if (wrap.requestFullscreen) {
          await wrap.requestFullscreen();
        } else if ((wrap as any).webkitRequestFullscreen) {
          await (wrap as any).webkitRequestFullscreen();
        } else if (videoElement && (videoElement as any).webkitEnterFullscreen) {
          // iOS Safari fallback
          await (videoElement as any).webkitEnterFullscreen();
        }
      } catch (e) {
        console.warn("Fullscreen request blocked:", e);
      }
    }
  }

  function toggleSave() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('ucc_now_saved_videos');
    let ids = saved ? (JSON.parse(saved) as string[]) : [];
    if (ids.includes(video.id)) {
      ids = ids.filter(id => id !== video.id);
      setIsSaved(false);
      toast.success("Removed from Watchlist");
    } else {
      ids.push(video.id);
      setIsSaved(true);
      toast.success("Saved to Watchlist");
    }
    localStorage.setItem('ucc_now_saved_videos', JSON.stringify(ids));
  }

  function handleDownload() {
    toast.error("Offline downloading is not enabled in this version.");
  }

  function handleShare() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        
        {/* Top Poster / Player Container */}
        <div className="relative w-full aspect-[4/5] bg-black overflow-hidden z-0">
          {/* Active HTML5 video stream player */}
          <div
            ref={wrapRef}
            className={`relative w-full h-full select-none ${playing ? "block" : "hidden"}`}
            onMouseMove={reveal}
            onClick={reveal}
          >
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.img}
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-contain bg-black"
              onClick={togglePlay}
              onPlay={() => { setPlaying(true); scheduleHide(); }}
              onPause={() => { setPlaying(false); setShowControls(true); }}
              onTimeUpdate={(e) => {
                const cur = e.currentTarget.currentTime;
                setCurrent(cur);
                if (total > 0 && typeof window !== 'undefined') {
                  const progress = cur / total;
                  const curWatchStr = localStorage.getItem('ucc_now_continue_watching');
                  let curWatch = curWatchStr ? JSON.parse(curWatchStr) : [];
                  curWatch = curWatch.filter((item: any) => item.id !== video.id);
                  curWatch.unshift({ id: video.id, progress });
                  localStorage.setItem('ucc_now_continue_watching', JSON.stringify(curWatch.slice(0, 5)));
                }
              }}
              onLoadedMetadata={(e) => setTotal(e.currentTarget.duration || 0)}
              onDurationChange={(e) => setTotal(e.currentTarget.duration || 0)}
              onWaiting={() => setBuffering(true)}
              onPlaying={() => setBuffering(false)}
              onCanPlay={() => setBuffering(false)}
              onEnded={() => { setPlaying(false); setShowControls(true); }}
              onError={() => { setError("Couldn't load this stream."); setBuffering(false); }}
            />

            {/* Player Top back action */}
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/70 to-transparent transition-opacity ${
                showControls ? "opacity-100" : "opacity-0"
              }`}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setPlaying(false); }}
              className={`absolute top-3 left-3 h-9 w-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center transition-opacity ${
                showControls ? "opacity-100" : "opacity-0"
              }`}
              aria-label="Stop Player"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Loader */}
            {buffering && !error && (
              <div className="absolute inset-0 m-auto h-12 w-12 flex items-center justify-center text-white">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            )}

            {/* Error fallback */}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-sm gap-2 px-6 text-center bg-black/60">
                <p>{error}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setError(null); videoRef.current?.load(); }}
                  className="mt-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Player controls */}
            <div
              className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="range"
                min={0}
                max={1000}
                value={total ? (current / total) * 1000 : 0}
                onChange={seek}
                aria-label="Seek"
                className="w-full h-1 accent-primary cursor-pointer"
              />
              <div className="mt-1 flex items-center gap-3 text-white text-xs">
                <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                  {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                </button>
                <button onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <span className="font-medium tabular-nums">
                  {fmt(current)} <span className="text-white/60">/ {fmt(total)}</span>
                </span>
                <div className="flex-1" />
                <button onClick={toggleFullscreen} aria-label="Fullscreen">
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tall poster display with glassy play button overlay */}
          <div className={`relative w-full h-full ${playing ? "hidden" : "block"}`}>
            <img
              src={video.img}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-black/45" />

            {/* Header icons */}
            <button
              onClick={() => navigate({ to: "/home" })}
              className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-black/60 transition"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={toggleSave}
              className={`absolute top-4 right-4 h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center border transition ${
                isSaved ? "bg-primary/95 text-white border-primary/20" : "bg-black/40 text-white/90 border-white/10"
              }`}
              aria-label="Save watchlist"
            >
              <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
            </button>

            {/* Central Glassmorphic play button */}
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl hover:scale-105 hover:bg-white/25 transition cursor-pointer"
              aria-label="Play video"
            >
              <Play className="h-9 w-9 fill-current ml-1" />
            </button>
          </div>
        </div>

        {/* Title Details Card container */}
        <section className="relative px-5 pt-6 pb-2 -mt-8 bg-background rounded-t-3xl z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {/* Title & year */}
              <h1 className="text-2xl font-extrabold tracking-tight">{video.title} ({new Date().getFullYear()})</h1>
              <p className="text-sm text-muted-foreground font-semibold mt-1">{video.speaker}</p>

              {/* Metadata Badges */}
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-card border border-border text-muted-foreground">16+</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-card border border-border text-muted-foreground">HD</span>
                <span className="flex items-center gap-0.5 text-xs font-bold text-accent">
                  <Star className="h-3.5 w-3.5 fill-current text-yellow-500" /> {rating}
                </span>
              </div>
            </div>

            {/* Red Reviews/Views button */}
            <div className="flex flex-col items-center">
              <span className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center shadow-lg">
                <Star className="h-4 w-4 fill-current text-white" />
                <span className="text-[8px] font-bold mt-0.5">UCC</span>
              </span>
              <span className="text-[10px] font-bold text-primary mt-1.5">Rating</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 flex items-center justify-around border-y border-border/40 py-4">
            <button
              onClick={toggleSave}
              className="flex flex-col items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-white transition"
            >
              {isSaved ? <Check className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5" />}
              <span>Watchlist</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex flex-col items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-white transition"
            >
              <Download className="h-5 w-5" />
              <span>Download</span>
            </button>

            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-white transition"
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </section>

        {/* Description Section */}
        <section className="px-5 mt-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-primary">Description</h2>
          <p className="text-xs text-muted-foreground font-semibold mt-1">{video.category} • {video.duration}</p>
        </section>

        {/* Overview Section */}
        <section className="px-5 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-white/90">Overview</h2>
            <span className="text-[10px] font-bold text-muted-foreground">Mon, 25 Jun 2026</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-medium">{video.description} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Curabitur porta elementum magna ut scelerisque. Curabitur feugiat augue at purus porttitor, id tristique purus porta.</p>
        </section>

        {/* Related Section ("Up Next") */}
        <section className="mt-8 mb-10">
          <h2 className="px-5 text-sm font-extrabold uppercase tracking-widest text-white/90">Up Next</h2>
          <div className="mt-3 px-5 flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {related.map((r) => (
              <Link
                key={r.id}
                to="/video/$id"
                params={{ id: r.id }}
                className="shrink-0 w-36 group"
              >
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-border bg-card">
                  <img
                    src={r.img}
                    alt={r.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-350 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <p className="absolute bottom-2 left-2.5 right-2.5 text-[10px] font-bold text-white drop-shadow line-clamp-2 leading-tight">{r.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}