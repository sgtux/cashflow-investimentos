package com.cashflow.investimentos.domain.contribution;

import com.cashflow.investimentos.domain.shared.DomainValidationException;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Quantidade de cotas/acoes de um aporte. Sempre positiva; inteira quando o tipo de ativo
 * nao permite fracao (ver {@link com.cashflow.investimentos.domain.asset.AssetType}).
 */
public final class Quantity {

    private final BigDecimal value;

    private Quantity(BigDecimal value) {
        this.value = value;
    }

    public static Quantity of(BigDecimal raw, boolean allowsFractional) {
        if (raw == null || raw.signum() <= 0) {
            throw new DomainValidationException("Quantidade deve ser positiva");
        }
        if (!allowsFractional && raw.stripTrailingZeros().scale() > 0) {
            throw new DomainValidationException("Quantidade deve ser inteira para este tipo de ativo");
        }
        return new Quantity(raw);
    }

    public BigDecimal value() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Quantity other && value.compareTo(other.value) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(value.stripTrailingZeros());
    }

    @Override
    public String toString() {
        return value.toPlainString();
    }
}
