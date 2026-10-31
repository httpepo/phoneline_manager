## ADDED Requirements

### Requirement: Código-fonte em src/ com alias @/
O código da aplicação SHALL ficar em `src/`: as pastas `src/app`,
`src/components`, `src/hooks` e `src/lib`. O alias `@/` MUST resolver para
`src/` no TypeScript (`tsconfig.json`), no Vitest e na configuração do shadcn
(`components.json`). Os diretórios `app/`, `components/` e `lib/` MUST NOT
continuar na raiz. `public/`, os arquivos de configuração e `scripts/` ficam
na raiz.

#### Scenario: Rotas servidas a partir de src/app
- **WHEN** `npm run build` é executado depois da reestruturação
- **THEN** o Next compila as rotas de `src/app/` e não existe `app/` na raiz

#### Scenario: Alias resolvido para src/
- **WHEN** um módulo importa `{ cn } from "@/lib/utils"`
- **THEN** o TypeScript, o Next e o Vitest resolvem o import para `src/lib/utils.ts`

### Requirement: Comandos de verificação via npm
O `package.json` SHALL expor os scripts `typecheck`
(`next typegen && tsc --noEmit`), `test`
(`vitest run`) e `tokens` (geração do tema). Os comandos `npm run typecheck` e
`npm test` MUST rodar sem configuração manual adicional. O Vitest MUST usar o
ambiente jsdom e MUST NOT fazer chamadas de rede.

#### Scenario: Typecheck pelo npm
- **WHEN** um desenvolvedor executa `npm run typecheck` numa árvore sem erros de tipo
- **THEN** o comando termina com código 0

#### Scenario: Testes pelo npm
- **WHEN** um desenvolvedor executa `npm test`
- **THEN** o Vitest executa os testes em jsdom uma única vez (sem watch) e termina com código 0 quando todos passam

### Requirement: Dependências declaradas e sem pacotes extraneous
Todo pacote importado pelo código de `src/`, pelos scripts ou pelo CSS SHALL
estar declarado no `package.json` e no `package-lock.json`. Depois da mudança,
`npm ls --depth=0` MUST NOT listar pacotes `missing` nem pacotes
`extraneous` ausentes do `package-lock.json`. Os opcionais de plataforma que o
npm marca como `extraneous` mesmo após `npm ci` (dependências de pacotes wasm32
pulados no sistema atual) são aceitos, desde que estejam no lockfile.
Dependências novas MUST passar pela aprovação prévia do usuário.

#### Scenario: Instalação limpa reproduz o build
- **WHEN** `node_modules` é recriado a partir do lockfile (`npm ci`) e `npm run build` é executado
- **THEN** o build termina com sucesso, sem depender de pacotes que existiam só localmente

#### Scenario: Árvore de dependências sem extraneous
- **WHEN** `npm ls --depth=0` é executado depois de `npm prune`
- **THEN** a saída não contém `missing`, e todo pacote marcado como `extraneous` tem entrada no `package-lock.json`

### Requirement: CSS global sem imports de pacotes ausentes
O `src/app/globals.css` SHALL importar apenas arquivos locais ou pacotes
declarados no `package.json`. O import de `shadcn/tailwind.css` MUST ser
removido.

#### Scenario: Build sem erro de resolução de CSS
- **WHEN** `npm run build` processa `src/app/globals.css`
- **THEN** nenhum erro de módulo CSS não encontrado é emitido
