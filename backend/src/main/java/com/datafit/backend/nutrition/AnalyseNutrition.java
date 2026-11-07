
package com.datafit.backend.nutrition;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.datafit.backend.utilisateur.Utilisateur;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "analyse_nutrition",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_analyse_nutrition_user_date",
        columnNames = {"utilisateur_id", "date"}
    )
)
public class AnalyseNutrition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "nombre_repas", nullable = false)
    private Integer nombreRepas;

    @Column(name = "variation_calories")
    private Double variationCalories;

    @Column(name = "energie_macros_kcal", nullable = false)
    private Double energieMacrosKcal;

    @Column(name = "ecart_calories_macros", nullable = false)
    private Double ecartCaloriesMacros;

    @Column(name = "ecart_calories_macros_pct")
    private Double ecartCaloriesMacrosPct;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "statistiques", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> statistiques;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "repartition_macros", columnDefinition = "jsonb")
    private Map<String, Object> repartitionMacros;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "correlations_calories", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> correlationsCalories;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "repartition_repas", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> repartitionRepas;

    @Column(name = "repas_plus_calorique", nullable = false, length = 20)
    private String repasPlusCalorique;

    @Column(name = "repas_plus_proteine", nullable = false, length = 20)
    private String repasPlusProteine;

    @Column(name = "date_analyse", nullable = false)
    private LocalDateTime dateAnalyse;

    protected AnalyseNutrition() {
        // Constructeur requis par JPA
    }

    public AnalyseNutrition(
            Utilisateur utilisateur,
            LocalDate date,
            Integer nombreRepas,
            Double variationCalories,
            Double energieMacrosKcal,
            Double ecartCaloriesMacros,
            Double ecartCaloriesMacrosPct,
            Map<String, Object> statistiques,
            Map<String, Object> repartitionMacros,
            Map<String, Object> correlationsCalories,
            Map<String, Object> repartitionRepas,
            String repasPlusCalorique,
            String repasPlusProteine) {

        this.utilisateur = utilisateur;
        this.date = date;
        this.nombreRepas = nombreRepas;
        this.variationCalories = variationCalories;
        this.energieMacrosKcal = energieMacrosKcal;
        this.ecartCaloriesMacros = ecartCaloriesMacros;
        this.ecartCaloriesMacrosPct = ecartCaloriesMacrosPct;
        this.statistiques = statistiques;
        this.repartitionMacros = repartitionMacros;
        this.correlationsCalories = correlationsCalories;
        this.repartitionRepas = repartitionRepas;
        this.repasPlusCalorique = repasPlusCalorique;
        this.repasPlusProteine = repasPlusProteine;
        this.dateAnalyse = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    @JsonIgnore
    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public LocalDate getDate() {
        return date;
    }

    public Integer getNombreRepas() {
        return nombreRepas;
    }

    public Double getVariationCalories() {
        return variationCalories;
    }

    public Double getEnergieMacrosKcal() {
        return energieMacrosKcal;
    }

    public Double getEcartCaloriesMacros() {
        return ecartCaloriesMacros;
    }

    public Double getEcartCaloriesMacrosPct() {
        return ecartCaloriesMacrosPct;
    }

    public Map<String, Object> getStatistiques() {
        return statistiques;
    }

    public Map<String, Object> getRepartitionMacros() {
        return repartitionMacros;
    }

    public Map<String, Object> getCorrelationsCalories() {
        return correlationsCalories;
    }

    public Map<String, Object> getRepartitionRepas() {
        return repartitionRepas;
    }

    public String getRepasPlusCalorique() {
        return repasPlusCalorique;
    }

    public String getRepasPlusProteine() {
        return repasPlusProteine;
    }

    public LocalDateTime getDateAnalyse() {
        return dateAnalyse;
    }
}
