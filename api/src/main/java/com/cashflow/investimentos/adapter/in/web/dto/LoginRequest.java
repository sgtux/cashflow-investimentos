package com.cashflow.investimentos.adapter.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Corpo de {@code POST /api/auth/login}. Ver ../docs/api-especificacao.md secao 2.1. */
public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {
}
