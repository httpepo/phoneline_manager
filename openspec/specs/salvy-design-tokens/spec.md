# salvy-design-tokens Specification

## Purpose
TBD - created by archiving change extract-salvy-design-system. Update Purpose after archive.
## Requirements
### Requirement: tokens.json é a fonte canônica do tema
O projeto SHALL manter uma cópia de `tokens.json` do Salvy Design System em
`src/lib/design-system/tokens.json` como única fonte de valores visuais. O tema
consumido pela aplicação (`src/app/salvy-theme.css`) MUST ser gerado a partir desse
arquivo por `npm run tokens`. O arquivo gerado MUST trazer um aviso de que não
deve ser editado à mão.

#### Scenario: Regenerar o tema a partir dos tokens
- **WHEN** um desenvolvedor altera um valor de cor em `src/lib/design-system/tokens.json` e executa `npm run tokens`
- **THEN** `src/app/salvy-theme.css` passa a conter o novo valor convertido para canais HSL e nenhum outro arquivo de tema precisa ser editado

#### Scenario: Token ausente interrompe a geração
- **WHEN** o template referencia um token que não existe em `tokens.json`
- **THEN** o script termina com erro e lista os tokens ausentes, sem gravar um tema incompleto

### Requirement: Tema importado uma única vez no CSS global
O `src/app/globals.css` carregado por `src/app/layout.tsx` SHALL importar o tema Salvy
uma única vez. O projeto MUST NOT manter um segundo conjunto de variáveis de
cor (como o tema oklch do scaffold) nem importar `shadcn/tailwind.css`.

#### Scenario: Uma única fonte de variáveis de tema
- **WHEN** o build de produção é gerado
- **THEN** as variáveis `--primary`, `--background` e `--radius` têm uma única declaração para `:root` no CSS emitido, com os valores derivados de `tokens.json`

#### Scenario: Utilitários do tema disponíveis
- **WHEN** um componente usa as classes `font-display`, `rounded-card`, `rounded-pill`, `bg-primary` ou `text-muted-foreground`
- **THEN** o Tailwind gera essas classes a partir das variáveis do tema Salvy

### Requirement: Tema claro observado como padrão e tema escuro desabilitado
A aplicação SHALL renderizar o tema claro extraído do site público como
aparência padrão: fundo `#fafafa`, texto `#232323`, primário `#1c1c1c` e
`muted-foreground` `#6d6d6d`. As variáveis do tema escuro derivado MAY ficar
no CSS sob `.dark`, mas a aplicação MUST NOT adicionar a classe `dark` nem
seguir `prefers-color-scheme`.

#### Scenario: Sistema operacional em modo escuro
- **WHEN** o usuário abre a aplicação com o sistema operacional em modo escuro
- **THEN** a página continua com o fundo `#fafafa` e o primário `#1c1c1c` do tema claro

### Requirement: Tipografia incorporada da extração
A aplicação SHALL carregar Poppins, Inter e Geist Mono a partir de
`src/lib/design-system/font-faces.css`, com `font-display: swap`. Inter MUST ser a
fonte `sans` do corpo, Poppins a fonte `display` dos títulos e Geist Mono a
fonte `mono`. O `src/app/layout.tsx` MUST NOT carregar outras fontes via
`next/font`.

#### Scenario: Fontes aplicadas no navegador
- **WHEN** uma página com texto de corpo e um título `font-display` é aberta no navegador
- **THEN** o estilo computado do corpo usa a família `Inter` e o do título usa `Poppins`, ambas carregadas das fontes incorporadas, sem requisições ao Google Fonts

### Requirement: Ativos de marca originais e proveniência documentada
O projeto SHALL disponibilizar o logotipo e o favicon originais da extração em
`public/brand/`, sem alteração. Um `src/lib/design-system/README.md` MUST registrar:

- a origem e a data da extração;
- quais valores são observados e quais são derivados (tema escuro, papéis de
  foco, cores de gráfico, escala de espaçamento e estados não vistos);
- o aviso de que o pacote não é a biblioteca oficial da Salvy;
- os componentes omitidos e as adaptações feitas.

As licenças OFL das fontes MUST acompanhar os arquivos de fonte.

#### Scenario: Consultar a origem de um valor
- **WHEN** um desenvolvedor precisa saber se o tema escuro é oficial
- **THEN** o README de proveniência indica que o tema escuro é derivado e não confirmado pelo site público

#### Scenario: Logotipo sem redesenho
- **WHEN** `public/brand/salvy-logo.png` é comparado byte a byte com `docs/references/logos/salvy-logo.png` do pacote de origem
- **THEN** os arquivos são idênticos

### Requirement: Integração sem atualização de versões
A integração SHALL preservar as versões instaladas de Next.js (16.4.3), React
(19.3.0), Tailwind CSS (v4) e `radix-ui` (1.8.1). O projeto MUST NOT ter o
Salvy Design System como dependência de pacote. As opções existentes de
`next.config.ts` MUST permanecer inalteradas.

#### Scenario: Configuração Next preservada
- **WHEN** a mudança é concluída
- **THEN** `next.config.ts` mantém `cacheComponents`, `partialPrefetching`, `experimental.agentFeedback` e a regra `turbopack` do Tailwind exatamente como antes

