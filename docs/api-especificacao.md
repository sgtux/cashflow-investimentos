# cashflow-investimentos — especificação da API

Este documento descreve o que a API (a ser implementada em Java, por conta própria, como
exercício de aprendizado) precisa entregar para o frontend em `web/` funcionar de verdade.
O frontend já foi construído **mockado** contra este contrato — os arquivos em
`web/src/services/*.js` são a referência viva de cada chamada esperada. Quando a API existir,
basta trocar a implementação desses services por chamadas HTTP reais; as assinaturas de
função e os formatos de dado não devem mudar.

Sugestões de stack (Spring Boot, Flyway, etc.) são recomendações, não obrigação — a escolha
final é sua.

## 1. Visão geral e decisões de arquitetura

- **Por que um app separado do Cashflow atual**: `cashflow-investimentos` é um domínio
  diferente (investimentos vs. orçamento doméstico) e você quer usar Java para aprender —
  então faz sentido ser um serviço próprio, com seu próprio banco, em vez de um módulo dentro
  da API .NET existente.
- **Por que não um `cashflow-auth` separado**: com só 2 apps, extrair um serviço de
  autenticação à parte seria over-engineering. A API .NET do Cashflow já emite JWTs — a API
  nova só precisa **confiar** nesses tokens (validar a assinatura) em vez de reimplementar
  cadastro/login do zero. Se um dia existir uma terceira aplicação precisando da mesma
  identidade, aí sim vale reavaliar.
- **Estratégia escolhida — proxy de login**: a API .NET do Cashflow **não tem CORS
  configurado**, então o browser não pode chamar `/api/token` dela diretamente a partir do
  frontend novo (origem diferente). Em vez de mexer no app .NET em produção, a API Java expõe
  seu próprio endpoint de login que repassa a chamada por trás (servidor-a-servidor, sem
  problema de CORS) e devolve o mesmo token ao frontend.

```
Browser (web/) --POST /api/auth/login--> API Java --POST /api/token--> API .NET (Cashflow)
                                              |
                                              v
                                     valida JWT localmente
                                     em todas as outras rotas
```

## 2. Autenticação

### 2.1 Login (proxy)

`POST /api/auth/login`

Requisição:
```json
{ "email": "usuario@exemplo.com", "password": "senha123" }
```

Implementação: repassar exatamente esse corpo para `POST {CASHFLOW_API_BASE_URL}/api/token`
da API .NET existente (env var `CASHFLOW_API_BASE_URL`, ex:
`https://cashflow-api.exemplo.com` ou `http://localhost:56666` em dev).

Resposta (sucesso, 200) — repassar o token recebido, sem reassinar nada:
```json
{ "id": 42, "email": "usuario@exemplo.com", "token": "<jwt recebido da API .NET>" }
```

Resposta (falha, 401) — mapear para um formato próprio, não vazar o envelope de erro do .NET:
```json
{ "message": "Credenciais inválidas" }
```

### 2.2 Validação do JWT em todas as outras rotas

**Isto é o ponto crítico — sem acertar exatamente estes detalhes, os tokens do Cashflow não
vão validar no seu app.**

Fatos confirmados lendo o código da API .NET (`Api/Auth/JwtTokenBuilder.cs` e
`Api/Auth/AuthenticationMiddleware.cs`):

- Algoritmo: **HMAC-SHA256**.
- A chave de assinatura é construída a partir dos **bytes ASCII crus** da secret
  (`Encoding.ASCII.GetBytes(key)`), **não** é Base64. No Java, isso é
  `secret.getBytes(StandardCharsets.US_ASCII)` — se usar `Decoders.BASE64.decode(...)` (comum
  em exemplos de JWT com jjwt) a validação vai falhar silenciosamente.
- **Não há validação de issuer nem audience** — só assinatura e expiração.
- A claim que identifica o usuário é `ClaimTypes.Sid` do .NET. Como o token é construído
  direto (`new Claim(item.Key, item.Value)` dentro de um `JwtSecurityToken`, sem passar por
  `ClaimsIdentity`), o .NET **não abrevia** esse nome de claim — ele vai parar no JWT com a
  **URI completa**:
  ```
  http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid
  ```
  Ou seja: no payload decodificado do JWT, a claim não se chama `"sid"`, se chama
  `"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"`. O valor é o id do usuário
  (inteiro, como string).
- A secret (`SECRET_JWT_KEY`) precisa ser **exatamente a mesma string** configurada nos dois
  apps (.NET e Java) — é isso que estabelece a confiança entre eles. Documente isso com
  destaque onde quer que as secrets de deploy sejam gerenciadas.

Sugestão de implementação: filtro (`OncePerRequestFilter` do Spring Security) que lê o header
`Authorization: Bearer <token>`, valida com `jjwt` usando a chave ASCII acima, extrai a claim
de URI longa como `userId`, e recusa (401) qualquer request sem token válido para rotas
protegidas.

### 2.3 CORS

A API .NET não precisa de nenhuma mudança. A API Java nova **precisa** de CORS habilitado
para a origem do frontend novo (variável de ambiente, ex: `WEB_ORIGIN=http://localhost:3000`
em dev, e o domínio real em produção), já que o browser fala com ela diretamente.

## 3. Modelo de dados

Duas tabelas, inspiradas no padrão "definição + histórico" já usado no Cashflow para ganhos
recorrentes (`RecurringEarning` + `RecurringEarningHistory`), mas **sem** a regra de "1
lançamento por mês" — um aporte pode ser lançado em qualquer data, quantas vezes for
necessário (ex: comprar em datas diferentes no mesmo mês).

### `asset` (ativo, ex: MXRF11)

| coluna        | tipo              | observação                                   |
|---------------|-------------------|-----------------------------------------------|
| id            | bigint, PK        |                                                |
| user_id       | int               | id do usuário, vem da claim do JWT            |
| ticker        | varchar(10)       | ex: `MXRF11`                                  |
| name          | varchar(255) null | nome de exibição, opcional                    |
| asset_type    | varchar(20)       | `FII`, `ACAO`, `ETF`, `TESOURO`, `CDB`, etc.  |
| created_at    | datetime          |                                                |
| inactive_at   | datetime null     | soft delete — mesmo padrão do `InactiveAt`    |

Índice único filtrado: `(user_id, ticker) WHERE inactive_at IS NULL` — impede duplicar um
ticker ativo, mas permite recriar depois de inativado.

### `contribution` (aporte)

| coluna             | tipo         | observação                                          |
|--------------------|--------------|------------------------------------------------------|
| id                 | bigint, PK   |                                                        |
| asset_id           | bigint, FK   | referencia `asset.id`                                 |
| user_id            | int          | denormalizado (evita join na query de dashboard)     |
| quantity           | decimal      | quantidade de cotas/ações compradas                   |
| unit_price         | decimal      | preço unitário pago                                    |
| total_value        | decimal      | valor total do aporte (guardado, não recalculado)      |
| contribution_date  | date         | data do aporte                                         |
| notes              | varchar null | observação livre, opcional                             |
| created_at         | datetime     |                                                          |

Índices sugeridos: `(user_id, contribution_date)` e `(asset_id, contribution_date)`.

No mapeamento JPA, `asset_id` vira um `@ManyToOne` para a entidade `Asset`; `user_id`
permanece como coluna simples nas duas entidades (preenchida a partir da claim do JWT), sem
relacionamento com uma entidade de usuário — este serviço não tem tabela de usuários própria.

## 4. Contrato REST — o que o frontend mockado já assume

Convenção de erro sugerida: JSON simples de erro (`{"message": "..."}`) ou `ProblemDetail`
(RFC 7807) do Spring — não é necessário replicar o envelope `{data, notifications, ...}` do
.NET, já que este é um app novo, sem acoplamento com o frontend antigo.

### Assets

- `GET /api/assets?active=true` → `[{id, ticker, name, assetType, inactiveAt}]`
- `GET /api/assets/{id}` → um asset
- `POST /api/assets` `{ticker, name?, assetType}` → cria
- `PUT /api/assets/{id}` `{ticker, name?, assetType}` → atualiza
- `DELETE /api/assets/{id}` → soft delete (seta `inactiveAt`)

### Contributions

- `GET /api/assets/{assetId}/contributions` → histórico de um ativo
- `GET /api/contributions?assetId=&from=&to=` → consulta livre entre ativos
- `POST /api/contributions` `{assetId, quantity, unitPrice, date, notes?}` → cria (servidor
  calcula/valida `totalValue = quantity * unitPrice`)
- `PUT /api/contributions/{id}` → atualiza
- `DELETE /api/contributions/{id}` → remove (hard delete — não há necessidade de histórico de
  auditoria aqui como existe em `RecurringEarningHistory`)

### Dashboard

- `GET /api/dashboard/summary` → agregação para a tela principal:

```json
{
  "totalInvested": 2400.00,
  "currentMarketValue": 2610.50,
  "totalReturn": 210.50,
  "totalReturnPercent": 8.77,
  "byAsset": [
    {
      "assetId": 1,
      "ticker": "MXRF11",
      "quantity": 240,
      "invested": 2400.00,
      "currentValue": 2610.50,
      "returnPercent": 8.77
    }
  ],
  "monthlyEvolution": [
    { "yearMonth": "2026-06", "contributed": 200.00, "invested": 1800.00, "marketValue": 1850.00 },
    { "yearMonth": "2026-07", "contributed": 200.00, "invested": 2000.00, "marketValue": 2100.00 },
    { "yearMonth": "2026-08", "contributed": 200.00, "invested": 2200.00, "marketValue": 2380.00 },
    { "yearMonth": "2026-09", "contributed": 200.00, "invested": 2400.00, "marketValue": 2610.50 }
  ]
}
```

`contributed` é o valor **novo aportado só naquele mês** (soma dos `total_value` dos aportes
com `contribution_date` no mês); `invested` é o total investido **acumulado** até o fim do
mês. O frontend usa `contributed` na coluna "Aporte do mês" do Histórico Mensal e `invested`
no acumulado.

Esse é exatamente o shape que `web/src/services/dashboardService.js` (mockado) devolve — veja
esse arquivo como referência exata do contrato.

## 5. Integração de cotação (brapi.dev)

- Endpoint aproximado: `GET https://brapi.dev/api/quote/{tickers}` (tickers separados por
  vírgula).
- Token via env var `BRAPI_API_TOKEN`, base URL via `BRAPI_BASE_URL`.

⚠️ **Antes de implementar**: verifique o schema real de resposta da brapi.dev e se o plano
free ainda exige token — não assuma nada de memória, teste uma chamada real primeiro. A
documentação oficial deles é a fonte da verdade, não este documento.

- Cachear a cotação por um TTL curto (ex: 10-15 min, configurável via
  `QUOTE_CACHE_TTL_MINUTES`) para não estourar rate limit do plano gratuito — um cache em
  memória (Caffeine, por exemplo) resolve bem para uma aplicação de usuário único.

## 6. Sugestão de stack Java (não obrigatória)

A organização interna da API (arquitetura hexagonal / Ports & Adapters, camadas, pacotes,
estratégia de testes) está em [`arquitetura.md`](./arquitetura.md).

- **Spring Boot** (web + security).
- **Flyway** para migrations (`V20260910071003__create_asset.sql`, `V20260910071013__create_contribution.sql`,
  ...) — é o padrão do próprio Spring Boot. **O Flyway é o dono do schema**; o JPA nunca gera
  nem altera DDL.
- **Spring Data JPA / Hibernate** para a persistência:
  - Entidades `@Entity` mapeando `asset` e `contribution`, com `@ManyToOne` de
    `Contribution` para `Asset` (`fetch = LAZY`). `total_value` é uma coluna persistida
    normal — calculada/validada no serviço no momento de salvar, nunca uma fórmula derivada.
  - `spring.jpa.hibernate.ddl-auto=validate` (nunca `update`/`create`): na subida a aplicação
    só confere se as entidades batem com o schema que o Flyway aplicou.
  - Repositórios `interface ... extends JpaRepository<T, Long>` com query methods para o CRUD
    (`findByUserIdAndInactiveAtIsNull`, `findByAssetIdOrderByContributionDateDesc`, etc.).
  - Soft delete: não usar `@SQLDelete`; o `DELETE /api/assets/{id}` só seta `inactive_at` e
    todas as consultas de leitura filtram `inactiveAt IS NULL` (via query method ou
    `@SQLRestriction("inactive_at IS NULL")` na entidade `Asset`).
  - Dashboard (`/api/dashboard/summary`): fazer a agregação por ativo com uma `@Query` JPQL
    (ou nativa) devolvendo uma projeção/DTO, em vez de carregar todos os aportes na memória.
- **jjwt** (`io.jsonwebtoken`) para validar o JWT.
- Banco: **SQL Server** (mesma engine do Cashflow atual), banco próprio e separado — usar o
  dialect correspondente do Hibernate.

## 7. Infraestrutura de desenvolvimento local

- SQL Server via `docker-compose` (mesma imagem usada pelo cashflow atual,
  `mcr.microsoft.com/mssql/server:2025-latest`), em rede/porta diferentes das já usadas pelo
  `cashflow` (que usa a subnet `172.31.31.0/24`), para rodar os dois simultaneamente.
- Variáveis de ambiente esperadas pela API Java:

| variável                    | descrição                                              |
|------------------------------|---------------------------------------------------------|
| `DATABASE_URL`               | connection string JDBC do banco de investimentos         |
| `SECRET_JWT_KEY`              | **idêntica** à do app .NET — é a base da confiança do JWT |
| `CASHFLOW_API_BASE_URL`       | URL da API .NET (para o proxy de login)                  |
| `WEB_ORIGIN`                  | origem permitida em CORS (URL do frontend)                |
| `BRAPI_API_TOKEN`             | token da brapi.dev (se necessário)                        |
| `BRAPI_BASE_URL`               | base URL da brapi.dev                                      |
| `QUOTE_CACHE_TTL_MINUTES`     | TTL do cache de cotação (default sugerido: 10-15)          |

- O frontend (`web/`), em dev, deve apontar `/api` para a porta local da API Java via proxy do
  `webpack-dev-server` (mesmo padrão do `Site/webpack.config.js` do Cashflow atual, que faz
  proxy de `/api` para a API .NET local).

## 8. Ordem sugerida de implementação

1. Scaffold do projeto + Flyway baseline + Spring Data JPA com `ddl-auto=validate` +
   `/actuator/health` + `POST /api/auth/login` (proxy) + validação de JWT + um endpoint
   "whoami" de teste. Isso prova que a cadeia de confiança inteira funciona com um token real
   emitido pela API .NET, e que o mapeamento JPA valida contra o schema do Flyway, antes de
   qualquer lógica de domínio.
2. Entidade + repositório + CRUD de `asset`.
3. Entidade + repositório + CRUD de `contribution` (com o `@ManyToOne` para `asset`).
4. Integração com brapi.dev + cache.
5. Endpoint `/api/dashboard/summary`.
6. Trocar os services mockados do `web/` pelas chamadas HTTP reais.
