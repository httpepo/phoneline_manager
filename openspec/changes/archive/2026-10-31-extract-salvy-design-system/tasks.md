## 1. Estado inicial

- [x] 1.1 Registrar o estado inicial: rodar `npx tsc --noEmit`, `npm run build` e `npm ls --depth=0` e anotar a falha esperada no import de `shadcn/tailwind.css` e a lista de pacotes extraneous.

## 2. Correções de repositório

- [x] 2.1 Mover com `git mv` as pastas `app/` → `src/app/`, `components/` → `src/components/` e `lib/` → `src/lib/`. Manter na raiz `public/`, `scripts/` e os arquivos de configuração. Remover com `git rm` a pasta `types/`, cópia desatualizada de `.next/types` que quebrava o `tsc`.
- [x] 2.2 Atualizar o `tsconfig.json` (`"@/*": ["./src/*"]`) e o `components.json` (`tailwind.css: "src/app/globals.css"`).
- [x] 2.3 Remover `.next/`, procurar com `grep` caminhos fixos da raiz (`"./app`, `"app/`, `"components/`, `"lib/`) e rodar `npx tsc --noEmit` para confirmar que os imports `@/` resolvem.
- [x] 2.4 Remover o import de `shadcn/tailwind.css` do `src/app/globals.css`. O tema completo é trocado no grupo 4.
- [x] 2.5 Adicionar ao `package.json` os scripts `typecheck` (`next typegen && tsc --noEmit`), `test` (`vitest run`) e `tokens` (`node scripts/build-salvy-tokens.mjs`).
- [x] 2.6 Criar `vitest.config.mts` (jsdom, `@vitejs/plugin-react`, alias `@` → `./src`) e `vitest.setup.ts` com `@testing-library/jest-dom/vitest` e polyfills mínimos (`ResizeObserver`, `PointerEvent` e `scrollIntoView`).
- [x] 2.7 Rodar `npm run typecheck`, confirmar que o `npm test` executa (mesmo sem testes ainda, com `--passWithNoTests` se necessário) e fazer um commit isolado da reestruturação.

## 3. Higiene de dependências (sem pacotes novos)

- [x] 3.1 Rodar `npm prune` e confirmar que `npm ls --depth=0` não lista `missing` nem `extraneous` fora do lockfile. Se a árvore ficar inconsistente, usar como fallback `rm -rf node_modules && npm ci`.
- [x] 3.2 Confirmar que o `package.json` não ganhou nenhuma dependência nova e rodar `npm run typecheck` de novo depois do prune.

## 4. Tokens, tema, fontes e marca

- [x] 4.1 Copiar `tokens.json`, `scripts/theme-template.css` e `scripts/font-faces.css` do pacote de origem para `src/lib/design-system/`.
- [x] 4.2 Adaptar `src/lib/design-system/theme-template.css`: remover `@source "./components"` e `@plugin "@tailwindcss/typography"` e apontar o import de fontes para `../lib/design-system/font-faces.css`, relativo a `src/app/salvy-theme.css`.
- [x] 4.3 Criar `scripts/build-salvy-tokens.mjs`, portado de `build-tokens.mjs`. Deve ler `src/lib/design-system/tokens.json`, gravar apenas `src/app/salvy-theme.css` com o cabeçalho "GERADO — não editar" e falhar quando faltar algum token.
- [x] 4.4 Executar `npm run tokens` e conferir que `src/app/salvy-theme.css` tem o tema claro esperado (`--primary: 0 0% 11%`, `--background: 0 0% 98%`, `--app-radius-card`, `--app-radius-pill`) e o bloco `.dark` derivado.
- [x] 4.5 Reescrever `src/app/globals.css` para importar só `./salvy-theme.css` (mais `tw-animate-css`, se o template não o incluir), removendo o tema oklch do scaffold.
- [x] 4.6 Em `src/app/layout.tsx`, remover `Inter`, `Geist` e `Geist_Mono` de `next/font`, manter `cn` e as classes de layout e trocar `lang="en"` por `lang="pt-BR"`. Não adicionar a classe `dark`.
- [x] 4.7 Copiar `salvy-logo.png` e `salvy-favicon.png` de `docs/references/logos/` para `public/brand/`, sem alterações, e as licenças OFL para `src/lib/design-system/licenses/`.
- [x] 4.8 Escrever `src/lib/design-system/README.md` com:
  - origem, data, observados × derivados e aviso de não oficial;
  - os oito componentes omitidos e o motivo;
  - a tabela de substituição da D7 (o que usar no lugar e quando instalar o pacote);
  - as adaptações (D4–D6 e D9);
  - o passo a passo para regenerar o tema.

## 5. Primeiro componente e validação no navegador

- [x] 5.1 Substituir `src/components/ui/button.tsx` pela versão Salvy: trocar `@radix-ui/react-slot` por `Slot.Root` de `radix-ui` e `../../lib/utils` por `@/lib/utils`.
- [x] 5.2 Criar a página temporária `src/app/ds-check/page.tsx` (Server Component) que renderiza só o `Button` nas variantes default, outline e disabled.
- [x] 5.3 Rodar `npm run dev` e conferir no navegador: Inter e Poppins carregadas sem chamadas ao Google Fonts, fundo `#fafafa`, botão `#1c1c1c` em cápsula, anel de foco ao navegar com Tab e console sem erros. Só seguir para o grupo 6 depois desta validação.

## 6. Extração dos componentes

- [x] 6.1 Extrair `src/hooks/use-toast.ts` e `src/hooks/use-mobile.ts`, ajustando os imports para `@/components/ui/toast`.
- [x] 6.2 Extrair Ações: button-group, toggle e toggle-group.
- [x] 6.3 Extrair Formulários e campos: label, input, input-group, textarea, checkbox, radio-group, select, slider, switch e field.
- [x] 6.4 Extrair Overlays: dialog, alert-dialog, sheet, popover, hover-card e tooltip.
- [x] 6.5 Extrair Menus e navegação: dropdown-menu, context-menu, menubar, navigation-menu, breadcrumb, pagination, tabs e sidebar.
- [x] 6.6 Extrair Exibição de dados: avatar, badge, card, table, accordion, collapsible, item, empty, kbd e aspect-ratio.
- [x] 6.7 Extrair Feedback: alert, progress, skeleton, spinner, toast e toaster.
- [x] 6.8 Extrair Estrutura: separator e scroll-area.
- [x] 6.9 Em todos os arquivos extraídos:
  - trocar `@radix-ui/react-*` por imports nomeados de `radix-ui`;
  - trocar imports relativos por `@/components/ui/*`, `@/lib/utils` e `@/hooks/*`;
  - trocar imports diretos de `clsx` ou `tailwind-merge` por `cn` de `@/lib/utils`;
  - confirmar com `grep` que não sobrou nenhum `@radix-ui/`, `../../`, `clsx`, `tailwind-merge` nem import de pacote omitido (`cmdk`, `vaul`, `sonner`, `input-otp`, `embla-carousel-react`, `react-day-picker`, `react-hook-form`, `react-resizable-panels`, `next-themes`, `recharts`).
- [x] 6.10 Confirmar que os arquivos omitidos não existem em `src/components/ui/`: chart, command, drawer, sonner, input-otp, carousel, calendar, form e resizable.
- [x] 6.11 Auditar `"use client"` (D6): adicionar a diretiva nos componentes com hooks, contexto, handlers ou Radix com estado e removê-la dos puramente apresentacionais.
- [x] 6.12 Rodar `npm run typecheck` e corrigir ícones `lucide-react` inexistentes na v1 e incompatibilidades de tipos do React 19 sem alterar o visual.

## 7. Testes de fumaça (Vitest + Testing Library)

- [x] 7.1 Testar o `Button`: renderiza com o nome acessível, aplica a classe de foco visível e, com `disabled`, não dispara `onClick` por clique nem por teclado.
- [x] 7.2 Testar `Label` + `Input`: o campo é encontrado por `getByLabelText`, e clicar no label foca o campo.
- [x] 7.3 Testar o `Checkbox`: Espaço alterna o estado, e `aria-checked`/`data-state` refletem o valor. O estado disabled impede a alternância.
- [x] 7.4 Testar o `Dialog`: Enter no gatilho abre, o foco entra no conteúdo, `role="dialog"` tem título acessível, Esc fecha e o foco volta ao gatilho.
- [x] 7.5 Rodar `npm test` e confirmar que tudo passa sem chamadas de rede.

## 8. Verificação ampliada no navegador

- [x] 8.1 Ampliar `src/app/ds-check/page.tsx` com uma amostra de cada grupo. Manter a página como Server Component e isolar em pequenos componentes cliente as demos com estado (Dialog, Select, Tooltip, Toast, Tabs, Sidebar).
- [x] 8.2 Conferir no navegador:
  - Poppins em `font-display` e Inter no corpo;
  - cores primária, muted e destructive;
  - `rounded-card` (16 px) e `rounded-pill`;
  - foco visível em todos os controles por Tab;
  - estados hover, disabled e aberto/fechado.
- [x] 8.3 Verificar a responsividade em 375 px e 1280 px, sem rolagem horizontal, com o Sheet (inclusive `side="bottom"`) e o Dialog utilizáveis no celular.
- [x] 8.4 Ler o console do navegador e corrigir qualquer erro de hydration, de Radix ou de `use client` antes de prosseguir.

## 9. Finalização

- [x] 9.1 Remover `src/app/ds-check/`.
- [x] 9.2 Confirmar que o `npm ls --depth=0` continua sem `missing` e sem `extraneous` fora do lockfile, que o `next.config.ts` ficou inalterado, que nenhuma versão de Next, React, Tailwind ou radix-ui mudou e que o pacote em `~/Downloads/salvy-design-system` não foi modificado.
- [x] 9.3 Executar `npm run typecheck`, `npm test` e `npm run build` e anexar a saída ao resumo.
- [x] 9.4 Informar os arquivos movidos, alterados e criados, as verificações executadas (com a saída) e as limitações: tema escuro derivado e desligado; componentes não observados no site são adaptações; fontes base64 sem subsetting; oito componentes omitidos por decisão (D7), com a tabela de substituição no README.
