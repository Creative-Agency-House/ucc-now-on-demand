import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Moon, Wifi, Globe, Bell, Lock } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — UCC Now On Demand" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [pushAlerts, setPushAlerts] = useState(true);

  const toggles: { icon: typeof Moon; label: string; sub: string; value: boolean; onChange: (v: boolean) => void }[] = [
    { icon: Moon, label: "Dark theme", sub: "Use the app's cinematic dark palette", value: dark, onChange: setDark },
    { icon: Wifi, label: "Stream on Wi-Fi only", sub: "Save mobile data", value: wifiOnly, onChange: setWifiOnly },
    { icon: Globe, label: "Autoplay next video", sub: "Continue playing related content", value: autoplay, onChange: setAutoplay },
    { icon: Bell, label: "Push notifications", sub: "Alerts for new sermons & live events", value: pushAlerts, onChange: setPushAlerts },
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen pb-24">
        <header className="px-5 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/profile" })} className="h-9 w-9 rounded-full border border-border flex items-center justify-center" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight">Settings</h1>
        </header>

        <ul className="px-3 space-y-2">
          {toggles.map((t) => (
            <li key={t.label} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <span className="h-10 w-10 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <t.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.sub}</p>
              </div>
              <Switch checked={t.value} onCheckedChange={t.onChange} />
            </li>
          ))}
          <li className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
            <span className="h-10 w-10 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <Lock className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">Change password</p>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
          </li>
        </ul>

        <p className="px-5 mt-6 text-[11px] text-muted-foreground/70 text-center">GraceFlix · v1.0.0</p>
      </div>
    </main>
  );
}