import { Link, useNavigate } from "@tanstack/react-router";
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

interface ProductFormProps {
  mode: "add" | "edit";
  productId?: string;
}

export function ProductForm({ mode, productId }: ProductFormProps) {
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
      // 1. Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        navigate({ to: "/" });
        return;
      }

      // 2. Fetch the user's shop
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

      // 3. If editing, load the product's current details
      if (mode === "edit" && productId) {
        const { data: product } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .maybeSingle();

        if (product) {
          setName(product.name);
          setPrice(String(product.price));
          setDescription(product.description ?? "");
          setInStock(product.in_stock);
        } else {
          toast.error("Product not found");
          navigate({ to: "/dashboard" });
          return;
        }
      }

      // 4. Check product limit for 'add' mode
      if (mode === "add") {
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("shop_id", shop.id);

        if (count && count >= FREE_PRODUCT_LIMIT) {
          toast.error(`Free plan limited to ${FREE_PRODUCT_LIMIT} products`);
          navigate({ to: "/dashboard" });
          return;
        }
      }
      setLoading(false);
    }
    load();
  }, [mode, productId, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shopId) {
      toast.error("No shop found");
      return;
    }

    const cleanName = sanitize(name, 100);
    const priceNum = parseFloat(price);
    if (!cleanName) return toast.error("Name required");
    if (isNaN(priceNum) || priceNum < 0) return toast.error("Valid price required");

    setSaving(true);

    const payload = {
      shop_id: shopId,
      name: cleanName,
      price: priceNum,
      description: sanitize(description, 500) || null,
      in_stock: inStock,
      image_url: null, // Image upload can be added back later
    };

    let error = null;
    if (mode === "add") {
      const result = await supabase.from("products").insert(payload);
      error = result.error;
      if (!error) toast.success("Product added");
    } else {
      const result = await supabase.from("products").update(payload).eq("id", productId!);
      error = result.error;
      if (!error) toast.success("Product updated");
    }

    setSaving(false);
    if (error) {
      console.error(error);
      toast.error(`Failed to ${mode === "add" ? "add" : "update"} product`);
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="px-5 py-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
          </Button>
          <h1 className="font-bold text-foreground">
            {mode === "add" ? "Add Product" : "Edit Product"}
          </h1>
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
          {saving ? <Loader2 className="animate-spin" /> : mode === "add" ? "Add Product" : "Save Changes"}
        </Button>
      </form>
    </main>
  );
}
