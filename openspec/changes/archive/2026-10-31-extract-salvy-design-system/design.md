## Context

**Estado atual inspecionado em 2026-10-30:**

- **Stack:**
  - Next.js 16.4.3 com App Router e `cacheComponents`, `partialPrefetching` e
    `experimental.agentFeedback` habilitados.
  - React 19.3.0.
  - Tailwind CSS 4.3.3 via `@tailwindcss/turbopack`, configurado como regra
    `turbopack.rules["*.css"]` no `next.config.ts`.
  - `radix-ui@1.8.1`, o pacote unificado.
  - `class-variance-authority`, `lucide-react@^1.64` e `tw-animate-css`.
- **Gerenciador de pacotes:** npm (`package-lock.json`), conforme
  CLAUDE.md, AGENTS.md, GEMINI.md e `openspec/config.yaml`, todos já
  sincronizados pelo usuário.
- **Estrutura real (diverge das convenções):** fica na raiz, sem `src/`.
  - Pastas: `app/`, `components/ui/`, `lib/`.
  - Alias `@/*` → `./*`.
  - `components.json` do shadcn com estilo `radix-luma`, `tailwind.css:
    app/globals.css` e aliases `@/components/ui`, `@/lib/utils` e `@/hooks`.
  - A pasta `types/` na raiz é uma cópia versionada e desatualizada de
    `.next/types` (aponta para `../../app/page.js`). O `include` `**/*.ts` do
    `tsconfig.json` a inclui e ela quebra o `tsc` (descoberto na
    implementação).
- **UI existente:**
  - `components/ui/button.tsx` (scaffold `radix-luma`).
  - `app/page.tsx` (home padrão do create-next-app).
  - `lib/utils.ts`, que reexporta `cn` do pacote `cn@0.4.0`. É o substituto
    compilado de `clsx` + `tailwind-merge` mantido pelo shadcn.
- **CSS global (`app/globals.css`):**
  - Tema oklch neutro.
  - Importa `shadcn/tailwind.css`, mas o pacote `shadcn` não existe, o que é
    provável quebra de build.
- **`app/layout.tsx`:** carrega Inter, Geist e Geist Mono via `next/font/google`
  e usa `lang="en"`.
- **Testes:** `vitest`, `jsdom`, `@vitejs/plugin-react` e `@testing-library/*`
  estão instalados, mas faltam configuração do Vitest e os scripts `typecheck`
  e `test`.
- **`node_modules`:** contém pacotes extraneous (por exemplo `cmdk`, `sonner`,
  `embla-carousel-react`, `recharts`, `framer-motion` e `next-themes`) que não
  estão no `package.json` nem no lockfile.

**Pacote de origem:** `~/Downloads/salvy-design-system`.

- 55 componentes shadcn tematizados, que importam `@radix-ui/react-*`
  individuais.
- `tokens.json` (DTCG) como fonte canônica.
- `scripts/build-tokens.mjs` + `theme-template.css` geram `src/index.css`.
- `scripts/font-faces.css`: cerca de 245 KB de fontes woff2 em base64.
- Logos em `docs/references/logos/`.
- O tema claro é observado no site público. O escuro, os papéis de foco, a
  escala de espaçamento e os estados não vistos são derivados.

**Restrição do pedido:** não instalar o pacote inteiro. Só extrair marca, cores,
tipografia, layout e os grupos de componentes Ações, Formulários e campos,
Overlays, Menus e navegação, Exibição de dados, Feedback e Estrutura.

## Goals / Non-Goals

**Goals:**

- Alinhar a estrutura do repositório às convenções (`src/`, `@/` → `src/`,
  `npm run typecheck`, `npm test`) e eliminar o import quebrado e as
  dependências não declaradas.
- Ter no projeto uma cópia local, rastreável e regenerável do tema Salvy, com
  `tokens.json` como única fonte de valores.
- Disponibilizar em `@/components/ui/*` os 46 componentes dos grupos pedidos
  que não exigem dependência nova, com comportamento Radix e acessibilidade
  preservados.
- Manter Server Components por padrão, com `"use client"` só onde necessário.
- Comprovar a integração no navegador: fontes, cores, cantos, foco, estados e
  responsividade, sem erros de hydration.
- Deixar `npm run typecheck`, `npm test` e `npm run build` verdes numa árvore
  de dependências sem pacotes extraneous.

**Non-Goals:**

- Telas do fluxo de linhas, backend, `openapi.yaml`, Orval e Scalar.
- Modo escuro ativo ou alternador de tema.
- Gráficos (`chart`/`recharts`) e preview navegável do DS.
- Instalar qualquer pacote novo, e extrair ou recriar à mão command, drawer,
  sonner, input-otp, carousel, calendar, form e resizable (D7).
- Atualizar versões, ou editar CLAUDE.md, AGENTS.md, GEMINI.md ou
  `openspec/config.yaml`.

## Decisions

### D0. Mover o código para `src/` antes de extrair

Mover com `git mv` para o histórico continuar rastreável:

- `app/` → `src/app/`
- `components/` → `src/components/`
- `lib/` → `src/lib/`

Ajustes que acompanham a mudança:

- `tsconfig.json`: `"@/*": ["./src/*"]`.
- `components.json`: `tailwind.css: "src/app/globals.css"`. Os aliases `@/...`
  continuam válidos.
- Ficam na raiz: `public/`, `next.config.ts`, `eslint.config.mjs`, `scripts/`
  e os arquivos de configuração.
- `types/` é removida com `git rm`. O Next gera esses tipos em `.next/types`,
  que o `next-env.d.ts` já referencia.

**Por quê:** o Next detecta `src/app` nativamente, sem configuração extra, e as
convenções do projeto exigem `src/`.

**Alternativa:** manter a raiz. Rejeitada porque contraria o CLAUDE.md, o
AGENTS.md, o GEMINI.md e o `config.yaml`, e a próxima mudança (backend em
`src/server/...`) herdaria a inconsistência.

Fazer a reestruturação antes também evita criar 46 componentes e movê-los
depois.

**Rollback:** como é um `git mv` isolado em commit próprio, basta reverter o
commit.

### D1. Extrair para o projeto em vez de depender do pacote

Os arquivos são copiados e adaptados para `src/components/ui`, `src/hooks`,
`src/lib/design-system` e `public/brand`. Os imports usam
`@/components/ui/<nome>`.

- **Por quê:** é o pedido explícito do usuário e segue o padrão shadcn já
  configurado. Também evita um pacote `file:` fora do repositório
  (`~/Downloads`), que quebraria em outra máquina.
- **Consequência:** `transpilePackages` não é necessário. O código é local e
  o Next já o compila. O `next.config.ts` fica intacto.
- **Alternativa A:** dependência `file:../Downloads/...` com `transpilePackages`.
  Rejeitada porque contraria o pedido, aponta para fora do repositório e traria
  28 pacotes `@radix-ui/react-*`, `recharts`, `framer-motion`, `zod@3` etc.
- **Alternativa B:** alias `paths` `@workspace/salvy-design-system/*`.
  Rejeitada porque simula um pacote inexistente, contraria a convenção de
  imports (`@/` → `src/`), e `@import` CSS processado pelo Tailwind não
  respeita `paths` do tsconfig.

### D2. Tokens: copiar `tokens.json` e gerar o tema localmente

O pipeline de tokens fica assim:

- **Fontes de verdade em `src/lib/design-system/`:** `tokens.json` (cópia
  canônica), `theme-template.css` (adaptado) e `font-faces.css`.
- **Gerador:** `scripts/build-salvy-tokens.mjs`, portado de `build-tokens.mjs`,
  produz apenas `src/app/salvy-theme.css`, com cabeçalho "GERADO — não
  editar". O favicon, o `index.html` e o `tokens.tsx` não são gerados, porque
  não há consumidor Expo.
- **Template adaptado:**
  - Remove `@source "./components"`, porque os componentes locais já são
    escaneados.
  - Remove `@plugin "@tailwindcss/typography"`, porque nenhum componente usa
    `prose`.
  - Importa `font-faces.css` por caminho relativo
    (`../lib/design-system/font-faces.css`).
- **CSS global:** `src/app/globals.css` passa a conter só
  `@import "./salvy-theme.css";` e ajustes de base que já existam no template.
  O bloco `.dark` é mantido, mas nada adiciona a classe `dark`.
- **Por quê:** o guia do pacote exige não manter uma "cópia independente dos
  valores". Gerar a partir de `tokens.json` preserva a rastreabilidade e
  permite atualizar a paleta com um comando (`npm run tokens`).
- **Alternativa:** copiar `src/index.css` já gerado. Rejeitada porque vira
  cópia estática sem caminho de regeneração.

### D3. Fontes incorporadas em vez de `next/font`

O `font-faces.css` (Poppins, Inter e Geist Mono embutidas) é importado pelo
tema. `Inter`, `Geist` e `Geist_Mono` saem do `src/app/layout.tsx`. As
variáveis `--app-font-sans`, `--app-font-display` e `--app-font-mono` vêm dos
tokens.

- **Por quê:** as fontes são exatamente as observadas no site, com proveniência
  documentada. O build não depende da rede para buscar o Google Fonts, e fica
  uma só fonte de tipografia.
- **Custo:** cerca de 245 KB de CSS com base64 no bundle global, sem
  subsetting.
- **Alternativa:** `next/font/google` para Poppins e Inter. Fica registrada como
  otimização futura.

### D4. Radix via pacote unificado `radix-ui`

As trocas de import seguem dois padrões:

- `import * as XPrimitive from "@radix-ui/react-x"` vira
  `import { X as XPrimitive } from "radix-ui"`.
- `Slot` passa a `Slot.Root`, como no `button.tsx` atual.

**Por quê:** o `radix-ui@1.8.1` já está instalado e reexporta todas as
primitives usadas (Accordion, AlertDialog, AspectRatio, Avatar, Checkbox,
Collapsible, ContextMenu, Dialog, DropdownMenu, HoverCard, Label, Menubar,
NavigationMenu, Popover, Progress, RadioGroup, ScrollArea, Select, Separator,
Slider, Slot, Switch, Tabs, Toast, Toggle, ToggleGroup e Tooltip). Isso evita
28 dependências novas e versões duplicadas de Radix.

Nenhuma primitive é reescrita: só o specifier do import muda.

### D5. Utilitário `cn` e imports internos

- `@/lib/utils` (pacote `cn`) é mantido. Ele é API-compatível com
  `clsx` + `twMerge`, então `tailwind-merge` não é necessário.
- Imports `../../lib/utils`, `../../hooks/*` e `./x` passam a `@/lib/utils`,
  `@/hooks/*` e `@/components/ui/x`.
- Os hooks sem JSX passam a `.ts` (`use-toast.ts`, `use-mobile.ts`).

### D6. Limites entre Server e Client Components

Cada componente extraído é auditado:

- **Recebem `"use client"` (31):** arquivos que usam hooks, criam contexto,
  registram handlers ou envolvem uma primitive Radix. Os wrappers Radix leem
  `XPrimitive.Root.displayName`. Num Server Component, a primitive é uma
  referência cliente, e essa leitura falha. Por isso até separator,
  aspect-ratio, label e progress ficam cliente. `field` (usa `useMemo`) e
  `input-group` (usa `onClick`) também.
- **Ficam sem diretiva (15):** alert, badge, breadcrumb, button,
  button-group, card, empty, input, item, kbd, pagination, skeleton, spinner,
  table e textarea. Eles usam no máximo `Slot.Root` como elemento e podem ser
  renderizados por Server Components.

Páginas e layouts continuam Server Components.

### D7. Nenhuma dependência nova: oito componentes omitidos, não recriados

Decisão do usuário em 2026-10-30, depois de avaliar cada pacote. Os
componentes abaixo **não** são extraídos, e **não** são recriados à mão:

| Componente | Pacote que exigiria | Função do pacote |
| --- | --- | --- |
| command | `cmdk` | Lista filtrável com o padrão ARIA de combobox |
| drawer | `vaul` | Gaveta inferior com gesto de arrasto |
| sonner | `sonner` | Notificações empilhadas |
| input-otp | `input-otp` | Código de verificação em caixas |
| carousel | `embla-carousel-react` | Carrossel com arrasto |
| calendar | `react-day-picker` (+ `date-fns`) | Calendário e seletor de datas |
| form | `react-hook-form` (+ `@hookform/resolvers` v5 para Zod 4) | Estado de formulário |
| resizable | `react-resizable-panels` | Painéis redimensionáveis |

- **Por que omitir:** nenhuma tela prevista (solicitação com DDD e plano,
  status e lista de linhas) precisa deles. Cada pacote seria mais uma
  dependência para manter e auditar, e o `node_modules` cresceria cerca de
  70 MB, quase tudo do `react-day-picker`. A regra do projeto pede uma
  justificativa concreta para cada dependência.
- **Por que não recriar:** o valor dessas bibliotecas está em casos difíceis,
  como o combobox ARIA, a navegação em grade do calendário, o preenchimento
  automático de código de SMS e o arrasto com teclado virtual. Recriá-los à mão
  contraria o pedido ("não recrie primitives"), arrisca regressões de
  acessibilidade e cria um framework interno sem necessidade real.
- **Consistência verificada:** nenhum dos 46 componentes mantidos importa um
  dos oito omitidos. Só o `command` importava o `dialog`, nunca o inverso.
- **Consequências:**
  - `next-themes` (usado só pelo `sonner`) e `@hookform/resolvers` também
    ficam fora.
  - A adaptação "sonner com tema fixo" deixa de ser necessária.

**Tabela de substituição.** Ela vai para o `src/lib/design-system/README.md` e
orienta as próximas changes. A ordem de preferência é: componente Radix já
extraído, depois elemento HTML nativo e, por último, dependência nova.

| Necessidade | Usar | Quando instalar o pacote |
| --- | --- | --- |
| Escolher DDD ou opção de lista | `select` (Radix), com salto por digitação | `cmdk`, se a busca por nome de cidade virar requisito |
| Painel inferior no celular | `sheet` com `side="bottom"` | `vaul`, se o gesto de arrastar for exigido |
| Notificação temporária | `toast` + `toaster` + `use-toast` (Radix) | Não previsto |
| Estado persistente da solicitação | `alert` + `badge` + texto, sem depender só de cor | — |
| Formulário | `<form>` nativo + Zod + `field`/`label`/`input` (`aria-invalid`, `aria-describedby`) | `react-hook-form`, se surgirem formulários grandes ou dinâmicos |
| Código de verificação | `<input inputmode="numeric" autocomplete="one-time-code">` | Não previsto |
| Data | `<input type="date">` nativo | `react-day-picker`, se for preciso escolher intervalos ou exibir um calendário |
| Carrossel | CSS `scroll-snap` + `button` | Não previsto |
| Painéis redimensionáveis | — | Não previsto |

**Alternativas avaliadas:**
- **Instalar os oito:** rejeitada por falta de uso previsto.
- **Recriar os oito à mão:** rejeitada pelo custo e pelo risco de
  acessibilidade.
- **Instalar só o `cmdk`:** adiada até existir o requisito de busca.

### D8. Higiene de dependências com `npm prune`

Como nenhuma dependência é adicionada, o prune remove todos os pacotes
extraneous: `cmdk`, `sonner`, `vaul`, `embla-carousel-react`,
`react-day-picker`, `date-fns`, `react-hook-form`, `@hookform/resolvers`,
`input-otp`, `react-resizable-panels`, `recharts`, `framer-motion`,
`next-themes`, `tailwind-merge`, `@tailwindcss/typography` e outros que não
estejam declarados.

Passos:
1. Rodar `npm prune`.
2. Confirmar que `npm ls --depth=0` não lista `extraneous` nem `missing`.
3. Rodar typecheck, testes e build **depois** do prune.

**Por quê:** hoje esses pacotes resolvem localmente sem estar declarados. O
build passaria aqui e falharia numa instalação limpa (`npm ci`). O prune
também garante, na prática, que nenhum componente extraído dependa
escondido de um dos pacotes omitidos.

**Alternativa:** `rm -rf node_modules && npm ci`. É equivalente e mais lento;
serve como fallback se o prune deixar a árvore inconsistente.

### D9. Imports do `cn` e de `clsx`

O `cn` local vem do pacote `cn`, que é declarado e substitui `clsx` +
`tailwind-merge`. Os componentes extraídos usam só `cn`. Se algum ainda
importar `clsx` ou `tailwind-merge` diretamente, o import deve trocar para
`cn` de `@/lib/utils`, sem adicionar esses pacotes.

### D10. Vitest, scripts e verificação incremental

Configuração e scripts:

- `vitest.config.mts` com `environment: "jsdom"`, `@vitejs/plugin-react` e o
  alias `@` → `./src`.
- `vitest.setup.ts` com `@testing-library/jest-dom/vitest` e polyfills mínimos
  (`ResizeObserver`, `PointerEvent` e `Element.prototype.scrollIntoView`).
- Scripts no `package.json`: `"typecheck": "next typegen && tsc --noEmit"`
  (os tipos globais `LayoutProps` e de rotas só existem depois do
  `next typegen`, e o typecheck precisa funcionar num clone limpo),
  `"test": "vitest run"` e
  `"tokens": "node scripts/build-salvy-tokens.mjs"`.

Verificação no navegador, em três etapas:

1. Criar `src/app/ds-check/page.tsx`, temporária, com um único `Button`
   extraído. Validar no navegador antes de ampliar.
2. Ampliar a página com uma amostra de cada grupo, testar teclado, estados,
   375 px e 1280 px e ler o console.
3. Remover a página no fim.

### D11. Proveniência

O `src/lib/design-system/README.md` registra:

- origem e data de captura;
- valores observados × derivados (tema escuro, foco, chart e escala de 4 px);
- o aviso de que **não** é a biblioteca oficial da Salvy;
- os oito componentes omitidos, com o motivo, e a tabela de substituição
  (D7);
- as adaptações das decisões D4–D6 e D9;
- como regenerar o tema.

As licenças OFL das fontes vão para `src/lib/design-system/licenses/`.

## Risks / Trade-offs

- **Imports ou caches antigos podem quebrar depois de mover para `src/`:**
  `.next/` guarda caminhos antigos.
  → Mitigação: rodar `rm -rf .next` antes do primeiro `npm run dev` ou build
  depois do move, e fazer `grep` por caminhos fixos da raiz.
- **Remover os extraneous pode revelar dependências implícitas.**
  → Mitigação: é exatamente o objetivo da D8. O typecheck e o build após o
  prune apontam o que faltar. Qualquer dependência necessária passa pela
  regra de aprovação, ou o componente que a exige é omitido, como na D7.
- **Uma tela futura pode precisar de um componente omitido.**
  → Mitigação: a tabela de substituição da D7 indica a alternativa e o
  critério para instalar o pacote. A instalação é aprovada na change daquela
  tela, e o componente é extraído do pacote de origem, não recriado.
- **Ícones podem ter sido renomeados ou removidos:** os componentes foram
  escritos para `lucide-react@0.545`, e o projeto usa `^1.64`.
  → Mitigação: o typecheck acusa ícones inexistentes. Trocar pelo equivalente
  da v1 sem mudar o visual.
- **Os testes do Radix em jsdom podem ser instáveis.**
  → Mitigação: polyfills no setup. Os testes de teclado focam Dialog e
  Checkbox. O Select é verificado no navegador.
- **O tema global também altera a home padrão.**
  → Mitigação: aceito e registrado na proposta.
- **O CSS base64 de 245 KB atrasa o primeiro paint.**
  → Mitigação: `font-display: swap`. Fica registrada a otimização futura com
  `next/font`.
- **`cacheComponents` e `partialPrefetching` com componentes cliente:**
  `useIsMobile` e `Sidebar` leem `window`.
  → Mitigação: o build de produção e o console do navegador são critérios de
  aceite.
- **Substituir o `button.tsx` muda a API de variantes.**
  → Mitigação: nenhum arquivo importa o botão atual.
- **Opcionais wasm32 aparecem como `extraneous` no `npm ls`** (descoberto na
  implementação): `@emnapi/*`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util` e
  `@img/sharp-wasm32` estão no lockfile como dependências de pacotes
  opcionais wasm32 que o npm pula em darwin. Mesmo um `npm ci` limpo os
  reinstala e os marca assim.
  → Mitigação: o critério passa a ser "nenhum extraneous fora do lockfile".
- **`next dev` acrescenta blocos ao `AGENTS.md`** (descoberto na
  implementação). Com `experimental.agentFeedback` ativo, ele escreve os
  blocos `nextjs-agent-rules` e `nextjs-agent-feedback` e os recria se forem
  removidos.
  → Mitigação: o `next.config.ts` fica intacto. A decisão de commitar ou não
  esses blocos é do usuário.
- **Foco de baixo contraste nos gatilhos de menubar e navigation-menu** (visto
  no navegador). O estilo de origem usa só `focus:bg-accent` (`#efefef` sobre
  `#fafafa`), sem anel.
  → Mitigação: registrado como limitação no README. Corrigir exige mudar
  classes, fora da adaptação permitida, e fica para decisão do usuário.

## Migration Plan

1. Registrar o estado inicial: `npx tsc --noEmit`, `npm run build` e
   `npm ls --depth=0`.
2. Fazer a reestruturação para `src/` (D0) em commit próprio e confirmar o
   typecheck.
3. Adicionar scripts e Vitest.
4. Rodar `npm prune` (D8) antes de extrair qualquer componente, para que um
   import de pacote omitido falhe logo.
5. Extrair tokens, fontes e marca, gerar o tema e trocar o `globals.css` e o
   `layout.tsx`.
6. Extrair o `Button`, validar no navegador e só então seguir.
7. Extrair os demais 45 componentes e os hooks.
8. Rodar testes, typecheck e build. Remover a página temporária.

**Rollback:** reverter os commits da mudança, na ordem inversa. Nenhum dado nem
contrato é afetado.

## Open Questions

- Nenhuma. A decisão sobre dependências foi tomada (D7): nenhum pacote novo.
