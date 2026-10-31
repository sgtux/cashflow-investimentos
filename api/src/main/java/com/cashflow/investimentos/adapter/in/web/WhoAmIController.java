package com.cashflow.investimentos.adapter.in.web;

import com.cashflow.investimentos.adapter.in.web.dto.WhoAmIResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint de teste: prova que a validacao do JWT emitido pela API .NET funciona ponta a ponta.
 * Passo 1 da ordem de implementacao (ver ../docs/api-especificacao.md secao 8).
 */
@RestController
@RequestMapping("/api/auth")
public class WhoAmIController {

    @GetMapping("/whoami")
    public WhoAmIResponse whoami(@AuthenticationPrincipal Long userId) {
        return new WhoAmIResponse(userId);
    }
}
