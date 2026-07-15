import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/uccnow-logo.png";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/home" });
    }
  },
  head: () => ({
    meta: [
      { title: "UCC Now On Demand" },
      { name: "description", content: "Sermons, courses, study plans, and reflection quizzes — all in one app." },
      { property: "og:title", content: "UCC Now On Demand" },
      { property: "og:description", content: "Sermons, courses, study plans, and reflection quizzes — all in one app." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen flex flex-col px-6 pt-16 pb-10">
        <div className="flex flex-col items-center gap-8">
          <img src={logo} alt="UCC Now On Demand" width={251} height={220} className="w-56 h-auto" />
          <h1 className="sr-only">UCC Now On Demand</h1>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">Watch.</span>{" "}
            <span className="text-accent">Listen.</span>{" "}
            <span>Grow.</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Sermons, courses, and spiritual teachings in a premium streaming experience.
          </p>
        </div>

        <div className="mt-auto pt-10 space-y-3">
          <Button asChild size="lg" className="w-full h-12 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/auth" search={{ mode: "signin" }}>Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full h-12 rounded-xl text-base font-bold border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <Link to="/auth" search={{ mode: "signup" }}>Sign Up</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground pt-3">
            Don't have an account?{" "}
            <Link to="/auth" search={{ mode: "signup" }} className="text-accent font-semibold">SignUp Now</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
