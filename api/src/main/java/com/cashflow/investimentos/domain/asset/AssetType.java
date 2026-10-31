package com.cashflow.investimentos.domain.asset;

/**
 * Tipo de ativo. Concentra a regra de negocio de fracionamento de quantidade.
 * Essa mesma regra esta espelhada no frontend (EditContributionModal); esta e a copia autoritativa.
 */
public enum AssetType {
    FII,
    ACAO,
    ETF,
    TESOURO,
    CDB;

    /** {@code false} para FII/ACAO/ETF (nao existe fracao de cota/acao em bolsa), {@code true} para renda fixa. */
    public boolean allowsFractionalQuantity() {
        return this == TESOURO || this == CDB;
    }
}
