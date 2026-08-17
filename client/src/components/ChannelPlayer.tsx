import { useEffect, useRef, useState, useMemo } from "react";
import Hls from "hls.js";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
  ListVideo,
  X,
  RotateCcw,
  MoreHorizontal,
  Tv,
  Check,
} from "lucide-react";
import type { M3uChannel } from "@/lib/m3u";

type ChannelPlayerProps = {
  channel: M3uChannel;
  channels?: M3uChannel[];
  onSelectChannel?: (channel: M3uChannel) => void;
  onClose: () => void;
};

type AspectRatioMode = "contain" | "cover" | "16/9" | "4/3";

export default function ChannelPlayer({
  channel,
  channels = [],
  onSelectChannel,
  onClose,
}: ChannelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<number | undefined>(undefined);

  // Playback & Audio State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplayMuted, setIsAutoplayMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingProxy, setUsingProxy] = useState(false);

  // Controls UI
  const [showControls, setShowControls] = useState(true);
  const [showChannelDrawer, setShowChannelDrawer] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>("contain");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [channelDrawerQuery, setChannelDrawerQuery] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Current channel indexing
  const currentChannelIndex = useMemo(() => {
    return channels.findIndex((c) => c.id === channel.id || c.url === channel.url);
  }, [channels, channel]);

  // Handle previous/next channels
  const handlePreviousChannel = () => {
    if (channels.length <= 1 || !onSelectChannel) return;
    const prevIndex = currentChannelIndex <= 0 ? channels.length - 1 : currentChannelIndex - 1;
    onSelectChannel(channels[prevIndex]);
  };

  const handleNextChannel = () => {
    if (channels.length <= 1 || !onSelectChannel) return;
    const nextIndex = currentChannelIndex >= channels.length - 1 ? 0 : currentChannelIndex + 1;
    onSelectChannel(channels[nextIndex]);
  };

  // Reset auto-hide controls timer (5 seconds)
  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !showChannelDrawer && !showMoreMenu) {
        setShowControls(false);
      }
    }, 5000);
  };

  // User Interaction Unmute (Liberar áudio)
  const unmuteAndPlayAudio = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1.0;
    setIsMuted(false);
    setIsAutoplayMuted(false);

    video.play().catch(() => {});
  };

  // Toggle Audio Mute / Unmute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted || isMuted || isAutoplayMuted) {
      unmuteAndPlayAudio();
    } else {
      video.muted = true;
      setIsMuted(true);
      setIsAutoplayMuted(false);
    }
    resetControlsTimer();
  };

  // Toggle Play / Pause
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimer();
  };

  // Toggle Fullscreen
  const toggleFullscreen = async () => {
    const container = playerContainerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      // ignore
    }
    resetControlsTimer();
  };

  // Sync fullscreen change event
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  // Keyboard and Remote Control (D-pad & Color buttons)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      resetControlsTimer();

      // Back / Return buttons on Android TV / Remote / PC
      if (
        event.key === "Escape" ||
        event.key === "Back" ||
        event.key === "GoBack" ||
        event.keyCode === 27 ||
        event.keyCode === 10009 || // Samsung Tizen Return
        event.keyCode === 461 || // LG webOS Back
        event.keyCode === 8 // Backspace
      ) {
        if (showChannelDrawer) {
          event.preventDefault();
          setShowChannelDrawer(false);
          return;
        }
        if (showMoreMenu) {
          event.preventDefault();
          setShowMoreMenu(false);
          return;
        }
        event.preventDefault();
        onClose();
        return;
      }

      // Enter / OK button on player
      if (event.key === "Enter" || event.key === " " || event.keyCode === 13 || event.keyCode === 65385) {
        const active = document.activeElement;
        // If focusing a specific button, let native click happen
        if (active && (active.tagName === "BUTTON" || active.tagName === "INPUT")) {
          return;
        }
        // If autoplay muted, pressing OK un-mutes
        if (isAutoplayMuted || isMuted) {
          event.preventDefault();
          unmuteAndPlayAudio();
          return;
        }
        // Otherwise toggle play/pause
        event.preventDefault();
        togglePlayPause();
        return;
      }

      // Up / Down arrow: Previous / Next channel
      if (event.key === "ArrowUp" || event.key === "ChannelUp" || event.keyCode === 427) {
        if (!showChannelDrawer && !showMoreMenu) {
          event.preventDefault();
          handlePreviousChannel();
        }
      } else if (event.key === "ArrowDown" || event.key === "ChannelDown" || event.keyCode === 428) {
        if (!showChannelDrawer && !showMoreMenu) {
          event.preventDefault();
          handleNextChannel();
        }
      }

      // Mute key
      if (event.key === "m" || event.key === "M" || event.keyCode === 449) {
        event.preventDefault();
        toggleMute();
      }

      // Fullscreen key
      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    showChannelDrawer,
    showMoreMenu,
    isAutoplayMuted,
    isMuted,
    isPlaying,
    currentChannelIndex,
    channels,
  ]);

  // Video Streaming Lifecycle with Hls.js and Native HTML5 Audio
  useEffect(() => {
    let isMounted = true;
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError("");

    // Cleanup previous HLS instance
    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }

    // Determine target URL (direct or fallback to proxy)
    const streamUrl = usingProxy ? channel.proxiedUrl || channel.url : channel.url;

    // Direct Native Audio config: start at 100% volume
    video.volume = 1.0;
    video.muted = false;

    // Helper: start playback and handle Chrome unmuted autoplay rejection gracefully
    const startPlayback = () => {
      if (!isMounted) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!isMounted) return;
            setIsPlaying(true);
            setIsLoading(false);
            setIsMuted(false);
            setIsAutoplayMuted(false);
          })
          .catch(() => {
            // Autoplay with audio was blocked by Chrome policy!
            // Start muted so video displays immediately, and prompt user to unmute
            if (!isMounted) return;
            video.muted = true;
            video.play()
              .then(() => {
                if (!isMounted) return;
                setIsPlaying(true);
                setIsLoading(false);
                setIsMuted(true);
                setIsAutoplayMuted(true);
              })
              .catch((err: any) => {
                if (!isMounted) return;
                setIsLoading(false);
                setIsPlaying(false);
                setError(`Não foi possível iniciar: ${err?.message || "Clique para reproduzir"}`);
              });
          });
      }
    };

    // Check if Hls.js is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 15000,
        levelLoadingMaxRetry: 3,
        fragLoadingTimeOut: 15000,
        fragLoadingMaxRetry: 4,
      });

      hlsInstanceRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!isMounted) return;
        startPlayback();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!isMounted) return;
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try proxy fallback once if direct fails
              if (!usingProxy && channel.proxiedUrl) {
                setUsingProxy(true);
                return;
              }
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setError("Sinal de transmissão temporariamente indisponível.");
              setIsLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("video/mp4")) {
      // Native HLS support (Safari, iOS, Apple TV, Smart TVs with native HLS)
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", startPlayback);
      video.addEventListener("error", () => {
        if (!isMounted) return;
        if (!usingProxy && channel.proxiedUrl) {
          setUsingProxy(true);
        } else {
          setError("Erro ao carregar transmissão no reprodutor nativo.");
          setIsLoading(false);
        }
      });
    } else {
      setError("Seu navegador não suporta streaming HLS.");
      setIsLoading(false);
    }

    resetControlsTimer();

    return () => {
      isMounted = false;
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
      video.removeAttribute("src");
      video.load();
    };
  }, [channel, usingProxy, retryCount]);

  // Filter channels in drawer
  const filteredDrawerChannels = useMemo(() => {
    if (!channelDrawerQuery.trim()) return channels;
    const q = channelDrawerQuery.toLowerCase();
    return channels.filter(
      (c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }, [channels, channelDrawerQuery]);

  // Calculate video aspect ratio style
  const videoStyle = useMemo(() => {
    switch (aspectRatio) {
      case "cover":
        return { objectFit: "cover" as const };
      case "16/9":
        return { objectFit: "fill" as const, aspectRatio: "16/9" };
      case "4/3":
        return { objectFit: "fill" as const, aspectRatio: "4/3" };
      case "contain":
      default:
        return { objectFit: "contain" as const };
    }
  }, [aspectRatio]);

  return (
    <div
      ref={playerContainerRef}
      id="cineclub-player-container"
      className="cineclub-player-container"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onClick={() => {
        // Unmute on tap if autoplay muted
        if (isAutoplayMuted || isMuted) {
          unmuteAndPlayAudio();
        }
        resetControlsTimer();
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        id="cineclub-video-element"
        className="cineclub-video-element"
        style={videoStyle}
        playsInline
        webkit-playsinline="true"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onEnded={() => handleNextChannel()}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="player-loading-overlay">
          <Loader2 className="animate-spin text-pink-500" size={48} />
          <p className="player-loading-text">Conectando ao canal {channel.name}...</p>
        </div>
      )}

      {/* Error Message with Retry */}
      {error && !isLoading && (
        <div className="player-error-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="player-error-box">
            <Tv size={36} className="text-rose-400 mb-2" />
            <h3 className="text-lg font-bold text-white mb-1">Transmissão instável</h3>
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                className="player-retry-btn"
                onClick={() => {
                  setError("");
                  setIsLoading(true);
                  setRetryCount((prev) => prev + 1);
                }}
              >
                <RotateCcw size={16} /> Tentar Novamente
              </button>
              <button
                type="button"
                className="player-next-btn"
                onClick={handleNextChannel}
              >
                Próximo Canal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Autoplay Muted Banner - Tap / OK to unmute */}
      {isAutoplayMuted && (
        <div
          className="player-unmute-banner"
          onClick={(e) => {
            e.stopPropagation();
            unmuteAndPlayAudio();
          }}
        >
          <Volume2 size={20} className="text-pink-400 animate-pulse" />
          <span>Toque ou pressione <strong>OK</strong> para ativar o som</span>
        </div>
      )}

      {/* Top Bar: Channel Info & Back/Close */}
      <div
        className={`player-top-bar ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="player-header-left">
          <button
            id="player-btn-close-top"
            type="button"
            className="player-action-btn player-close-btn"
            title="Fechar player (Esc / Voltar)"
            onClick={onClose}
          >
            <X size={22} />
            <span className="player-btn-label">Fechar</span>
          </button>

          <div className="player-channel-meta">
            {channel.logo && (
              <img
                src={channel.logo}
                alt={channel.name}
                className="player-channel-logo"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            )}
            <div>
              <h2 className="player-channel-name">{channel.name}</h2>
              <div className="player-channel-tags">
                <span className="player-tag-live">● AO VIVO</span>
                <span className="player-tag-group">{channel.group || "Geral"}</span>
                {channel.sourceCountry && (
                  <span className="player-tag-country">{channel.sourceCountry}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar: Fechar | Canais | Anterior | Próximo | Play/Pause | Som | Tela cheia | Mais */}
      <div
        className={`player-bottom-bar ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="player-controls-cluster">
          {/* 1. Fechar */}
          <button
            id="player-btn-close"
            type="button"
            className="player-control-button"
            title="Fechar reprodutor"
            onClick={onClose}
          >
            <X size={20} />
            <span className="control-text">Fechar</span>
          </button>

          {/* 2. Canais */}
          <button
            id="player-btn-channels"
            type="button"
            className={`player-control-button ${showChannelDrawer ? "is-active" : ""}`}
            title="Lista de canais"
            onClick={() => {
              setShowChannelDrawer((prev) => !prev);
              setShowMoreMenu(false);
              resetControlsTimer();
            }}
          >
            <ListVideo size={20} />
            <span className="control-text">Canais</span>
          </button>

          {/* 3. Canal Anterior */}
          <button
            id="player-btn-prev"
            type="button"
            className="player-control-button"
            title="Canal anterior (Seta Cima)"
            onClick={() => {
              handlePreviousChannel();
              resetControlsTimer();
            }}
          >
            <ChevronUp size={20} />
            <span className="control-text">Anterior</span>
          </button>

          {/* 4. Próximo Canal */}
          <button
            id="player-btn-next"
            type="button"
            className="player-control-button"
            title="Próximo canal (Seta Baixo)"
            onClick={() => {
              handleNextChannel();
              resetControlsTimer();
            }}
          >
            <ChevronDown size={20} />
            <span className="control-text">Próximo</span>
          </button>

          {/* 5. Play / Pause */}
          <button
            id="player-btn-playpause"
            type="button"
            className="player-control-button is-primary-play"
            title={isPlaying ? "Pausar" : "Reproduzir"}
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            <span className="control-text">{isPlaying ? "Pausar" : "Play"}</span>
          </button>

          {/* 6. Som / Mudo */}
          <button
            id="player-btn-mute"
            type="button"
            className={`player-control-button ${isMuted || isAutoplayMuted ? "is-muted" : ""}`}
            title={isMuted || isAutoplayMuted ? "Ativar som" : "Silenciar"}
            onClick={toggleMute}
          >
            {isMuted || isAutoplayMuted ? (
              <VolumeX size={20} className="text-rose-400" />
            ) : (
              <Volume2 size={20} />
            )}
            <span className="control-text">
              {isMuted || isAutoplayMuted ? "Ativar som" : "Silenciar"}
            </span>
          </button>

          {/* 7. Tela Cheia */}
          <button
            id="player-btn-fullscreen"
            type="button"
            className="player-control-button"
            title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            <span className="control-text">
              {isFullscreen ? "Reduzir" : "Tela cheia"}
            </span>
          </button>

          {/* 8. Botão "Mais" secundário */}
          <button
            id="player-btn-more"
            type="button"
            className={`player-control-button ${showMoreMenu ? "is-active" : ""}`}
            title="Mais opções"
            onClick={() => {
              setShowMoreMenu((prev) => !prev);
              setShowChannelDrawer(false);
              resetControlsTimer();
            }}
          >
            <MoreHorizontal size={20} />
            <span className="control-text">Mais</span>
          </button>
        </div>
      </div>

      {/* Submenu "Mais" (Proporção de Tela / Recarregar) */}
      {showMoreMenu && (
        <div className="player-more-popover" onClick={(e) => e.stopPropagation()}>
          <div className="player-more-header">
            <span className="text-xs uppercase font-bold text-gray-400">Ajuste de Tela</span>
            <button
              type="button"
              className="text-gray-400 hover:text-white"
              onClick={() => setShowMoreMenu(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="player-more-options">
            <button
              type="button"
              className={`player-more-item ${aspectRatio === "contain" ? "active" : ""}`}
              onClick={() => {
                setAspectRatio("contain");
                setShowMoreMenu(false);
              }}
            >
              <span>Ajustar à tela (Original)</span>
              {aspectRatio === "contain" && <Check size={16} className="text-pink-400" />}
            </button>

            <button
              type="button"
              className={`player-more-item ${aspectRatio === "cover" ? "active" : ""}`}
              onClick={() => {
                setAspectRatio("cover");
                setShowMoreMenu(false);
              }}
            >
              <span>Preencher tela (Zoom)</span>
              {aspectRatio === "cover" && <Check size={16} className="text-pink-400" />}
            </button>

            <button
              type="button"
              className={`player-more-item ${aspectRatio === "16/9" ? "active" : ""}`}
              onClick={() => {
                setAspectRatio("16/9");
                setShowMoreMenu(false);
              }}
            >
              <span>Forçar 16:9 Widescreen</span>
              {aspectRatio === "16/9" && <Check size={16} className="text-pink-400" />}
            </button>

            <button
              type="button"
              className={`player-more-item ${aspectRatio === "4/3" ? "active" : ""}`}
              onClick={() => {
                setAspectRatio("4/3");
                setShowMoreMenu(false);
              }}
            >
              <span>Forçar 4:3 Clássico</span>
              {aspectRatio === "4/3" && <Check size={16} className="text-pink-400" />}
            </button>

            <div className="border-t border-gray-800 my-1"></div>

            <button
              type="button"
              className="player-more-item"
              onClick={() => {
                setError("");
                setIsLoading(true);
                setRetryCount((prev) => prev + 1);
                setShowMoreMenu(false);
              }}
            >
              <RotateCcw size={16} className="text-pink-400" />
              <span>Ressincronizar Transmissão</span>
            </button>
          </div>
        </div>
      )}

      {/* Side Channel Drawer (Zapping) */}
      {showChannelDrawer && (
        <div className="player-drawer-backdrop" onClick={() => setShowChannelDrawer(false)}>
          <div className="player-channel-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <ListVideo size={20} className="text-pink-500" />
                <h3 className="font-bold text-white text-base">Guia de Canais</h3>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowChannelDrawer(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-search">
              <input
                type="text"
                placeholder="Buscar canal..."
                value={channelDrawerQuery}
                onChange={(e) => setChannelDrawerQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="drawer-channels-list">
              {filteredDrawerChannels.map((c, index) => {
                const isSelected = c.id === channel.id || c.url === channel.url;
                return (
                  <button
                    key={c.id || index}
                    type="button"
                    className={`drawer-channel-item ${isSelected ? "is-current" : ""}`}
                    onClick={() => {
                      if (onSelectChannel) {
                        onSelectChannel(c);
                        setShowChannelDrawer(false);
                      }
                    }}
                  >
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt=""
                        className="drawer-item-logo"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="drawer-item-icon">
                        <Tv size={16} />
                      </div>
                    )}
                    <div className="drawer-item-info">
                      <span className="drawer-item-name">{c.name}</span>
                      <span className="drawer-item-group">{c.group}</span>
                    </div>
                    {isSelected && (
                      <span className="drawer-item-badge">No Ar</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
