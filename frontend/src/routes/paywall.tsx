import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Check, Loader2, Sparkles, CreditCard, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/paywall")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    // If already subscribed, skip paywall
    const subStr = typeof window !== "undefined" ? localStorage.getItem("graceflix_subscription") : null;
    const sub = subStr ? JSON.parse(subStr) : null;
    if (sub && sub.active) {
      throw redirect({ to: "/profiles" });
    }
    return { user: data.user };
  },
  component: PaywallPage,
});

function PaywallPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"single" | "family" | null>(null);
  
  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc || !cardName) {
      toast.error("Please fill in all payment details.");
      return;
    }

    setLoading(true);
    // Simulate API webhook delay
    setTimeout(() => {
      setLoading(false);
      setShowCheckout(false);
      
      const sub = { active: true, tier: selectedTier };
      localStorage.setItem("graceflix_subscription", JSON.stringify(sub));
      
      toast.success(`Welcome to GraceFlix! Subscribed to the ${selectedTier === "single" ? "Single User" : "Family"} Plan.`);
      navigate({ to: "/profiles" });
    }, 2000);
  };

  const handlePlanSelect = (tier: "single" | "family") => {
    setSelectedTier(tier);
    setShowCheckout(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center px-4 py-8 relative">
      <div className="mx-auto max-w-md w-full flex flex-col min-h-screen justify-between py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="text-xl font-black tracking-tighter text-white">
              GRACE<span className="text-primary">FLIX</span>
            </span>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-xs font-bold text-muted-foreground hover:text-white flex items-center gap-1 transition"
          >
            <ArrowLeft className="h-3 w-3" /> Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="my-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Unlock GraceFlix</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Unlock unlimited access to custom study courses, live streams, reflection quizzes, and scripture guides.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Card 1: Single */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card/50 flex flex-col justify-between hover:border-primary/40 transition relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 text-[10px] font-extrabold uppercase tracking-widest bg-primary/20 text-primary rounded-bl-lg">
                Individual
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Single User Plan</h3>
                <p className="text-2xl font-black mt-2 text-white">$9.99<span className="text-xs text-muted-foreground font-semibold">/month</span></p>
                
                <ul className="mt-4 space-y-2 text-xs font-semibold text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Access for 1 profile</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Full HD course streaming</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Scriptures & reflections</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Watch progress tracking</li>
                </ul>
              </div>
              <Button 
                onClick={() => handlePlanSelect("single")}
                className="mt-6 w-full h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95"
              >
                Select Plan
              </Button>
            </div>

            {/* Card 2: Family */}
            <div className="p-6 rounded-2xl border-2 border-primary bg-card/80 flex flex-col justify-between hover:border-primary/90 transition relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 text-[9px] font-black uppercase tracking-widest bg-primary text-white rounded-bl-lg">
                Best Value
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  Family Plan
                </h3>
                <p className="text-2xl font-black mt-2 text-white">$19.99<span className="text-xs text-muted-foreground font-semibold">/month</span></p>
                
                <ul className="mt-4 space-y-2 text-xs font-semibold text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Up to 5 individual sub-profiles</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Multi-profile selection screen</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Independent watchlists per profile</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary shrink-0" /> Separate quiz history per profile</li>
                </ul>
              </div>
              <Button 
                onClick={() => handlePlanSelect("family")}
                className="mt-6 w-full h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95"
              >
                Select Plan
              </Button>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-muted-foreground/60 leading-normal">
          Cancel subscription anytime. Stripe payments are encrypted and secure. By subscribing, you agree to our Terms of Service.
        </p>

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
              <div className="flex flex-col items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-extrabold text-white">Stripe Checkout</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete subscription for the <span className="text-primary font-bold uppercase">{selectedTier} Plan</span>
                </p>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        setCardNumber(val);
                      }}
                      placeholder="4242 4242 4242 4242"
                      className="w-full h-10 pl-3 pr-10 rounded-xl bg-background border border-border text-sm text-white focus:outline-none focus:border-primary font-mono"
                    />
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Expiry Date</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\//g, '');
                        if (val.length > 2) {
                          val = val.substring(0,2) + "/" + val.substring(2);
                        }
                        setExpiry(val);
                      }}
                      placeholder="MM/YY"
                      className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-white focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="•••"
                      className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm text-white focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 h-11 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin m-auto" /> : "Pay & Subscribe"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
