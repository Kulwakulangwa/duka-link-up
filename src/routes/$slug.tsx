import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductImage } from "@/components/ProductImage";
import { Button } from "@/components/ui/button";
import { Store, MapPin, Clock, Phone, Share2, Check } from "lucide-react";
import { formatTsh } from "@/lib/dukalink";
import { toast } from "sonner";

export const Route = createFileRoute("/$slug")({
  component: ShopPage,
});

type Shop = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  whatsapp_number: string | null;
  location: string | null;
  avatar_signed_url: string | null;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_signed_url: string | null;
  in_stock: boolean;
};

function ShopPage() {
  const { slug } = Route.useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadShop() {
      try {
        // Fetch shop and products using the existing server function or direct API
        const response = await fetch(`/api/shop/${slug}`);
        if (!response.ok) {
          throw new Error("Shop not found");
        }
        const data = await response.json();
        setShop(data.shop);
        setProducts(data.products);
      } catch (err) {
        console.error(err);
        setShop(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, [slug]);

  // Alternative: use direct Supabase if server function not set up
  // This is a fallback – but the above fetch is cleaner if you have an API route
  useEffect(() => {
    async function fallbackLoad() {
      if (shop) return; // already loaded via fetch
      const { data: shopData } = await supabase
        .from("shops")
        .select("id, slug, name, description, whatsapp_number, location, avatar_url, created_at")
        .eq("slug", slug)
        .maybeSingle();
      if (!shopData) return;
      // Get signed avatar URL
      let avatar_signed_url = null;
      if (shopData.avatar_url) {
        const { data: signedUrl } = await supabase.storage
          .from("shop-images")
          .createSignedUrl(shopData.avatar_url, 60 * 60 * 24);
        avatar_signed_url = signedUrl?.signedUrl || null;
      }
      setShop({ ...shopData, avatar_signed_url });
      // Load products
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, price, description, image_url, in_stock")
        .eq("shop_id", shopData.id)
        .eq("in_stock", true)
        .order("created_at", { ascending: false });
      const productsWithSigned = await Promise.all(
        (productsData || []).map(async (p: any) => {
          let image_signed_url = null;
          if (p.image_url) {
            const { data: signed } = await supabase.storage
              .from("shop-images")
              .createSignedUrl(p.image_url, 60 * 60 * 24);
            image_signed_url = signed?.signedUrl || null;
          }
          return { ...p, image_signed_url };
        })
      );
      setProducts(productsWithSigned);
      setLoading(false);
    }
    if (!shop && !loading) fallbackLoad();
  }, [slug, shop, loading]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const handleWhatsAppOrder = (productName?: string) => {
    if (!shop?.whatsapp_number) {
      toast.error("Shop WhatsApp number not set");
      return;
    }
    const phone = shop.whatsapp_number.startsWith("+") ? shop.whatsapp_number : `+255${shop.whatsapp_number.slice(-9)}`;
    let message = `Hello! I'm interested in products from ${shop.name}.`;
    if (productName) {
      message = `Hello! I'd like to order "${productName}" from ${shop.name}.`;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const shareShop = async () => {
    const url = window.location.href;
    try {
      await navigator.share({ title: shop?.name, url });
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Store className="size-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Shop not found</h1>
        <p className="text-muted-foreground mb-4">
          The shop you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <a href="/">Go home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with shop name and share */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {shop.avatar_signed_url && (
              <img src={shop.avatar_signed_url} alt={shop.name} className="size-8 rounded-full object-cover" />
            )}
            <span className="font-semibold truncate">{shop.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={shareShop}>
            {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Shop info card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {shop.avatar_signed_url && (
              <img
                src={shop.avatar_signed_url}
                alt={shop.name}
                className="size-20 rounded-full object-cover border"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              {shop.location && (
                <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                  <MapPin className="size-3" />
                  <span>{shop.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground text-xs mt-2">
                <Clock className="size-3" />
                <span>Selling since {formatDate(shop.created_at)}</span>
              </div>
            </div>
          </div>
          {shop.description && (
            <p className="mt-4 text-foreground/80 border-t border-border pt-4">
              {shop.description}
            </p>
          )}
          {shop.whatsapp_number && (
            <Button
              onClick={() => handleWhatsAppOrder()}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="size-4 mr-2" /> Contact shop on WhatsApp
            </Button>
          )}
        </div>

        {/* Products section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-2xl">
              No products available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition"
                >
                  <div className="aspect-square bg-muted relative">
                    {product.image_signed_url ? (
                      <img
                        src={product.image_signed_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-primary font-bold mt-1">{formatTsh(product.price)}</p>
                    {product.description && (
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <Button
                      onClick={() => handleWhatsAppOrder(product.name)}
                      className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Phone className="size-4 mr-2" /> Order via WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-muted-foreground text-sm">
        <p>Powered by Duka Link Up</p>
      </footer>
    </div>
  );
}
