package com.cashflow.investimentos.adapter.in.web.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Le {@code Authorization: Bearer <token>}, valida via {@link JwtTokenParser} e, em caso de sucesso,
 * coloca o {@code userId} (Long) como principal no {@link SecurityContextHolder}. Requests sem token
 * valido para rotas protegidas sao recusados depois, pela cadeia de autorizacao do Spring Security.
 *
 * <p>Instanciado manualmente em {@code SecurityConfig} (nao e {@code @Component}) para nao ser
 * tambem auto-registrado no filter chain do servlet.</p>
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenParser tokenParser;

    public JwtAuthenticationFilter(JwtTokenParser tokenParser) {
        this.tokenParser = tokenParser;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            String token = header.substring(BEARER_PREFIX.length());
            tokenParser.extractUserId(token).ifPresent(userId -> {
                var authentication = new UsernamePasswordAuthenticationToken(
                        userId, null, AuthorityUtils.NO_AUTHORITIES);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }

        chain.doFilter(request, response);
    }
}
