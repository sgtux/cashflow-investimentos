# cashflow-investimentos — API (Java / Spring Boot)

API de aportes em investimentos, em **arquitetura hexagonal** (Ports & Adapters).

- **O quê** (contrato REST, modelo de dados, JWT, cotação): [`../docs/api-especificacao.md`](../docs/api-especificacao.md)
- **Como** (camadas, pacotes, testes): [`../docs/arquitetura.md`](../docs/arquitetura.md)

## Estado atual — passo 1 do roteiro

Este é o **scaffold** (passo 1 de `api-especificacao.md` §8). Já entrega:

| Item | Onde |
|------|------|
| Projeto Spring Boot 3.4 / Java 21 | [`pom.xml`](pom.xml) |
| Flyway como dono do schema (`asset`, `contribution`) | [`src/main/resources/db/migration/`](src/main/resources/db/migration) |
| Spring Data JPA com `ddl-auto=validate` | [`application.yml`](src/main/resources/application.yml) |
| `GET /actuator/health` | starter actuator |
| `POST /api/auth/login` — proxy para a API .NET | [`AuthProxyController`](src/main/java/com/cashflow/investimentos/adapter/in/web/AuthProxyController.java) + [`CashflowAuthHttpAdapter`](src/main/java/com/cashflow/investimentos/adapter/out/auth/CashflowAuthHttpAdapter.java) |
| Validação do JWT do Cashflow (HMAC-SHA256, chave ASCII crua, claim `.../sid` de URI longa) | [`JwtTokenParser`](src/main/java/com/cashflow/investimentos/adapter/in/web/security/JwtTokenParser.java) + [`JwtAuthenticationFilter`](src/main/java/com/cashflow/investimentos/adapter/in/web/security/JwtAuthenticationFilter.java) |
| CORS para a origem do frontend | [`SecurityConfig`](src/main/java/com/cashflow/investimentos/config/SecurityConfig.java) |
| `GET /api/auth/whoami` — endpoint de teste da cadeia de confiança | [`WhoAmIController`](src/main/java/com/cashflow/investimentos/adapter/in/web/WhoAmIController.java) |
| Objetos de valor do domínio (`Ticker`, `Money`, `Quantity`, `AssetType`) | [`domain/`](src/main/java/com/cashflow/investimentos/domain) |
| Fronteiras da arquitetura verificadas por ArchUnit | [`ArchitectureTest`](src/test/java/com/cashflow/investimentos/arch/ArchitectureTest.java) |

**Ainda não** (passos 2–6): entidades/CRUD de `asset` e `contribution`, integração brapi.dev + cache,
`GET /api/dashboard/summary`, troca dos services mockados do `web/`.

## Pré-requisitos

- JDK 21
- Maven 3.9+ (não há wrapper commitado ainda — rode `mvn -N wrapper:wrapper` se quiser gerar `./mvnw`)
- Docker (para o SQL Server local)

## Subir o banco

```bash
cd api
cp .env.example .env          # ajuste SECRET_JWT_KEY e CASHFLOW_API_BASE_URL
docker compose --env-file .env up -d

# a imagem do SQL Server não cria o database sozinha:
docker exec -it cashflow-investimentos-db /opt/mssql-tools18/bin/sqlcmd \
  -C -S localhost -U sa -P "$DATABASE_PASSWORD" \
  -Q "IF DB_ID('cashflow_investimentos') IS NULL CREATE DATABASE cashflow_investimentos"
```

## Rodar

```bash
cd api
mvn spring-boot:run     # lê o .env via spring.config.import
```

Na subida: Flyway aplica `V1`/`V2`, o Hibernate valida o mapeamento contra o schema, a API sobe em `http://localhost:8080`.

### Provar a cadeia de confiança (passo 1)

```bash
# 1. login via proxy -> devolve o token cru emitido pela API .NET
curl -s localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"voce@exemplo.com","password":"suasenha"}'
# -> {"id":42,"email":"voce@exemplo.com","token":"<jwt>"}

# 2. usar o token numa rota protegida
curl -s localhost:8080/api/auth/whoami -H "Authorization: Bearer <jwt>"
# -> {"userId":42}
```

## Testes

```bash
mvn test
```

- `domain/` — JUnit puro (VOs).
- `arch/` — ArchUnit: `domain` sem Spring/JPA, `application` sem adapters.

## Notas de configuração

- **`SECRET_JWT_KEY` idêntica à do app .NET** — é a base da confiança entre os serviços.
  jjwt exige ≥ 32 caracteres ASCII para HS256; a app não sobe se for menor.
- `POST /api/token` da API .NET: o schema de resposta ainda **não foi confirmado**. O adapter
  procura o token em `token`/`accessToken`/`access_token`/`jwt`, na raiz ou dentro de `data`
  (ver `TODO(confirmar)` em `CashflowAuthHttpAdapter`). O `id` do usuário sai da claim do próprio
  token, não da resposta.
- `DATABASE_URL` é uma connection string **JDBC** (`jdbc:sqlserver://...`).
