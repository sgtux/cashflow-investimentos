-- Ativo (ex: MXRF11). Ver ../docs/api-especificacao.md secao 3.
-- Nomenclatura no padrao do Cashflow .NET (SQL Server): tabela/colunas em PascalCase singular,
-- Id INT IDENTITY, CreatedAt/InactiveAt como DATETIME, UserId como coluna solta (sem FK, este
-- servico nao tem tabela de usuario propria).
CREATE TABLE ${flyway:defaultSchema}.Asset (
    Id          INT           IDENTITY(1,1) NOT NULL,
    UserId      INT           NOT NULL,               -- id do usuario, vem da claim do JWT
    Ticker      VARCHAR(10)   NOT NULL,               -- ex: MXRF11
    Name        VARCHAR(255)  NULL,                   -- nome de exibicao, opcional
    AssetType   VARCHAR(20)   NOT NULL,               -- FII, ACAO, ETF, TESOURO, CDB, ...
    CreatedAt   DATETIME      NOT NULL CONSTRAINT DF_Asset_CreatedAt DEFAULT (GETUTCDATE()),
    InactiveAt  DATETIME      NULL,                   -- soft delete (mesmo padrao do InactiveAt do Cashflow)
    CONSTRAINT PK_Asset PRIMARY KEY (Id)
);

-- Impede duplicar um ticker ativo, mas permite recriar depois de inativado.
CREATE UNIQUE INDEX UX_Asset_UserId_Ticker_Active
    ON ${flyway:defaultSchema}.Asset (UserId, Ticker)
    WHERE InactiveAt IS NULL;

CREATE INDEX IX_Asset_UserId ON ${flyway:defaultSchema}.Asset (UserId);
