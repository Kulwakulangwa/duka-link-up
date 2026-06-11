import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getPublicShop } from "@/lib/shop.functions";
import { formatTsh, whatsappOrderLink, RESERVED_SLUGS } from "@/lib/dukalink";
import { MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const shopQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-shop", slug],
    queryFn: () => getPublicShop({ data: { slug } }),
  });

export const Route = createFileRoute("/$slug")({
  loader: async ({ params, context }) => {
    if (RESERVED_SLUGS.has(params.slug.toLowerCase())) throw notFound();
    const res = await context.queryClient.ensureQueryData(shopQuery(params.slug));
    if (!res.shop) throw notFound();
    return res;
  },
  head: ({ loaderData }) => {
    const shop = loaderData?.shop;
    if (!shop) return { meta: [{ title: "Shop not found — Dukalink" }] };
    const title = `${shop.name} — Dukalink`;
    const desc = shop.description || `Order from ${shop.name} on WhatsApp.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(shop.avatar_signed_url ? [{ property: "og:image", content: shop.avatar_signed_url } as const] : []),
      ],
    };
  },
  notFoundComponent: NotFoundShop,
  errorComponent: () => <NotFoundShop />,
  component: ShopPage,
});

function ShopPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(shopQuery(slug));
  const shop = data.shop!;
  const products = data.products;

  const sinceDate = new Date(shop.created_at);
  const since = sinceDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-gradient-to-b from-primary/10 to-transparent">
        <div className="max-w-3xl mx-auto px-5 pt-10 pb-6 text-center">
          <div className="size-20 mx-auto rounded-full bg-primary/15 border-2 border-primary/30 overflow-hidden flex items-center justify-center text-2xl font-bold text-primary">
            {shop.avatar_signed_url ? (
              <img src={shop.avatar_signed_url} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              shop.name.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">{shop.name}</h1>
          {shop.location && (
            <p className="mt-1 text-sm text-muted-foreground inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> {shop.location}
            </p>
          )}
          {shop.description && (
            <p className="mt-3 text-sm text-foreground max-w-md mx-auto">{shop.description}</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Selling since {since}</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-5 py-6">
        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No products yet — check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 auto-rows-fr">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} whatsapp={shop.whatsapp_number} />

            ))}
          </div>
        )}
      </section>

      <footer className="max-w-3xl mx-auto px-5 py-8 text-center border-t border-border mt-8">
        <p className="text-xs text-muted-foreground">
          Powered by{" "}
          <Link to="/" className="text-primary font-semibold hover:underline">dukalink</Link>
          {" "}— <Link to="/auth" className="hover:underline">Create your free shop</Link>
        </p>
      </footer>
    </main>
  );
}

function ProductCard({ product, whatsapp }: { product: any; whatsapp: string | null }) {
  const disabled = !product.in_stock || !whatsapp;
  const href = whatsapp ? whatsappOrderLink(whatsapp, product.name, product.price) : "#";
  return (
    <div className={`rounded-xl bg-card border border-border overflow-hidden flex flex-col h-full ${!product.in_stock ? "opacity-60" : ""}`}>
      <div className="aspect-square bg-muted relative shrink-0">
        {product.image_signed_url ? (
          <img src={product.image_signed_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
        )}
        {!product.in_stock && (
          <span className="absolute top-2 left-2 bg-foreground text-background text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
            Sold out
          </span>
        )}
      </div>
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col min-w-0">
        <p className="font-medium text-foreground text-sm line-clamp-2 break-words">{product.name}</p>
        <p className="text-base font-bold text-primary mt-1">{formatTsh(product.price)}</p>
        {product.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">{product.description}</p>
        )}
        <Button
          asChild={!disabled}
          disabled={disabled}
          size="sm"
          className="mt-3 w-full bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 disabled:opacity-50 h-10 px-2 font-semibold text-xs sm:text-sm"
        >
          {disabled ? (
            <span className="inline-flex items-center justify-center gap-1.5 min-w-0">
              <MessageCircle className="size-4 shrink-0" />
              <span className="truncate">{!product.in_stock ? "Sold out" : "Unavailable"}</span>
            </span>
          ) : (
            <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 min-w-0">
              <MessageCircle className="size-4 shrink-0" />
              <span className="truncate"><span className="sm:hidden">Order</span><span className="hidden sm:inline">Order on WhatsApp</span></span>
            </a>
          )}
        </Button>
      </div>
    </div>
  );
}

function NotFoundShop() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">🛍️</p>
        <h1 className="text-2xl font-bold text-foreground">This shop doesn't exist yet</h1>
        <p className="mt-2 text-muted-foreground">…but yours could.</p>
        <Button asChild size="lg" className="mt-6 h-12 px-6 font-semibold">
          <Link to="/auth">Create your free shop</Link>
        </Button>
      </div>
    </main>
  );
}
