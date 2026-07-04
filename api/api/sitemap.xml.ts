import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Use environment variables (available on Vercel)
  const supabaseUrl = 'https://rkylzxxkckbxucpnktar.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreWx6eHhrY2tieHVjcG5rdGFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEzODAyOCwiZXhwIjoyMDk2NzE0MDI4fQ.3CPz9YiK6ljzwJH56m0jTlSRxjrQuU8pN1pV8KogT6o';

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: shops, error } = await supabase
    .from('shops')
    .select('slug, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Sitemap error:', error);
    return res.status(500).send('Error fetching shops');
  }

  const baseUrl = 'https://dukalinkup.royotechtz.cc';
  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth</loc>
    <priority>0.8</priority>
  </url>
  ${shops.map(shop => `
  <url>
    <loc>${baseUrl}/${shop.slug}</loc>
    <lastmod>${shop.updated_at ? new Date(shop.updated_at).toISOString().split('T')[0] : now}</lastmod>
    <priority>0.9</priority>
  </url>
  `).join('')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // cache for 1 hour
  res.status(200).send(xml);
}
