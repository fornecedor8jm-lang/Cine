type VercelRequest = { method?: string };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
  send: (body: string) => void;
  json: (body: unknown) => void;
};

function configuredUrl() {
  const raw = process.env.PREMIUM_M3U_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Método não permitido" });

  const url = configuredUrl();
  if (!url) return res.status(503).json({ error: "Fonte Premium ainda não configurada ou inválida" });

  try {
    const response = await fetch(url, {
      headers: { Accept: "audio/x-mpegurl,text/plain,*/*" },
      signal: AbortSignal.timeout(55_000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `A fonte Premium respondeu HTTP ${response.status}` });
    }

    const playlist = await response.text();
    if (!playlist.trim()) return res.status(502).json({ error: "A fonte Premium retornou uma lista vazia" });

    // A lista patrocinada é igual para todos; o cache da borda evita um refetch por usuário.
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.setHeader("Content-Type", "audio/x-mpegurl; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).send(playlist);
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "A fonte Premium demorou mais de 55 segundos para responder"
      : "Não foi possível carregar a fonte Premium";
    return res.status(502).json({ error: message });
  }
}
