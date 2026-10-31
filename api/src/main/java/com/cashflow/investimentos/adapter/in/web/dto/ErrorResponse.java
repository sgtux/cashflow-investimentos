package com.cashflow.investimentos.adapter.in.web.dto;

/** Envelope de erro da API: JSON simples {@code {"message": "..."}} (ver ../docs/api-especificacao.md secao 4). */
public record ErrorResponse(String message) {
}
