package com.cashflow.investimentos.domain;

import com.cashflow.investimentos.domain.contribution.Money;
import com.cashflow.investimentos.domain.contribution.Quantity;
import com.cashflow.investimentos.domain.shared.DomainValidationException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MoneyAndQuantityTest {

    @Test
    void money_arredonda_para_duas_casas_half_up() {
        assertEquals(new BigDecimal("10.13"), Money.of(new BigDecimal("10.125")).amount());
    }

    @Test
    void total_do_aporte_e_preco_unitario_vezes_quantidade() {
        Money total = Money.of(new BigDecimal("10.00")).times(Quantity.of(new BigDecimal("240"), false));
        assertTrue(total.isEqualTo(Money.of(new BigDecimal("2400.00"))));
    }

    @Test
    void quantidade_deve_ser_positiva() {
        assertThrows(DomainValidationException.class, () -> Quantity.of(BigDecimal.ZERO, true));
        assertThrows(DomainValidationException.class, () -> Quantity.of(new BigDecimal("-1"), true));
    }

    @Test
    void quantidade_fracionada_so_e_permitida_quando_o_tipo_permite() {
        assertThrows(DomainValidationException.class, () -> Quantity.of(new BigDecimal("1.5"), false));
        assertEquals(new BigDecimal("1.5"), Quantity.of(new BigDecimal("1.5"), true).value());
    }
}
