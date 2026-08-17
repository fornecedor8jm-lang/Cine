import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { fetchPremiumPlaylist, hasPremiumSource } from "./premiumSource";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("/api/premium", async (_req, res) => {
    if (!hasPremiumSource()) return res.status(503).json({ error: "Fonte Premium ainda não configurada" });
    try {
      const playlist = await fetchPremiumPlaylist();
      res.setHeader("Cache-Control", "private, max-age=300");
      res.type("application/x-mpegurl").send(playlist);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível carregar a fonte Premium";
      res.status(502).json({ error: message });
    }
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
