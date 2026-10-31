package com.cashflow.investimentos.application.port.out;

/** A API .NET nao respondeu ou devolveu um erro inesperado. Mapeada para {@code 502}. */
public class CashflowAuthUnavailableException extends RuntimeException {

    public CashflowAuthUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
