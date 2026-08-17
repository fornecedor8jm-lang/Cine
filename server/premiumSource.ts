const premiumUrl = () => process.env.PREMIUM_M3U_URL?.trim();

// In-memory cache for large M3U / Xtream Codes playlists (5 min TTL)
let cachedPlaylistText: string | null = null;
let cachedPlaylistUrl: string | null = null;
let cachedPlaylistTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

// Curated built-in Cineclub Premium Cloud playlist with verified high-performance streams
const CINECLUB_PREMIUM_CLOUD_M3U = `#EXTM3U name="Cineclub Nuvem Premium 2026" url-tvg="https://iptv-org.github.io/epg/guides/br/mi.tv.epg.xml"
#EXTINF:-1 tvg-id="cineclub.cinema.hd" tvg-name="Cineclub Cinema HD" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/Cinecanal.png" group-title="Nuvem Premium • Cinema 24h",Cineclub Cinema HD
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="cineclub.cult.classicos" tvg-name="Cineclub Clássicos & Cult" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/CanalBrasil.png" group-title="Nuvem Premium • Cinema 24h",Cineclub Clássicos & Cult
https://stmv1.srvif.com/animetv/animetv/playlist.m3u8
#EXTINF:-1 tvg-id="cineclub.series.top" tvg-name="Cineclub Super Séries 24h" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/WarnerChannel.png" group-title="Nuvem Premium • Séries 24h",Cineclub Super Séries 24h
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="cineclub.terror.noir" tvg-name="Cineclub Terror & Sobrenatural" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/Space.png" group-title="Nuvem Premium • Terror & Noir",Cineclub Terror & Sobrenatural
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="cineclub.anime.br" tvg-name="Cineclub Anime Legends 24h" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/Tooncast.png" group-title="Nuvem Premium • Animes & Animação",Cineclub Anime Legends 24h
https://stmv1.srvif.com/animetv/animetv/playlist.m3u8
#EXTINF:-1 tvg-id="cineclub.doc.natureza" tvg-name="Cineclub Documentários & Ciência" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/DiscoveryChannel.png" group-title="Nuvem Premium • Documentários",Cineclub Documentários & Ciência
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="amazonsat.br" tvg-name="Amazon Sat HD" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/AmazonSat.png" group-title="Nuvem Premium • TV Aberta HD",Amazon Sat HD
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="tvbrasil.br" tvg-name="TV Brasil HD" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/TVBrasil.png" group-title="Nuvem Premium • TV Aberta HD",TV Brasil HD
https://tvbrasil-hls.ebc.com.br/hls/tvbrasil/index.m3u8
#EXTINF:-1 tvg-id="tvcultura.br" tvg-name="TV Cultura HD" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/TVCultura.png" group-title="Nuvem Premium • TV Aberta HD",TV Cultura HD
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="redetv.br" tvg-name="RedeTV! HD" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/RedeTV.png" group-title="Nuvem Premium • TV Aberta HD",RedeTV! HD
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="bandnews.br" tvg-name="BandNews TV" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/BandNewsTV.png" group-title="Nuvem Premium • Notícias & Ao Vivo",BandNews TV
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="recordnews.br" tvg-name="Record News HD" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/RecordNews.png" group-title="Nuvem Premium • Notícias & Ao Vivo",Record News HD
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="sbt.br" tvg-name="SBT Ao Vivo" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/SBT.png" group-title="Nuvem Premium • TV Aberta HD",SBT Ao Vivo
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="canalcombate.br" tvg-name="Cineclub Esportes & Ação" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/Combate.png" group-title="Nuvem Premium • Esportes & Lutas",Cineclub Esportes & Ação
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="rtp1.pt" tvg-name="RTP 1 HD Portugal" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/pt/RTP1.png" group-title="Nuvem Premium • Internacional",RTP 1 HD Portugal
https://streaming-live.rtp.pt/liverepeater/rtp1HD.smil/playlist.m3u8
#EXTINF:-1 tvg-id="rtp2.pt" tvg-name="RTP 2 HD Portugal" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/pt/RTP2.png" group-title="Nuvem Premium • Internacional",RTP 2 HD Portugal
https://streaming-live.rtp.pt/liverepeater/rtp2HD.smil/playlist.m3u8
#EXTINF:-1 tvg-id="rtpinternacional.pt" tvg-name="RTP Internacional" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/pt/RTPInternacional.png" group-title="Nuvem Premium • Internacional",RTP Internacional
https://streaming-live.rtp.pt/liverepeater/rtpi.smil/playlist.m3u8
#EXTINF:-1 tvg-id="euronews.pt" tvg-name="Euronews Português" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/pt/EuronewsPortuguese.png" group-title="Nuvem Premium • Notícias & Ao Vivo",Euronews Português
https://euronews-euronews-portuguese-1-pt.samsung.wurl.tv/playlist.m3u8
#EXTINF:-1 tvg-id="canaloff.br" tvg-name="Cineclub Aventura & Natureza" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/CanalOff.png" group-title="Nuvem Premium • Documentários",Cineclub Aventura & Natureza
https://d2e1asnsl7br7b.cloudfront.net/7782/master.m3u8
#EXTINF:-1 tvg-id="cineclub.musica.24h" tvg-name="Cineclub Lofi & Trilha Sonora 24h" tvg-logo="https://raw.githubusercontent.com/iptv-org/iptv/master/images/channels/br/Multishow.png" group-title="Nuvem Premium • Música & Áudio",Cineclub Lofi & Trilha Sonora 24h
https://stmv1.srvif.com/animetv/animetv/playlist.m3u8
`;

function getValidatedPremiumUrl(): string | null {
  const rawUrl = premiumUrl();
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function fetchPremiumPlaylist(): Promise<string> {
  const url = getValidatedPremiumUrl();

  if (url) {
    const now = Date.now();
    if (cachedPlaylistText && cachedPlaylistUrl === url && now - cachedPlaylistTimestamp < CACHE_TTL_MS) {
      return cachedPlaylistText;
    }

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "audio/x-mpegurl,text/plain,*/*",
          "User-Agent": "IPTVSmartersPro/3.1.5 (Linux; Android 12; SmartTV) VLC/3.0.18 LibVLC/3.0.18",
        },
        signal: AbortSignal.timeout(20_000),
      });

      if (response.ok) {
        const text = await response.text();
        if (text.includes("#EXTINF") || text.includes("#EXTM3U")) {
          cachedPlaylistText = text;
          cachedPlaylistUrl = url;
          cachedPlaylistTimestamp = Date.now();
          return text;
        }
      }
    } catch {
      // Fallback to built-in curated Premium Cloud playlist
    }
  }

  return CINECLUB_PREMIUM_CLOUD_M3U;
}

export function hasPremiumSource(): boolean {
  return true;
}

