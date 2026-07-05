# André Borges — Psicólogo de Relacionamentos

Site institucional de página única, reconstruído como **site estático** (HTML + CSS + JS puro) a partir do HTML salvo do site original (`psiandreborges.arthea.com.br`, originalmente feito em React/Lovable).

## Estrutura

```
index.html              ← página completa (todo o conteúdo)
assets/css/styles.css   ← CSS compilado (Tailwind + tema customizado)
assets/js/main.js       ← interações (FAQ, animações de scroll, marquee, cursor)
assets/img/             ← imagens (ATENÇÃO: são placeholders — ver abaixo)
src/styles.css          ← fonte do CSS (tema, variáveis, componentes)
tailwind.config.js      ← config do Tailwind (cores e fontes do tema)
```

## ⚠️ Imagens são placeholders

O arquivo HTML salvo não incluía as fotos originais, então as imagens em
`assets/img/` são **gradientes gerados na paleta do site**. Para restaurar as
fotos reais, basta substituir os arquivos **mantendo os mesmos nomes**:

| Arquivo | Conteúdo original |
|---|---|
| `andre-portrait-Deb0SfYB.jpg` | Retrato do André (seção "Quem sou") |
| `office-C20hA_43.jpg` | Foto do consultório (seção FAQ) |
| `diptych-desktop-BRiQt_hI.webp` | Fundo desktop da seção "Não é falta de amor" |
| `diptych-couple-DIebyvob.webp` | Foto do casal (hero desktop + mesma seção no mobile) |
| `manifesto-leighton-DSFRYqsM.webp` | Pintura de fundo do manifesto (11% opacidade) |
| `closing-mobile.webp` | Fundo mobile da seção final |
| `secaofinal-desktop.webp` | Fundo desktop da seção final |

Essas fotos estão na pasta `..._files/` que o navegador criou junto do HTML
salvo ("Salvar como → Página completa").

### Medalhões da seção "Você já se viu em alguma dessas situações?"

Em `assets/img/situacoes/` — um por card, recorte circular com fundo
transparente (WebP, ~520px). Substituir mantendo os nomes:

| Arquivo | Card |
|---|---|
| `situacao-brigas.webp` | "A gente tenta conversar, mas sempre termina em briga." |
| `situacao-afastamento.webp` | "Sinto que a gente se afastou." |
| `situacao-espelho.webp` | "Às vezes me pergunto se sou eu o problema." |
| `situacao-conflitos.webp` | "A gente repete os mesmos conflitos." |
| `situacao-encruzilhada.webp` | "Vale investir ou já passou do ponto?" |
| `situacao-sozinha.webp` | "Estou carregando isso sozinha." |
| `situacao-filho.webp` | "Quando o filho chegou, a gente parou de ser casal." |
| `situacao-solidao.webp` | "Durmo do lado dele todo dia e me sinto completamente só." |

## Observações da reconstrução

- **Cores**: `--bone-warm: #F2F0E9` e `--ink-deep: #14201A` foram extraídas de
  estilos inline do HTML original; as demais variáveis da paleta foram
  recriadas por aproximação. Ajustes finos podem ser feitos em `src/styles.css`.
- **Fontes**: o CSS original não estava disponível; foram escolhidas
  **Fraunces** (títulos/serif), **Inter** (texto) e **IBM Plex Mono**
  (etiquetas), via Google Fonts.
- Todo o **texto, estrutura, links de WhatsApp, SEO/meta tags e ordem das
  seções** são idênticos ao original.

## Desenvolvimento

Para alterar estilos, edite `src/styles.css` e recompile:

```bash
npm install
npm run build:css
```

Para publicar, basta servir a pasta como site estático (GitHub Pages, Netlify,
Vercel etc.) — não há build de aplicação, o `index.html` já é final.
