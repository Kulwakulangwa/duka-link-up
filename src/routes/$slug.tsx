import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Store, MapPin, Clock, Phone, Share2, Check } from "lucide-react";
import { formatTsh, normalizeWhatsApp } from "@/lib/dukalink";
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
        const { data: shopData } = await supabase
          .from("shops")
          .select("id, slug, name, description, whatsapp_number, location, avatar_url, created_at")
          .eq("slug", slug)
          .maybeSingle();
        if (!shopData) {
          setLoading(false);
          return;
        }
        let avatar_signed_url = null;
        if (shopData.avatar_url) {
          const { data: signedUrl } = await supabase.storage
            .from("shop-images")
            .createSignedUrl(shopData.avatar_url, 60 * 60 * 24);
          avatar_signed_url = signedUrl?.signedUrl || null;
        }
        setShop({ ...shopData, avatar_signed_url });

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const handleWhatsAppOrder = (productName?: string, productPrice?: number) => {
    if (!shop?.whatsapp_number) {
      toast.error("Shop WhatsApp number not set");
      return;
    }
    let phone = normalizeWhatsApp(shop.whatsapp_number);
    if (!phone) {
      let raw = shop.whatsapp_number.replace(/\D/g, "");
      if (raw.startsWith("0")) raw = "255" + raw.slice(1);
      if (!raw.startsWith("255")) raw = "255" + raw;
      phone = "+" + raw;
    }
    phone = phone.replace(/\s+/g, "");
    let message: string;
    if (productName && productPrice !== undefined) {
      message = `Hello! I'd like to order "${productName}" priced at ${formatTsh(productPrice)} from ${shop.name}.`;
    } else if (productName) {
      message = `Hello! I'd like to order "${productName}" from ${shop.name}.`;
    } else {
      message = `Hello! I'm interested in products from ${shop.name}.`;
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
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {shop.avatar_signed_url && (
              <img src={shop.avatar_signed_url} alt={shop.name} className="size-7 rounded-full object-cover" />
            )}
            <span className="font-semibold truncate">{shop.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={shareShop}>
            {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Shop info card */}
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex justify-center sm:justify-start">
              {shop.avatar_signed_url ? (
                <img
                  src={shop.avatar_signed_url}
                  alt={shop.name}
                  className="size-20 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="size-20 rounded-full bg-muted flex items-center justify-center">
                  <Store className="size-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              {shop.location && (
                <div className="flex items-center justify-center sm:justify-start gap-1 text-muted-foreground text-sm mt-1">
                  <MapPin className="size-3" />
                  <span>{shop.location}</span>
                </div>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-1 text-muted-foreground text-xs mt-1">
                <Clock className="size-3" />
                <span>Selling since {formatDate(shop.created_at)}</span>
              </div>
            </div>
            {shop.whatsapp_number && (
              <div className="sm:ml-auto">
                <Button
                  onClick={() => handleWhatsAppOrder()}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <Phone className="size-4" /> Contact
                </Button>
              </div>
            )}
          </div>
          {shop.description && (
            <p className="mt-4 text-foreground/80 border-t border-border pt-4 text-center sm:text-left">
              {shop.description}
            </p>
          )}
        </div>

        {/* Products section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 px-1">Products</h2>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-2xl">
              No products available yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                  <div className="p-2 sm:p-3">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{product.name}</h3>
                    <p className="text-primary font-bold text-sm sm:text-base mt-1">{formatTsh(product.price)}</p>
                    {product.description && (
                      <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-2 hidden sm:block">
                        {product.description}
                      </p>
                    )}
                    <Button
                      onClick={() => handleWhatsAppOrder(product.name, product.price)}
                      className="w-full mt-2 sm:mt-3 bg-green-600 hover:bg-green-700 text-white gap-1 sm:gap-2 text-xs sm:text-sm"
                      size="sm"
                    >
                      <Phone className="size-3 sm:size-4" /> Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ✅ Updated footer with green "Create your own shop" link */}
      <footer className="border-t border-border mt-12 py-6 text-center text-muted-foreground text-sm">
        <p>Powered by Duka Link Up</p>
        <p className="mt-2">
          <a 
            href="https://dukalinkup.royotechtz.cc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            Create your own shop →
          </a>
        </p>
      </footer>
    </div>
  );
}
