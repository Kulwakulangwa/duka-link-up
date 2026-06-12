import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { sanitize, FREE_PRODUCT_LIMIT } from "@/lib/dukalink";
import { ProductImage } from "@/components/ProductImage";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        console.log("ProductForm load - mode:", mode, "productId:", productId);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Not authenticated");
          navigate({ to: "/" });
          return;
        }

        const { data: shop, error: shopError } = await supabase
          .from("shops")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (shopError || !shop) {
          toast.error("No shop found");
          navigate({ to: "/dashboard" });
          return;
        }

        setShopId(shop.id);

        if (mode === "edit") {
          if (!productId) {
            toast.error("No product ID provided");
            navigate({ to: "/dashboard" });
            return;
          }

          const { data: product, error: productError } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .maybeSingle();

          if (productError || !product) {
            toast.error("Product not found");
            navigate({ to: "/dashboard" });
            return;
          }

          setName(product.name);
          setPrice(String(product.price));
          setDescription(product.description ?? "");
          setInStock(product.in_stock);
          setImagePath(product.image_url);
          // For existing image, we'll rely on ProductImage component, so no preview needed
          // But we keep imagePath for update reference
        } else if (mode === "add") {
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
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("Something went wrong");
        navigate({ to: "/dashboard" });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [mode, productId, navigate]);

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Use JPG, PNG, or WebP");
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      toast.error("Max 10MB");
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

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
    let finalImageUrl = imagePath;

    if (imageFile) {
      const { data: u } = await supabase.auth.getUser();
      const userId = u.user?.id;
      if (!userId) {
        setSaving(false);
        toast.error("Not signed in");
        return;
      }
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/products/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("shop-images")
        .upload(path, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type,
        });
      if (upErr) {
        setSaving(false);
        toast.error("Image upload failed: " + upErr.message);
        return;
      }
      finalImageUrl = path;
    }

    const payload = {
      shop_id: shopId,
      name: cleanName,
      price: priceNum,
      description: sanitize(description, 500) || null,
      in_stock: inStock,
      image_url: finalImageUrl,
    };

    if (mode === "add") {
      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        setSaving(false);
        toast.error("Failed to add product");
        return;
      }
      toast.success("Product added");
    } else {
      const { error } = await supabase.from("products").update(payload).eq("id", productId!);
      if (error) {
        setSaving(false);
        toast.error("Failed to update product");
        return;
      }
      toast.success("Product updated");
    }

    setSaving(false);
    navigate({ to: "/dashboard" });
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="px-5 py-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
          </Button>
          <h1 className="font-bold text-foreground">{mode === "add" ? "Add Product" : "Edit Product"}</h1>
        </div>
      </header>
      <form onSubmit={onSubmit} className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <div>
          <Label>Photo</Label>
          <div className="mt-1.5">
            {imagePreview ? (
              // New image preview (blob URL)
              <div className="relative w-full aspect-square max-w-xs rounded-xl overflow-hidden bg-muted">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : imagePath ? (
              // Existing image: use ProductImage component for signed URL
              <div className="relative w-full aspect-square max-w-xs rounded-xl overflow-hidden bg-muted">
                <ProductImage path={imagePath} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePath(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5"
                >
                  <X className="size-4" />
                </button>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white cursor-pointer opacity-0 hover:opacity-100 transition">
                  <Upload className="size-6" />
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onPickImage} />
                </label>
              </div>
            ) : (
              <label className="block w-full aspect-square max-w-xs rounded-xl border-2 border-dashed border-border bg-card cursor-pointer hover:bg-muted/40 transition flex items-center justify-center">
                <div className="text-center px-4">
                  <Upload className="size-7 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Upload photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP · Max 10MB</p>
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onPickImage} />
              </label>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="name">Product name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="h-12" maxLength={100} />
        </div>

        <div>
          <Label htmlFor="price">Price (TSh)</Label>
          <Input id="price" type="number" required min="0" step="100" value={price} onChange={(e) => setPrice(e.target.value)} className="h-12" inputMode="numeric" />
        </div>

        <div>
          <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
          <div>
            <p className="font-medium text-foreground">In stock</p>
            <p className="text-xs text-muted-foreground">Customers can order this product</p>
          </div>
          <Switch checked={inStock} onCheckedChange={setInStock} />
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : mode === "add" ? "Add Product" : "Save Changes"}
        </Button>
      </form>
    </main>
  );
}
