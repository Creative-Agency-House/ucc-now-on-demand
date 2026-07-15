import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Plus, User, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profiles")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    // If not subscribed, go to paywall
    const subStr = typeof window !== "undefined" ? localStorage.getItem("graceflix_subscription") : null;
    const sub = subStr ? JSON.parse(subStr) : null;
    if (!sub || !sub.active) {
      throw redirect({ to: "/paywall" });
    }
    return { user: data.user, subscription: sub };
  },
  component: ProfilesPage,
});

interface Profile {
  id: string;
  name: string;
  avatar: string; // Tailwind bg-color code
}

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-purple-600",
  "bg-pink-600",
];

function ProfilesPage() {
  const { user, subscription } = Route.useLoaderData();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const storageKey = `graceflix_profiles_${user.id}`;
  const maxProfiles = subscription.tier === "family" ? 5 : 1;

  // Load profiles from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(storageKey);
    let loaded: Profile[] = [];
    if (stored) {
      try {
        loaded = JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }

    // Ensure at least one profile exists on first load
    if (loaded.length === 0) {
      const defaultName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Primary";
      loaded = [{
        id: `profile-${Date.now()}`,
        name: defaultName,
        avatar: AVATAR_COLORS[0],
      }];
      localStorage.setItem(storageKey, JSON.stringify(loaded));
    }
    setProfiles(loaded);
  }, [storageKey, user.email, user.user_metadata]);

  const handleSelectProfile = (profile: Profile) => {
    if (isEditMode) return;
    localStorage.setItem("graceflix_active_profile", JSON.stringify(profile));
    toast.success(`Switched to profile: ${profile.name}`);
    navigate({ to: "/home" });
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    if (profiles.length >= maxProfiles) {
      toast.error(`Your plan allows a maximum of ${maxProfiles} profile(s). Upgrade to the Family Plan for more.`);
      return;
    }

    const nextColor = AVATAR_COLORS[profiles.length % AVATAR_COLORS.length];
    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name: newProfileName.trim(),
      avatar: nextColor,
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewProfileName("");
    setShowAddForm(false);
    toast.success("Profile created!");
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      toast.error("You must have at least one profile.");
      return;
    }
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    
    // Clear active profile if it was deleted
    const activeStr = localStorage.getItem("graceflix_active_profile");
    if (activeStr) {
      const active = JSON.parse(activeStr);
      if (active.id === id) {
        localStorage.removeItem("graceflix_active_profile");
      }
    }
    toast.success("Profile deleted.");
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center px-6 py-8">
      <div className="mx-auto max-w-lg w-full flex flex-col min-h-screen justify-between py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6">
          <button 
            onClick={() => navigate({ to: "/paywall" })}
            className="text-xs font-bold text-muted-foreground hover:text-white flex items-center gap-1 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Manage Subscription
          </button>
        </div>

        {/* Profiles Content */}
        <div className="my-auto py-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Who's watching?</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Select a profile to start streaming customized courses and tracking progress.
          </p>

          {/* Grid */}
          <div className="flex flex-wrap justify-center gap-6 max-w-md mx-auto">
            {profiles.map((profile) => (
              <div 
                key={profile.id}
                onClick={() => handleSelectProfile(profile)}
                className="group flex flex-col items-center gap-3 cursor-pointer select-none"
              >
                {/* Profile Box Avatar */}
                <div className={`relative h-24 w-24 rounded-2xl ${profile.avatar} flex items-center justify-center text-white border-2 border-transparent group-hover:border-white transition overflow-hidden shadow-lg`}>
                  <User className="h-10 w-10 text-white/90 group-hover:scale-105 transition duration-300" />
                  
                  {/* Delete button (Edit Mode) */}
                  {isEditMode && profiles.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteProfile(profile.id, e)}
                      className="absolute inset-0 m-auto h-9 w-9 bg-black/75 hover:bg-red-600 rounded-full flex items-center justify-center text-white border border-white/20 transition"
                      aria-label="Delete Profile"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <span className="text-sm font-semibold text-muted-foreground group-hover:text-white transition leading-tight">
                  {profile.name}
                </span>
              </div>
            ))}

            {/* Add profile box */}
            {profiles.length < maxProfiles && !showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex flex-col items-center gap-3 group select-none cursor-pointer"
              >
                <div className="h-24 w-24 rounded-2xl bg-card border-2 border-dashed border-border group-hover:border-primary group-hover:bg-card/70 flex items-center justify-center text-muted-foreground group-hover:text-primary transition shadow-md">
                  <Plus className="h-8 w-8" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-white transition leading-tight">
                  Add Profile
                </span>
              </button>
            )}
          </div>

          {/* Manage Profiles / Edit mode Toggle */}
          {profiles.length > 1 && !showAddForm && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`mt-12 px-6 py-2 border rounded-xl text-xs font-bold transition tracking-wider uppercase ${
                isEditMode 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "border-muted-foreground/40 text-muted-foreground hover:text-white hover:border-white"
              }`}
            >
              {isEditMode ? "Done Editing" : "Manage Profiles"}
            </button>
          )}

          {/* Add Profile Form */}
          {showAddForm && (
            <div className="mt-12 p-6 rounded-2xl border border-border bg-card/40 max-w-sm mx-auto text-left">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Create Profile</h3>
              <form onSubmit={handleAddProfile} className="space-y-4">
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Profile Name"
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-white focus:outline-none focus:border-primary"
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 h-9 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-9 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Empty Footer spacing */}
        <div />

      </div>
    </main>
  );
}
