package com.cashflow.investimentos.adapter.in.web;

import com.cashflow.investimentos.adapter.in.web.dto.LoginRequest;
import com.cashflow.investimentos.adapter.in.web.dto.LoginResponse;
import com.cashflow.investimentos.adapter.in.web.security.JwtTokenParser;
import com.cashflow.investimentos.application.port.out.CashflowAuthOutputPort;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code POST /api/auth/login}: proxy de login para a API .NET do Cashflow.
 * Pura integracao - nao toca o dominio (ver ../docs/arquitetura.md secao 5.1).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthProxyController {

    private final CashflowAuthOutputPort cashflowAuthPort;
    private final JwtTokenParser jwtTokenParser;

    public AuthProxyController(CashflowAuthOutputPort cashflowAuthPort, JwtTokenParser jwtTokenParser) {
        this.cashflowAuthPort = cashflowAuthPort;
        this.jwtTokenParser = jwtTokenParser;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        String token = cashflowAuthPort.requestToken(request.email(), request.password());
        long userId = jwtTokenParser.extractUserId(token)
                .orElseThrow(() -> new IllegalStateException(
                        "Token recebido da API .NET nao contem a claim de usuario esperada"));
        return new LoginResponse(userId, request.email(), token);
    }
}
