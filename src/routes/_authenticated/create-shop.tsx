import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { checkSlug } from "@/lib/shop.functions";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { sanitize, slugError } from "@/lib/dukalink";

export const Route = createFileRoute("/_authenticated/create-shop")({
  head: () => ({ meta: [{ title: "Create Shop — Dukalink" }] }),
  component: CreateShopPage,
});

function CreateShopPage() {
  const navigate = useNavigate();
  const check = useServerFn(checkSlug);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(value);
  };

  // Check slug availability
  const checkSlugAvailability = async () => {
    if (!slug) return;
    const err = slugError(slug);
    if (err) {
      setSlugStatus("invalid");
      return;
    }
    setSlugStatus("checking");
    const res = await check({ data: { slug } });
    setSlugStatus(res.available ? "ok" : "taken");
  };

  // Debounce slug check
  const debouncedCheck = () => {
    const timer = setTimeout(checkSlugAvailability, 500);
    return () => clearTimeout(timer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Shop name is required");
      return;
    }
    
    if (!slug) {
      toast.error("Shop link is required");
      return;
    }
    
    if (slugStatus !== "ok") {
      toast.error("Please choose an available shop link");
      return;
    }

    setSaving(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Not authenticated");
        return;
      }

      const { data: existingShop } = await supabase
        .from("shops")
        .select("id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (existingShop) {
        toast.error("You already have a shop");
        navigate({ to: "/dashboard" });
        return;
      }

      const { error } = await supabase.from("shops").insert({
        user_id: userData.user.id,
        name: sanitize(name, 80),
        description: sanitize(description, 500) || null,
        location: sanitize(location, 80) || null,
        slug: slug,
      });

      if (error) {
        console.error("Shop creation error:", error);
        toast.error("Could not create shop: " + error.message);
        return;
      }

      toast.success("Shop created successfully!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="px-5 py-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
          </Button>
          <h1 className="font-bold text-foreground">Create Your Shop</h1>
        </div>
      </header>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <div>
          <Label htmlFor="name">Shop Name *</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12"
            maxLength={80}
            placeholder="My Awesome Shop"
          />
          <p className="text-xs text-muted-foreground mt-1">Your shop's display name</p>
        </div>

        <div>
          <Label htmlFor="slug">Shop Link *</Label>
          <div className="flex items-stretch h-12 rounded-md border border-input bg-input/30 overflow-hidden focus-within:ring-2 focus-within:ring-ring mt-1.5">
            <span className="px-3 flex items-center text-sm text-muted-foreground bg-muted whitespace-nowrap">
              dukalink.app/
            </span>
            <input
              id="slug"
              value={slug}
              onChange={handleSlugChange}
              onBlur={checkSlugAvailability}
              maxLength={40}
              className="flex-1 px-3 bg-transparent outline-none text-foreground"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="your-shop-name"
            />
            <span className="px-3 flex items-center">
              {slugStatus === "checking" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              {slugStatus === "ok" && <CheckCircle2 className="size-5 text-green-500" />}
              {(slugStatus === "taken" || slugStatus === "invalid") && <XCircle className="size-5 text-red-500" />}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Use only lowercase letters, numbers, and hyphens. Must be unique.
          </p>
          {slugStatus === "taken" && (
            <p className="text-xs text-red-500 mt-1">This link is already taken</p>
          )}
          {slugStatus === "invalid" && (
            <p className="text-xs text-red-500 mt-1">
              Invalid format. Use only a-z, 0-9, and hyphens.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="location">Location (optional)</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Dar es Salaam, Tanzania"
            className="h-12"
            maxLength={80}
          />
        </div>

        <div>
          <Label htmlFor="description">About Your Shop (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Tell customers what you sell..."
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={saving || slugStatus !== "ok"}
        >
          {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          {saving ? "Creating..." : "Create Shop"}
        </Button>
      </form>
    </main>
  );
}
