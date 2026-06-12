import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { sanitize, FREE_PRODUCT_LIMIT } from "@/lib/dukalink";

export const Route = createFileRoute("/_authenticated/dashboard/add")({
  head: () => ({ meta: [{ title: "Add product — Dukalink" }] }),
  component: ProductForm,
});

function ProductForm() {
  const navigate = useNavigate();
  const [shopId, setShopId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [inStock, setInStock] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        navigate({ to: "/" });
        return;
      }

      const { data: shop } = await supabase
        .from("shops")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!shop) {
        toast.error("No shop found");
        navigate({ to: "/dashboard" });
        return;
      }

      setShopId(shop.id);

      // Check product limit
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", shop.id);

      if (count && count >= FREE_PRODUCT_LIMIT) {
        toast.error(`Free plan limited to ${FREE_PRODUCT_LIMIT} products`);
        navigate({ to: "/dashboard" });
        return;
      }

      setLoading(false);
    }
    load();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shopId) return;

    const cleanName = sanitize(name, 100);
    const priceNum = parseFloat(price);
    if (!cleanName) return toast.error("Name required");
    if (isNaN(priceNum) || priceNum < 0) return toast.error("Valid price required");

    setSaving(true);
    const { error } = await supabase.from("products").insert({
      shop_id: shopId,
      name: cleanName,
      price: priceNum,
      description: sanitize(description, 500) || null,
      in_stock: inStock,
      image_url: null,
    });

    setSaving(false);
    if (error) {
      console.error(error);
      toast.error("Failed to add product");
    } else {
      toast.success("Product added");
      navigate({ to: "/dashboard" });
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-background">
      <header className="px-5 py-4 border-b">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
          </Button>
          <h1 className="font-bold">Add Product</h1>
        </div>
      </header>
      <form onSubmit={onSubmit} className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <div>
          <Label>Product name</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Price (TSh)</Label>
          <Input type="number" required min="0" step="100" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <Label>Description (optional)</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="flex items-center justify-between">
          <Label>In stock</Label>
          <Switch checked={inStock} onCheckedChange={setInStock} />
        </div>
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? <Loader2 className="animate-spin" /> : "Add Product"}
        </Button>
      </form>
    </main>
  );
}
