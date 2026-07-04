import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sitemap.xml")({
  loader: async () => {
    // Fetch all shop slugs from Supabase
    const { data: shops, error } = await supabase
      .from("shops")
      .select("slug, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Sitemap error:", error);
      return new Response("Error fetching shops", { status: 500 });
    }

    const baseUrl = "https://dukalinkup.royotechtz.cc";

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth</loc>
    <priority>0.8</priority>
  </url>
  ${shops.map(shop => `
  <url>
    <loc>${baseUrl}/${shop.slug}</loc>
    <lastmod>${shop.updated_at ? new Date(shop.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.9</priority>
  </url>
  `).join('')}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
});
