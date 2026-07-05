import { serve } from "bun";
import { resolve } from "path";

const ssr = require("./dist/server/server.js").default;

serve({
  port: process.env.PORT || 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Serve static assets from the client build directory
    const file = Bun.file(`./dist/client${url.pathname}`);
    if (await file.exists()) {
      return new Response(file);
    }
    
    // Otherwise fallback to the TanStack Start SSR handler
    return ssr.fetch(req);
  },
});

console.log(`Server started on port ${process.env.PORT || 3000}`);
