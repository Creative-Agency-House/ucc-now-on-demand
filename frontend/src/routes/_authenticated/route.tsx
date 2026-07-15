import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // Paywall Subscription Check
    const subStr = typeof window !== "undefined" ? localStorage.getItem("graceflix_subscription") : null;
    const sub = subStr ? JSON.parse(subStr) : null;
    if (!sub || !sub.active) {
      throw redirect({ to: "/paywall" });
    }

    // Active Profile Check
    const activeProfileStr = typeof window !== "undefined" ? localStorage.getItem("graceflix_active_profile") : null;
    if (!activeProfileStr) {
      throw redirect({ to: "/profiles" });
    }
    const activeProfile = JSON.parse(activeProfileStr);

    return { user: data.user, subscription: sub, activeProfile };
  },
  component: () => <Outlet />,
});