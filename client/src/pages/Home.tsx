// Cineclub / Direção visual: streaming noir ritualístico pensado para mobile.

import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Filter,
  Layers3,
  Languages,
  Menu,
  Play,
  Plus,
  Search,
  Share2,
  Sparkles,
  X,
  Youtube,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { catalog, collections, type AccessLink, type CatalogItem, getCatalogItem } from "@/lib/catalog";

const markUrl = "/posters/cineclub-mark_87e117a8.png";

function ratingStars(rating?: number) {
  const filled = Math.max(0, Math.min(5, Math.round((rating ?? 0) / 2)));
  return `${"★".repeat(filled)}${"☆".repeat(5 - filled)}`;
}

function TopFiveCard({
  item,
  rank,
  isActive,
  onOpen,
  onSelect,
}: {
  item: CatalogItem;
  rank: number;
  isActive: boolean;
  onOpen: () => void;
  onSelect: () => void;
}) {
  return (
    <article className={`top-five-card ${isActive ? "is-active" : ""}`}>
      <button
        type="button"
        className="top-five-poster"
        onClick={onSelect}
        aria-label={`Selecionar Top ${rank}: ${item.title}`}
      >
        <span className="top-five-rank">Top {rank}</span>
        <img src={item.poster} alt={`Pôster de ${item.title}`} loading="lazy" />
        <span className="top-five-play">
          <Play size={15} fill="currentColor" />
        </span>
      </button>
      <div className="top-five-copy">
        <div className="top-five-title">
          <h3>{item.title}</h3>
          <span>{item.year}</span>
        </div>
        <div className="top-five-rating">
          <span className="stars" aria-label={`${item.imdbRating} de 10 no IMDb`}>
            {ratingStars(item.imdbRating)}
          </span>
          <strong>{item.imdbRating?.toFixed(1).replace(".", ",")}/10</strong>
          <small>IMDb</small>
        </div>
        <button type="button" className="top-five-details" onClick={onOpen}>
          Ver detalhes <ArrowUpRight size={13} />
        </button>
      </div>
    </article>
  );
}

function PosterCard({
  item,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: {
  item: CatalogItem;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <article className="poster-card">
      <button
        className="poster-button"
        type="button"
        onClick={onOpen}
        aria-label={`Abrir detalhes de ${item.title}`}
      >
        <div className="poster-frame">
          <img src={item.poster} alt={`Pôster de ${item.title}`} loading="lazy" />
          <div className="poster-scrim" />
          <div className="poster-topline">
            <span>{item.type}</span>
            <span>{item.year ?? "CINECLUB"}</span>
          </div>
          <span className="poster-open">
            <ArrowUpRight size={16} strokeWidth={1.6} />
          </span>
          <div className="poster-hover-copy">
            <span className="mini-kicker">{item.genres[0]}</span>
            <strong>{item.title}</strong>
          </div>
        </div>
      </button>
      <div className="poster-caption">
        <div>
          <h3>{item.title}</h3>
          <p>{item.seasons ?? item.type}</p>
        </div>
        <button
          className={`save-button ${isFavorite ? "is-saved" : ""}`}
          type="button"
          onClick={onToggleFavorite}
          aria-label={
            isFavorite
              ? `Remover ${item.title} da minha lista`
              : `Adicionar ${item.title} à minha lista`
          }
        >
          {isFavorite ? <Check size={15} /> : <Plus size={15} />}
        </button>
      </div>
    </article>
  );
}

function CatalogRow({
  id,
  eyebrow,
  title,
  description,
  items,
  favorites,
  onOpen,
  onToggleFavorite,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: CatalogItem[];
  favorites: string[];
  onOpen: (item: CatalogItem) => void;
  onToggleFavorite: (item: CatalogItem) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) =>
    rowRef.current?.scrollBy({ left: direction * 420, behavior: "smooth" });

  return (
    <section className="catalog-row" data-row={id} aria-labelledby={`${id}-title`}>
      <div className="row-heading shell">
        <div className="row-heading-copy">
          <p className="section-kicker">
            <span />
            {eyebrow}
          </p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="row-controls" aria-label={`Controles de ${title}`}>
          <button type="button" onClick={() => scroll(-1)} aria-label="Voltar cards">
            <ChevronLeft size={19} />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Avançar cards">
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
      <div className="poster-row" ref={rowRef}>
        {items.map((item) => (
          <PosterCard
            key={item.id}
            item={item}
            isFavorite={favorites.includes(item.id)}
            onOpen={() => onOpen(item)}
            onToggleFavorite={() => onToggleFavorite(item)}
          />
        ))}
      </div>
    </section>
  );
}

function AccessRow({ link }: { link: AccessLink }) {
  const icon = link.kind === "youtube" ? <Youtube size={15} /> : <ExternalLink size={15} />;
  const watchLabel = link.label
    .replace(/^Abrir /, "Assistir ")
    .replace(/^Temporada /, "Assistir temporada ")
    .replace(/^Episódio /, "Assistir episódio ")
    .replace(/^1ª temporada$/, "Assistir 1ª temporada")
    .replace(/^2ª temporada$/, "Assistir 2ª temporada");
  return link.href ? (
    <a className="access-row" href={link.href} target="_blank" rel="noreferrer">
      <span className="access-icon">{icon}</span>
      <span className="access-label">
        <strong>{watchLabel}</strong>
        <small>{link.kind === "youtube" ? "Playlist do YouTube" : "Link externo para assistir"}</small>
      </span>
      <ArrowUpRight size={16} className="access-arrow" />
    </a>
  ) : (
    <div className="access-row is-disabled" aria-disabled="true">
      <span className="access-icon">
        <FileText size={15} />
      </span>
      <span className="access-label">
        <strong>{watchLabel}</strong>
        <small>{link.note ?? "Acesso ainda não disponível"}</small>
      </span>
    </div>
  );
}

function DetailsModal({
  item,
  isFavorite,
  onClose,
  onToggleFavorite,
}: {
  item: CatalogItem;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
}) {
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" ||
        event.key === "Back" ||
        event.keyCode === 27 ||
        event.keyCode === 10009 ||
        event.keyCode === 461 ||
        event.keyCode === 8
      ) {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  const shareItem = async () => {
    const shareUrl = `${window.location.origin}/?titulo=${encodeURIComponent(item.id)}`;
    const shareData = {
      title: `${item.title} | Cineclub`,
      text: `Assista ${item.title} no Cineclub.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const helper = document.createElement("textarea");
        helper.value = shareUrl;
        helper.setAttribute("readonly", "true");
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (!copied) throw new Error("Não foi possível copiar o link");
      }

      setShareStatus("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  };

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="details-modal">
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
        >
          <X size={20} />
        </button>
        <div className="details-visual">
          <img src={item.poster} alt={`Pôster de ${item.title}`} />
          <div className="details-visual-overlay" />
          <div className="details-visual-label">
            <span /> CINECLUB STREAMING
          </div>
        </div>
        <div className="details-content">
          <p className="section-kicker">
            <span />
            Escolha para assistir
          </p>
          <h2 id="details-title">{item.title}</h2>
          <div className="detail-meta">
            <span>{item.year ?? "—"}</span>
            <span>{item.rating ? `Classificação ${item.rating}` : item.type}</span>
            <span>{item.seasons}</span>
            <span>{item.language}</span>
          </div>
          <p className="details-synopsis">{item.synopsis}</p>
          <div className="tag-list">
            {item.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="detail-actions">
            <button
              className={`button ${isFavorite ? "button-secondary saved" : "button-secondary"}`}
              type="button"
              onClick={onToggleFavorite}
            >
              {isFavorite ? <Check size={17} /> : <Plus size={17} />}
              {isFavorite ? "Na minha lista" : "Minha lista"}
            </button>
            {item.type === "Filme" && (
              <button
                className="button button-secondary share-button"
                type="button"
                onClick={shareItem}
              >
                <Share2 size={17} /> {shareStatus === "copied" ? "Link copiado" : "Compartilhar"}
              </button>
            )}
            <span className="detail-note">
              <Languages size={15} /> {item.availability}
            </span>
          </div>
          {item.watchUrl && (
            <div className="watch-section">
              <div className="access-heading">
                <div>
                  <p className="section-kicker">
                    <span />
                    Player autorizado
                  </p>
                  <h3>Assista agora</h3>
                </div>
                <Layers3 size={20} />
              </div>
              <a
                className="button button-primary watch-button"
                href={item.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Play size={17} fill="currentColor" /> Assistir agora <ArrowUpRight size={16} />
              </a>
              <p className="watch-caption">
                {item.watchLabel ?? "Você será redirecionado ao player externo."}
              </p>
              <p className="watch-instructions">
                <strong>Aviso:</strong> recarregue a página duas vezes para confirmar que você é
                humano. Depois disso, o player aparecerá para assistir.
              </p>
            </div>
          )}
          {item.accessLinks.length > 0 && (
            <div className="access-section">
              <div className="access-heading">
                <div>
                  <p className="section-kicker">
                    <span />
                    Como assistir
                  </p>
                  <h3>Assista agora</h3>
                </div>
                <Layers3 size={20} />
              </div>
              <div className="access-list">
                {item.accessLinks.map((link) => (
                  <AccessRow key={link.label} link={link} />
                ))}
              </div>
            </div>
          )}
          <p className="legal-note">
            O Cineclub reúne os links informados pelo usuário e direciona você para o serviço externo
            escolhido.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tudo");
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [topIndex, setTopIndex] = useState(0);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cineclub-list") ?? "[]") as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cineclub-list", JSON.stringify(favorites));
  }, [favorites]);

  // Check URL query parameters
  useEffect(() => {
    const sharedId = new URLSearchParams(window.location.search).get("titulo");
    if (!sharedId) return;
    const sharedItem = getCatalogItem(sharedId);
    if (sharedItem) setSelectedItem(sharedItem);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleFavorite = (item: CatalogItem) =>
    setFavorites((current) =>
      current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]
    );

  const scrollTo = (id: string) => {
    document.querySelector(`[data-row="${id}"]`)?.scrollIntoView({ behavior: "auto", block: "start" });
    setMobileOpen(false);
  };

  const filters = ["Tudo", "Sobrenatural", "Terror", "Fantasia", "Drama", "Comédia", "Anime"];
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filtered = useMemo(
    () =>
      catalog.filter((item) => {
        const matchesQuery =
          !normalizedQuery ||
          [item.title, item.synopsis, ...item.genres, ...item.tags]
            .join(" ")
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedQuery);
        const matchesFilter =
          activeFilter === "Tudo" ||
          item.genres.some((genre) =>
            genre.toLocaleLowerCase("pt-BR").includes(activeFilter.toLocaleLowerCase("pt-BR"))
          );
        return matchesQuery && matchesFilter;
      }),
    [activeFilter, normalizedQuery]
  );

  const favoriteItems = favorites
    .map((id) => getCatalogItem(id))
    .filter(Boolean) as CatalogItem[];

  const topFive = useMemo(
    () =>
      catalog
        .filter((item) => item.type === "Série" && typeof item.imdbRating === "number")
        .sort(
          (a, b) =>
            (b.imdbRating ?? 0) - (a.imdbRating ?? 0) ||
            (Number(b.imdbVotes?.replace(/\D/g, "")) || 0) -
              (Number(a.imdbVotes?.replace(/\D/g, "")) || 0)
        )
        .slice(0, 5),
    []
  );

  const hero = topFive[topIndex] ?? topFive[0] ?? catalog[0];

  useEffect(() => {
    if (topFive.length < 2) return;
    const timer = window.setInterval(
      () => setTopIndex((current) => (current + 1) % topFive.length),
      8500
    );
    return () => window.clearInterval(timer);
  }, [topFive.length]);

  const hasSearch = Boolean(normalizedQuery || activeFilter !== "Tudo");

  return (
    <div
      className="cineclub-app"
    >
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="header-inner shell">
          <button
            className="brand"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Voltar ao início do Cineclub"
          >
            <img src={markUrl} alt="" />
            <span>
              cine<em>club</em>
            </span>
          </button>

          <nav
            className={`main-nav ${mobileOpen ? "is-open" : ""}`}
            aria-label="Navegação principal"
          >
            <button
              className="active"
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Início
            </button>
            <button type="button" onClick={() => scrollTo("doors")}>
              Séries
            </button>
            <button type="button" onClick={() => scrollTo("terror")}>
              Terror
            </button>
            <button type="button" onClick={() => scrollTo("films")}>
              Filmes
            </button>
            <button type="button" onClick={() => scrollTo("top-five")}>
              Top 5 IMDb
            </button>
            <button type="button" onClick={() => scrollTo("my-list")}>
              Minha lista <span>{favorites.length || ""}</span>
            </button>
            <button type="button" onClick={() => scrollTo("about")}>
              Sobre
            </button>
          </nav>

          <div className="header-tools">
            <label className="search-field">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar títulos"
                aria-label="Buscar no catálogo"
              />
            </label>



            <button
              className="mobile-menu"
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section" style={{ backgroundImage: `url(${hero.poster})` }}>
          <div className="hero-overlay" />
          <div className="hero-grain" />
          <div className="hero-content shell">
            <p className="hero-kicker">
              <span /> TOP {topIndex + 1} / RECOMENDADOS PELO IMDb
            </p>
            <h1>{hero.title}</h1>
            <p className="hero-intro">Uma das séries mais bem avaliadas do catálogo.</p>
            <p className="hero-copy">{hero.synopsis}</p>
            <div className="hero-meta">
              <span>{hero.year}</span>
              <span>{hero.type}</span>
              <span>{hero.seasons}</span>
              <span>{hero.genres[0]}</span>
              <span className="hero-imdb">
                <strong>{ratingStars(hero.imdbRating)}</strong>{" "}
                {hero.imdbRating?.toFixed(1).replace(".", ",")}/10 IMDb
              </span>
            </div>
            <div className="hero-actions">
              <button
                className="button button-primary"
                type="button"
                onClick={() => setSelectedItem(hero)}
              >
                <Play size={17} fill="currentColor" /> Assistir agora
              </button>
              <button
                className="button button-ghost"
                type="button"
                onClick={() => toggleFavorite(hero)}
              >
                {favorites.includes(hero.id) ? <Check size={17} /> : <Plus size={17} />}
                {favorites.includes(hero.id) ? "Na minha lista" : "Minha lista"}
              </button>
            </div>
          </div>
          <div className="hero-index">
            TOP {topIndex + 1} <span>/</span> 05
          </div>
          <div className="hero-bottom-line shell">
            <span>STREAMING CINECLUB</span>
            <span>Assista no celular, onde estiver</span>
            <ArrowUpRight size={15} />
          </div>
        </section>

        {/* Top 5 Section */}
        <section
          className="top-five-section shell"
          data-row="top-five"
          aria-labelledby="top-five-title"
        >
          <div className="top-five-heading">
            <div>
              <p className="section-kicker">
                <span />
                Ranking do catálogo
              </p>
              <h2 id="top-five-title">Top 5 recomendados pelo IMDb</h2>
              <p>Somente séries disponíveis no Cineclub, ordenadas pela nota exibida no IMDb.</p>
            </div>
            <span className="top-five-updated">Notas conferidas em 2026</span>
          </div>
          <div className="top-five-grid">
            {topFive.map((item, index) => (
              <TopFiveCard
                key={item.id}
                item={item}
                rank={index + 1}
                isActive={index === topIndex}
                onSelect={() => setTopIndex(index)}
                onOpen={() => setSelectedItem(item)}
              />
            ))}
          </div>
        </section>

        {/* Catalog Search & Genres */}
        <section className="discovery-strip shell" aria-label="Filtros do catálogo">
          <div className="discovery-copy">
            <p className="section-kicker">
              <span />
              Explore o catálogo
            </p>
            <h2>Encontre algo para assistir.</h2>
          </div>
          <div className="filter-list">
            {filters.map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? "active" : ""}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="discovery-status">
            <Filter size={15} /> {filtered.length} títulos
          </div>
        </section>

        {/* Catalog Grid / Rows */}
        <section className="catalog-area">
          {hasSearch ? (
            <div className="search-results shell">
              <div className="row-heading-copy">
                <p className="section-kicker">
                  <span />
                  Busca no catálogo
                </p>
                <h2>
                  {normalizedQuery
                    ? `Resultados para “${query}”`
                    : `Títulos de ${activeFilter}`}
                </h2>
                <p>
                  {filtered.length
                    ? "Escolha um título para assistir agora."
                    : "Nenhum título encontrado. Tente outra palavra ou outro clima."}
                </p>
              </div>
              {filtered.length ? (
                <div className="results-grid">
                  {filtered.map((item) => (
                    <PosterCard
                      key={item.id}
                      item={item}
                      isFavorite={favorites.includes(item.id)}
                      onOpen={() => setSelectedItem(item)}
                      onToggleFavorite={() => toggleFavorite(item)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Sparkles size={22} />
                  <span>Nenhum título disponível com essa busca.</span>
                </div>
              )}
            </div>
          ) : (
            <>
              {favoriteItems.length > 0 && (
                <CatalogRow
                  id="my-list"
                  eyebrow="Sua seleção"
                  title="Minha lista"
                  description="Títulos guardados para assistir em uma próxima sessão."
                  items={favoriteItems}
                  favorites={favorites}
                  onOpen={setSelectedItem}
                  onToggleFavorite={toggleFavorite}
                />
              )}
              {favoriteItems.length === 0 && (
                <section className="empty-list shell" data-row="my-list">
                  <div>
                    <p className="section-kicker">
                      <span />
                      Minha lista
                    </p>
                    <h2>Salve para assistir depois.</h2>
                    <p>Adicione títulos com o símbolo + e eles aparecerão aqui.</p>
                  </div>
                  <BookOpen size={28} />
                </section>
              )}
              {collections.map((collection) => {
                const items = collection.itemIds
                  .map((id) => getCatalogItem(id))
                  .filter(Boolean) as CatalogItem[];
                return (
                  <CatalogRow
                    key={collection.id}
                    id={collection.id}
                    eyebrow={collection.eyebrow}
                    title={collection.title}
                    description={collection.description}
                    items={items}
                    favorites={favorites}
                    onOpen={setSelectedItem}
                    onToggleFavorite={toggleFavorite}
                  />
                );
              })}
            </>
          )}
        </section>

        {/* About section */}
        <section
          className="about-section shell"
          data-row="about"
          aria-labelledby="about-title"
        >
          <div className="about-intro">
            <p className="section-kicker">
              <span />
              Nossa história
            </p>
            <h2 id="about-title">O Cine Club começou em outro lugar.</h2>
            <p className="about-lead">
              Antes de ser uma área própria de entretenimento, o projeto nasceu dentro do site
              Caçadores Winchesters.
            </p>
          </div>
          <div className="about-story">
            <p>
              Anteriormente chamado de <strong>Cineclube</strong>, o projeto funcionava como uma
              aba ligada ao universo de Supernatural e aos conteúdos relacionados aos Winchesters.
            </p>
            <p>
              Com o tempo, o Cineclube ganhou identidade própria como <strong>Cine Club</strong>:
              pensado para uma experiência simples, rápida e confortável no celular.
            </p>
          </div>
          <div className="about-pillars" aria-label="Pilares do projeto">
            <article>
              <span>01</span>
              <h3>Cine Club</h3>
              <p>A área audiovisual que cresceu e ganhou seu próprio espaço.</p>
            </article>
          </div>
        </section>
      </main>

      {/* Persistent TV Remote Helper Bar at bottom of screen in TV Mode */}
      <footer className="site-footer shell">
        <div className="footer-brand">
          <img src={markUrl} alt="" />
          <span>
            cine<em>club</em>
          </span>
        </div>
        <p>Uma curadoria independente para histórias que deixam marcas.</p>
        <span className="footer-stamp">MOBILE EDITION 2026</span>
      </footer>

      {/* Modals & Player */}
      {selectedItem && (
        <DetailsModal
          item={selectedItem}
          isFavorite={favorites.includes(selectedItem.id)}
          onClose={() => setSelectedItem(null)}
          onToggleFavorite={() => toggleFavorite(selectedItem)}
        />
      )}


    </div>
  );
}
