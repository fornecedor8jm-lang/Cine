export const DEFAULT_M3U_URL = "/api/premium";

export const M3U_SOURCES = [
  { id: "premium", label: "⭐ Nuvem Premium", url: "/api/premium" },
  { id: "br", label: "Brasil", url: "https://iptv-org.github.io/iptv/countries/br.m3u" },
  { id: "pt", label: "Portugal", url: "https://iptv-org.github.io/iptv/countries/pt.m3u" },
  { id: "ao", label: "Angola", url: "https://iptv-org.github.io/iptv/countries/ao.m3u" },
  { id: "py", label: "Paraguai", url: "https://iptv-org.github.io/iptv/countries/py.m3u" },
  { id: "por", label: "Todos em Português", url: "https://iptv-org.github.io/iptv/languages/por.m3u" },
  { id: "sinal-aberto", label: "Sinal Aberto", url: "/playlists/sinal-aberto-todos-canais.m3u" },
] as const;

export type M3uContentType = "live" | "movie" | "series";

export type M3uChannel = {
  id: string;
  name: string;
  group: string;
  logo?: string;
  country?: string;
  sourceCountry?: string;
  language?: string;
  contentType: M3uContentType;
  url: string;
  proxiedUrl?: string;
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export function getProxiedStreamUrl(streamUrl: string): string {
  if (!streamUrl) return "";
  if (streamUrl.startsWith("/api/stream-proxy")) return streamUrl;
  return `/api/stream-proxy?url=${encodeURIComponent(streamUrl)}`;
}

/** Classifica por evidências específicas de VOD e assume live para o restante. */
export function classifyM3uEntry(group: string, name = "", url = ""): M3uContentType {
  const groupText = normalize(group);
  const nameText = normalize(name);
  const urlText = normalize(url);
  const fullText = `${groupText} ${nameText}`;

  const isSeries =
    /(^|\b)(series?|tv shows?|temporadas?|episodios?)(\b|$)/.test(groupText) ||
    /\b(?:s|t)\d{1,2}\s*e\s*\d{1,3}\b/.test(fullText) ||
    /\b(?:temporada|season|episodio|episode)\s*\d+/.test(fullText) ||
    /\/(?:series|serie|episodes?)\//.test(urlText);
  if (isSeries) return "series";

  const isMovie =
    /(^|\b)(filmes?|movies?|cinema|longas?)(\b|$)/.test(groupText) ||
    /\/(?:movie|movies|filmes?)\//.test(urlText);
  if (isMovie) return "movie";

  return "live";
}

export function classifyM3uGroup(group: string): M3uContentType {
  return classifyM3uEntry(group);
}

function readAttribute(line: string, names: string[]) {
  for (const name of names) {
    const quoted = line.match(new RegExp(`(?:^|[\\s,])${name}\\s*=\\s*["']([^"']*)["']`, "i"));
    if (quoted?.[1]) return quoted[1].trim();

    const unquoted = line.match(new RegExp(`(?:^|[\\s,])${name}\\s*=\\s*([^\\s,]+)`, "i"));
    if (unquoted?.[1]) return unquoted[1].trim();
  }
  return "";
}

function cleanName(value: string) {
  return value.replace(/^\s*,\s*/, "").replace(/\s+/g, " ").trim();
}

function firstCommaOutsideQuotes(line: string) {
  let quote = "";
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === '"' || char === "'") && line[index - 1] !== "\\") quote = quote === char ? "" : quote || char;
    if (char === "," && !quote) return index;
  }
  return -1;
}

export function parseM3u(text: string, sourceCountry?: string): M3uChannel[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const channels: M3uChannel[] = [];
  let pending: Omit<M3uChannel, "url" | "id" | "proxiedUrl"> | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.toUpperCase().startsWith("#EXTINF")) {
      const comma = firstCommaOutsideQuotes(line);
      const fallbackName = comma >= 0 ? cleanName(line.slice(comma + 1)) : "Canal Cineclub";
      const group = readAttribute(line, ["group-title", "group", "category"]) || "Canais ao vivo";
      const name = readAttribute(line, ["tvg-name", "name"]) || fallbackName;
      pending = {
        name,
        group,
        logo: readAttribute(line, ["tvg-logo", "logo", "logo-url"]) || undefined,
        country: readAttribute(line, ["tvg-country", "country"]) || undefined,
        sourceCountry,
        language: readAttribute(line, ["tvg-language", "language"]) || undefined,
        contentType: classifyM3uEntry(group, name),
      };
      continue;
    }

    if (!line.startsWith("#") && pending) {
      const url = line;
      const contentType = classifyM3uEntry(pending.group, pending.name, url);
      const id = `${pending.name}-${url}`.toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      channels.push({
        ...pending,
        contentType,
        id,
        url,
        proxiedUrl: getProxiedStreamUrl(url),
      });
      pending = null;
    }
  }

  const seen = new Set<string>();
  return channels.filter((channel) => {
    const key = channel.url.trim().toLocaleLowerCase("pt-BR");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function loadPremiumM3u() {
  const response = await fetch("/api/premium", { headers: { Accept: "audio/x-mpegurl,text/plain,*/*" } });
  if (!response.ok) {
    let message = `A fonte Premium respondeu HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      /* resposta não JSON */
    }
    throw new Error(message);
  }
  const channels = parseM3u(await response.text(), "Nuvem Premium");
  if (!channels.length) throw new Error("A fonte Premium foi baixada, mas nenhum item foi encontrado.");
  return channels;
}

export async function loadM3u(url = DEFAULT_M3U_URL, sourceCountry?: string) {
  // Tenta carregar diretamente; se falhar por CORS/HTTP, usa o proxy
  let text = "";
  try {
    const response = await fetch(url, { headers: { Accept: "audio/x-mpegurl,text/plain,*/*" } });
    if (response.ok) {
      text = await response.text();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch {
    // Fallback através do proxy do backend Cineclub
    const proxyUrl = getProxiedStreamUrl(url);
    const proxyResponse = await fetch(proxyUrl, { headers: { Accept: "audio/x-mpegurl,text/plain,*/*" } });
    if (!proxyResponse.ok) throw new Error(`A lista respondeu HTTP ${proxyResponse.status}`);
    text = await proxyResponse.text();
  }

  const channels = parseM3u(text, sourceCountry);
  if (!channels.length) throw new Error("A lista foi baixada, mas nenhum canal foi encontrado.");
  return channels;
}
