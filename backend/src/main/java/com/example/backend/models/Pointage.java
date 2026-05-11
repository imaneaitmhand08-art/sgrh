package com.example.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "pointages")
public class Pointage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Utilisateur employe;

    private LocalDate date;
    private LocalTime heureEntree;
    private LocalTime heureSortie;

    @Enumerated(EnumType.STRING)
    private StatutPointage statut;

    public Pointage() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Utilisateur getEmploye() { return employe; }
    public void setEmploye(Utilisateur employe) { this.employe = employe; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getHeureEntree() { return heureEntree; }
    public void setHeureEntree(LocalTime heureEntree) { this.heureEntree = heureEntree; }
    public LocalTime getHeureSortie() { return heureSortie; }
    public void setHeureSortie(LocalTime heureSortie) { this.heureSortie = heureSortie; }
    public StatutPointage getStatut() { return statut; }
    public void setStatut(StatutPointage statut) { this.statut = statut; }
}