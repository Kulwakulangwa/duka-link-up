// scripts/generate-sitemap.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
 https://rkylzxxkckbxucpnktar.supabase.co,
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreWx6eHhrY2tieHVjcG5rdGFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEzODAyOCwiZXhwIjoyMDk2NzE0MDI4fQ.3CPz9YiK6ljzwJH56m0jTlSRxjrQuU8pN1pV8KogT6o);

async function generateSitemap() {
  try {
    const { data: shops, error } = await supabase
      .from('shops')
      .select('slug, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shops:', error);
      process.exit(1);
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

    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    console.log('✅ Sitemap generated at public/sitemap.xml');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

generateSitemap();
