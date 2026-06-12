// Vercel Serverless Function entry point
// The actual SSR server is built by `bun run build` into dist/server/
// then copy-server.mjs copies it here as api/server/ at build time.
import handler from './server/index.mjs';
export default handler;
