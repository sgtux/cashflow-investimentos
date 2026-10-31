package com.cashflow.investimentos.adapter.out.auth;

import com.cashflow.investimentos.application.port.out.CashflowAuthOutputPort;
import com.cashflow.investimentos.application.port.out.CashflowAuthUnavailableException;
import com.cashflow.investimentos.application.port.out.InvalidCredentialsException;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

/**
 * Implementa o proxy de login: repassa {email, password} para {@code POST {CASHFLOW_API_BASE_URL}/api/token}
 * e devolve o JWT recebido, sem reassinar. Ver ../docs/api-especificacao.md secao 2.1.
 */
@Component
public class CashflowAuthHttpAdapter implements CashflowAuthOutputPort {

    /** Nomes de campo candidatos para o token na resposta do .NET, na raiz ou dentro de "data". */
    private static final List<String> TOKEN_FIELDS = List.of("token", "accessToken", "access_token", "jwt");

    private final RestClient restClient;

    public CashflowAuthHttpAdapter(RestClient cashflowRestClient) {
        this.restClient = cashflowRestClient;
    }

    @Override
    public String requestToken(String email, String password) {
        JsonNode body;
        try {
            body = restClient.post()
                    .uri("/api/token")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("email", email, "password", password))
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                        throw new InvalidCredentialsException();
                    })
                    .body(JsonNode.class);
        } catch (InvalidCredentialsException e) {
            throw e;
        } catch (RestClientException e) {
            throw new CashflowAuthUnavailableException("Falha na chamada a " + "/api/token", e);
        }

        String token = extractToken(body);
        if (token == null || token.isBlank()) {
            // TODO(confirmar): validar o schema real de POST /api/token da API .NET e ajustar TOKEN_FIELDS.
            throw new CashflowAuthUnavailableException(
                    "Resposta da API .NET sem campo de token reconhecido", null);
        }
        return token;
    }

    private static String extractToken(JsonNode body) {
        if (body == null) {
            return null;
        }
        String direct = readToken(body);
        if (direct != null) {
            return direct;
        }
        return body.has("data") ? readToken(body.get("data")) : null;
    }

    private static String readToken(JsonNode node) {
        if (node == null || !node.isObject()) {
            return null;
        }
        for (String field : TOKEN_FIELDS) {
            JsonNode value = node.get(field);
            if (value != null && value.isTextual()) {
                return value.asText();
            }
        }
        return null;
    }
}
