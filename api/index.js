import { createRequire } from 'module';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Try multiple possible locations for the server bundle
const locations = [
  '/var/task/api/server/index.mjs',
  '/var/task/dist/server/index.mjs',
  '/var/task/.output/server/index.mjs',
];

let handler;

for (const loc of locations) {
  if (existsSync(loc)) {
    const mod = await import(loc);
    handler = mod.default;
    break;
  }
}

if (!handler) {
  // List what's actually available for debugging
  const { readdirSync } = await import('fs');
  let debug = 'Available in /var/task/: ';
  try { debug += readdirSync('/var/task').join(', '); } catch(e) { debug += e.message; }
  let debugApi = ' | /var/task/api/: ';
  try { debugApi += readdirSync('/var/task/api').join(', '); } catch(e) { debugApi += e.message; }
  
  handler = (req, res) => {
    res.status(500).json({ error: 'Server bundle not found', debug: debug + debugApi });
  };
}

export default handler;
