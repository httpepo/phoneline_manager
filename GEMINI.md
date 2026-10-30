# AGENTS.md — Regras técnicas do projeto Salvy

Estas regras orientam a implementação do desafio. Aplique-as a todas as mudanças
de código e testes.

## 1. Stack e limite arquitetural

- Use Next.js com App Router, TypeScript, React, Node.js e Route Handlers.
- Mantenha um único aplicativo Next.js com backend integrado. Não introduza
  Express, outro servidor, Server Actions, banco de dados, ORM, filas ou workers.
- Use TanStack Query para as chamadas do navegador; shadcn/ui e Tailwind CSS
  para a interface; Fetch para chamadas HTTP; Zod para validação; Vitest e
  Testing Library para testes.
- Use os pacotes e convenções existentes no workspace. Instale outra
  dependência ou substitua a stack somente após apresentar o motivo, as
  alternativas, os custos e obter aprovação.
- O backend executa em um processo Node.js local. O armazenamento em memória
  não persiste após reinício e não é compartilhado entre processos.

## 2. Arquitetura em camadas

Organize o código como um monólito modular pequeno, com responsabilidades
separadas e dependências direcionadas para dentro:

1. **Interface — `src/app`, `src/components` e `src/hooks`:** páginas, elementos
   visuais e interação com a API. Os componentes não acessam a TOM nem o
   armazenamento.
2. **Adaptadores HTTP — `src/app/api`:** Route Handlers que validam a entrada,
   chamam os casos de uso e convertem seus resultados em respostas HTTP.
   Não implemente regras de negócio nos handlers.
3. **Aplicação — `src/server/application`:** casos de uso para preparar,
   executar, consultar e listar. Coordena portas e regras sem depender do
   Next.js ou do transporte HTTP.
4. **Domínio — `src/server/domain`:** entidades, estados, transições e
   invariantes. Não importa React, Next.js, clientes HTTP ou adaptadores.
5. **Infraestrutura — `src/server/infrastructure`:** armazenamento em memória,
   adaptador da TOM e composição das dependências.

Declare na camada de aplicação as interfaces mínimas necessárias para o
repositório e o gateway da TOM. A infraestrutura as implementa. Não crie
frameworks internos, classes base ou camadas sem uma necessidade real.

Use estes padrões com escopo reduzido:

- **Casos de uso/serviços** para operações da aplicação.
- **Repository** para leitura e escrita do estado em memória.
- **Gateway/adapter** para isolar a API TOM do domínio.
- **Injeção de dependências** simples para testar casos de uso com gateway e
  armazenamento simulados.

Não permita que o domínio importe interfaces HTTP nem que a infraestrutura seja
chamada diretamente pela interface.

## 3. Organização e convenções de código

- Use `@/` para importar de `artifacts/salvy/src` e `@workspace/*` para pacotes
  compartilhados do monorepo.
- Prefira TypeScript estrito. Não use `any`; para dados externos, comece com
  `unknown` e valide antes de usar.
- Use `camelCase` para funções e variáveis, `PascalCase` para componentes e
  tipos e nomes de arquivo `kebab-case`. Use `import type` para imports somente
  de tipos.
- Prefira funções pequenas, nomes que expressem a ação e funções puras para
  validações e transições de estado.
- Mantenha componentes visuais focados na apresentação. Coloque a interação
  compartilhada do fluxo de linhas em hooks, como `use-line-workflow.ts`.
- Componentes e layouts do Next.js são Server Components por padrão. Adicione
  `"use client"` somente aos componentes que realmente precisam de estado,
  eventos ou APIs do navegador.
- Não misture CSS Modules, outra biblioteca de estado, Axios, TanStack Router,
  Redux ou TanStack Table com as ferramentas aprovadas.
- Antes de mudar código existente, confira sua implementação; não presuma que
  rotas, componentes ou testes descritos em interfaces já estão implementados.

## 4. Contrato HTTP e geração de código

- `lib/api-spec/openapi.yaml` é a fonte canônica do contrato HTTP.
- Gere os clientes React Query e schemas Zod com
  `pnpm --filter @workspace/api-spec run codegen`. Nunca edite os arquivos
  gerados à mão.
- Preserve `info.title: Api`, `servers.url: /api`, os operation IDs existentes
  e o mutator `customFetch`; a geração depende dessas convenções.
- Endpoints obrigatórios:
  - `POST /api/requests`: valida e prepara; devolve `201`. Não chama a TOM.
  - `GET /api/requests/{code}`: consulta apenas o estado local; nunca cria nem
    reenvia.
  - `POST /api/requests/{code}/execute`: executa o pedido já preparado, sem
    corpo que possa alterar DDD, plano ou código; devolve `200`, ou `202` se
    esse mesmo pedido já estiver processando.
  - `GET /api/lines`: lista exclusivamente linhas confirmadas.
- Para códigos desconhecidos ou perdidos, devolva `404`. Validação inválida
  devolve `400`. Mantenha erros no formato `{ error, code, fieldErrors? }`;
  não exponha stack traces, credenciais nem respostas brutas da TOM.
- Use `runtime = "nodejs"`, `dynamic = "force-dynamic"` e
  `Cache-Control: no-store` nas rotas de negócio.
- Toda mudança no formato HTTP começa no OpenAPI. Em seguida, regenere os
  clientes e schemas e atualize os testes e consumidores afetados.

## 5. Modelo e invariantes do domínio

- Compartilhe o catálogo fixo definido em `src/lib/catalog.ts`: DDD brasileiro
  válido e planos WhatsApp (1), 1 GB (2), 3 GB (3) e 5 GB (4). Valide novamente
  no servidor, sem depender da validação da interface.
- A API aceita somente códigos que o backend emitiu e ainda reconhece. Gere-os
  no servidor com `crypto.randomUUID()`. Nunca aceite um código do navegador
  como prova de identidade ou autorização.
- Uma solicitação e uma linha confirmada são entidades distintas. Uma
  solicitação tem zero ou uma linha local; cada linha pertence a uma
  solicitação.
- Armazene na linha apenas o código da solicitação, o telefone retornado pela
  TOM e o instante em que a aplicação recebeu a confirmação. Derive DDD e plano
  da solicitação original; não os duplique na entidade armazenada da linha.
- Uma linha só pode ser adicionada à lista após uma resposta TOM válida com
  telefone validado. Não crie dados de demonstração, linhas otimistas ou números
  inventados.
- DDD e plano não mudam depois da preparação. O mesmo código é a chave de
  idempotência enviada à TOM em qualquer tentativa do mesmo pedido.
- Use uma união de estados com os valores exatos
  `PREPARADA`, `PROCESSANDO`, `CONCLUÍDA`, `FALHA_CONFIRMADA` e
  `RESULTADO_INCERTO`. Centralize as transições e rejeite transições inválidas;
  não represente o estado com booleanos independentes.
- `CONCLUÍDA` retorna o resultado local sem outra chamada à TOM. Enquanto o
  pedido estiver `PROCESSANDO`, uma repetição não inicia outra chamada. Uma
  falha genérica, timeout, perda de rede ou resposta de sucesso malformada
  resulta em `RESULTADO_INCERTO`, nunca numa linha fictícia.
- Uma rejeição nova não transforma em falha confirmada o histórico de uma
  tentativa anterior incerta. Mantenha `RESULTADO_INCERTO` até que uma
  confirmação válida seja recebida.

## 6. Armazenamento em memória

- Implemente um repositório em memória no servidor, baseado em coleções simples
  indexadas pelo código do pedido. Não introduza SQL, ORM, persistência no
  navegador, expiração ou limpeza automática sem aprovação.
- Compartilhe o repositório durante a vida do processo Node.js e preserve-o
  durante hot reload de desenvolvimento com um singleton controlado em
  `globalThis`.
- Atualize estado e linha confirmada atomicamente no processo, evitando linha
  sem solicitação correspondente ou mais de uma linha por pedido.
- Ao executar: marque `PROCESSANDO` sincronamente antes do primeiro `await`.
  Um segundo pedido concorrente para o mesmo código deve observar esse estado,
  não chamar a TOM novamente.
- Não interprete a memória local como garantia de recuperação depois do
  reinício. Códigos não conhecidos pelo processo retornam `404`.

## 7. Integração com a TOM

- A comunicação com a TOM acontece somente no adaptador de infraestrutura do
  servidor, usando `fetch` nativo:
  `POST https://1wvur6wjzc.execute-api.us-east-1.amazonaws.com/phone-number`.
- Envie `areaCode`, `subscriptionPlanId` e `idempotencyKey` igual ao código
  emitido pelo backend. A resposta válida esperada contém `phoneNumber`.
- Obtenha `TOM_API_KEY` exclusivamente pelo fluxo seguro de Secrets do Replit,
  via variável server-side `process.env.TOM_API_KEY`. Nunca use prefixo
  `NEXT_PUBLIC_`, prop, localStorage ou sessionStorage para credenciais.
- O limite é configurável pelo backend, inicialmente 60 segundos. Cancele a
  espera de rede com `AbortController` ao atingir o limite e cubra a leitura do
  corpo da resposta no mesmo prazo.
- Não envie o `AbortSignal` do navegador à TOM. O usuário fechar a página ou a
  conexão cliente cair não prova cancelamento do processamento remoto.
- Trate redirecionamentos como erro. Valide estrutura e telefone da resposta.
  Timeout, erro de rede, HTTP 5xx ou payload inválido não comprovam ausência de
  criação. Somente classifique uma falha como confirmada quando houver evidência
  conclusiva de rejeição.
- Não registre a chave, telefone completo, corpo bruto da resposta externa ou
  cabeçalhos da TOM nos logs. Use logs estruturados no servidor com contexto
  mínimo e sanitizado.

## 8. Interface e comportamento assíncrono

- Use os hooks e tipos gerados de `@workspace/api-client-react`; componentes
  não fazem `fetch` direto.
- Configure TanStack Query com `retry: false`,
  `refetchOnWindowFocus: false` e `refetchOnReconnect: false` para consultas;
  mutations usam `retry: false` e `networkMode: "always"`. Não habilite fila
  offline ou reenvio automático após reconexão.
- Num único envio: preparar, receber o código do servidor, gravar esse código
  em `sessionStorage` e só então executar. Se a gravação falhar, não execute.
- Use uma proteção de envio em andamento (`useRef` ou equivalente) além de
  desabilitar o botão, para impedir duplo clique antes da atualização visual.
- Ao recarregar, consulte pelo código armazenado. Nunca faça novo `POST` de
  preparação ou execução automaticamente. Se o backend não reconhecer o código,
  explique que pode ter ocorrido reinício e exija ação consciente antes de uma
  nova solicitação.
- Preserve o código em erros de rede e consulta. Não apague a referência apenas
  porque o navegador perdeu a conexão.
- Atualize o cache do pedido a partir das respostas reais do servidor e
  invalide a lista após uma tentativa. Não confirme linhas otimisticamente.
- Diferencie carregamento, lista vazia, preparação falha, falha confirmada,
  estado incerto e criação concluída com mensagens acessíveis. Não use a cor
  como único indicador.

## 9. Testes e comandos de verificação

- Escreva testes de domínio e casos de uso com repositório em memória isolado e
  gateway TOM falso injetado; os testes unitários nunca chamam a API externa.
- Cubra: validação do catálogo, código emitido no servidor, dados imutáveis,
  sucesso e linha listada, repetição de sucesso sem nova chamada, concorrência
  para o mesmo código, estados e transições, timeout incerto, payload inválido,
  falha da TOM, retentativa manual com a mesma chave, `404` após reinício e
  retomada sem envio automático.
- Para a interface, teste rótulos, navegação por teclado, mensagens de erro,
  gravação bem-sucedida e falha do `sessionStorage`, recuperação após recarregar
  e prevenção contra envio duplicado.
- Antes de entregar alterações de código, execute:
  - `pnpm --filter @workspace/salvy run typecheck`
  - `pnpm --filter @workspace/salvy run test`
  - `pnpm run typecheck`
- Mudanças em `lib/api-spec/openapi.yaml` também exigem regeneração via Orval e
  testes do cliente e dos endpoints afetados.
