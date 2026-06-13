"use client";
import { useRef, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";

interface ShopLinkCardProps {
  url: string;
  label?: string;
  className?: string;
}

export function ShopLinkCard({ url, label = "Your shop link", className = "" }: ShopLinkCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    card.style.transform = `perspective(800px) rotateX(${(y - cy) / 12}deg) rotateY(${(cx - x) / 12}deg)`;
    card.style.setProperty("--bg-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--bg-y", `${(y / rect.height) * 100}%`);
    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    card.style.setProperty("--bg-x", "50%");
    card.style.setProperty("--bg-y", "50%");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full rounded-3xl overflow-hidden transition-transform duration-100 ${className}`}
      style={{
        background: "#111827",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 20px 35px -10px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Static glows: teal (center-left) and blue (right) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 20% 50%, rgba(0, 201, 167, 0.2), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 80% 50%, rgba(59, 130, 246, 0.2), transparent 60%)",
        }}
      />

      {/* Glass-like overlay */}
      <div className="pointer-events-none absolute inset-0 bg-white/[0.02] backdrop-blur-[2px]" />

      {/* Interactive hover glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ background: "radial-gradient(circle at var(--bg-x) var(--bg-y), rgba(0,201,167,0.18), rgba(255,170,0,0.06) 40%, transparent 70%)" }}
      />
      {/* Shimmer effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ background: "radial-gradient(ellipse 80px 80px at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.07), transparent)" }}
      />

      {/* Corner accents */}
      <span className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-[1.5px] border-l-[1.5px] border-[#00C9A7] rounded-tl" />
      <span className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-[1.5px] border-r-[1.5px] border-[#3B82F6] rounded-br" />

      {copied && (
        <span className="absolute top-3 right-4 text-[11px] font-mono text-[#00C9A7] bg-[#00C9A7]/10 border border-[#00C9A7]/30 px-2 py-0.5 rounded-md z-20">
          Copied!
        </span>
      )}

      <div className="relative z-10 p-6">
        <p className="text-[10px] font-mono tracking-widest text-[#00C9A7] uppercase mb-3 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00C9A7]" />
          {label}
        </p>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#00C9A7]/10 border border-[#00C9A7]/25 flex items-center justify-center shrink-0">
            <ExternalLink size={14} className="text-[#00C9A7]" />
          </div>
          {/* ✅ UPDATED: Reduced font size, improved typography and contrast */}
          <span className="font-mono text-xs sm:text-sm font-medium tracking-wide text-slate-300 break-all">
            {url}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-[#00C9A7] bg-[#00C9A7]/10 border border-[#00C9A7]/30 hover:bg-[#00C9A7]/18 transition-colors"
          >
            <Copy size={14} /> Copy
          </button>
          <button
            onClick={() => window.open(url, "_blank")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ExternalLink size={14} /> Preview
          </button>
        </div>
      </div>
    </div>
  );
}
