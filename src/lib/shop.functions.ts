import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isValidSlug, RESERVED_SLUGS } from "./dukalink";

const slugSchema = z.object({ slug: z.string().min(1).max(40) });

/** Check if a slug is available. Public; no auth. */
export const checkSlug = createServerFn({ method: "GET" })
  .inputValidator((d) => slugSchema.parse(d))
  .handler(async ({ data }) => {
    const slug = data.slug.toLowerCase();
    if (!isValidSlug(slug)) return { available: false, reason: "invalid" as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("shops").select("id").eq("slug", slug).maybeSingle();
    return { available: !row, reason: row ? ("taken" as const) : ("ok" as const) };
  });

/** Suggest an available slug close to the given one. */
export const suggestSlug = createServerFn({ method: "GET" })
  .inputValidator((d) => slugSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const base = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 36) || "shop";
    for (let i = 0; i < 50; i++) {
      const candidate = i === 0 ? base : `${base}-${i + 1}`.slice(0, 40);
      if (RESERVED_SLUGS.has(candidate)) continue;
      const { data: row } = await supabaseAdmin.from("shops").select("id").eq("slug", candidate).maybeSingle();
      if (!row) return { slug: candidate };
    }
    return { slug: `${base}-${Date.now().toString(36)}`.slice(0, 40) };
  });

/** Get public shop + products with signed image URLs. */
export const getPublicShop = createServerFn({ method: "GET" })
  .inputValidator((d) => slugSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: shop } = await supabaseAdmin
      .from("shops")
      .select("id, slug, name, description, whatsapp_number, location, avatar_url, created_at")
      .eq("slug", data.slug.toLowerCase())
      .maybeSingle();
    if (!shop) return { shop: null, products: [] };
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name, price, description, image_url, in_stock, created_at")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false });

    const withUrls = await Promise.all(
      (products ?? []).map(async (p: any) => ({
        ...p,
        image_signed_url: p.image_url ? await signed(p.image_url) : null,
      })),
    );
    const avatarSigned = shop.avatar_url ? await signed(shop.avatar_url) : null;
    return { shop: { ...shop, avatar_signed_url: avatarSigned }, products: withUrls };

    async function signed(path: string): Promise<string | null> {
      const { data, error } = await supabaseAdmin.storage
        .from("shop-images")
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
      if (error) return null;
      return data.signedUrl;
    }
  });
