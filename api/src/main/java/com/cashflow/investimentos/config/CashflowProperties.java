package com.cashflow.investimentos.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuracao propria da aplicacao (prefixo {@code cashflow.*} em application.yml).
 * Ver ../docs/api-especificacao.md secao 7.
 */
@ConfigurationProperties(prefix = "cashflow")
public record CashflowProperties(
        Api api,
        Jwt jwt,
        Web web,
        Brapi brapi,
        Quote quote
) {

    /** API .NET do Cashflow, alvo do proxy de login. */
    public record Api(String baseUrl) {
    }

    /** Secret HMAC-SHA256; DEVE ser identica a do app .NET. */
    public record Jwt(String secret) {
    }

    /** Origem do frontend permitida em CORS. */
    public record Web(String origin) {
    }

    /** Integracao de cotacao (brapi.dev). Usada a partir do passo 4 da implementacao. */
    public record Brapi(String baseUrl, String token) {
    }

    /** TTL do cache de cotacao, em minutos. */
    public record Quote(int cacheTtlMinutes) {
    }
}
