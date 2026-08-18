# Teste no navegador — canais de referência

URL testada: https://enchanting-marshmallow-5df483.netlify.app/?tv=1

## ISTV

Fonte selecionada: aba **Sinal Aberto**. O canal exibido foi `ISTV (720p) - não 24/7`, identificado como `Referência de teste`. Ao abrir o cartão, o player entrou em estado `Conectando ao canal...` e permaneceu sem imagem visível. A inspeção do elemento de vídeo mostrou `readyState: 0`, `networkState: 2`, `paused: false`, sem erro HTML5 exposto. Resultado: **não confirmou reprodução no navegador; ficou travado em conexão**.

Manifesto da lista Sinal Aberto: `https://stmv1.srvstm.com/sistema7933/sistema7933/playlist.m3u8`.

## Amazon Sat

A aba Sinal Aberto no site publicado exibiu apenas 12 canais de referência/extras e não apresentou Amazon Sat como cartão selecionável. A fonte pública local contém a entrada `Amazon Sat (1080p)` com o manifesto `https://amazonsat.brasilstream.com.br/hls/amazonsat/index.m3u8`, mas essa entrada não apareceu na grade observada do site durante o teste. Portanto, **não foi possível abrir o Amazon Sat pelo player do site publicado**.

## Outras observações

A aba `Todos em Português` carregou 25 canais, sem Amazon Sat. O site publicou a aba Sinal Aberto, mas a grade exibida não correspondeu aos 474 itens do arquivo M3U enviado; isso sugere que o deploy/loader está usando uma seleção reduzida ou que a fonte nova não está sendo filtrada corretamente.

Data do teste: 2026-08-18.
