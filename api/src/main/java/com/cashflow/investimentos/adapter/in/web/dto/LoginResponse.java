package com.cashflow.investimentos.adapter.in.web.dto;

/** Resposta de sucesso de {@code POST /api/auth/login} (200). O token e o JWT cru da API .NET. */
public record LoginResponse(long id, String email, String token) {
}
