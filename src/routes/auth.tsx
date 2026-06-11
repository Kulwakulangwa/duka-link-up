import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { checkSlug, suggestSlug } from "@/lib/shop.functions";
import { useServerFn } from "@tanstack/react-start";
import { slugify, slugError, sanitize } from "@/lib/dukalink";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in or create your shop — Dukalink" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const navigate = useNavigate();

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
            {mode === "signup" ? "Create your shop" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {mode === "signup" ? "Free forever for 5 products." : "Sign in to your dashboard."}
          </p>
          {mode === "signup" ? <SignupForm /> : <SigninForm />}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>Already have a shop?{" "}
                <button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">Sign in</button>
              </>
            ) : (
              <>New here?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Create a shop</button>
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
  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const check = useServerFn(checkSlug);
  const suggest = useServerFn(suggestSlug);

  // Auto-generate slug from shop name
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(shopName));
  }, [shopName, slugTouched]);

  const localError = useMemo(() => (slug ? slugError(slug) : null), [slug]);

  // Debounced availability check
  useEffect(() => {
    if (!slug) { setSlugStatus("idle"); return; }
    if (localError) { setSlugStatus("invalid"); return; }
    setSlugStatus("checking");
    const t = setTimeout(async () => {
      try {
        const res = await check({ data: { slug } });
        setSlugStatus(res.available ? "ok" : "taken");
      } catch { setSlugStatus("idle"); }
    }, 350);
    return () => clearTimeout(t);
  }, [slug, localError, check]);

  async function autoFix() {
    try {
      const res = await suggest({ data: { slug: slug || slugify(shopName) || "shop" } });
      setSlug(res.slug);
      setSlugTouched(true);
    } catch {}
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (slugStatus !== "ok") return toast.error("Pick an available shop link");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    const cleanName = sanitize(shopName, 80);
    const { data: signUp, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error || !signUp.user) { setLoading(false); return toast.error(error?.message ?? "Sign up failed"); }

    // create the shop now (RLS allows user to create their own)
    const { error: shopErr } = await supabase.from("shops").insert({
      user_id: signUp.user.id,
      slug,
      name: cleanName,
    } as any);
    setLoading(false);
    if (shopErr) {
      toast.error(shopErr.message.includes("duplicate") ? "That link was just taken. Try another." : "Could not create shop");
      return;
    }
    toast.success("Welcome to Dukalink!");
    navigate({ to: "/dashboard" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="shopName">Shop name</Label>
        <Input id="shopName" required value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Mama Asha Boutique" className="h-12" maxLength={80} />
      </div>
      <div>
        <Label htmlFor="slug">Your shop link</Label>
        <div className="flex items-stretch h-12 rounded-md border border-input bg-input/30 overflow-hidden focus-within:ring-2 focus-within:ring-ring">
          <span className="px-2 sm:px-3 flex items-center text-xs sm:text-sm text-muted-foreground bg-muted shrink-0">
            <span className="sm:hidden">/</span>
            <span className="hidden sm:inline">dukalink.app/</span>
          </span>
          <input
            id="slug"
            value={slug}
            onChange={(e) => { setSlug(e.target.value.toLowerCase()); setSlugTouched(true); }}
            placeholder="your-shop"
            maxLength={40}
            className="flex-1 min-w-0 px-3 bg-transparent outline-none text-foreground"
            autoCapitalize="off" autoCorrect="off" spellCheck={false}
          />
          <span className="px-3 flex items-center shrink-0">
            {slugStatus === "checking" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            {slugStatus === "ok" && <CheckCircle2 className="size-5 text-success" />}
            {(slugStatus === "taken" || slugStatus === "invalid") && <XCircle className="size-5 text-destructive" />}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground sm:hidden">Your link: dukalink.app/{slug || "your-shop"}</p>
        <div className="mt-1 text-xs min-h-[1.2em]">
          {localError && <span className="text-destructive">{localError}</span>}
          {!localError && slugStatus === "taken" && (
            <span className="text-destructive">
              Taken. <button type="button" onClick={autoFix} className="underline">Use a free one</button>
            </span>
          )}
          {!localError && slugStatus === "ok" && <span className="text-success">Available</span>}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" autoComplete="new-password" />
        <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
      </div>
      <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading || slugStatus !== "ok"}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Create my shop"}
      </Button>
    </form>
  );
}
