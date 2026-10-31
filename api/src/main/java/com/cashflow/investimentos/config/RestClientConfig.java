package com.cashflow.investimentos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class RestClientConfig {

    /** Cliente HTTP servidor-a-servidor para a API .NET do Cashflow (proxy de login). */
    @Bean
    RestClient cashflowRestClient(CashflowProperties properties, RestClient.Builder builder) {
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(10).toMillis());
        return builder
                .baseUrl(properties.api().baseUrl())
                .requestFactory(factory)
                .build();
    }
}
