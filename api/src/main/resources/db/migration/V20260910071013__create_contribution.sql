-- Aporte de um ativo. Sem a regra de "1 lancamento por mes": pode haver varios no mesmo mes.
-- Ver ../docs/api-especificacao.md secao 3. Nomenclatura no padrao do Cashflow .NET (SQL Server):
-- PascalCase singular, Id INT IDENTITY, CreatedAt como DATETIME, FK nomeada FK_<Tabela>_<TabelaRef>.
CREATE TABLE ${flyway:defaultSchema}.Contribution (
    Id                INT            IDENTITY(1,1) NOT NULL,
    AssetId           INT            NOT NULL,           -- FK -> Asset.Id (@ManyToOne no JPA)
    UserId            INT            NOT NULL,           -- denormalizado (evita join na query do dashboard)
    Quantity          DECIMAL(18, 6) NOT NULL,           -- cotas/acoes compradas (fracao so p/ TESOURO/CDB)
    UnitPrice         DECIMAL(18, 2) NOT NULL,           -- preco unitario pago
    TotalValue        DECIMAL(18, 2) NOT NULL,           -- guardado, nao recalculado (= Quantity * UnitPrice)
    ContributionDate  DATE           NOT NULL,           -- data do aporte
    Notes             VARCHAR(500)   NULL,               -- observacao livre, opcional
    CreatedAt         DATETIME       NOT NULL CONSTRAINT DF_Contribution_CreatedAt DEFAULT (GETUTCDATE()),
    CONSTRAINT PK_Contribution PRIMARY KEY (Id),
    CONSTRAINT FK_Contribution_Asset FOREIGN KEY (AssetId) REFERENCES ${flyway:defaultSchema}.Asset (Id)
);

CREATE INDEX IX_Contribution_UserId_ContributionDate  ON ${flyway:defaultSchema}.Contribution (UserId, ContributionDate);
CREATE INDEX IX_Contribution_AssetId_ContributionDate ON ${flyway:defaultSchema}.Contribution (AssetId, ContributionDate);
