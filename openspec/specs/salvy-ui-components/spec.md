# salvy-ui-components Specification

## Purpose
TBD - created by archiving change extract-salvy-design-system. Update Purpose after archive.
## Requirements
### Requirement: Inventário de componentes extraídos por grupo
O projeto SHALL disponibilizar em `src/components/ui/` os 46 componentes
tematizados do Salvy Design System que funcionam só com as dependências já
declaradas, nos grupos abaixo:

- **Ações:** button, button-group, toggle, toggle-group.
- **Formulários e campos:** input, input-group, textarea, checkbox,
  radio-group, select, slider, switch, field, label.
- **Overlays:** dialog, alert-dialog, sheet, popover, hover-card, tooltip.
- **Menus e navegação:** dropdown-menu, context-menu, menubar,
  navigation-menu, breadcrumb, pagination, tabs, sidebar.
- **Exibição de dados:** avatar, badge, card, table, accordion, collapsible,
  item, empty, kbd, aspect-ratio.
- **Feedback:** alert, progress, skeleton, spinner, toast, toaster.
- **Estrutura:** separator, scroll-area.

Os hooks de apoio `use-toast` e `use-mobile` MUST ficar em `src/hooks/`. Os
componentes `chart`, `command`, `drawer`, `sonner`, `input-otp`, `carousel`,
`calendar`, `form` e `resizable` MUST NOT ser extraídos nem recriados à mão.
Sua omissão MUST ficar registrada no README de proveniência.

#### Scenario: Importar um componente extraído
- **WHEN** um módulo da aplicação importa `{ Button } from "@/components/ui/button"`
- **THEN** o import resolve para o componente Salvy, com o CTA em cápsula e a cor primária `#1c1c1c`

#### Scenario: Componentes omitidos ausentes
- **WHEN** alguém procura `src/components/ui/chart.tsx`, `command.tsx`, `drawer.tsx`, `sonner.tsx`, `input-otp.tsx`, `carousel.tsx`, `calendar.tsx`, `form.tsx` ou `resizable.tsx`
- **THEN** nenhum desses arquivos existe, e `package.json` não declara `recharts`, `cmdk`, `vaul`, `sonner`, `input-otp`, `embla-carousel-react`, `react-day-picker`, `react-hook-form`, `react-resizable-panels` nem `next-themes`

### Requirement: Nenhuma dependência nova e tabela de substituição
A extração SHALL usar apenas pacotes já declarados no `package.json`
(`radix-ui`, `class-variance-authority`, `cn`, `lucide-react`, `react` e
`tw-animate-css`). O `src/lib/design-system/README.md` MUST ter uma tabela de
substituição. Para cada componente omitido, ela indica o componente Radix
extraído ou o elemento HTML nativo a usar no lugar e o critério para, numa
change futura e com aprovação, instalar o pacote e extrair o componente
original.

#### Scenario: Escolher a alternativa a um componente omitido
- **WHEN** uma change futura precisa de um seletor de DDD ou de uma notificação temporária
- **THEN** a tabela de substituição indica `select` e `toast`/`toaster`, respectivamente, e o critério para instalar `cmdk` ou `sonner`, se a necessidade crescer

#### Scenario: Nenhum componente importa pacote omitido
- **WHEN** `grep` procura imports de `cmdk`, `vaul`, `sonner`, `input-otp`, `embla-carousel-react`, `react-day-picker`, `react-hook-form`, `react-resizable-panels` ou `next-themes` em `src/`
- **THEN** nenhuma ocorrência é encontrada

### Requirement: Primitives Radix reutilizadas do pacote unificado
Os componentes extraídos SHALL importar as primitives do pacote `radix-ui` já
instalado. O projeto MUST NOT adicionar pacotes `@radix-ui/react-*`
individuais nem reimplementar comportamento de diálogo, menu, seletor ou foco
que o Radix já fornece. A adaptação MUST se limitar a specifiers de import, ao
alias `@/` e às diretivas `"use client"`, preservando estrutura, variantes e
classes do componente de origem.

#### Scenario: Nenhuma dependência Radix individual
- **WHEN** `package.json` é inspecionado após a mudança
- **THEN** não há entradas `@radix-ui/react-*`, e os componentes importam de `"radix-ui"`

### Requirement: Fronteiras entre Server e Client Components
A diretiva `"use client"` SHALL aparecer somente nos componentes que usam
estado, efeitos, contexto, handlers de evento, APIs do navegador ou primitives
Radix com estado. Os apresentacionais puros (por exemplo card, badge, table, kbd,
empty, item, skeleton, spinner e alert) MUST NOT declarar a diretiva. Assim,
eles continuam renderizáveis em Server Components. Páginas e layouts MUST
continuar como Server Components.

#### Scenario: Componente apresentacional em Server Component
- **WHEN** um Server Component renderiza `Card`, `Badge` e `Table`
- **THEN** a página compila e renderiza no servidor sem criar uma boundary cliente para esses componentes

#### Scenario: Componente interativo sem erro de hydration
- **WHEN** uma página renderiza `Dialog`, `Select` e `Tooltip` e é aberta no navegador
- **THEN** o console não mostra erros de hydration nem de uso de hooks em Server Components

### Requirement: Acessibilidade Radix preservada
Os componentes extraídos SHALL preservar:

- operação por teclado;
- foco visível com anel derivado do token `ring`;
- associação entre label e controle;
- estados `disabled`;
- os atributos ARIA emitidos pelo Radix.

Os estados MUST NOT ser comunicados só por cor.

#### Scenario: Foco visível no botão
- **WHEN** o usuário navega com Tab até um `Button`
- **THEN** o botão mostra um anel de foco visível baseado na cor `ring`

#### Scenario: Botão desabilitado
- **WHEN** um `Button` é renderizado com `disabled`
- **THEN** ele não recebe cliques, não é ativado pelo teclado e tem aparência atenuada

#### Scenario: Label associado ao campo
- **WHEN** um `Label` com `htmlFor="ddd"` é renderizado junto de um `Input` com `id="ddd"`
- **THEN** o campo fica acessível pelo nome do label e clicar no label foca o campo

#### Scenario: Checkbox pelo teclado
- **WHEN** o usuário foca um `Checkbox` e pressiona Espaço
- **THEN** o estado alterna e `aria-checked` reflete o novo valor

#### Scenario: Dialog pelo teclado
- **WHEN** o usuário abre um `Dialog` pelo gatilho usando Enter
- **THEN** o foco vai para dentro do diálogo e fica preso nele, Esc fecha o diálogo e o foco volta ao gatilho

### Requirement: Notificações via Radix Toast
As notificações temporárias SHALL usar os componentes `toast`/`toaster` e o
hook `use-toast` extraídos, sobre o Radix Toast, que compartilham um único
store em memória. As notificações MUST usar o tema claro Salvy e MUST NOT ser
o único meio de comunicar um estado que o usuário precisa consultar depois.

#### Scenario: Toast exibido pelo hook
- **WHEN** um componente cliente chama `toast({ title: "Linha criada" })` com o `Toaster` montado
- **THEN** a notificação aparece numa região com `role` de status anunciável por leitores de tela e com as cores do tema claro, mesmo com o sistema operacional em modo escuro

### Requirement: Verificação no navegador e no build
A integração SHALL ser validada em ordem:

1. Um `Button` extraído é renderizado e conferido no navegador antes de
   qualquer outro componente.
2. Uma amostra de cada grupo é conferida em larguras móvel (375 px) e desktop
   (1280 px).
3. O typecheck e o build de produção passam sem erros.

A página temporária de verificação MUST ser removida ao fim da mudança.

#### Scenario: Botão validado antes da ampliação
- **WHEN** a página temporária mostra apenas o `Button` extraído
- **THEN** o navegador exibe Inter, fundo `#1c1c1c`, cantos em cápsula e anel de foco ao navegar com Tab, e só então os demais componentes são extraídos

#### Scenario: Build de produção
- **WHEN** `npm run typecheck`, `npm test` e `npm run build` são executados
- **THEN** ambos terminam com sucesso, sem erros de resolução de módulo, tipos ou CSS

