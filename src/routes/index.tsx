import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, ShoppingBag, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dukalink — Uza zaidi. Haraka zaidi." },
      { name: "description", content: "Create your free shop in 60 seconds. Share on WhatsApp. Get orders today." },
      { property: "og:title", content: "Dukalink — Uza zaidi. Haraka zaidi." },
      { property: "og:description", content: "Create your free shop in 60 seconds. Share on WhatsApp. Get orders today." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="px-5 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/" className="font-bold text-lg tracking-tight text-primary">dukalink</Link>
        <Link to="/auth" className="text-sm font-medium text-foreground hover:text-primary">Sign in</Link>
      </header>

      <section className="px-5 pt-10 pb-16 max-w-3xl mx-auto text-center">
        <p className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
          For sellers in Tanzania 🇹🇿
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
          Uza zaidi.<br/>Haraka zaidi.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
          Create your free shop in 60 seconds. Share on WhatsApp. Get orders today.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" className="h-14 px-7 text-base rounded-xl font-semibold shadow-lg shadow-primary/20">
            <Link to="/auth">
              Create your free shop <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No card. No fees. 5 products free.</p>
      </section>

      <section className="px-5 pb-20 max-w-4xl mx-auto grid sm:grid-cols-3 gap-4">
        {[
          { icon: Zap, title: "60 seconds", body: "Sign up, name your shop, add a product. Done." },
          { icon: ShoppingBag, title: "Your own link", body: "dukalink.app/your-name — share it anywhere." },
          { icon: MessageCircle, title: "WhatsApp orders", body: "Customers tap a button and message you directly." },
        ].map((f, i) => (
          <div key={i} className="rounded-2xl bg-card border border-border p-5">
            <f.icon className="size-6 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
