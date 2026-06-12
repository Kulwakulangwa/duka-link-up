// Vercel Serverless Function — Node.js 20 wrapper around Cloudflare-style fetch handler
// The SSR server (built by `bun run build`) exports a { fetch(req, env, ctx) } handler.
// Vercel Node functions receive (req, res) — we bridge them using the Web Fetch API.

import { createServer } from "http";

// Dynamically import the built server entry (copied here by copy-server.mjs postbuild)
let handlerPromise;
function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import("./server/index.mjs").then((m) => m.default ?? m);
  }
  return handlerPromise;
}

export default async function handler(req, res) {
  try {
    const app = await getHandler();

    // Build a Web API Request from the Node.js IncomingMessage
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const url = new URL(req.url, `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }

    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    let body = undefined;
    if (hasBody) {
      body = await new Promise((resolve) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
      });
    }

    const webRequest = new Request(url.toString(), {
      method: req.method,
      headers,
      body: hasBody ? body : undefined,
    });

    const webResponse = await app.fetch(webRequest, process.env, {});

    res.statusCode = webResponse.status;
    webResponse.headers.forEach((value, key) => res.setHeader(key, value));
    const responseBody = await webResponse.arrayBuffer();
    res.end(Buffer.from(responseBody));
  } catch (err) {
    console.error("SSR handler error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
