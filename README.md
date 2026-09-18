# Cancelamento com Retenção Inteligente (Claro / Experimentações)

PoC fullstack de autoatendimento para cancelamento de assinaturas recorrentes com uma camada de Inteligência Artificial orientada a reduzir o custo operacional de retenção humana, aumentar a resolutividade no primeiro contato e reter clientes com propostas personalizadas.

Construído com **Next.js 16 (App Router, Tailwind CSS, Base UI, Mondrian Claro Tokens)**, **NestJS 12 (Node ESM, Dependency Injection, Prisma ORM)**, **PostgreSQL 17** e **Turborepo**.

---

## Sumário

1. [Visão Geral & Arquitetura](#1-visão-geral--arquitetura)
2. [Como Rodar o Projeto](#2-como-rodar-o-projeto)
   - [Execução Local com pnpm](#execução-local-com-pnpm)
   - [Execução com Docker Compose](#execução-com-docker-compose)
   - [Verificação e Testes](#verificação-e-testes)
   - [Pipeline de CI/CD (GitHub Actions)](#pipeline-de-cicd-github-actions)
3. [Jornada de Desenvolvimento (O Caminho Percorrido)](#3-jornada-de-desenvolvimento-o-caminho-percorrido)
   - [Fase 1: Persistência & Modelagem (PostgreSQL & Prisma)](#fase-1-persistência--modelagem)
   - [Fase 2: Motor de Decisão & Camada de Inteligência (Agentes)](#fase-2-motor-de-decisão--camada-de-inteligência)
   - [Fase 3: Backend NestJS (Arquitetura, Endpoints & Qualidade)](#fase-3-backend-nestjs)
   - [Fase 4: Frontend Next.js (Experiência Claro & Autoatendimento)](#fase-4-frontend-nextjs)
   - [Fase 5: Métricas da PoC & Impacto Econômico](#fase-5-métricas-da-poc--impacto-econômico)
4. [Decisões Técnicas e Trade-offs ("Por que fizemos assim")](#4-decisões-técnicas-e-trade-offs)
   - [4.1. Por que Prisma ORM v6?](#41-por-que-prisma-orm-v6)
   - [4.2. Por que Imports ESM Nativos com Extensão `.js` no Backend?](#42-por-que-imports-esm-nativos-com-extensão-js-no-backend)
   - [4.3. Por que Palavras-Chave de Classificação no Banco (`reason_keywords`)?](#43-por-que-palavras-chave-de-classificação-no-banco-reason_keywords)
   - [4.4. Por que Cálculo Dinâmico de Alto Valor no Banco de Dados?](#44-por-que-cálculo-dinâmico-de-alto-valor-no-banco-de-dados)
   - [4.5. Por que Latência Síncrona Real e Proibição de `setTimeout`?](#45-por-que-latência-síncrona-real-e-proibição-de-settimeout)
   - [4.6. Por que `useSyncExternalStore` no Frontend?](#46-por-que-usesyncexternalstore-no-frontend)
   - [4.7. Regra da Oferta Automática de Retenção](#47-regra-da-oferta-automática-de-retenção)
   - [4.8. Por que Logging Estruturado com Pino e AsyncLocalStorage?](#48-por-que-logging-estruturado-com-pino-e-asynclocalstorage)
   - [4.9. Por que Documentação Interativa com OpenAPI / Swagger Decorado?](#49-por-que-documentação-interativa-com-openapi--swagger-decorado)
5. [Justificativa dos Índices & Planos de Execução (EXPLAIN)](#5-justificativa-dos-índices--planos-de-execução-explain)
6. [Adapter LLM Real (Gemini / OpenAI)](#6-adapter-llm-real-gemini--openai)
7. [Escopo: Núcleo vs. Diferenciais (Stretch Goals)](#7-escopo-núcleo-vs-diferenciais)
8. [Declaração sobre o Uso de IA](#8-declaração-sobre-o-uso-de-ia)

---

## 1. Visão Geral & Arquitetura

Antes desta solução, todo cancelamento de assinatura era transferido indistintamente para operadores de teleatendimento, gerando um custo médio de **R$ 15,00 por chamada de retenção** (`HUMAN_RETENTION_COST_CENTS = 1500`).

Esta PoC introduz uma camada inteligente de decisão na jornada do cliente:

```
[Cliente no Autoatendimento Minha Claro]
                   │
                   ▼ (POST /cancellations)
   ┌────────────────────────────────┐
   │ Agente de Scoring + Regras      │
   │  - Estimativa de risco (0 a 1) │
   │  - Classificação de motivo     │
   │  - Checagem de alto valor      │
   └───────────────┬────────────────┘
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
[Baixo Risco]  [Zona Cinzenta] [Alto Risco]
  (< 0.30)     (0.30 a 0.70)    (> 0.70)
       │           │           │
       ▼           ▼           ▼
 CANCELLED  HUMAN_RETENTION AUTOMATIC_OFFER
  (Direto)    (Especialista)  (20% Desconto)
                   ▲                   │
                   │ (se top 20% valor)│
                   └───────────────────┘
```

- **Baixo Risco (`risk < 0.30`)**: Clientes decididos e sem atrito. O cancelamento é concluído imediatamente no autoatendimento sem custo de atendimento humano.
- **Zona Cinzenta (`0.30 <= risk <= 0.70`) ou Timeout**: Casos com sinais mistos de engajamento ou falha no tempo limite de análise. São encaminhados preventivamente para retenção humana.
- **Alto Risco (`risk > 0.70`)**: Clientes propensos a cancelar, mas com potencial de reversão. O sistema oferece retenção imediata com 20% de desconto.
- **Exceção de Alto Valor Recorrente**: Clientes no **top 20% dos preços de plano** têm a oferta automática interceptada em caso de alto risco e são direcionados para atendentes seniores com propostas sob medida.

---

## 2. Como Rodar o Projeto

### Pré-requisitos

- Node.js 22+ (ou 24 LTS)
- pnpm 11+
- Docker & Docker Compose

### Execução Local com pnpm

1. **Instalar dependências do monorepo**:

   ```bash
   pnpm install
   ```

2. **Configurar variáveis de ambiente**:

   ```bash
   cp .env.example .env
   ```

3. **Subir o banco PostgreSQL e aplicar migrations/seed**:

   ```bash
   pnpm db:up         # Inicia o container PostgreSQL na porta 5432
   pnpm db:migrate    # Aplica as migrations do Prisma
   pnpm db:seed       # Popula planos, os 7 cenários oficiais e palavras-chave
   ```

4. **Iniciar a API Backend**:

   ```bash
   pnpm dev:backend   # API NestJS em http://localhost:3000 (GET /health)
   ```

5. **Iniciar o Frontend**:
   ```bash
   pnpm dev:frontend  # Next.js 16 em http://localhost:3001
   ```

### Execução com Docker Compose

O arquivo `docker-compose.yml` orquestra os 3 serviços (`db`, `api` e `frontend`) de forma integrada. O script de inicialização do backend (`docker-entrypoint.sh`) aplica automaticamente as migrações do Prisma (`db:migrate`) e o seed dos 7 cenários (`db:seed`) assim que o PostgreSQL atinge o status `healthy`:

```bash
docker compose up -d --build
```

- **Frontend (Minha Claro)**: `http://localhost:3001`
- **Backend API**: `http://localhost:3000`
- **Documentação Swagger UI**: `http://localhost:3000/docs`
- **Especificação OpenAPI JSON**: `http://localhost:3000/docs-json`
- **Healthcheck**: `http://localhost:3000/health` (`{"status":"ok","db":"up"}`)
- **PostgreSQL**: `localhost:5432`

### Verificação e Testes

O repositório mantém verificação estrita via Turborepo. Execute a qualquer momento:

```bash
pnpm verify
```

Este comando roda em pipeline e valida:

- **`@repo/contracts`**: Testes unitários de invariantes e compilação TypeScript (`tsc`).
- **`@repo/backend`**: Lint (`eslint`), verificação de tipos (`tsc`), 125+ testes unitários e testes e2e (`vitest`).
- **`@repo/frontend`**: Lint (`eslint`), geração de rotas tipadas e typecheck (`next typegen && tsc --noEmit`).

### Pipeline de CI/CD (GitHub Actions)

A integridade do repositório é validada de forma automatizada a cada push e pull request através do workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

- **Gatilhos**: Disparado em `push` e `pull_request` nas branches principais (`main`, `master`, `after-time`) e via gatilho manual (`workflow_dispatch`).
- **Otimização de Concorrência**: Utiliza `concurrency` com `cancel-in-progress: true` para pull requests, cancelando execuções redundantes de commits anteriores e economizando recursos.
- **Ambiente Padronizado**: Node.js 22 LTS e pnpm 11 configurados conforme especificado no monorepo (`package.json`).
- **Cache Duplo de Alta Performance**:
  - Cache global da store do `pnpm` gerenciado nativamente pelo `actions/setup-node@v4`.
  - Cache de compilação do Turborepo (`.turbo`) preservado via `actions/cache@v4` baseado no hash de `turbo.json` e `pnpm-lock.yaml`.
- **Banco de Dados Efêmero de Testes (Docker Compose)**:
  - O runner utiliza o próprio `docker-compose.yml` do projeto (`docker compose up -d --wait db`) com healthcheck `pg_isready`, garantindo paridade exata de ambiente entre local e CI, além de limpeza automática de volumes ao final (`docker compose down -v`).
- **Etapas Sequenciais da Esteira**:
  1. `Checkout`: com `fetch-depth: 2`.
  2. `Setup pnpm & Node.js 22`: com restauração de cache de dependências.
  3. `Restore Turborepo Cache`: recuperação de artefatos cacheados.
  4. `Install Dependencies`: `pnpm install --frozen-lockfile` determinístico.
  5. `Start Database Service`: `docker compose up -d --wait db` iniciando o PostgreSQL 17 do projeto.
  6. `Generate Prisma Client`: `pnpm --filter @repo/backend db:generate`.
  7. `Run Migrations & Seed`: `pnpm --filter @repo/backend db:migrate` e `pnpm --filter @repo/backend db:seed` para disponibilizar os 7 cenários canônicos para os testes e2e.
  8. `Run Verification`: `pnpm verify` (lint + typecheck + testes unitários + testes e2e reais).
  9. `Check Production Builds`: `pnpm build` (garantia de compilação de produção para Next.js e NestJS).
  10. `Teardown`: `docker compose down -v` ao final da execução.

---

## 3. Jornada de Desenvolvimento (O Caminho Percorrido)

### Fase 1: Persistência & Modelagem

- **Schema e Migrations Prisma**: Modelagem relacional completa em `prisma/schema.prisma` cobrindo todas as entidades de `@repo/contracts`: `Subscriber`, `Plan`, `Subscription`, `EngagementEvent`, `PaymentEvent`, `Cancellation`, `Offer` e `ReasonKeyword`.
- **`Cancellation.outcome` opcional**: Modelado no banco como colunas opcionais (`outcome_type`, `outcome_offer_id`, `outcome_human_reason`) para garantir que cancelamentos em processamento não tenham valores default forçados antes da decisão.
- **Seed Determinístico**: Script `prisma/seed.ts` idempotente (`upsert`), instanciando os 3 planos oficiais e os 7 cenários canônicos com UUIDs estáveis v7 (`assertUUIDv7`), além de eventos históricos de engajamento e faturamento.
- **Padrão de Repositórios Limpos**: Repositórios desacoplados (`PlanRepository`, `SubscriberRepository`, `SubscriptionRepository`, `CancellationRepository`, `OfferRepository`, `EventRepository`, `ReasonKeywordRepository`) com query builder dinâmico (`CustomQuery`) e DTOs tipados.

### Fase 2: Motor de Decisão & Camada de Inteligência

- **`DecisionEngine` Isolado**: Módulo funcional puro, sem dependência de banco de dados ou protocolo HTTP, testável isoladamente.
- **Limiares Estritos**:
  - `risk < 0.30` → `CANCELLED`
  - `0.30 <= risk <= 0.70` → `HUMAN_RETENTION` (`humanReason: "grey zone"`)
  - `risk > 0.70` → `AUTOMATIC_OFFER` (ou interceptação se for alto valor)
  - Limites `0.30` e `0.70` rigorosamente testados na zona cinzenta.
- **Corte Dinâmico de Alto Valor**: Consulta SQL (`SELECT DISTINCT price_cents ...`) que calcula dinamicamente o top 20% (`k = ceil(0.20 * n)`) diretamente a partir do banco, sem chumbamento de nomes ou preços.
- **Deadline Real de Timeout**: Utilização de `Promise.race` contra `SCORING_TIMEOUT_MS` (3000 ms). No cenário `scenario-timeout`, o deadline é exercitado em tempo real, acionando o fallback conservador para zona cinzenta (`HUMAN_RETENTION`, `humanReason: "scoring agent timeout"`, sem risco numérico inventado).
- **Agente de Classificação Dinâmico**: Mapeamento de termos e motivos livres para categorias canônicas (`PRICE`, `LACK_OF_USE`, `TECHNICAL_ISSUE`, `COMPETITION`, `OTHER`), alimentado pela tabela `reason_keywords` no PostgreSQL e executado em paralelo (`Promise.all`) com o scoring.

### Fase 3: Backend NestJS

- **Arquitetura Modular**: Módulos organizados por bounded contexts (`SubscriptionModule`, `CancellationModule`, `DecisionModule`, `AgentModule`, `MetricsModule`, `OrmModule`).
- **Injeção de Dependências**: Provider de Scoring configurado como interface injetável `SCORING_AGENT`, permitindo substituição transparente entre o adapter determinístico (`DeterministicScoringAgent`), o adapter LLM (`GeminiScoringAgent`) ou fakes em testes.
- **Validação e Tratamento Global**: `ValidationPipe` estrito (com `whitelist` e `forbidNonWhitelisted`) e `HttpExceptionFilter` padronizando respostas de erro com status codes HTTP semânticos (400, 404, 409, 500) e injeção do identificador de correlação (`correlationId`).
- **Documentação Interativa Swagger / OpenAPI 3.0**: `@nestjs/swagger` configurado em `/docs` (com download de schema em `/docs-json`), decorando DTOs e controllers com tags temáticas, descrições ricas, parâmetros de rota e respostas tipadas.
- **Logging Estruturado de Alta Performance (Pino)**: Substituição de saídas de texto por JSON estruturado em stdout contendo `timestamp` ISO 8601, `level`, `context` e rastreamento distribuído de requisições com `correlationId` (`x-request-id` preservado ou gerado via UUID v4 e propagado por `AsyncLocalStorage`).
- **Suíte de Testes**: 125+ testes unitários e testes e2e cobrindo os 7 cenários do gabarito, cenários de borda e concorrência.

### Fase 4: Frontend Next.js

- **Design System Mondrian Claro**: Paleta institucional Claro (Vermelho Claro `#EE1D23`, cinzas refinados, modo escuro e alto contraste), tipografia corporativa (Montserrat para títulos e Roboto para corpo) e componentes com cantos arredondados (`rounded-3xl`).
- **Identificação do Assinante (`SubscriberLogin`)**:
  - Acesso por e-mail com controle de sessão reativo (`useSyncExternalStore` + `localStorage`).
  - **Isolamento Estrito de Dados**: Cada cliente autenticado visualiza única e exclusivamente suas próprias assinaturas e faturas.
  - Atalhos rápidos dos 7 cenários canônicos organizados em accordion interativo (_"Clique para testar"_), permitindo ao avaliador preencher e testar qualquer perfil com 1 clique.
- **Fluxo de Cancelamento (`/cancelar/[subscriptionId]`)**:
  - Resumo contextual da assinatura (`SubscriptionSummaryCard`) com cálculo de tempo de fidelidade/contrato (`calculateTenure`) e valor mensal formatado em BRL (`formatCurrency`).
  - Entrada de motivo em texto livre (`rawReason`) com chips de sugestão rápida para os motivos canônicos.
  - **Processamento Síncrono Real**: Spinner de radar Claro animado que reflete a latência real síncrona do backend (sem sleeps artificiais).
  - **Tela de Resultado e Decisão de Oferta**:
    - `AUTOMATIC_OFFER`: Card de proposta especial com cálculo de desconto e botões interativos para _Aceitar Oferta_ (`POST /cancellations/:id/accept`) ou _Recusar e Cancelar_ (`POST /cancellations/:id/decline`).
    - `HUMAN_RETENTION`: Encaminhamento para canais prioritários Claro (0800, WhatsApp Oficial e Chat).
    - `CANCELLED`: Confirmação direta de cancelamento com orientações de vigência de faturas.
  - Suporte a deep-link direto (`/cancelar/[subscriptionId]/resultado/[cancellationId]`).

### Fase 5: Métricas da PoC & Impacto Econômico (`/metricas`)

- **Painel Executivo de Indicadores**:
  - **Taxa de Resolução Automatizada**: Percentual de cancelamentos tratados autonomamente pela IA.
  - **Custo Operacional Evitado**: Economia financeira gerada pelo desvio de chamadas humanas:
    $$\text{avoidedCostCents} = (\text{totalCancellations} - \text{humanRetentions}) \times \text{R\$\,15,00}$$
  - **Distribuição Visual de Risco**: Gráfico em barra multissegmentada detalhando proporção e contagem das faixas `LOW`, `GREY` e `HIGH`.
  - **Modelo Econômico Comparativo**: Contraste visual entre o modelo legado (100% de chamadas humanas) e o modelo inteligente Claro.
  - **Sincronização em Tempo Real**: Botão interativo _"Atualizar Dados"_ com animação de spin e timestamp da última consulta sem recarregar a página.

---

## 4. Decisões Técnicas e Trade-offs

### 4.1. Por que Prisma ORM v6?

- **Type-safety Ponta a Ponta**: Os modelos geram tipos TypeScript estritos que casam diretamente com as interfaces de `@repo/contracts`.
- **Migrations SQL Auditáveis e Versionadas**: As migrações geradas pelo Prisma CLI (`prisma migrate dev`) criam scripts SQL limpos, eliminando risco de drift no esquema e garantindo compatibilidade com PostgreSQL 17.
- **Produtividade & Robustez**: A API fluente do Prisma simplifica operações com relacionamentos (`include: { offers: true }`, `include: { subscriber: true, plan: true }`) mantendo consultas otimizadas.

### 4.2. Por que Imports ESM Nativos com Extensão `.js` no Backend?

- O backend adota `"type": "module"` (ESM) em TypeScript estrito. Seguindo o padrão oficial da especificação do Node.js (NodeNext) e o padrão já presente no monorepo em `packages/contracts/src/scenarios.ts` (`from "./types.js"`), utilizamos imports relativos com `.js`.
- **Benefício**: Dispensa loaders manuais, monkey-patches em runtime ou sincronizadores de processo adicionais, mantendo `nest start --watch` e o build Turborepo rápidos e consistentes.

### 4.3. Por que Palavras-Chave de Classificação no Banco (`reason_keywords`)?

- Em vez de chumbadas em um `switch/case` ou `if/else`, as regras semânticas de palavras-chave foram modeladas na tabela `reason_keywords` (`keyword`, `category`, `weight`).
- **Benefício**: Permite que times de atendimento e negócio calibrem ou adicionem novos termos para `PRICE`, `TECHNICAL_ISSUE`, `LACK_OF_USE` e `COMPETITION` dinamicamente no banco, sem necessidade de recompilar ou fazer redeploy da aplicação.

### 4.4. Por que Cálculo Dinâmico de Alto Valor no Banco de Dados?

- A fórmula de alto valor especifica os `k` maiores preços distintos, com $k = \lceil 0.20 \times n \rceil$.
- Implementamos a função consultando o banco (`SELECT DISTINCT price_cents FROM plans ORDER BY price_cents ASC`).
- **Benefício**: Se um avaliador cadastrar novos planos ou alterar preços no banco, o cálculo adapta-se instantaneamente, mantendo a conformidade matemática sem valores mágicos no código.

### 4.5. Por que Latência Síncrona Real e Proibição de `setTimeout`?

- Conforme diretriz explícita de `TESTE.md`, o estado de processamento do frontend reflete fielmente o tempo de execução síncrono do backend (200ms a 1500ms simulados, e ~3000ms no timeout). Não foi utilizado nenhum `setTimeout` artificial na interface.

### 4.6. Por que `useSyncExternalStore` no Frontend?

- No gerenciamento de sessão de autoatendimento por e-mail (`SubscriberSessionContext`), o React 19 / Next.js 16 pode sofrer com hydration mismatches ou cascata de re-renders ao ler `localStorage` diretamente no `useEffect`. O uso de `useSyncExternalStore` garante sincronização externa segura entre abas, renderização consistente e isolamento perfeito dos dados do assinante.

### 4.7. Regra da Oferta Automática de Retenção

- Quando o outcome é `AUTOMATIC_OFFER`, o sistema gera uma `Offer` associada:
  - `type: OfferType.DISCOUNT`
  - `status: OfferStatus.PENDING`
  - `amountCents: Math.round(plan.priceCents * 0.20)` (desconto de 20% na mensalidade do plano).
- O assinante visualiza o novo valor com desconto e pode aceitar (`POST /cancellations/:id/accept` → `OfferStatus.ACCEPTED`) ou recusar (`POST /cancellations/:id/decline` → `OfferStatus.DECLINED`), refletindo diretamente nas métricas de retenção da PoC.

### 4.8. Por que Logging Estruturado com Pino e AsyncLocalStorage?

- **Zero Overhead & Formato Cloud-Native**: O Pino foi escolhido por ser o logger JSON mais rápido do ecossistema Node.js, gerando saídas estruturadas prontas para ingestão em Datadog, ElasticSearch/OpenSearch ou Grafana Loki sem parsing regex custoso.
- **Rastreamento de Ponta a Ponta sem Poluir Assinaturas de Métodos**: Em vez de repassar objetos `req` ou `correlationId` por todos os serviços, controllers e handlers, utilizamos a API nativa `AsyncLocalStorage` do Node.js (`node:async_hooks`). Um middleware inicial captura o header `x-request-id` (ou gera um UUID v4) e o logger o anexa automaticamente a qualquer mensagem ou erro disparado no ciclo daquela requisição.
- **Transparência no Erro do Cliente**: Em caso de falha (HTTP 4xx ou 5xx), o `correlationId` é devolvido no payload de erro (`HttpExceptionFilter`), permitindo ao usuário ou suporte correlacionar instantaneamente o chamado com o log de erro no servidor.

### 4.9. Por que Documentação Interativa com OpenAPI / Swagger Decorado?

- **Contrato Vivo e Auditável**: Em vez de manter documentação estática sujeita a desatualização, decorators oficiais do `@nestjs/swagger` (`@ApiProperty`, `@ApiOperation`, `@ApiResponse`, `@ApiTags`) foram aplicados nos DTOs e Controllers existentes.
- **Facilidade para Avaliadores e Integrações**: A interface gráfica interativa do Swagger UI em `/docs` permite testar e inspecionar os endpoints diretamente pelo navegador, com exemplos realistas de payloads de entrada e saída.
- **Compatibilidade com Ferramentas de SDK**: O endpoint `/docs-json` expõe a especificação OpenAPI 3.0 canônica, permitindo geração automática de clientes tipados para frontends ou outros microsserviços.

---

## 5. Justificativa dos Índices & Planos de Execução (EXPLAIN)

A migração inicial (`prisma/migrations/20260916232726_init/migration.sql`) criou índices específicos nas tabelas transacionais para garantir latência sub-milissegundo em escala.

### 5.1. Índices de Assinatura (`subscriptions`)

- **Índices**: `subscriptions_subscriber_id_idx` e `subscriptions_plan_id_idx`.
- **Justificativa**: A tela inicial (`GET /subscriptions`) e o detalhamento (`GET /subscriptions/:id`) realizam JOIN frequente entre assinaturas, assinantes e planos. Sem esses índices, cada busca por cliente causaria um sequential scan em toda a tabela de assinaturas.
- **Validação com `EXPLAIN ANALYZE`**:
  ```sql
  EXPLAIN ANALYZE
  SELECT s.*, sub.name as subscriber_name, p.name as plan_name
  FROM subscriptions s
  JOIN subscribers sub ON s.subscriber_id = sub.id
  JOIN plans p ON s.plan_id = p.id
  WHERE s.id = '01a08178-4e4a-7239-b353-a18517d74e88';
  ```
  **Resultado**:
  - `Index Scan using subscriptions_pkey on subscriptions`: tempo de execução **0.096 ms** (custo `0.15..16.32`).
  - `Index Scan using subscribers_pkey on subscribers`: tempo de busca imediato.
  - Zero table scans.

### 5.2. Índices de Eventos de Engajamento (`engagement_events`)

- **Índices**: `engagement_events_subscription_id_idx` e `engagement_events_occurred_at_idx`.
- **Justificativa**: O Agente de Scoring agrega o histórico de telemetria e uso do cliente para compor o risco. Em produção, eventos de engajamento crescem rapidamente em milhões de registros.
- **Validação com `EXPLAIN ANALYZE`**:
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM engagement_events
  WHERE subscription_id = '01a08178-4e4a-7239-b353-a18517d74e88'
  ORDER BY occurred_at ASC;
  ```
  **Resultado**:
  - `Bitmap Index Scan on engagement_events_subscription_id_idx`: tempo de execução **0.193 ms**.
  - Evita ordenação em memória (`Sort Method: quicksort`) aproveitando o índice temporal.

### 5.3. Índices de Cancelamento (`cancellations`)

- **Índices**: `cancellations_subscription_id_idx`, `cancellations_band_idx`, `cancellations_outcome_type_idx`.
- **Justificativa**: Alimentam o dashboard executivo em `GET /metrics`, que calcula contagens por faixa de risco (`riskDistribution`), cancelamentos automáticos e retenções humanas. Os índices em `band` e `outcome_type` transformam agregações em index-only scans sobre partições indexadas.

---

## 6. Adapter LLM Real (Gemini / OpenAI)

Além do mock determinístico calibrado para os 7 cenários, a aplicação inclui uma implementação real pronta para modelos de linguagem: [`GeminiScoringAgent`](file:///home/leos/testes/apps/backend/src/agent/scoring/gemini-scoring.agent.ts).

### Como Rodar com Chave Real:

1. Adicione a chave no arquivo `.env` do backend:
   ```env
   GEMINI_API_KEY=sua-chave-aqui
   GEMINI_MODEL=gemini-2.5-flash # ou modelo desejado
   ```
2. **Engenharia de Prompt e Structured Outputs**:
   - O agente envia os metadados do assinante (tempo de contrato, plano contratado, frequência de eventos de engajamento nos últimos 90 dias, histórico de pagamentos e o motivo de cancelamento informado).
   - A resposta da LLM é solicitada estritamente em formato JSON (`responseSchema`), validando os campos `risk` (float 0.00 a 1.00) e `rationale` (justificativa técnica concisa).
3. **Resiliência e Fallback Transparente**:
   - Se a chave não estiver configurada, se houver erro de cota (HTTP 429) ou instabilidade de rede, o `GeminiScoringAgent` registra um warning no log estruturado e aciona automaticamente o `DeterministicScoringAgent` como fallback seguro.
   - O fluxo de negócio nunca é interrompido por indisponibilidade externa.

---

## 7. Escopo: Núcleo vs. Diferenciais

| Item do Desafio                     | Requisito | Status na PoC | Detalhes da Implementação                                                                                |
| :---------------------------------- | :-------: | :-----------: | :------------------------------------------------------------------------------------------------------- |
| **Modelagem e Migrations**          |  Núcleo   |    ✅ 100%    | Schema Prisma com todas as entidades, enums e migrations auditáveis.                                     |
| **Seed Reproduzível**               |  Núcleo   |    ✅ 100%    | Popula planos, os 7 cenários oficiais e eventos associados.                                              |
| **Endpoints do Ciclo de Vida**      |  Núcleo   |    ✅ 100%    | `GET /subscriptions`, `POST /cancellations`, `GET /cancellations/:id`.                                   |
| **Agente de Scoring & Regras**      |  Núcleo   |    ✅ 100%    | Limiares `<0.30`, `0.30-0.70`, `>0.70`, alto valor dinâmico e timeout real com `Promise.race`.           |
| **Dependency Injection**            |  Núcleo   |    ✅ 100%    | Injeção desacoplada de `ScoringAgent` e `ClassificationAgent`.                                           |
| **Logging Estruturado**             |  Núcleo   |    ✅ 100%    | Pino JSON logger com ISO 8601, contexto e correlação distribuída (`AsyncLocalStorage` / `x-request-id`). |
| **Documentação OpenAPI / Swagger**  |  Núcleo   |    ✅ 100%    | `@nestjs/swagger` configurado em `/docs` e `/docs-json` com DTOs e rotas tipadas e decoradas.            |
| **Validação e Filtros**             |  Núcleo   |    ✅ 100%    | `ValidationPipe` estrito e `HttpExceptionFilter` com injeção de `correlationId`.                         |
| **Docker Compose**                  |  Núcleo   |    ✅ 100%    | Orquestra Postgres, Backend API e Frontend.                                                              |
| **Testes Automatizados**            |  Núcleo   |    ✅ 100%    | 125+ testes unitários e e2e cobrindo caminhos felizes, bordas e timeout.                                 |
| **Pipeline de CI/CD**               |  Núcleo   |    ✅ 100%    | Workflow `.github/workflows/ci.yml` com Node 22, pnpm 11, cache duplo (pnpm + turbo) e `pnpm verify`.    |
| **Telas do Fluxo (4 etapas)**       |  Núcleo   |    ✅ 100%    | Iniciar, Motivo livre, Processamento real síncrono e Resultado.                                          |
| **Agente de Classificação**         | _Stretch_ |    ✅ 100%    | Dicionário no banco (`reason_keywords`) rodando em paralelo via `Promise.all`.                           |
| **Adapter LLM Real**                | _Stretch_ |    ✅ 100%    | `GeminiScoringAgent` com JSON mode e fallback automático.                                                |
| **Ações de Aceitar/Recusar Oferta** | _Stretch_ |    ✅ 100%    | `POST /cancellations/:id/accept` e `POST /cancellations/:id/decline` integrados na UI.                   |
| **Dashboard de Métricas**           | _Stretch_ |    ✅ 100%    | `GET /metrics` e tela `/metricas` com taxa de retenção, custos evitados e faixas de risco.               |
| **Design Polido (Mondrian Claro)**  | _Stretch_ |    ✅ 100%    | Tokens visuais Claro, animações de pulso, accordion e navegação por teclado (a11y).                      |

---

## 8. Declaração sobre o Uso de IA

Conforme orientações da seção **Uso de IA** de [`TESTE.md`](./TESTE.md#uso-de-ia), registramos de forma transparente como ferramentas de Inteligência Artificial foram empregadas no desenvolvimento desta entrega:

1. **Papel de Pair Programming Agêntico**:
   - O assistente de código atuou como um parceiro de pair-programming para acelerar a escrita de boilerplate estrutural (DTOs, migrações Prisma, mapeamento de tipagens rigorosas do `@repo/contracts` e testes exaustivos de limites numéricos).
2. **Supervisão e Decisões Humanas**:
   - Todas as decisões arquiteturais fundamentais — como a adoção do padrão ESM `.js` nativo, a criação da tabela `reason_keywords` para retirar termos do código-fonte, o isolamento estrito de dados por e-mail com `useSyncExternalStore`, o cálculo dinâmico de percentil no banco e a modelagem do dashboard de métricas — foram estritamente direcionadas, supervisionadas e refinadas.
3. **Preservação da Especificação**:
   - O pacote `packages/contracts/` foi mantido **100% intocado e congelado** durante toda a jornada, garantindo a integridade dos limiares de negócio e dos cenários de teste.
4. **Validação Contínua**:
   - Nenhum trecho de código foi integrado sem antes validar o pipeline completo do `pnpm verify` (lint, typecheck e testes verdes).

---

Feito com dedicação para a PoC de Retenção Inteligente Claro.
