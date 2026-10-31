# cashflow-investimentos

App para acompanhar aportes mensais em ativos (ex: R$200/mês em MXRF11) com um dashboard de
totais investidos, valor de mercado atual e rentabilidade. É uma aplicação irmã do
[cashflow](../cashflow), reaproveitando a autenticação de lá em vez de ter login próprio.

## Estado atual deste repositório

- **`web/`** — frontend React **mockado**: funciona sozinho, sem nenhuma API por trás. Os
  dados (usuário, ativos, aportes, cotações) são simulados em `web/src/mocks/fixtures.js` e
  persistidos no `localStorage` do navegador (`web/src/services/mockDb.js`), então sobrevivem
  a um refresh da página mas são só locais/de demonstração.
- **`docs/api-especificacao.md`** — especificação completa do que precisa ser construído na
  API (a ser feita em Java, por conta própria, como exercício): contrato REST, modelo de
  dados, estratégia de autenticação (proxy de login para a API .NET do Cashflow existente),
  integração de cotação via brapi.dev.
- **`api/`** — API Java (Spring Boot, arquitetura hexagonal). No momento é só o **scaffold**
  (passo 1 do roteiro em `docs/api-especificacao.md` §8): Flyway + JPA com `ddl-auto=validate`,
  proxy de login `POST /api/auth/login`, validação do JWT do Cashflow e um endpoint `whoami`
  de teste. CRUD de ativos/aportes, cotação e dashboard ainda não existem. Ver `api/README.md`.

Quando a API existir, basta trocar a implementação interna dos arquivos em
`web/src/services/*.js` por chamadas HTTP reais — as assinaturas de função e os formatos de
dado já seguem exatamente o contrato documentado.

## Rodando o frontend mockado

```bash
cd web
pnpm install
pnpm start
```

Abre em `http://localhost:3001`. Login aceita qualquer email/senha (é mock).
