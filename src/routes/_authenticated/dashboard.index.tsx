import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Copy, ExternalLink, Plus, Settings, LogOut, Pencil, Trash2, Sparkles, Store, Shield } from "lucide-react";
import { formatTsh, FREE_PRODUCT_LIMIT } from "@/lib/dukalink";
import { ProductImage } from "@/components/ProductImage";

// Admin email – change this to your own email
const ADMIN_EMAIL = "admin@dukalink.com"; // 👈 Replace with your email

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — Dukalink" }] }),
  component: Dashboard,
});

type Shop = { id: string; slug: string; name: string };
type Product = {
  id: string; name: string; price: string | number; image_url: string | null;
  in_stock: boolean; description: string | null;
};

function Dashboard() {
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Check admin status
    if (user.email === ADMIN_EMAIL) {
      setIsAdmin(true);
    }

    const { data: shopRow } = await supabase
      .from("shops")
      .select("id,slug,name")
      .eq("user_id", user.id)
      .maybeSingle();

    setShop(shopRow as any);

    if (shopRow) {
      const { data: prods } = await supabase
        .from("products")
        .select("id,name,price,image_url,in_stock,description")
        .eq("shop_id", shopRow.id)
        .order("created_at", { ascending: false });
      setProducts((prods as any) ?? []);
    } else {
      setProducts([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  const shopUrl = typeof window !== "undefined" && shop ? `${window.location.origin}/${shop.slug}` : "";

  async function copyLink() {
    if (!shopUrl) return;
    await navigator.clipboard.writeText(shopUrl);
    toast.success("Link copied!");
  }

  async function toggleStock(p: Product) {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, in_stock: !p.in_stock } : x)));
    const { error } = await supabase.from("products").update({ in_stock: !p.in_stock } as any).eq("id", p.id);
    if (error) { toast.error("Could not update"); load(); }
  }

  async function doDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteId);
    setDeleteId(null);
    if (error) return toast.error("Could not delete");
    toast.success("Deleted");
    load();
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  if (!shop) {
    return (
      <main className="min-h-screen bg-background">
        <header className="px-5 py-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Store className="size-5 text-primary shrink-0" />
              <h1 className="font-bold text-foreground">Duka Link Up</h1>
            </div>
            <div className="flex gap-1">
              {isAdmin && (
                <Button asChild variant="ghost" size="icon">
                  <Link to="/admin"><Shield className="size-5" /></Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="size-5" />
              </Button>
            </div>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-5 py-12">
          <div className="rounded-2xl border-2 border-dashed border-primary/30 p-10 text-center bg-card">
            <Store className="size-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">You don't have a shop yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your digital shop page and start selling online today.
            </p>
            <Button asChild size="lg" className="h-12 px-8 font-semibold">
              <Link to="/create-shop">Create Your Shop →</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="px-5 py-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Store className="size-5 text-primary shrink-0" />
            <h1 className="font-bold text-foreground truncate">{shop.name}</h1>
          </div>
          <div className="flex gap-1">
            <Button asChild variant="ghost" size="icon">
              <Link to="/dashboard/settings"><Settings className="size-5" /></Link>
            </Button>
            {isAdmin && (
              <Button asChild variant="ghost" size="icon">
                <Link to="/admin"><Shield className="size-5" /></Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
        {/* Green gradient shop link card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 shadow-lg shadow-primary/20">
          <p className="text-xs uppercase tracking-wider opacity-80">Your shop link</p>
          <p className="font-mono text-base sm:text-lg mt-1 break-all">{shopUrl}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={copyLink} variant="secondary" size="sm" className="flex-1 sm:flex-none">
              <Copy className="size-4 mr-1.5" /> Copy
            </Button>
            <Button asChild variant="secondary" size="sm" className="flex-1 sm:flex-none">
              <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4 mr-1.5" /> Preview
              </a>
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center bg-card">
            <Sparkles className="size-10 text-primary mx-auto mb-3" />
            <h2 className="font-semibold text-lg text-foreground">Let's add your first product</h2>
            <p className="text-muted-foreground text-sm mt-1 mb-5">Snap a photo, set a price, share your link.</p>
            <Button asChild size="lg" className="h-12 px-6 font-semibold">
              <Link to="/dashboard/add"><Plus className="size-5 mr-1" /> Add your first product</Link>
            </Button>
          </div>
        ) : (
          <>
            {products.length >= FREE_PRODUCT_LIMIT && (
              <div className="rounded-xl bg-warning/15 border border-warning/40 p-4">
                <p className="text-sm font-medium text-foreground">
                  You've hit the free plan limit ({FREE_PRODUCT_LIMIT} products).
                </p>
                <p className="text-xs text-muted-foreground mt-1">Upgrade to add more — coming soon.</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">
                Products <span className="text-muted-foreground font-normal">({products.length}/{FREE_PRODUCT_LIMIT})</span>
              </h2>
              <Button asChild size="sm" disabled={products.length >= FREE_PRODUCT_LIMIT}>
                <Link to="/dashboard/add"><Plus className="size-4 mr-1" /> Add product</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="rounded-xl bg-card border border-border p-3 flex gap-3 items-center">
                  <ProductImage path={p.image_url} className="size-16 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{formatTsh(p.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Switch checked={p.in_stock} onCheckedChange={() => toggleStock(p)} />
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="icon" className="size-8">
                        <Link to="/dashboard/edit/$id" params={{ id: p.id }}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => setDeleteId(p.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              Customers will no longer see it. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
