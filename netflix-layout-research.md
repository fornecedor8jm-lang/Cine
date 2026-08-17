# Pesquisa de referência: organização da Netflix

## Fontes consultadas

1. [Netflix's New Layout: What to Know About the TV Redesign](https://www.netflix.com/tudum/articles/netflix-new-tv-layout)
2. [How to Use Netflix's New Homepage's Features](https://www.netflix.com/tudum/articles/netflix-new-homepage-layout-user-guide)

## Padrões observados

A Netflix descreve a página inicial como um hub central de descoberta. A experiência combina um destaque visual amplo para uma obra em evidência com atalhos de navegação sempre acessíveis no topo, incluindo busca, séries, filmes, jogos e uma área pessoal chamada My Netflix.

O conteúdo é organizado em fileiras horizontais de recomendações. Essas fileiras mudam conforme o histórico de visualização e de navegação, permitindo que a página responda ao momento do usuário em vez de ser apenas uma lista fixa. Para o Cineclub, isso pode virar uma combinação de fileiras temáticas como “Universos sobrenaturais”, “Terror para maratonar” e “Continue explorando”.

Outro ponto importante é reduzir a indecisão. Ao navegar pelos títulos, a Netflix apresenta informações úteis antes da reprodução, como sinopse, duração, elenco, temporadas e outros sinais contextuais. O Cineclub deve fazer o mesmo, mas com uma interface própria e um tom de catálogo de terror/sobrenatural.

Na referência oficial, a navegação é direta, com poucas escolhas de primeiro nível, e a área pessoal concentra itens como continuar assistindo, lista pessoal e lembretes. Como o Cineclub será inicialmente um frontend estático, essa área poderá aparecer como uma versão local e demonstrativa, sem prometer autenticação ou sincronização real.

## Diretrizes que serão aproveitadas no Cineclub

| Padrão da referência | Adaptação planejada para o Cineclub |
|---|---|
| Hero de destaque | Banner editorial escuro com uma série sobrenatural em foco e CTA de detalhes |
| Navegação persistente | Barra superior com marca, Início, Séries, Gêneros, Minha lista e busca |
| Fileiras horizontais | Carrosséis por clima, gênero e disponibilidade de temporadas |
| Descoberta personalizada | Filtros locais por terror, fantasia, dorama, drama e “mais temporadas” |
| Informações antes do play | Modal/página de detalhes com sinopse, metadados e temporadas |
| Hub pessoal | Minha lista local usando estado do navegador, sem simular conta ou reviews |

## Observações complementares de UX

Uma análise independente sobre os padrões da Netflix descreve uma barra de navegação fixa e enxuta, com o item selecionado destacado de forma discreta. A busca aparece como uma ação compacta no topo e atualiza os resultados conforme o usuário digita, usando cards com imagens para tornar os resultados rápidos de escanear. Para o Cineclub, será implementada uma busca local instantânea por título, gênero e palavras-chave da sinopse.

O mesmo estudo destaca que a navegação principal também funciona como um filtro, permitindo reduzir a quantidade de opções sem criar uma tela de filtros pesada. O uso de carrosséis por categoria organiza o catálogo e reduz a sobrecarga visual. A referência também menciona controles de reprodução simples e visíveis, mas o Cineclub não vai simular um player de vídeo sem um acervo de mídia próprio; em vez disso, os botões de cada temporada abrirão os links externos enviados pelo usuário.

Uma das fontes independentes consultadas apresentou bloqueio por captcha durante a leitura automatizada. As conclusões usadas aqui foram limitadas ao conteúdo textual disponibilizado antes do bloqueio e não foram tratadas como uma validação oficial da Netflix.

## Decisão de design

O Cineclub não deve copiar o logotipo, a tipografia, a paleta exata ou a composição proprietária da Netflix. A referência será usada apenas para a arquitetura de descoberta: destaque + navegação simples + fileiras horizontais + detalhes contextuais. A identidade do Cineclub será própria, com atmosfera sobrenatural, vinho queimado, preto azulado, marfim e detalhes em vermelho ritualístico.
