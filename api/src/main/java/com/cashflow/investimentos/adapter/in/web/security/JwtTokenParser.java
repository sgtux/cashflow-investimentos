package com.cashflow.investimentos.adapter.in.web.security;

import com.cashflow.investimentos.config.CashflowProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Valida a assinatura e a expiracao dos JWTs emitidos pela API .NET do Cashflow e extrai o id
 * do usuario. Detalhes confirmados lendo {@code Api/Auth/*.cs} (ver ../docs/api-especificacao.md secao 2.2):
 *
 * <ul>
 *   <li>Algoritmo HMAC-SHA256.</li>
 *   <li>Chave = bytes ASCII crus da secret ({@code Encoding.ASCII.GetBytes}), NAO Base64.</li>
 *   <li>Sem validacao de issuer nem audience - so assinatura e expiracao.</li>
 *   <li>A claim de usuario e {@code ClaimTypes.Sid} do .NET, que vai para o JWT com a URI completa
 *       {@code http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid}. O valor e o id (inteiro como string).</li>
 * </ul>
 */
@Component
public class JwtTokenParser {

    /** Nome da claim de usuario no payload do JWT - a URI longa, o .NET nao abrevia aqui. */
    static final String SID_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid";

    private static final Logger log = LoggerFactory.getLogger(JwtTokenParser.class);

    private final SecretKey key;

    public JwtTokenParser(CashflowProperties properties) {
        String secret = properties.jwt().secret();
        if (secret == null || secret.getBytes(StandardCharsets.US_ASCII).length < 32) {
            // HS256 exige chave >= 256 bits. A secret compartilhada com o .NET precisa ter >= 32 chars ASCII.
            throw new IllegalStateException("SECRET_JWT_KEY ausente ou com menos de 32 caracteres ASCII");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.US_ASCII));
    }

    /** @return o id do usuario se o token for valido; {@link Optional#empty()} caso contrario. */
    public Optional<Long> extractUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            String sid = claims.get(SID_CLAIM, String.class);
            return sid == null ? Optional.empty() : Optional.of(Long.valueOf(sid.trim()));
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT invalido: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
