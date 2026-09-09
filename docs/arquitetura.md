# cashflow-investimentos — arquitetura da API (hexagonal)

Este documento descreve **como** a API Java é organizada por dentro. O **o quê** (contrato
REST, modelo de dados, validação de JWT, integração de cotação) está em
[`api-especificacao.md`](./api-especificacao.md) e é a fonte da verdade do comportamento
externo — aqui só se define a estrutura interna que entrega aquele contrato.

A escolha é **arquitetura hexagonal** (Ports & Adapters), com um domínio isolado no centro e
toda tecnologia (Spring, JPA/Hibernate, HTTP, brapi.dev) empurrada para as bordas.

## 1. Princípios

1. **Regra de dependência**: o código-fonte só aponta para dentro. `adapter → application →
   domain`. O domínio não importa nada de Spring, `jakarta.persistence`, web ou de qualquer
   adapter.
2. **Portas são interfaces do lado de dentro**; adapters são implementações do lado de fora.
   - Porta de **entrada** (driving): um caso de uso que o mundo externo invoca.
   - Porta de **saída** (driven): algo que a aplicação precisa e que o mundo externo fornece
     (persistência, cotação, relógio).
3. **O domínio é ignorante de infraestrutura**: nada de anotações de ORM na entidade de
   domínio, nada de DTO de request entrando no domínio.
4. **Isolamento por dependência, não por reflexão**: se o `domain` compilasse sem o
   `spring-context` e sem o `hibernate-core` no classpath, a fronteira está correta.
5. Projeto de estudo e usuário único — onde a pureza hexagonal custaria caro sem benefício
   real, a seção 9 registra o atalho pragmático adotado.

## 2. As camadas e a regra de dependência

```
        ┌─────────────────────────────────────────────────────────┐
        │                     ADAPTERS (in)                       │
        │  REST controllers · JwtAuthenticationFilter · Auth proxy │
        └───────────────┬─────────────────────────────────────────┘
                        │ chamam portas de entrada (use cases)
        ┌───────────────▼─────────────────────────────────────────┐
        │                     APPLICATION                         │
        │  port.in (interfaces)      services (orquestração)       │
        │  port.out (interfaces) ────────────────────────────┐     │
        └───────────────┬───────────────────────────────────┼─────┘
                        │ usa o domínio                     │
        ┌───────────────▼──────────────────┐                │
        │              DOMAIN              │                │
        │  Asset · Contribution · VOs ·   │                │
        │  PortfolioCalculator            │                │
        │  (sem Spring, sem JPA, sem web)  │                │
        └─────────────────────────────────┘                │
                        ▲                                   │
                        │ implementam port.out              │
        ┌───────────────┴───────────────────────────────────▼─────┐
        │                     ADAPTERS (out)                      │
        │  JPA persistence · brapi.dev client + cache · clock      │
        └─────────────────────────────────────────────────────────┘
```

As setas de **dependência de código** apontam sempre para dentro; as setas de **fluxo de
chamada em runtime** entram por um adapter in, atravessam a aplicação e o domínio, e saem por
um adapter out.

## 3. Domínio (`domain`)

Java puro. Entidades, objetos de valor e serviços de domínio. Sem framework.

### Entidades e agregados

- **`Asset`** — raiz de agregado. Identidade `id`, dono `userId`, `Ticker`, `name` opcional,
  `AssetType`, `inactiveAt`. Comportamento: `rename`, `changeType`, `deactivate()` (soft
  delete = setar `inactiveAt`), `isActive()`.
- **`Contribution`** — aporte de um ativo. Referencia `assetId` (dentro do mesmo bounded
  context, referência por id, não por objeto). Guarda `Quantity`, `unitPrice` (`Money`),
  `totalValue` (`Money`), `contributionDate`, `notes`.

### Objetos de valor

- **`Ticker`** — normaliza (maiúsculas, sem espaços) e valida formato.
- **`AssetType`** — enum `FII, ACAO, ETF, TESOURO, CDB`. Concentra regra de negócio:
  `allowsFractionalQuantity()` → `false` para `FII/ACAO/ETF` (não existe fração de cota/ação
  em bolsa), `true` para `TESOURO/CDB`. **Essa mesma regra está espelhada no frontend**
  (`EditContributionModal`); o domínio é a cópia autoritativa.
- **`Quantity`**, **`Money`** — encapsulam positividade e arredondamento (`Money` a 2 casas,
  `HALF_UP`).

### Invariantes (garantidas no construtor/fábrica da entidade)

- `Contribution`: `quantity > 0`, `unitPrice > 0`, `totalValue == quantity * unitPrice`
  (calculado no domínio, não recebido de fora), e `quantity` inteira quando
  `assetType.allowsFractionalQuantity()` é `false`.
- `Asset`: `ticker` não vazio, `assetType` não nulo.
- A **unicidade `(userId, ticker)` entre ativos ativos** depende de consulta ao repositório,
  então é verificada no serviço de aplicação (seção 4), não na entidade.

### Serviço de domínio

- **`PortfolioCalculator`** — função pura: recebe a lista de `Asset` ativos, suas
  `Contribution` e um mapa `ticker → preço atual`, devolve um `PortfolioSummary`
  (`totalInvested`, `currentMarketValue`, `totalReturn`, `%`, `List<AssetPosition>`,
  `List<MonthlyPoint>` com `contributed`/`invested`/`marketValue`). É aqui que vive toda a
  aritmética que hoje o mock faz em `web/src/services/dashboardService.js`.

## 4. Aplicação (`application`)

Orquestra: recebe um comando de uma porta de entrada, carrega/salva via portas de saída,
invoca o domínio, devolve um resultado. **Sem regra de negócio própria** além de coordenação
e autorização (o aporte/ativo pertence ao `userId` do token?).

### Portas de entrada — `application/port/in`

Uma interface por caso de uso, com um _command_/_query_ de entrada e um retorno simples
(record da aplicação, nunca entidade de domínio crua para fora, nunca DTO de web para
dentro):

| Porta                        | Corresponde a (ver `api-especificacao.md` §4) |
|------------------------------|-----------------------------------------------|
| `ListAssetsQuery`            | `GET /api/assets?active=`                      |
| `RegisterAssetUseCase`       | `POST /api/assets`                             |
| `UpdateAssetUseCase`         | `PUT /api/assets/{id}`                         |
| `DeactivateAssetUseCase`     | `DELETE /api/assets/{id}` (soft delete)        |
| `ListContributionsQuery`     | `GET /api/contributions`, `GET /api/assets/{id}/contributions` |
| `RegisterContributionUseCase`| `POST /api/contributions`                      |
| `UpdateContributionUseCase`  | `PUT /api/contributions/{id}`                  |
| `DeleteContributionUseCase`  | `DELETE /api/contributions/{id}`              |
| `GetDashboardSummaryQuery`   | `GET /api/dashboard/summary`                   |

### Portas de saída — `application/port/out`

| Porta                        | Implementada por (adapter out)                |
|------------------------------|-----------------------------------------------|
| `LoadAssetPort` / `SaveAssetPort`         | `persistence` (JPA)              |
| `LoadContributionPort` / `SaveContributionPort` | `persistence` (JPA)        |
| `QuotePort` (`Map<Ticker,Money> quotes(Collection<Ticker>)`) | `quote` (brapi.dev + cache) |
| `ClockPort` (`LocalDate today()`)         | `time` (`SystemClockAdapter`)   |

Portas de repositório são divididas por intenção (`Load*`/`Save*`) em vez de um `*Repository`
gordo — cada serviço declara só o que usa, o que também facilita o mock nos testes.

### Serviços (implementações) — `application/service`

`RegisterAssetService`, `RegisterContributionService`, `GetDashboardSummaryService`, etc.
Injeção por construtor das portas de saída. Exemplo do fluxo do dashboard:

```
GetDashboardSummaryService.handle(userId):
  assets        = loadAssetPort.activeByUser(userId)
  contributions = loadContributionPort.byUser(userId)
  quotes        = quotePort.quotes(tickers de assets)
  summary       = PortfolioCalculator.calculate(assets, contributions, quotes, clock.today())
  return SummaryResponse.from(summary)
```

## 5. Adaptadores (`adapter`)

### 5.1 Entrada — `adapter/in/web`

- **Controllers** (`AssetController`, `ContributionController`, `DashboardController`):
  Spring MVC. Convertem JSON ↔ _command_/_query_ da porta de entrada, chamam a porta, mapeiam
  o retorno para o DTO de resposta. Os nomes de campo do contrato (`assetType`,
  `contributionDate`, `marketValue`, …) vivem **aqui**, nos DTOs de web — não no domínio.
- **`JwtAuthenticationFilter`**: valida o Bearer token com a chave ASCII (detalhes em
  `api-especificacao.md` §2.2), extrai o `userId` da claim de URI longa e o coloca no
  `SecurityContext`. Os controllers repassam esse `userId` para dentro dos comandos.
- **`AuthProxyController`** (`POST /api/auth/login`): repassa credenciais para a API .NET via
  a porta de saída `CashflowAuthPort` e devolve o token recebido. É pura integração — **não
  toca o domínio**.
- Tratamento de erro: `@RestControllerAdvice` traduz exceções de domínio/aplicação
  (`DomainValidationException`, `AssetNotFoundException`, `DuplicateTickerException`) para
  `{ "message": "..." }` / `ProblemDetail` com o status certo.

### 5.2 Saída — `adapter/out`

- **`persistence`** (Spring Data JPA / Hibernate):
  - `AssetJpaEntity` / `ContributionJpaEntity` — classes **separadas** do domínio, com as
    anotações `@Entity`, `@ManyToOne`, `@Column`. `ContributionJpaEntity` tem `@ManyToOne`
    para `AssetJpaEntity` (`fetch = LAZY`).
  - `AssetSpringDataRepository extends JpaRepository<AssetJpaEntity, Long>` — query methods
    (`findByUserIdAndInactiveAtIsNull`, …).
  - `AssetPersistenceAdapter implements LoadAssetPort, SaveAssetPort` — faz o mapeamento
    entidade-JPA ↔ entidade-de-domínio (mapper manual dedicado; `MapStruct` é opcional).
  - `spring.jpa.hibernate.ddl-auto=validate`: **o Flyway é o dono do schema**, o JPA só
    valida o mapeamento na subida.
  - Soft delete: sem `@SQLDelete`; o adapter só persiste `inactiveAt` e as leituras filtram
    `inactive_at IS NULL`.
- **`quote`**: `BrapiClient` (`RestClient`/`WebClient` para `brapi.dev`) + `BrapiQuoteAdapter
  implements QuotePort`, com cache Caffeine (TTL `QUOTE_CACHE_TTL_MINUTES`). Se a brapi cair,
  o adapter decide o fallback (última cotação em cache / erro) — o domínio nunca sabe que
  brapi existe.
- **`time`**: `SystemClockAdapter implements ClockPort`. Torna `PortfolioCalculator`
  determinístico nos testes.
- **`auth`**: `CashflowAuthHttpAdapter implements CashflowAuthPort` — o cliente HTTP
  servidor-a-servidor para `POST /api/token` da API .NET.

### 5.3 Wiring — `config`

`@Configuration` do Spring que amarra cada porta ao seu adapter (ou `@Component` nos
adapters + `@Service` nos serviços de aplicação — ver seção 9). Injeção sempre por
construtor.

## 6. Estrutura de pacotes

```
com.cashflow.investimentos
├── domain
│   ├── asset/           Asset, AssetType, Ticker
│   ├── contribution/    Contribution, Quantity, Money
│   ├── portfolio/       PortfolioSummary, AssetPosition, MonthlyPoint, PortfolioCalculator
│   └── shared/          DomainValidationException
├── application
│   ├── port
│   │   ├── in/          *UseCase, *Query  (+ commands/queries como records)
│   │   └── out/         LoadAssetPort, SaveAssetPort, LoadContributionPort,
│   │                    SaveContributionPort, QuotePort, ClockPort, CashflowAuthPort
│   └── service/         RegisterAssetService, GetDashboardSummaryService, ...
├── adapter
│   ├── in
│   │   └── web/         controllers, dto/, mapper/, security/JwtAuthenticationFilter,
│   │                    AuthProxyController, ApiExceptionHandler
│   └── out
│       ├── persistence/ *JpaEntity, *SpringDataRepository, *PersistenceAdapter, mapper/
│       ├── quote/       BrapiClient, BrapiQuoteAdapter
│       ├── auth/        CashflowAuthHttpAdapter
│       └── time/        SystemClockAdapter
└── config/              beans de wiring, CORS, SecurityFilterChain
```

Alternativa aceitável (estilo DDD): mover as portas de repositório de `application/port/out`
para dentro de `domain/asset` e `domain/contribution`. A regra de dependência continua
válida (a interface fica no domínio, a implementação no adapter). Este documento usa
`port/out` por manter todas as portas no mesmo lugar.

## 7. Fluxo de uma requisição — registrar um aporte

```
POST /api/contributions {assetId, quantity, unitPrice, date, notes}
  │
  ▼  adapter/in/web
ContributionController
  - JwtAuthenticationFilter já colocou userId no contexto
  - valida o JSON, monta RegisterContributionCommand(userId, assetId, quantity, unitPrice, date, notes)
  │
  ▼  application/port/in
RegisterContributionUseCase.register(command)
  │
  ▼  application/service
RegisterContributionService
  - asset = loadAssetPort.byIdAndUser(assetId, userId)  → 404 se não existe / não é do user
  - Contribution.create(asset.type(), quantity, unitPrice, date, notes)
        └─ domínio calcula totalValue e aplica a invariante de fração
  - saveContributionPort.save(contribution)
  │
  ▼  adapter/out/persistence
ContributionPersistenceAdapter
  - mapeia domínio → ContributionJpaEntity
  - springDataRepository.save(...)
  │
  ▼
Controller mapeia o retorno → 201 + ContributionResponse
```

Para `GET /api/dashboard/summary`, o mesmo caminho, terminando em `PortfolioCalculator` +
`QuotePort` (ver seção 4).

## 8. Testes por camada

| Alvo                         | Como                                                            |
|------------------------------|----------------------------------------------------------------|
| `domain` (entidades, VOs, `PortfolioCalculator`) | JUnit puro, sem Spring. É onde fica a maior parte dos testes. |
| `application/service`        | JUnit + Mockito nas portas de saída.                          |
| `adapter/in/web`             | `@WebMvcTest` + `MockMvc`, use cases mockados.                |
| `adapter/out/persistence`    | `@DataJpaTest` + Testcontainers (SQL Server).                 |
| `adapter/out/quote`          | `MockWebServer`/WireMock simulando a brapi.dev.               |
| Fronteiras                   | **ArchUnit**: `domain` não depende de `org.springframework..`, `jakarta.persistence..`, `..adapter..`; `application` não depende de `..adapter..`. |
| Contrato ponta a ponta       | `@SpringBootTest` cobrindo os exemplos de `api-especificacao.md` §4. |

## 9. Decisões e trade-offs

- **Entidade de domínio ≠ entidade JPA (classes separadas).** Custa um mapper por agregado,
  mas é o que mantém `jakarta.persistence` fora do domínio. Uma única classe anotada seria
  mais curta e é um atalho comum — aqui é rejeitado de propósito, porque quebra a fronteira.
- **`@Service`/`@Component` nos serviços de aplicação.** Concessão pragmática: são anotações
  do Spring em código de aplicação. A alternativa 100% pura (POJOs + `@Bean` em `config`) foi
  considerada exagero para o tamanho do projeto. O **domínio**, esse sim, fica sem nenhuma
  anotação.
- **Dashboard: cálculo no domínio, não no banco.** `api-especificacao.md` §6 sugere agregar
  com JPQL para não carregar todos os aportes na memória. Para um usuário só, com dezenas de
  aportes, `PortfolioCalculator` no domínio é mais simples, testável e coerente com a
  arquitetura. Se o volume crescer, a saída é uma porta de leitura dedicada
  (`LoadPortfolioProjectionPort`) cujo adapter roda a agregação em SQL — um lado de leitura
  estilo CQRS, atrás de uma porta, sem sujar o domínio.
- **Referência entre agregados por id.** `Contribution` guarda `assetId` (long), não um
  objeto `Asset`. No banco há FK e `@ManyToOne` na entidade JPA; no domínio, agregados se
  referenciam por identidade.
- **Proxy de login isolado.** `AuthProxyController` + `CashflowAuthPort` nunca encostam no
  domínio — é integração, não regra de negócio.
- **Módulo único Maven** com pacotes como fronteira, validada por ArchUnit. Multi-módulo
  (`domain`, `application`, `bootstrap`) daria isolamento em tempo de compilação, mas é peso
  desnecessário agora.
