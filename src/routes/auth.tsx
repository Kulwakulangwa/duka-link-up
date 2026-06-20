import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Store } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in or create your shop — Dukalink" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const navigate = useNavigate();

  // Capture referral code from URL on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      sessionStorage.setItem('referral_code', refCode);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-green-700 via-green-600 to-teal-700 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />

      {/* Back button */}
      <header className="relative z-10 px-5 py-4 max-w-5xl w-full mx-auto">
        <Link to="/" className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors gap-1.5">
          <ArrowLeft className="size-4" /> Back
        </Link>
      </header>

      {/* Auth card */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-5 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Store className="size-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1 text-center">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-white/70 text-center mb-6">
              {mode === "signup" ? "Sign up to start your shop." : "Sign in to your dashboard."}
            </p>
            {mode === "signup" ? <SignupForm /> : <SigninForm />}
            <p className="mt-6 text-center text-sm text-white/70">
              {mode === "signup" ? (
                <>Already have an account?{" "}
                  <button
                    onClick={() => setMode("signin")}
                    className="text-white font-medium hover:underline hover:text-white/90 transition-colors"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>New here?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-white font-medium hover:underline hover:text-white/90 transition-colors"
                  >
                    Create an account
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function SigninForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/dashboard" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-white/80">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="password" className="text-white/80">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
          autoComplete="current-password"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-11 text-base font-semibold bg-white text-green-700 hover:bg-white/90 hover:text-green-800 shadow-lg shadow-black/20"
        disabled={loading}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);

    // Retrieve referral code (URL param > sessionStorage)
    const urlParams = new URLSearchParams(window.location.search);
    let refCode = urlParams.get('ref');
    if (!refCode) refCode = sessionStorage.getItem('referral_code');

    const { data: signUp, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { referral_code: refCode || null },
      },
    });

    if (error || !signUp.user) {
      setLoading(false);
      return toast.error(error?.message ?? "Sign up failed");
    }

    sessionStorage.removeItem('referral_code');
    toast.success("Account created! Now set up your shop.");
    navigate({ to: "/create-shop" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-white/80">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="password" className="text-white/80">Password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 bg-white/20 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
          autoComplete="new-password"
        />
        <p className="text-xs text-white/60 mt-1">At least 8 characters</p>
      </div>
      <Button
        type="submit"
        className="w-full h-11 text-base font-semibold bg-white text-green-700 hover:bg-white/90 hover:text-green-800 shadow-lg shadow-black/20"
        disabled={loading}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign up"}
      </Button>
    </form>
  );
}
