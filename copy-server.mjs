import { cpSync, existsSync, mkdirSync } from "fs";

// Nitro outputs to different paths depending on the preset.
// Lovable uses cloudflare-pages preset by default → .output/server
// We copy it into api/server/ so Vercel can find it.
const candidates = [
  ".output/server",   // cloudflare-pages / node-server preset
  "dist/server",      // some custom configs
  ".nitro/server",    // older nitro versions
];

const src = candidates.find((p) => existsSync(p));

if (!src) {
  console.error("ERROR: No server build output found.");
  console.error("Searched:", candidates.join(", "));
  console.error("Contents of current dir:");
  import("fs").then(({ readdirSync }) => {
    try { console.error(readdirSync(".").join(", ")); } catch {}
    try { console.error(".output:", readdirSync(".output").join(", ")); } catch {}
  });
  process.exit(1);
}

mkdirSync("api/server", { recursive: true });
cpSync(src, "api/server", { recursive: true });
console.log("✓ Copied", src, "→ api/server");
