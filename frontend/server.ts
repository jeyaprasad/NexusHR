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
      let backendUrl = process.env.API_URL;
      if (!backendUrl) {
        if (process.env.API_HOST && process.env.API_PORT) {
          backendUrl = `http://${process.env.API_HOST}:${process.env.API_PORT}`;
        } else {
          backendUrl = "http://insiihr-backend:8080";
        }
      }
      if (backendUrl.endsWith("/")) {
        backendUrl = backendUrl.slice(0, -1);
      }
      
      // We MUST delete the Host header, otherwise Render routes it right back to the frontend (508 Loop Detected)
      const headers = new Headers(req.headers);
      headers.delete("host");
      // Delete origin and referer to bypass Spring Boot CORS checks, since this is a server-to-server proxy request
      headers.delete("origin");
      headers.delete("referer");
      
      let reqBody = null;
      if (req.method !== "GET" && req.method !== "HEAD") {
        reqBody = await req.arrayBuffer();
      }
      
      const proxyReq = new Request(backendUrl + url.pathname + url.search, {
        method: req.method,
        headers: headers,
        body: reqBody
      });
      
      try {
        const proxyRes = await fetch(proxyReq);
        const resBody = await proxyRes.arrayBuffer();
        
        const resHeaders = new Headers(proxyRes.headers);
        // Bun auto-decompresses the body, so we must remove the gzip encoding and length headers
        // otherwise the browser will fail to decode the response and throw Failed to fetch
        resHeaders.delete("content-encoding");
        resHeaders.delete("content-length");
        
        return new Response(resBody, {
          status: proxyRes.status,
          headers: resHeaders
        });
      } catch (err) {
        console.error("Proxy error for URL:", backendUrl, err);
        const errorDetails = err instanceof Error ? err.message : String(err);
        return new Response(JSON.stringify({ 
          error: "Proxy connection failed", 
          details: errorDetails,
          target: backendUrl
        }), {
          status: 502,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    
    // Otherwise fallback to the TanStack Start SSR handler
    return ssr.fetch(req);
  },
});

console.log(`Server started on port ${process.env.PORT || 3000}`);
