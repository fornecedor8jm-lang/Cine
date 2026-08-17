import type { Request, Response } from "express";
import axios from "axios";

/**
 * Utilitário de proxy de streaming com reescrita inteligente de manifestos HLS (M3U8)
 * e repasse com suporte a CORS e User-Agent para todas as Smart TVs.
 */

function rewriteM3u8Manifest(manifestText: string, baseUrl: string): string {
  const lines = manifestText.split(/\r?\n/);
  const rewrittenLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      rewrittenLines.push(rawLine);
      continue;
    }

    // Reescreve tags com URIs como #EXT-X-KEY:METHOD=AES-128,URI="http://..."
    if (trimmed.startsWith("#EXT-X-KEY:") || trimmed.startsWith("#EXT-X-MAP:")) {
      const uriMatch = trimmed.match(/URI=["']([^"']+)["']/i);
      if (uriMatch && uriMatch[1]) {
        try {
          const absoluteUri = new URL(uriMatch[1], baseUrl).toString();
          const proxiedUri = `/api/stream-proxy?url=${encodeURIComponent(absoluteUri)}`;
          const replacedLine = trimmed.replace(uriMatch[0], `URI="${proxiedUri}"`);
          rewrittenLines.push(replacedLine);
          continue;
        } catch {
          // Mantém linha original se URL for inválida
        }
      }
      rewrittenLines.push(rawLine);
      continue;
    }

    // Se a linha é um comentário ou metadado do M3U8, mantém intacto
    if (trimmed.startsWith("#")) {
      rewrittenLines.push(rawLine);
      continue;
    }

    // Se for uma URL (relativa ou absoluta) para um segmento ou sub-playlist
    try {
      const absoluteUrl = new URL(trimmed, baseUrl).toString();
      const proxiedUrl = `/api/stream-proxy?url=${encodeURIComponent(absoluteUrl)}`;
      rewrittenLines.push(proxiedUrl);
    } catch {
      rewrittenLines.push(rawLine);
    }
  }

  return rewrittenLines.join("\n");
}

export async function handleStreamProxy(req: Request, res: Response) {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send("Parâmetro 'url' obrigatório.");
  }

  try {
    const parsedTarget = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsedTarget.protocol)) {
      return res.status(400).send("Protocolo inválido.");
    }
  } catch {
    return res.status(400).send("URL de stream inválida.");
  }

  // Prepara headers repassados
  const requestHeaders: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (SmartHub; SMART-TV; U; Linux/SmartTV; Android 11; GoogleTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    Accept: "*/*",
  };

  if (req.headers.range) {
    requestHeaders.Range = req.headers.range as string;
  }

  try {
    const response = await axios.get(targetUrl, {
      headers: requestHeaders,
      responseType: "stream",
      timeout: 25000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    const contentTypeHeader = response.headers["content-type"];
    const contentType = typeof contentTypeHeader === "string" ? contentTypeHeader.toLowerCase() : "";
    const isM3u8 =
      contentType.includes("mpegurl") ||
      contentType.includes("m3u") ||
      targetUrl.includes(".m3u8") ||
      targetUrl.includes("type=m3u");

    // Cabeçalhos universais de streaming e CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Origin, Content-Type, Accept");
    res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");

    if (isM3u8) {
      // Coleta o manifesto inteiro e reescreve as URIs
      const chunks: Buffer[] = [];
      response.data.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.data.on("end", () => {
        const fullBody = Buffer.concat(chunks).toString("utf-8");
        const rewritten = rewriteM3u8Manifest(fullBody, targetUrl);
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.send(rewritten);
      });
      response.data.on("error", (err: Error) => {
        if (!res.headersSent) {
          res.status(502).send(`Erro ao ler playlist m3u8: ${err.message}`);
        }
      });
      return;
    }

    // Se for segmento TS/MP4 ou fluxo binário contínuo
    if (response.headers["content-type"]) {
      res.setHeader("Content-Type", String(response.headers["content-type"]));
    }
    if (response.headers["content-length"]) {
      res.setHeader("Content-Length", String(response.headers["content-length"]));
    }
    if (response.headers["content-range"]) {
      res.setHeader("Content-Range", String(response.headers["content-range"]));
      res.status(206);
    } else {
      res.status(response.status);
    }
    if (response.headers["accept-ranges"]) {
      res.setHeader("Accept-Ranges", String(response.headers["accept-ranges"]));
    }

    res.setHeader("Cache-Control", "public, max-age=3600");
    response.data.pipe(res);
  } catch (error: any) {
    if (!res.headersSent) {
      const msg = error?.message || "Falha ao conectar na fonte do canal";
      res.status(502).json({ error: `Proxy de streaming: ${msg}` });
    }
  }
}
