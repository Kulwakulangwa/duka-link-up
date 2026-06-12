import { cpSync, existsSync, mkdirSync, readdirSync } from "fs";

// Log everything so we can see what nitro produced in build logs
function logDir(dir) {
  try {
    console.log(dir + ":", readdirSync(dir).join(", "));
  } catch {
    console.log(dir + ": (not found)");
  }
}

console.log("=== copy-server.mjs: scanning build output ===");
logDir(".");
logDir(".output");
logDir("dist");

const candidates = [".output/server", "dist/server", ".nitro/server"];
const src = candidates.find((p) => existsSync(p));

if (!src) {
  console.error("ERROR: No server output found in any of:", candidates.join(", "));
  console.error("Skipping copy. The api/index.js will fail at runtime.");
  process.exit(0); // exit 0 so build does not fail — runtime error is more debuggable
}

mkdirSync("api/server", { recursive: true });
cpSync(src, "api/server", { recursive: true });
console.log("✓ Copied", src, "→ api/server");
logDir("api/server");
