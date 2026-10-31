package com.cashflow.investimentos.domain.contribution;

import com.cashflow.investimentos.domain.shared.DomainValidationException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Valor monetario em BRL. Sempre com 2 casas, arredondamento HALF_UP.
 */
public final class Money {

    public static final Money ZERO = new Money(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));

    private final BigDecimal amount;

    private Money(BigDecimal amount) {
        this.amount = amount;
    }

    public static Money of(BigDecimal raw) {
        if (raw == null) {
            throw new DomainValidationException("Valor monetario e obrigatorio");
        }
        return new Money(raw.setScale(2, RoundingMode.HALF_UP));
    }

    /** Preco unitario x quantidade -> valor total do aporte. */
    public Money times(Quantity quantity) {
        return Money.of(amount.multiply(quantity.value()));
    }

    public Money plus(Money other) {
        return Money.of(amount.add(other.amount));
    }

    public boolean isPositive() {
        return amount.signum() > 0;
    }

    public boolean isEqualTo(Money other) {
        return amount.compareTo(other.amount) == 0;
    }

    public BigDecimal amount() {
        return amount;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Money other && amount.compareTo(other.amount) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount);
    }

    @Override
    public String toString() {
        return amount.toPlainString();
    }
}
