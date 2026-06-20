import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, ShoppingBag, Zap, Store, Rocket, ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";

// ---------- UPDATED Feature card with Swahili description ----------
function FeatureCard({ step, title, description, swahiliDescription, icon }: { 
  step: number; 
  title: string; 
  description: string; 
  swahiliDescription: string;
  icon?: ReactNode 
}) {
  return (
    <div className="relative">
      <div className="rounded-2xl bg-card border border-border/70 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
        <div className="flex items-center gap-3 mb-5">
          <span className="relative z-10 flex items-center justify-center size-9 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0 ring-4 ring-background">
            {step}
          </span>
          {icon && (
            <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary shrink-0">
              {icon}
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        {/* English description */}
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        {/* Swahili translation */}
        <p className="text-muted-foreground/70 text-sm leading-relaxed mt-2 border-t border-border/40 pt-2">
          {swahiliDescription}
        </p>
      </div>
    </div>
  );
}

// ---------- Accordion FAQ Item (simple) ----------
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left font-medium text-foreground hover:text-primary transition-colors"
      >
        <span>{question}</span>
        <ChevronDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-5 text-muted-foreground text-sm leading-relaxed">
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
      swahiliDescription: "Jisajili kwa barua pepe yako. Hakuna kadi ya mkopo. Bure kabisa kwa bidhaa 5.",
      icon: <Rocket className="size-5" />,
    },
    {
      step: 2,
      title: "Create your shop",
      description: "Name your shop, choose a unique link (dukalink.app/your-name), and add your WhatsApp number.",
      swahiliDescription: "Taja duka lako, chagua kiungo cha kipekee (dukalink.app/jina-lako), na ongeza namba yako ya WhatsApp.",
      icon: <Store className="size-5" />,
    },
    {
      step: 3,
      title: "Add products",
      description: "Upload photos, set prices, and write descriptions. Your products appear instantly on your public shop page.",
      swahiliDescription: "Pakia picha, weka bei, na andika maelezo. Bidhaa zako zitaonekana kwenye ukurasa wako wa duka mara moja.",
      icon: <ShoppingBag className="size-5" />,
    },
    {
      step: 4,
      title: "Share & sell",
      description: "Share your link on WhatsApp, Instagram, or anywhere. Customers order with one tap via WhatsApp.",
      swahiliDescription: "Shiriki kiungo chako kwenye WhatsApp, Instagram, au popote. Wateja wanaweza kuagiza kwa kugonga kitufe kimoja kupitia WhatsApp.",
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
    <main className="min-h-screen bg-background">
      {/* Hero with background photo */}
      <div 
        className="relative overflow-hidden text-white rounded-b-[2rem] sm:rounded-b-[3rem]"
        style={{
          backgroundImage: "url(/hero-seller.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Decorative glows (still visible) */}
        <div className="pointer-events-none absolute -top-32 -right-24 size-[26rem] rounded-full bg-primary/25 blur-[110px]" />
        <div className="pointer-events-none absolute top-1/2 -left-32 size-[20rem] rounded-full bg-accent/10 blur-[110px]" />
        
        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(134,239,172,0.6) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Header */}
        <header className="relative z-10 px-5 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <Link to="/" className="font-bold text-lg tracking-tight text-white">dukalink</Link>
          <Link to="/auth" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Get started</Link>
        </header>

        {/* Hero content */}
        <section className="relative z-10 px-5 pt-8 pb-20 sm:pb-28 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
            {/* Text column */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <p className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/15 text-accent text-xs font-medium mb-6">
                For sellers in Tanzania 🇹🇿
              </p>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
                Status zako zinaondoka<br/>baada ya masaa 24?
              </h1>
              <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto lg:mx-0">
                Tumia Dukalink — wateja wako wataona bidhaa au huduma zako{' '}
                <span className="text-primary">FOREVER</span>.
              </p>
              <div className="mt-8 flex justify-center lg:justify-start">
                <Button asChild size="lg" className="h-14 px-7 text-base rounded-xl font-semibold shadow-lg shadow-primary/30">
                  <Link to="/auth">
                    Create your free shop <ArrowRight className="ml-2 size-5" />
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-white/50">No card. No fees. 5 products free.</p>
            </div>

            {/* Image column (preview card) */}
            <div className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-sm lg:max-w-none lg:ml-auto">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/30 via-transparent to-accent/20 blur-xl" />
                <img
                  src="/hero-seller.jpg"
                  alt="Muuzaji akitumia dukalink kuonyesha duka lake la mtandaoni"
                  className="relative rounded-[1.75rem] shadow-2xl shadow-black/50 ring-1 ring-white/10 w-full object-cover aspect-[4/5] lg:aspect-[3/4]"
                />
                {/* floating notification card */}
                <div className="absolute -bottom-5 -left-5 sm:-left-8 bg-white text-foreground rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shrink-0">
                    <MessageCircle className="size-5" />
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-tight">Order mpya!</p>
                    <p className="text-xs text-muted-foreground leading-tight">Toyota Spade · TSh 17,500,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Steps section with Swahili translations */}
      <section className="px-5 pb-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 tracking-wide uppercase">
            Jinsi inavyofanya kazi
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">How to start selling</h2>
          <p className="text-muted-foreground mt-2">Four simple steps, and you're live</p>
        </div>
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block absolute top-[2.75rem] left-[12.5%] right-[12.5%] h-px bg-border" />
          {steps.map((step) => (
            <FeatureCard
              key={step.step}
              step={step.step}
              title={step.title}
              description={step.description}
              swahiliDescription={step.swahiliDescription}
              icon={step.icon}
            />
          ))}
        </div>
      </section>

      {/* Quick stats */}
      <section className="px-5 pb-16 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center border-t border-border pt-16">
        <div>
          <div className="text-2xl font-bold text-primary">0%</div>
          <p className="text-muted-foreground text-sm mt-1">Commission</p>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">60s</div>
          <p className="text-muted-foreground text-sm mt-1">Setup time</p>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">5</div>
          <p className="text-muted-foreground text-sm mt-1">Free products</p>
        </div>
        <div>
          <div className="text-2xl font-bold text-primary">WhatsApp</div>
          <p className="text-muted-foreground text-sm mt-1">Direct orders</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-5 pb-20 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Frequently asked questions</h2>
          <p className="text-muted-foreground mt-2">Everything you need to know</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          {faqs.map((faq, idx) => (
            <FaqItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-20">
        <div className="max-w-2xl mx-auto text-center bg-card rounded-2xl p-8 border border-border">
          <h2 className="text-2xl font-bold text-foreground">Ready to grow your business?</h2>
          <p className="text-muted-foreground mt-2">Join hundreds of sellers using Duka Link Up.</p>
          <Button asChild size="lg" className="mt-6 bg-primary hover:bg-primary/90">
            <Link to="/auth">Create your free shop →</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Duka Link Up. Free digital shops for Tanzania.</p>
      </footer>
    </main>
  );
}
