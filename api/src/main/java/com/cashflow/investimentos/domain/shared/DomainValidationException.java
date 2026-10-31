package com.cashflow.investimentos.domain.shared;

/**
 * Invariante de dominio violada. Lancada pelas entidades e objetos de valor; traduzida para
 * {@code 400/422 {"message": ...}} no adapter web (ver ../docs/arquitetura.md secao 5.1).
 */
public class DomainValidationException extends RuntimeException {

    public DomainValidationException(String message) {
        super(message);
    }
}
