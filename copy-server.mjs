import { cpSync, existsSync, mkdirSync, copyFileSync } from 'fs';

// Nitro can output to different paths depending on preset config.
// Try all known locations and copy whichever exists into api/server/
// so Vercel's /api/index.js can import it at runtime.
const candidates = ['.output/server', 'dist/server'];
const src = candidates.find(p => existsSync(p));

if (!src) {
  console.error('ERROR: No server output found. Searched:', candidates.join(', '));
  process.exit(1);
}

mkdirSync('api/server', { recursive: true });
cpSync(src, 'api/server', { recursive: true });
console.log('✓ Copied ' + src + ' → api/server');
