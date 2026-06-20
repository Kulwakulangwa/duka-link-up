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

  // Check session and redirect
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      
      // Check if user has a shop
      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

      // If they have a shop, go to dashboard; otherwise go to create shop
      if (shop) {
        navigate({ to: "/dashboard" });
      } else {
        // Pass referral code if any
        const storedRef = sessionStorage.getItem('referral_code');
        const redirectUrl = storedRef ? `/create-shop?ref=${storedRef}` : '/create-shop';
        sessionStorage.removeItem('referral_code');
        navigate({ to: redirectUrl });
      }
    });
  }, [navigate]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth',
      },
    });
    if (error) toast.error(error.message);
  };

  return (
    <main
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: "url(/hero-seller.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
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

            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-11 bg-white/20 border-white/30 text-white hover:bg-white/30 transition-colors gap-2 mb-4"
            >
              <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative flex items-center my-4">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="mx-4 text-xs text-white/50">or</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

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
    // After sign in, the session effect will redirect appropriately
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
