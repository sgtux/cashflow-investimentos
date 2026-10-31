package com.cashflow.investimentos.application.port.out;

/**
 * Porta de saida para o login-proxy: repassa credenciais para a API .NET do Cashflow
 * (servidor-a-servidor, sem CORS) e devolve o JWT recebido, sem reassinar nada.
 * Ver ../docs/api-especificacao.md secao 2.1 e ../docs/arquitetura.md secao 5.2.
 *
 * <p>E pura integracao: nao encosta no dominio.</p>
 */
public interface CashflowAuthOutputPort {

    /**
     * @return o JWT cru emitido pela API .NET.
     * @throws InvalidCredentialsException   se a API .NET responder 401.
     * @throws CashflowAuthUnavailableException se a API .NET estiver fora do ar ou responder erro inesperado.
     */
    String requestToken(String email, String password);
}
