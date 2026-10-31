package com.cashflow.investimentos.application.port.out;

/** A API .NET recusou as credenciais (401). Mapeada para {@code 401 {"message":"Credenciais invalidas"}}. */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Credenciais inválidas");
    }
}
