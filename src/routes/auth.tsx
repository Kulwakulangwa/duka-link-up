import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

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
    <main className="min-h-screen bg-background flex flex-col">
      <header className="px-5 py-4 max-w-5xl w-full mx-auto">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4 mr-1" /> Back
        </Link>
      </header>
      <div className="flex-1 px-5 pb-12 flex items-start justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {mode === "signup" ? "Sign up to start your shop." : "Sign in to your dashboard."}
          </p>
          {mode === "signup" ? <SignupForm /> : <SigninForm />}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">Sign in</button>
              </>
            ) : (
              <>New here?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Create an account</button>
              </>
            )}
          </p>
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" autoComplete="current-password" />
      </div>
      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
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
        data: { referral_code: refCode || null }   // stored in user_metadata
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" autoComplete="new-password" />
        <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
      </div>
      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign up"}
      </Button>
    </form>
  );
}
