## Why

O app ainda usa o tema neutro do scaffold shadcn (`radix-luma`, cores oklch,
Inter/Geist via `next/font`) e não tem identidade visual Salvy. Antes de criar as
telas do fluxo de linhas, precisamos de uma base visual única, extraída do
Salvy Design System em `/Users/pedrohenriquesudariodasilva/Downloads/salvy-design-system`.
Assim as próximas mudanças só compõem componentes prontos e não inventam cores,
fontes ou primitives.

A inspeção também encontrou problemas no repositório que bloqueiam esta mudança
e as seguintes. Por isso entram aqui:

- **Build provavelmente quebrado:** o `app/globals.css` importa
  `shadcn/tailwind.css`, mas o pacote `shadcn` não está instalado (nem no
  `package.json`, nem em `node_modules`).
- **Código fora de `src/`:** o código fica na raiz (`app/`, `components/`,
  `lib/`, com `@/*` → `./*`). O CLAUDE.md, o AGENTS.md e o GEMINI.md exigem
  `src/` com `@/` → `src/`.
- **Scripts ausentes:** faltam `typecheck` e `test`, exigidos pelos comandos de
  verificação do projeto (`npm run typecheck` e `npm test`). Também não há
  configuração do Vitest, embora `vitest`, `jsdom` e Testing Library estejam
  instalados.
- **Pacotes extraneous:** `node_modules` tem pacotes que não estão no
  `package.json` nem no lockfile (`recharts`, `framer-motion`, `next-themes`,
  `cmdk`, `sonner`, `vaul` etc.). Eles mascaram dependências não declaradas, e o
  build pode passar localmente e falhar numa instalação limpa.

## What Changes

### Correções de repositório

- **Código em `src/`:**
  - `app/`, `components/` e `lib/` vão para `src/app/`, `src/components/` e
    `src/lib/`. Os novos hooks nascem em `src/hooks/`.
  - `tsconfig.json` passa a usar `@/*` → `./src/*`.
  - Os caminhos do `components.json` acompanham (`tailwind.css` →
    `src/app/globals.css`).
  - `public/`, os arquivos de configuração e `scripts/` ficam na raiz.
  - `types/`, cópia desatualizada de `.next/types` que quebrava o `tsc`, é
    removida.
- **`globals.css`:** deixa de importar `shadcn/tailwind.css` e passa a usar o
  tema Salvy (veja abaixo).
- **Scripts no `package.json`:** `typecheck` (`next typegen && tsc --noEmit`), `test`
  (`vitest run`) e `tokens` (geração do tema). O script `codegen` fica para a
  mudança que introduzir Orval e `openapi.yaml`.
- **Vitest:** configuração mínima (`vitest.config.mts` + `vitest.setup.ts`),
  com jsdom e o alias `@/` → `src/`.
- **`npm prune`** para remover os pacotes extraneous, para que o build só use
  pacotes declarados. A verificação final roda após o prune.

### Design system

- **Extração, não instalação do pacote.** Os arquivos necessários são copiados e
  adaptados para `src/`. `@workspace/salvy-design-system` não vira
  dependência, então `transpilePackages` não é necessário: os componentes passam
  a ser código-fonte local. As opções do `next.config.ts` ficam inalteradas.
- **Tokens e tema:**
  - `tokens.json` (DTCG) é copiado para `src/lib/design-system/` e continua
    sendo a fonte canônica.
  - Um script local gera o tema Tailwind v4 em `src/app/salvy-theme.css`, com
    variáveis CSS, `@theme inline`, `font-display`, `rounded-card` e
    `rounded-pill`.
  - O `src/app/globals.css` importa esse tema uma única vez.
- **Tipografia:** são extraídas as fontes incorporadas Poppins, Inter e Geist
  Mono, com as licenças OFL. As fontes `next/font` (Inter, Geist e Geist Mono)
  saem do `src/app/layout.tsx`.
- **Marca:** logotipo e favicon originais vão para `public/brand/`, sem
  redesenho. O favicon e os metadados do app não mudam nesta mudança.
- **Componentes** (46 arquivos em `src/components/ui/`, todos sem dependência
  nova), por grupo:
  - Ações: button, button-group, toggle, toggle-group.
  - Formulários e campos: input, input-group, textarea, checkbox,
    radio-group, select, slider, switch, field, label.
  - Overlays: dialog, alert-dialog, sheet, popover, hover-card, tooltip.
  - Menus e navegação: dropdown-menu, context-menu, menubar, navigation-menu,
    breadcrumb, pagination, tabs, sidebar.
  - Exibição de dados: avatar, badge, card, table, accordion, collapsible,
    item, empty, kbd, aspect-ratio.
  - Feedback: alert, progress, skeleton, spinner, toast, toaster.
  - Estrutura: separator, scroll-area.
  - Hooks de apoio: `src/hooks/use-toast.ts` e `src/hooks/use-mobile.ts`.
  - O `button.tsx` atual é **substituído** pela versão Salvy, que usa CTA em
    cápsula e a paleta extraída.
- **Adaptações mínimas dos componentes:**
  - Imports `@radix-ui/react-*` passam para o pacote unificado `radix-ui@1.8.1`,
    já instalado.
  - Imports relativos internos passam para `@/`.
  - O utilitário `cn` atual (pacote `cn`, que substitui `clsx` + `tailwind-merge`)
    é mantido.
  - `"use client"` só entra onde há estado, efeitos, contexto ou eventos.
- **Nenhuma dependência nova.** Decisão do usuário em 2026-10-30: os oito
  componentes que exigiriam pacotes de terceiros não são extraídos nem
  recriados à mão.

  | Componente omitido | Pacote que exigiria |
  | --- | --- |
  | command | `cmdk` |
  | drawer | `vaul` |
  | sonner | `sonner` |
  | input-otp | `input-otp` |
  | carousel | `embla-carousel-react` |
  | calendar | `react-day-picker` |
  | form | `react-hook-form` |
  | resizable | `react-resizable-panels` |

  No lugar deles, vale uma **tabela de substituição** documentada no README de
  proveniência, com esta ordem de preferência:
  1. componente Radix já extraído;
  2. elemento HTML nativo;
  3. dependência nova, só quando uma tela concreta exigir e com aprovação na
     change dessa tela.
- **Fora da extração:** os oito componentes acima, `chart.tsx` (e com ele
  `recharts`), o preview Vite, as demos, os componentes nativos (Expo),
  `@tailwindcss/typography`, `next-themes` e a paleta não validada de
  `structured-model.json`.
- **Verificação:**
  - Uma página temporária renderiza primeiro o `Button` extraído e depois uma
    amostra de cada grupo.
  - Testes de fumaça cobrem labels, teclado, foco e estados disabled.
  - `npm run typecheck`, `npm test` e `npm run build` precisam passar.
  - A página temporária é removida no fim.

## Capabilities

### New Capabilities

- `project-structure`: convenções verificáveis do repositório.
  - Código-fonte em `src/` com o alias `@/`.
  - Scripts `typecheck` e `test` via npm e Vitest configurado.
  - Dependências de runtime declaradas no `package.json`, sem pacotes
    extraneous.
  - CSS global sem imports de pacotes ausentes.
- `salvy-design-tokens`: tema visual extraído (cores claras observadas, tema
  escuro derivado e desabilitado, tipografia, raio, espaçamento), fontes
  incorporadas, ativos de marca, geração do tema a partir de `tokens.json` e
  rastreabilidade entre valores observados e derivados.
- `salvy-ui-components`: biblioteca de componentes Radix/shadcn tematizada no
  projeto. Cobre o inventário por grupo, as convenções de import, os limites
  entre Server e Client Components e as garantias de acessibilidade (teclado,
  foco visível, labels, disabled e ARIA).

### Modified Capabilities

<!-- Nenhuma: `openspec/specs/` está vazio. -->

## Impact

- **Arquivos movidos:** `app/**`, `components/**` e `lib/**` vão para `src/`.
- **Arquivos alterados:**
  - `tsconfig.json`: o alias `@/*` passa a `./src/*`.
  - `components.json`: caminho do CSS.
  - `src/app/globals.css`: tema substituído e import quebrado removido.
  - `src/app/layout.tsx`: saem as fontes `next/font`; `lang` passa a `pt-BR`.
  - `src/components/ui/button.tsx`: substituído.
  - `package.json` e `package-lock.json`: scripts `typecheck`, `test` e
    `tokens`. O prune remove os pacotes extraneous; nenhuma dependência nova
    é adicionada.
- **Arquivos novos:**
  - `src/lib/design-system/` com tokens, template, fontes, licenças e README de
    proveniência.
  - `scripts/build-salvy-tokens.mjs`.
  - `src/app/salvy-theme.css` (gerado).
  - `src/components/ui/*`, `src/hooks/*` e `public/brand/*`.
  - `vitest.config.mts`, `vitest.setup.ts` e testes de fumaça.
- **Efeito visual colateral:** a home padrão do Next (`src/app/page.tsx`) não
  será redesenhada. Ela herda o fundo, a tipografia e o raio globais do novo
  tema.
- **Contrato HTTP:** nenhum impacto. `openapi.yaml`, a geração do Orval em
  `src/lib/api-client/` e a documentação do Scalar em `/api/docs` não mudam (e
  ainda não existem no repositório).
- **Versões:** nenhuma atualização. Ficam Next 16.4.3, React 19.3.0,
  Tailwind 4.3.3 e radix-ui 1.8.1.

## Fora de Escopo

- Telas do fluxo de linhas: nova solicitação, status e lista de linhas. Ficam
  para uma mudança própria, que vai consumir esta base.
- Backend, Route Handlers, `openapi.yaml`, Orval (incluindo o script
  `codegen`), Scalar, persistência em banco, ORM, filas, workers ou qualquer
  pacote novo.
- Os componentes command, drawer, sonner, input-otp, carousel, calendar, form
  e resizable, extraídos ou recriados à mão.
- Alterações no CLAUDE.md, AGENTS.md, GEMINI.md e `openspec/config.yaml`, que
  já foram corrigidos e estão sincronizados.
- Habilitar o modo escuro ou criar um alternador de tema.
- Componente de gráficos (`chart`/`recharts`) e preview navegável do design
  system.
- Atualizar Next, React, Tailwind, Radix ou outras versões.
- Redesenhar a home atual ou outras partes do produto.
- Alterar o pacote de origem em `~/Downloads/salvy-design-system` ou outros
  projetos.
