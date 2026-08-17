import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fetchPremiumPlaylist, hasPremiumSource } from "./server/premiumSource.js";
import { handleStreamProxy } from "./server/streamProxy.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Preflight CORS handler
  app.options("*", (_req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Origin, Content-Type, Accept");
    res.sendStatus(204);
  });

  // API routes FIRST
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/stream-proxy", (req, res) => {
    handleStreamProxy(req, res);
  });

  app.get("/api/premium", async (_req, res) => {
    if (!hasPremiumSource()) {
      return res.status(503).json({ error: "Fonte Premium ainda não configurada" });
    }
    try {
      const playlist = await fetchPremiumPlaylist();
      res.setHeader("Cache-Control", "private, max-age=300");
      res.type("application/x-mpegurl").send(playlist);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível carregar a fonte Premium";
      res.status(502).json({ error: message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist", "public");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
