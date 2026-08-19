# Migração do Cineclub para mobile

## Escopo aplicado

O Cineclub deixou de exibir canais ao vivo, IPTV, listas M3U e a seção Nuvem Premium. Também foram removidos do Home o modo TV, o controle remoto virtual, os atalhos de D-PAD, a barra de ajuda para controle remoto e todas as ações de navegação que apontavam para canais.

A página foi reorganizada para preservar somente o catálogo de filmes e séries, busca, filtros, Top 5, Minha lista, detalhes dos títulos e links de acesso ao conteúdo. O cabeçalho e o rodapé foram ajustados para comunicação mobile.

## Arquivos removidos

- `client/src/components/ChannelPlayer.tsx`
- `client/src/components/CustomM3uModal.tsx`
- `client/src/components/VirtualTvRemote.tsx`
- `client/src/lib/m3u.ts`
- `client/public/playlists/iptvlegal.m3u`
- `client/public/playlists/sinal-aberto-todos-canais.m3u`

## Arquivos modificados

- `client/src/pages/Home.tsx`: remoção de estados, efeitos, handlers, renderização e textos de TV/IPTV.
- `client/src/index.css`: remoção das regras de canais, player ao vivo e layout Android TV; manutenção dos estilos noir e responsivos mobile.

## Validação

- TypeScript: aprovado com `pnpm check`.
- Build de produção: aprovado com `pnpm build`.
- Busca residual em `client/src` e `client/public` por canais, IPTV, M3U, Premium, `tvMode`, `tv-layout`, D-PAD e componentes removidos: nenhum resultado.

O módulo Android TV foi mantido separado do frontend web nesta etapa; a alteração realizada converte a experiência do site para mobile e remove o modo TV da interface web.
