import React, { useState } from "react";
import { ListPlus, Loader2, Radio, Trash2, X, Check, Link2, FileText } from "lucide-react";
import { parseM3u, type M3uChannel, loadM3u } from "@/lib/m3u";

type CustomM3uModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddChannels: (channels: M3uChannel[], listName: string) => void;
  savedPlaylists: { id: string; name: string; url: string; count: number }[];
  onRemovePlaylist: (id: string) => void;
};

export default function CustomM3uModal({
  isOpen,
  onClose,
  onAddChannels,
  savedPlaylists,
  onRemovePlaylist,
}: CustomM3uModalProps) {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistText, setPlaylistText] = useState("");
  const [mode, setMode] = useState<"url" | "text">("url");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      let channels: M3uChannel[] = [];
      const finalName = playlistName.trim() || (mode === "url" ? "Minha Lista IPTV" : "Lista Personalizada");

      if (mode === "url") {
        const trimmedUrl = playlistUrl.trim();
        if (!trimmedUrl) throw new Error("Informe a URL da lista M3U.");
        channels = await loadM3u(trimmedUrl, finalName);
      } else {
        const trimmedText = playlistText.trim();
        if (!trimmedText) throw new Error("Cole o conteúdo do arquivo M3U.");
        channels = parseM3u(trimmedText, finalName);
        if (!channels.length) throw new Error("Nenhum canal foi encontrado no texto informado.");
      }

      onAddChannels(channels, finalName);
      setSuccessMsg(`Sucesso! ${channels.length} canais carregados.`);
      setPlaylistUrl("");
      setPlaylistText("");
      setPlaylistName("");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Não foi possível carregar a lista M3U.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-m3u-title"
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <div className="custom-m3u-modal">
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Fechar modal de lista M3U"
        >
          <X size={20} />
        </button>

        <div className="custom-m3u-header">
          <div className="m3u-modal-badge">
            <ListPlus size={20} />
          </div>
          <div>
            <h2 id="custom-m3u-title">Adicionar Lista M3U / IPTV</h2>
            <p>Insira sua própria lista de canais para assistir no navegador da sua TV.</p>
          </div>
        </div>

        <div className="m3u-mode-selector">
          <button
            type="button"
            className={mode === "url" ? "active" : ""}
            onClick={() => setMode("url")}
          >
            <Link2 size={16} /> URL da Lista (.m3u / .m3u8)
          </button>
          <button
            type="button"
            className={mode === "text" ? "active" : ""}
            onClick={() => setMode("text")}
          >
            <FileText size={16} /> Colar Texto M3U
          </button>
        </div>

        <form onSubmit={handleSubmit} className="custom-m3u-form">
          <label className="form-field">
            <span>Nome da Lista (Opcional)</span>
            <input
              type="text"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Ex: Meus Canais Favoritos, Esportes..."
            />
          </label>

          {mode === "url" ? (
            <label className="form-field">
              <span>URL da Lista M3U</span>
              <input
                type="url"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="https://exemplo.com/lista.m3u"
                required
                autoFocus
              />
            </label>
          ) : (
            <label className="form-field">
              <span>Conteúdo M3U</span>
              <textarea
                value={playlistText}
                onChange={(e) => setPlaylistText(e.target.value)}
                placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-name='Canal Exemplo',Exemplo TV&#10;http://exemplo.com/stream.m3u8"
                rows={5}
                required
                autoFocus
              />
            </label>
          )}

          {error && <div className="form-error-banner">{error}</div>}
          {successMsg && (
            <div className="form-success-banner">
              <Check size={16} /> {successMsg}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="button button-ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin" /> Processando canais...
                </>
              ) : (
                <>
                  <ListPlus size={16} /> Carregar e Salvar Lista
                </>
              )}
            </button>
          </div>
        </form>

        {savedPlaylists.length > 0 && (
          <div className="saved-playlists-section">
            <h3>Listas Personalizadas Salvas</h3>
            <div className="saved-playlists-list">
              {savedPlaylists.map((pl) => (
                <div key={pl.id} className="saved-playlist-card">
                  <div className="saved-pl-info">
                    <Radio size={16} />
                    <div>
                      <strong>{pl.name}</strong>
                      <small>{pl.count} canais cadastrados</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="saved-pl-delete"
                    onClick={() => onRemovePlaylist(pl.id)}
                    title="Remover esta lista"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
