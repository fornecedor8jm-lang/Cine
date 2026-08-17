import React, { useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Circle,
  CornerDownLeft,
  Minimize2,
  Tv,
  Volume2,
  VolumeX,
  X,
  Play,
  RotateCcw,
} from "lucide-react";

type VirtualTvRemoteProps = {
  isOpen: boolean;
  onClose: () => void;
  isTvMode: boolean;
  onToggleTvMode: () => void;
};

export default function VirtualTvRemote({
  isOpen,
  onClose,
  isTvMode,
  onToggleTvMode,
}: VirtualTvRemoteProps) {
  if (!isOpen) return null;

  const dispatchKey = (key: string, keyCode: number) => {
    const activeElement = document.activeElement;
    const eventDown = new KeyboardEvent("keydown", {
      key,
      code: key,
      keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
    });
    (activeElement || window).dispatchEvent(eventDown);

    const eventUp = new KeyboardEvent("keyup", {
      key,
      code: key,
      keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
    });
    (activeElement || window).dispatchEvent(eventUp);
  };

  return (
    <aside
      className="virtual-remote-overlay"
      role="region"
      aria-label="Controle Remoto Virtual para TV"
    >
      <div className="virtual-remote-panel">
        <div className="remote-topline">
          <div className="remote-brand">
            <Tv size={16} />
            <span>Controle TV</span>
          </div>
          <div className="remote-topline-actions">
            <button
              type="button"
              className={`remote-mode-toggle ${isTvMode ? "is-active" : ""}`}
              onClick={onToggleTvMode}
              title="Ativar/Desativar interface de TV"
            >
              {isTvMode ? "Modo TV: ON" : "Modo TV: OFF"}
            </button>
            <button
              type="button"
              className="remote-close-btn"
              onClick={onClose}
              aria-label="Fechar controle virtual"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* D-Pad Controller */}
        <div className="dpad-container">
          <button
            type="button"
            className="dpad-btn dpad-up"
            onClick={() => dispatchKey("ArrowUp", 38)}
            aria-label="Cima"
          >
            <ArrowUp size={20} />
          </button>

          <div className="dpad-middle-row">
            <button
              type="button"
              className="dpad-btn dpad-left"
              onClick={() => dispatchKey("ArrowLeft", 37)}
              aria-label="Esquerda"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              type="button"
              className="dpad-btn dpad-center"
              onClick={() => dispatchKey("Enter", 13)}
              aria-label="OK / Confirmar"
            >
              <strong>OK</strong>
            </button>
            <button
              type="button"
              className="dpad-btn dpad-right"
              onClick={() => dispatchKey("ArrowRight", 39)}
              aria-label="Direita"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          <button
            type="button"
            className="dpad-btn dpad-down"
            onClick={() => dispatchKey("ArrowDown", 40)}
            aria-label="Baixo"
          >
            <ArrowDown size={20} />
          </button>
        </div>

        {/* Function Keys: Back, Home, Play/Pause */}
        <div className="remote-action-row">
          <button
            type="button"
            className="remote-action-btn"
            onClick={() => dispatchKey("Escape", 27)}
            title="Voltar / Sair"
          >
            <RotateCcw size={16} />
            <span>Voltar</span>
          </button>
          <button
            type="button"
            className="remote-action-btn"
            onClick={() => dispatchKey("MediaPlayPause", 179)}
            title="Play / Pause"
          >
            <Play size={16} />
            <span>Play/Pausa</span>
          </button>
          <button
            type="button"
            className="remote-action-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              dispatchKey("Escape", 27);
            }}
            title="Início"
          >
            <CornerDownLeft size={16} />
            <span>Início</span>
          </button>
        </div>

        {/* Smart TV Color Keys */}
        <div className="remote-color-row">
          <button
            type="button"
            className="remote-color-btn color-red"
            onClick={() => dispatchKey("Red", 403)}
            title="Vermelho: Busca"
          >
            <Circle size={10} fill="currentColor" />
            <span>Busca</span>
          </button>
          <button
            type="button"
            className="remote-color-btn color-green"
            onClick={() => dispatchKey("Green", 404)}
            title="Verde: Canais Ao Vivo"
          >
            <Circle size={10} fill="currentColor" />
            <span>Canais</span>
          </button>
          <button
            type="button"
            className="remote-color-btn color-yellow"
            onClick={() => dispatchKey("Yellow", 405)}
            title="Amarelo: Minha Lista"
          >
            <Circle size={10} fill="currentColor" />
            <span>Lista</span>
          </button>
          <button
            type="button"
            className="remote-color-btn color-blue"
            onClick={() => dispatchKey("Blue", 406)}
            title="Azul: Top 5 IMDb"
          >
            <Circle size={10} fill="currentColor" />
            <span>Top 5</span>
          </button>
        </div>

        <p className="remote-hint">
          Funciona com o controle físico da TV, teclado (Setas, Enter, Esc) ou botões acima.
        </p>
      </div>
    </aside>
  );
}
