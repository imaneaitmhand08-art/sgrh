package com.example.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "contrats")
public class Contrat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Utilisateur employe;

    @Column(name = "type")
    private String type; // CDD, CDI, Stage

    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Double salaireBrut;
    private String statut = "actif";

    public Contrat() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Utilisateur getEmploye() { return employe; }
    public void setEmploye(Utilisateur employe) { this.employe = employe; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }
    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }
    public Double getSalaireBrut() { return salaireBrut; }
    public void setSalaireBrut(Double salaireBrut) { this.salaireBrut = salaireBrut; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}