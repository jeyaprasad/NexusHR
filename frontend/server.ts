// @ts-nocheck
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
    
    // Proxy /api requests to backend so frontend doesn't need to be rebuilt for absolute URLs
    if (url.pathname.startsWith("/api/")) {
      let backendUrl = "https://nexus-hr-3n2v.onrender.com";
      if (backendUrl.endsWith("/")) {
        backendUrl = backendUrl.slice(0, -1);
      }
      
      // We MUST delete the Host header, otherwise Render routes it right back to the frontend (508 Loop Detected)
      const headers = new Headers(req.headers);
      headers.delete("host");
      // Delete origin and referer to bypass Spring Boot CORS checks, since this is a server-to-server proxy request
      headers.delete("origin");
      headers.delete("referer");
      
      const proxyReq = new Request(backendUrl + url.pathname + url.search, {
        method: req.method,
        headers: headers,
        body: req.body
      });
      return fetch(proxyReq);
    }
    
    // Otherwise fallback to the TanStack Start SSR handler
    return ssr.fetch(req);
  },
});

console.log(`Server started on port ${process.env.PORT || 3000}`);
