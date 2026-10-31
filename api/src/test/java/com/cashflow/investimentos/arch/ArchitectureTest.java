package com.cashflow.investimentos.arch;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

/**
 * Fronteiras da arquitetura hexagonal (ver ../docs/arquitetura.md secao 8).
 * A regra de dependencia: o codigo-fonte so aponta para dentro (adapter -> application -> domain).
 */
@AnalyzeClasses(
        packages = "com.cashflow.investimentos",
        importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule dominio_nao_depende_de_framework =
            noClasses()
                    .that().resideInAPackage("..domain..")
                    .should().dependOnClassesThat().resideInAnyPackage(
                            "org.springframework..",
                            "jakarta.persistence..",
                            "com.fasterxml.jackson..",
                            "io.jsonwebtoken..",
                            "..application..",
                            "..adapter..",
                            "..config..");

    @ArchTest
    static final ArchRule aplicacao_nao_depende_de_adapters =
            noClasses()
                    .that().resideInAPackage("..application..")
                    .should().dependOnClassesThat().resideInAnyPackage("..adapter..", "..config..");

    @ArchTest
    static final ArchRule camadas =
            layeredArchitecture().consideringOnlyDependenciesInLayers()
                    .layer("domain").definedBy("..domain..")
                    .layer("application").definedBy("..application..")
                    .layer("adapter").definedBy("..adapter..")
                    .layer("config").definedBy("..config..")
                    // config e a camada de wiring: pode enxergar os adapters para amarra-los as portas.
                    .whereLayer("adapter").mayOnlyBeAccessedByLayers("config")
                    .whereLayer("application").mayOnlyBeAccessedByLayers("adapter", "config")
                    .whereLayer("domain").mayOnlyBeAccessedByLayers("application", "adapter", "config");
}
