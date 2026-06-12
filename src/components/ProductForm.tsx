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

        // 1. Get user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Not authenticated");
          navigate({ to: "/" });
          return;
        }

        // 2. Get user's shop
        const { data: shop, error: shopError } = await supabase
          .from("shops")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (shopError) {
          console.error("Shop fetch error:", shopError);
          toast.error("Error loading shop");
          navigate({ to: "/dashboard" });
          return;
        }

        if (!shop) {
          toast.error("No shop found. Please create a shop first.");
          navigate({ to: "/dashboard" });
          return;
        }

        setShopId(shop.id);

        // 3. If edit mode, load product
        if (mode === "edit") {
          if (!productId) {
            toast.error("No product ID provided");
            navigate({ to: "/dashboard" });
            return;
          }

          console.log("Fetching product with ID:", productId);
          const { data: product, error: productError } = await supabase
            .from("products")
            .select("*")
            .eq("id", productId)
            .maybeSingle();

          if (productError) {
            console.error("Product fetch error:", productError);
            toast.error("Failed to load product");
            navigate({ to: "/dashboard" });
            return;
          }

          if (!product) {
            toast.error("Product not found");
            navigate({ to: "/dashboard" });
            return;
          }

          console.log("Product loaded:", product);
          setName(product.name);
          setPrice(String(product.price));
          setDescription(product.description ?? "");
          setInStock(product.in_stock);
          setImagePath(product.image_url);
          if (product.image_url) {
            setImagePreview(product.image_url);
          }
        } else if (mode === "add") {
          // Check product limit
          const { count, error: countError } = await supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("shop_id", shop.id);

          if (countError) {
            console.error("Count error:", countError);
          }

          if ((count ?? 0) >= FREE_PRODUCT_LIMIT) {
            toast.error(`Free plan limited to ${FREE_PRODUCT_LIMIT} products`);
            navigate({ to: "/dashboard" });
            return;
          }
        }
      } catch (err) {
        console.error("Unexpected error in load:", err);
        toast.error("Something went wrong loading the form");
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

    // Upload new image if selected
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
        console.error("Upload error:", upErr);
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
      console.error("Submit error:", error);
      toast.error(`Failed to ${mode === "add" ? "add" : "update"} product`);
    } else {
      navigate({ to: "/dashboard" });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="px-5 py-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="font-bold text-foreground">
            {mode === "add" ? "Add Product" : "Edit Product"}
          </h1>
        </div>
      </header>
      <form onSubmit={onSubmit} className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {/* Photo Upload Section */}
        <div>
          <Label>Photo</Label>
          <div className="mt-1.5">
            {imagePreview ? (
              <div className="relative w-full aspect-square max-w-xs rounded-xl overflow-hidden bg-muted">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setImagePath(null);
                  }}
                  className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="block w-full aspect-square max-w-xs rounded-xl border-2 border-dashed border-border bg-card cursor-pointer hover:bg-muted/40 transition flex items-center justify-center">
                <div className="text-center px-4">
                  <Upload className="size-7 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Upload photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP · Max 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={onPickImage}
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12"
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="price">Price (TSh)</Label>
          <Input
            id="price"
            type="number"
            required
            min="0"
            step="100"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-12"
            inputMode="numeric"
          />
        </div>

        <div>
          <Label htmlFor="description">
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
          />
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
