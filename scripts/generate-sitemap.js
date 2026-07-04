import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variables or fallback to hardcoded (for testing)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rkylzxxkckbxucpnktar.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreWx6eHhrY2tieHVjcG5rdGFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEzODAyOCwiZXhwIjoyMDk2NzE0MDI4fQ.3CPz9YiK6ljzwJH56m0jTlSRxjrQuU8pN1pV8KogT6o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  // ... rest same
}
generateSitemap();
