package com.cashflow.investimentos.domain.asset;

import com.cashflow.investimentos.domain.shared.DomainValidationException;

import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Codigo de negociacao de um ativo (ex: MXRF11). Normaliza (maiusculas, sem espacos) e valida formato.
 */
public final class Ticker {

    private static final Pattern FORMAT = Pattern.compile("^[A-Z0-9]{1,10}$");

    private final String value;

    private Ticker(String value) {
        this.value = value;
    }

    public static Ticker of(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new DomainValidationException("Ticker e obrigatorio");
        }
        String normalized = raw.trim().replace(" ", "").toUpperCase(Locale.ROOT);
        if (!FORMAT.matcher(normalized).matches()) {
            throw new DomainValidationException("Ticker invalido: " + raw);
        }
        return new Ticker(normalized);
    }

    public String value() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Ticker other && value.equals(other.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
