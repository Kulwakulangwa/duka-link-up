import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, ShoppingBag, Zap, Store, Rocket, ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";

// ---------- FeatureCard component (glass style) ----------
function FeatureCard({ step, title, description, icon }: { step: number; title: string; description: string; icon?: ReactNode }) {
  return (
    <div
      className="relative rounded-3xl overflow-hidden transition-transform duration-100 hover:scale-[1.02] group"
      style={{
        background: "#111827",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 20px 35px -10px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 20% 50%, rgba(0, 201, 167, 0.15), transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(59, 130, 246, 0.15), transparent 60%)" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-white/[0.02] backdrop-blur-[2px]" />
      <span className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-[1.5px] border-l-[1.5px] border-[#00C9A7] rounded-tl" />
      <span className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-[1.5px] border-r-[1.5px] border-[#3B82F6] rounded-br" />

      <div className="relative z-10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-bold text-[#00C9A7]/30">0{step}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-[#00C9A7]/30 to-transparent" />
        </div>
        <div className="flex items-start gap-3 mb-3">
          {icon && <div className="shrink-0 text-[#00C9A7]">{icon}</div>}
          <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ---------- Accordion FAQ Item ----------
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left text-white font-medium hover:text-[#00C9A7] transition-colors"
      >
        <span>{question}</span>
        <ChevronDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-5 text-slate-300 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

// ---------- Landing page ----------
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
  const steps = [
    {
      step: 1,
      title: "Sign up",
      description: "Create an account with your email. No credit card required. Free forever for 5 products.",
      icon: <Rocket className="size-5" />,
    },
    {
      step: 2,
      title: "Create your shop",
      description: "Name your shop, choose a unique link (dukalink.app/your-name), and add your WhatsApp number.",
      icon: <Store className="size-5" />,
    },
    {
      step: 3,
      title: "Add products",
      description: "Upload photos, set prices, and write descriptions. Your products appear instantly on your public shop page.",
      icon: <ShoppingBag className="size-5" />,
    },
    {
      step: 4,
      title: "Share & sell",
      description: "Share your link on WhatsApp, Instagram, or anywhere. Customers order with one tap via WhatsApp.",
      icon: <MessageCircle className="size-5" />,
    },
  ];

  const faqs = [
    {
      question: "How much does Duka Link Up cost?",
      answer: "The basic plan is completely free – you can add up to 5 products, no commission, no monthly fees. Paid plans with more products and features are coming soon."
    },
    {
      question: "Do I need a website or technical skills?",
      answer: "No. Duka Link Up gives you a ready‑made shop page. You just sign up, add your products, and share your link. No coding required."
    },
    {
      question: "How do customers place orders?",
      answer: "Customers click the 'Order via WhatsApp' button on your product. A pre‑filled message with the product name and price opens – they just tap send, and you receive it directly."
    },
    {
      question: "Can I edit or delete products?",
      answer: "Yes. From your dashboard, you can edit any product (name, price, photo, stock) or delete it. Changes appear instantly on your public shop."
    },
    {
      question: "What if I reach the 5‑product limit?",
      answer: "You can still receive orders for existing products. To add more, you'll need to upgrade when paid plans become available, or remove some products to free up space."
    },
    {
      question: "Is my shop really free forever?",
      answer: "Yes, the 5‑product tier is free forever with no hidden fees. If you need more products in the future, you can choose to upgrade – but your free shop will always stay free."
    }
  ];

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/" className="font-bold text-lg tracking-tight text-primary">dukalink</Link>
        <Link to="/auth" className="text-sm font-medium text-foreground hover:text-primary">Get started</Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,201,167,0.15),transparent_50%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
            For sellers in Tanzania 🇹🇿
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-[1.05]">
            Uza zaidi.<br/>Haraka zaidi.
          </h1>
          <p className="mt-5 text-lg text-slate-300 max-w-xl mx-auto">
            Create your free shop in 60 seconds. Share on WhatsApp. Get orders today.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-14 px-7 text-base rounded-xl font-semibold bg-[#00C9A7] hover:bg-[#00C9A7]/90 text-black shadow-lg">
              <Link to="/auth">
                Create your free shop <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-slate-400">No card. No fees. 5 products free.</p>
        </div>
      </section>

      {/* Steps in premium cards */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">How to start selling</h2>
          <p className="text-slate-400 mt-2">Four simple steps, and you're live</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step) => (
            <FeatureCard
              key={step.step}
              step={step.step}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </div>
      </section>

      {/* Quick stats */}
      <section className="px-4 py-16 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-[#00C9A7]">0%</div>
            <p className="text-slate-400 text-sm mt-1">Commission</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#00C9A7]">60s</div>
            <p className="text-slate-400 text-sm mt-1">Setup time</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#00C9A7]">5</div>
            <p className="text-slate-400 text-sm mt-1">Free products</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#00C9A7]">WhatsApp</div>
            <p className="text-slate-400 text-sm mt-1">Direct orders</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Frequently asked questions</h2>
          <p className="text-slate-400 mt-2">Everything you need to know</p>
        </div>
        <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
          {faqs.map((faq, idx) => (
            <FaqItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 mb-12">
        <div className="max-w-2xl mx-auto text-center bg-[#111827] rounded-3xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white">Ready to grow your business?</h2>
          <p className="text-slate-300 mt-2">Join hundreds of sellers using Duka Link Up.</p>
          <Button asChild size="lg" className="mt-6 bg-[#00C9A7] hover:bg-[#00C9A7]/90 text-black font-semibold">
            <Link to="/auth">Create your free shop →</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Duka Link Up. Free digital shops for Tanzania.</p>
      </footer>
    </main>
  );
}
