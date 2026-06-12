import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { checkSlug } from "@/lib/shop.functions";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { normalizeWhatsApp, sanitize, slugError } from "@/lib/dukalink";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  head: () => ({ meta: [{ title: "Shop settings — Dukalink" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const check = useServerFn(checkSlug);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shop, setShop] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [slugConfirm, setSlugConfirm] = useState(false);

  useEffect(() => {
    supabase.from("shops").select("*").maybeSingle().then(({ data }) => {
      if (data) {
        const s = data as any;
        setShop(s);
        setName(s.name ?? "");
        setDescription(s.description ?? "");
        setLocation(s.location ?? "");
        setWhatsapp(s.whatsapp_number ?? "");
        setSlug(s.slug ?? "");
      }
      setLoading(false);
    });
  }, []);

  const slugChanged = shop && slug !== shop.slug;

  useEffect(() => {
    if (!slugChanged) { setSlugStatus("idle"); return; }
    const err = slugError(slug);
    if (err) { setSlugStatus("invalid"); return; }
    setSlugStatus("checking");
    const t = setTimeout(async () => {
      const res = await check({ data: { slug } });
      setSlugStatus(res.available ? "ok" : "taken");
    }, 350);
    return () => clearTimeout(t);
  }, [slug, slugChanged, check]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    
    // ✅ FIX 1: Check if shop exists before proceeding
    if (!shop || !shop.id) {
      toast.error("No shop found. Please create a shop first.");
      return;
    }
    
    if (slugChanged && slugStatus !== "ok") return toast.error("Pick an available link");
    if (slugChanged && !slugConfirm) return toast.error("Confirm the link change");

    const updates: any = {
      name: sanitize(name, 80),
      description: sanitize(description, 500) || null,
      location: sanitize(location, 80) || null,
    };

    if (whatsapp.trim()) {
      const normalized = normalizeWhatsApp(whatsapp);
      if (!normalized) return toast.error("Enter a valid Tanzania phone (e.g. 0712345678)");
      updates.whatsapp_number = normalized;
    } else {
      updates.whatsapp_number = null;
    }

    if (slugChanged) updates.slug = slug;

    setSaving(true);
    // ✅ FIX 2: Now shop.id is guaranteed to exist due to check above
    const { error } = await supabase.from("shops").update(updates).eq("id", shop.id);
    setSaving(false);
    if (error) return toast.error("Could not save");
    toast.success("Saved");
    navigate({ to: "/dashboard" });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  // ✅ FIX 3: Handle case when no shop exists (new user)
  if (!shop) {
    return (
      <main className="min-h-screen bg-background">
        <header className="px-5 py-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
            </Button>
            <h1 className="font-bold text-foreground">Settings</h1>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-5 py-12 text-center">
          <div className="rounded-xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">No Shop Found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't created a shop yet. Create your first shop to access settings.
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="px-5 py-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button asChild variant="ghost" size="icon"><Link to="/dashboard"><ArrowLeft className="size-5" /></Link></Button>
          <h1 className="font-bold text-foreground">Settings</h1>
        </div>
      </header>
      <form onSubmit={onSave} className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <div>
          <Label htmlFor="name">Shop name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="h-12" maxLength={80} />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp number</Label>
          <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="0712 345 678" className="h-12" inputMode="tel" />
          <p className="text-xs text-muted-foreground mt-1">Used for customer orders. We'll add +255 automatically.</p>
        </div>

        <div>
          <Label htmlFor="location">Location / neighborhood</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Mwenge, Dar es Salaam" className="h-12" maxLength={80} />
        </div>

        <div>
          <Label htmlFor="description">About your shop</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} placeholder="Fresh fabrics, fast delivery." />
        </div>

        <div className="rounded-xl border border-border p-4 bg-card space-y-3">
          <div>
            <Label htmlFor="slug">Shop link</Label>
            <div className="flex items-stretch h-12 rounded-md border border-input bg-input/30 overflow-hidden focus-within:ring-2 focus-within:ring-ring mt-1.5">
              <span className="px-3 flex items-center text-sm text-muted-foreground bg-muted">dukalink.app/</span>
              <input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                maxLength={40}
                className="flex-1 px-3 bg-transparent outline-none text-foreground"
                autoCapitalize="off" autoCorrect="off" spellCheck={false}
              />
              <span className="px-3 flex items-center">
                {slugStatus === "checking" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                {slugStatus === "ok" && <CheckCircle2 className="size-5 text-success" />}
                {(slugStatus === "taken" || slugStatus === "invalid") && <XCircle className="size-5 text-destructive" />}
              </span>
            </div>
          </div>
          {slugChanged && (
            <div className="rounded-lg bg-warning/15 border border-warning/40 p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">⚠️ Your old link will stop working.</p>
              <p className="text-xs text-muted-foreground">Update your WhatsApp status, bio, and any saved links.</p>
              <label className="flex items-start gap-2 text-sm cursor-pointer pt-1">
                <Checkbox checked={slugConfirm} onCheckedChange={(v) => setSlugConfirm(v === true)} className="mt-0.5" />
                <span className="text-foreground">I understand — change the link</span>
              </label>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
        </Button>
      </form>
    </main>
  );
}
