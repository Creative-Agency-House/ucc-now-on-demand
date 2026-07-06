import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Mail, Lock, Eye, EyeOff, User as UserIcon } from "lucide-react";
import logo from "@/assets/uccnow-logo.png";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional().default("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — UCC Now On Demand" },
      { name: "description", content: "Sign in or create an account to access sermons, events, and more." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home" });
    });
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/home" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: { display_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you're in!");
    navigate({ to: "/home" });
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/home",
    });
    if (result.error) {
      setLoading(false);
      return toast.error("Google sign-in failed");
    }
    if (result.redirected) return;
    navigate({ to: "/home" });
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen flex flex-col px-6 pt-6 pb-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mt-6 flex justify-center">
          <img src={logo} alt="UCC NOW On Demand" width={140} height={112} className="w-32 h-auto" />
        </div>

        <div className="mt-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            {tab === "signin" ? "Sign In" : "Sign Up"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {tab === "signin" ? "Fill out the credentials below :" : "Create your account to get started :"}
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="w-full mt-6">
          <TabsList className="grid grid-cols-2 w-full rounded-xl h-11 bg-card border border-border">
            <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign in</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <FieldIcon icon={Mail}>
                <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 pl-12 rounded-xl bg-card border-border" />
              </FieldIcon>
              <FieldIcon icon={Lock} trailing={
                <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground" aria-label="Toggle password">
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }>
                <Input type={showPw ? "text" : "password"} required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 pl-12 pr-12 rounded-xl bg-card border-border" />
              </FieldIcon>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                  <button type="button" onClick={() => setAutoLogin((v) => !v)} className={`relative h-5 w-9 rounded-full transition ${autoLogin ? "bg-accent" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition ${autoLogin ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                  Auto login
                </label>
                <button type="button" className="text-sm font-semibold text-accent">Forgot your Password?</button>
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 mt-4">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <FieldIcon icon={UserIcon}>
                <Input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="h-14 pl-12 rounded-xl bg-card border-border" />
              </FieldIcon>
              <FieldIcon icon={Mail}>
                <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 pl-12 rounded-xl bg-card border-border" />
              </FieldIcon>
              <FieldIcon icon={Lock} trailing={
                <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground" aria-label="Toggle password">
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }>
                <Input type={showPw ? "text" : "password"} required minLength={6} placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 pl-12 pr-12 rounded-xl bg-card border-border" />
              </FieldIcon>
              <Button type="submit" disabled={loading} size="lg" className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 mt-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or continue with</span></div>
        </div>

        <Button onClick={handleGoogle} variant="outline" size="lg" disabled={loading} className="w-full h-12 rounded-xl font-semibold gap-2 bg-card border-border">
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          Continue with Google
        </Button>

        <p className="mt-auto pt-8 text-center text-sm text-muted-foreground">
          {tab === "signin" ? "Don't Have an Account?" : "Already have an account?"}{" "}
          <button onClick={() => setTab(tab === "signin" ? "signup" : "signin")} className="text-accent font-bold">
            {tab === "signin" ? "SignUp Now" : "Sign In"}
          </button>
        </p>
      </div>
    </main>
  );
}

function FieldIcon({ icon: Icon, trailing, children }: { icon: React.ComponentType<{ className?: string }>; trailing?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
      {children}
      {trailing && <div className="absolute right-4 top-1/2 -translate-y-1/2">{trailing}</div>}
    </div>
  );
}