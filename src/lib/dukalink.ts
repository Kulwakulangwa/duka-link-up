export const RESERVED_SLUGS = new Set([
  "dashboard", "login", "signup", "admin", "api", "settings", "upgrade",
  "404", "auth", "logout", "signout", "signin", "register", "_authenticated",
  "www", "about", "terms", "privacy", "help", "support", "static", "assets",
]);

export const FREE_PRODUCT_LIMIT = 10; // Changed from 5

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > 40) return false;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return false;
  if (RESERVED_SLUGS.has(slug)) return false;
  return true;
}

export function slugError(slug: string): string | null {
  if (!slug) return "Pick a shop link";
  if (slug.length > 40) return "Max 40 characters";
  if (!/^[a-z0-9-]+$/.test(slug)) return "Only lowercase letters, numbers, and hyphens";
  if (!/^[a-z0-9]/.test(slug)) return "Must start with a letter or number";
  if (RESERVED_SLUGS.has(slug)) return "That word is reserved";
  return null;
}

/** Normalize Tanzania WhatsApp number to 255XXXXXXXXX (12 digits). */
export function normalizeWhatsApp(raw: string): string | null {
  let n = raw.replace(/[^\d]/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (n.startsWith("255")) {
    // already prefixed
  } else if (n.startsWith("0")) {
    n = "255" + n.slice(1);
  } else if (n.length === 9) {
    n = "255" + n;
  }
  if (!/^255\d{9}$/.test(n)) return null;
  return n;
}

export function formatTsh(price: number | string): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(n)) return "TSh 0";
  return "TSh " + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function whatsappOrderLink(number: string, productName: string, price: number | string): string {
  const msg = `Habari! Nataka kuagiza: ${productName} - ${formatTsh(price)}. Je, inapatikana?`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

export function sanitize(input: string, max = 500): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}
