package com.cashflow.investimentos.domain;

import com.cashflow.investimentos.domain.asset.Ticker;
import com.cashflow.investimentos.domain.shared.DomainValidationException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TickerTest {

    @Test
    void normaliza_para_maiusculas_e_sem_espacos() {
        assertEquals("MXRF11", Ticker.of("  mxrf11 ").value());
    }

    @Test
    void tickers_iguais_apos_normalizacao_sao_equals() {
        assertEquals(Ticker.of("mxrf11"), Ticker.of("MXRF11"));
    }

    @Test
    void rejeita_vazio() {
        assertThrows(DomainValidationException.class, () -> Ticker.of("   "));
    }

    @Test
    void rejeita_formato_invalido() {
        assertThrows(DomainValidationException.class, () -> Ticker.of("MXRF-11"));
        assertThrows(DomainValidationException.class, () -> Ticker.of("ABCDEFGHIJK"));
    }
}
