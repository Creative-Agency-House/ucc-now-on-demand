import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, User, Bookmark, Bell, Settings, HelpCircle, LogOut, Shield, Search, RefreshCw, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { VIDEOS, type Video } from "@/lib/videos";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — GraceFlix" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("Friend");
  const [activeProfile, setActiveProfile] = useState<{ id: string; name: string; avatar: string } | null>(null);

  // Modal control states
  const [activeModal, setActiveModal] = useState<"edit" | "saved" | "privacy" | "help" | null>(null);

  // Edit Profile form states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Saved videos state
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);

  // Privacy & Security states
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [dataSharingEnabled, setDataSharingEnabled] = useState(true);

  // Help & Support states
  const [helpQuery, setHelpQuery] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  useEffect(() => {
    // Load parent user details
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setEmail(u.email ?? "");
      const meta = u.user_metadata;
      const displayName = meta?.display_name || meta?.full_name || u.email?.split("@")[0] || "Friend";
      setName(displayName);
      setEditName(displayName);
      setEditEmail(u.email ?? "");
    });

    // Load active sub-profile
    if (typeof window !== "undefined") {
      const activeStr = localStorage.getItem("graceflix_active_profile");
      if (activeStr) {
        setActiveProfile(JSON.parse(activeStr));
      }
    }
  }, []);

  // Reload saved videos whenever the saved videos modal is triggered
  useEffect(() => {
    if (activeModal === "saved" && typeof window !== "undefined") {
      const key = activeProfile ? `graceflix_watchlist_${activeProfile.id}` : "ucc_now_saved_videos";
      const savedIdsStr = localStorage.getItem(key);
      if (savedIdsStr) {
        const ids = JSON.parse(savedIdsStr) as string[];
        const filtered = VIDEOS.filter((v) => ids.includes(v.id));
        setSavedVideos(filtered);
      } else {
        setSavedVideos([]);
      }
    }
  }, [activeModal, activeProfile]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    // Clear active profile on sign out
    localStorage.removeItem("graceflix_active_profile");
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  function handleSwitchProfile() {
    localStorage.removeItem("graceflix_active_profile");
    toast.success("Logging out of profile...");
    navigate({ to: "/profiles" });
  }

  // Update profile handler
  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (typeof window === "undefined") return;

    // Update session
    const sessionStr = localStorage.getItem("ucc_now_demo_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      session.email = editEmail;
      session.user_metadata = { ...session.user_metadata, display_name: editName };
      localStorage.setItem("ucc_now_demo_session", JSON.stringify(session));
    }

    // Update user list
    const usersStr = localStorage.getItem("ucc_now_demo_users");
    if (usersStr) {
      const users = JSON.parse(usersStr);
      const userIdx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userIdx !== -1) {
        users[userIdx].email = editEmail;
        users[userIdx].name = editName;
        localStorage.setItem("ucc_now_demo_users", JSON.stringify(users));
      }
    }

    setName(editName);
    setEmail(editEmail);
    setActiveModal(null);
    toast.success("Profile details updated successfully!");
  }

  function handleClearHistory() {
    if (typeof window !== "undefined") {
      const key = activeProfile ? `graceflix_watchlist_${activeProfile.id}` : "ucc_now_saved_videos";
      localStorage.removeItem(key);
      setSavedVideos([]);
      toast.success("Watchlist cleared!");
    }
  }

  function handleSendSupport(e: React.FormEvent) {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    toast.success("Support ticket sent! We will reach out shortly.");
    setSupportMessage("");
    setActiveModal(null);
  }

  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Edit parent account", onClick: () => { setEditName(name); setEditEmail(email); setActiveModal("edit"); } },
        { icon: Bookmark, label: "Saved watchlist", onClick: () => setActiveModal("saved") },
        { icon: Bell, label: "Notifications", to: "/notifications" },
        { icon: RefreshCw, label: "Switch profile", onClick: handleSwitchProfile },
        { icon: CreditCard, label: "Manage subscription", to: "/paywall" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: Settings, label: "Settings", to: "/settings" },
        { icon: Shield, label: "Privacy & security", onClick: () => setActiveModal("privacy") },
        { icon: HelpCircle, label: "Help & support", onClick: () => setActiveModal("help") },
      ],
    },
  ];

  const faqs = [
    { q: "How do I watch live streams?", a: "Tap on the Channel/Live broadcast indicator at the top of the home screen, or click the Channel icon on the header." },
    { q: "How do I add a sermon to my saved videos?", a: "Open any sermon detail screen and click the bookmark/save button next to the play controls." },
    { q: "Are live streams recorded?", a: "Yes, once a live broadcast concludes, the recording is processed and added to the Series library." },
    { q: "Can I use the app offline?", a: "Video streaming requires an active internet connection. Saving videos is currently for online watchlists." }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(helpQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(helpQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-24">
        {/* Header */}
        <header className="px-5 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/home" })} className="h-9 w-9 rounded-full border border-border flex items-center justify-center" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight">Profile</h1>
        </header>

        {/* Profile Details card */}
        <section className="px-5 mt-2 flex items-center gap-4">
          <div className={`h-16 w-16 rounded-full ${activeProfile?.avatar || "bg-gradient-to-br from-primary to-accent"} text-white flex items-center justify-center text-2xl font-extrabold shadow-lg`}>
            {activeProfile ? activeProfile.name.charAt(0).toUpperCase() : name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold truncate">{activeProfile ? activeProfile.name : name}</p>
            <p className="text-xs text-muted-foreground truncate">{activeProfile ? `Viewer Profile • ${name}` : email}</p>
          </div>
        </section>

        {/* Sections listing */}
        <div className="mt-7 space-y-6">
          {sections.map((s) => (
            <div key={s.title}>
              <p className="px-5 text-[11px] uppercase tracking-wider text-accent font-bold mb-2">{s.title}</p>
              <ul className="px-2">
                {s.items.map((it) => {
                  const inner = (
                    <div className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-card transition">
                      <span className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground">
                        <it.icon className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-semibold flex-1">{it.label}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  );
                  return (
                    <li key={it.label}>
                      {it.to ? (
                        <Link to={it.to}>{inner}</Link>
                      ) : (
                        <button type="button" onClick={it.onClick} className="w-full text-left cursor-pointer">
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Sign Out Action */}
          <div className="px-5 pt-2">
            <button onClick={handleSignOut} className="w-full h-12 rounded-xl border border-destructive/40 text-destructive font-bold flex items-center justify-center gap-2 hover:bg-destructive/10 transition cursor-pointer">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}
      <Dialog open={activeModal === "edit"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label htmlFor="display-name" className="text-xs font-semibold text-muted-foreground">Display Name</Label>
              <Input
                id="display-name"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-12 bg-background border-border rounded-xl px-4"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email-address" className="text-xs font-semibold text-muted-foreground">Email Address</Label>
              <Input
                id="email-address"
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="h-12 bg-background border-border rounded-xl px-4"
                placeholder="email@example.com"
              />
            </div>
            <div className="pt-2 flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-xl border-border cursor-pointer">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="flex-1 h-11 bg-primary text-primary-foreground font-bold rounded-xl cursor-pointer">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= SAVED VIDEOS MODAL ================= */}
      <Dialog open={activeModal === "saved"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 text-foreground max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Saved Videos</DialogTitle>
          </DialogHeader>
          <div className="mt-3 space-y-4">
            {savedVideos.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground space-y-2">
                <Bookmark className="h-8 w-8 mx-auto stroke-1" />
                <p className="text-sm">Your watchlist is currently empty.</p>
                <p className="text-xs text-muted-foreground/80">Save sermons to watch them later here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedVideos.map((v) => (
                  <Link
                    key={v.id}
                    to="/video/$id"
                    params={{ id: v.id }}
                    onClick={() => setActiveModal(null)}
                    className="flex gap-3 group"
                  >
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border">
                      <img src={v.img} alt={v.title} loading="lazy" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 m-auto h-7 w-7 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 fill-current" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 justify-center flex flex-col">
                      <p className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition">{v.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{v.speaker}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{v.duration}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="pt-2">
              <DialogClose asChild>
                <Button className="w-full h-11 bg-muted hover:bg-muted/95 border-border rounded-xl text-foreground font-semibold cursor-pointer">Close</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= PRIVACY & SECURITY MODAL ================= */}
      <Dialog open={activeModal === "privacy"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Privacy & Security</DialogTitle>
          </DialogHeader>
          <div className="mt-3 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div>
                <p className="text-sm font-bold">Location Permissions</p>
                <p className="text-xs text-muted-foreground">Enable proximity announcements</p>
              </div>
              <Switch checked={locationEnabled} onCheckedChange={setLocationEnabled} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div>
                <p className="text-sm font-bold">Enable Biometric Login</p>
                <p className="text-xs text-muted-foreground">Use fingerprint or Face ID</p>
              </div>
              <Switch checked={biometricsEnabled} onCheckedChange={setBiometricsEnabled} />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div>
                <p className="text-sm font-bold">Personalized Data Sharing</p>
                <p className="text-xs text-muted-foreground">Share diagnostics data with UCC team</p>
              </div>
              <Switch checked={dataSharingEnabled} onCheckedChange={setDataSharingEnabled} />
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button onClick={handleClearHistory} variant="outline" className="h-11 rounded-xl border-destructive/30 hover:bg-destructive/10 text-destructive font-semibold cursor-pointer">
                Clear Saved Watchlist
              </Button>
              <DialogClose asChild>
                <Button className="h-11 bg-muted hover:bg-muted/95 rounded-xl text-foreground font-semibold cursor-pointer">Done</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= HELP & SUPPORT MODAL ================= */}
      <Dialog open={activeModal === "help"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 text-foreground max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Help & Support</DialogTitle>
          </DialogHeader>
          <div className="mt-3 space-y-4">
            {/* Search FAQ */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={helpQuery}
                onChange={(e) => setHelpQuery(e.target.value)}
                className="h-10 pl-9 rounded-xl bg-background border-border"
              />
            </div>

            {/* FAQ List */}
            <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {filteredFaqs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No matching questions found.</p>
              ) : (
                filteredFaqs.map((faq, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-background/50 border border-border/50">
                    <p className="text-xs font-bold text-foreground">{faq.q}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-normal">{faq.a}</p>
                  </div>
                ))
              )}
            </div>

            {/* Support Message form */}
            <form onSubmit={handleSendSupport} className="space-y-2 pt-2 border-t border-border/40">
              <Label htmlFor="support-message" className="text-xs font-bold">Send a Message</Label>
              <textarea
                id="support-message"
                required
                rows={3}
                placeholder="How can we assist you today? Describe your issue here..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0"
              />
              <div className="flex gap-2 pt-1">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="flex-1 h-10 rounded-xl cursor-pointer">Close</Button>
                </DialogClose>
                <Button type="submit" className="flex-1 h-10 bg-primary text-primary-foreground font-bold rounded-xl cursor-pointer">Send Message</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}