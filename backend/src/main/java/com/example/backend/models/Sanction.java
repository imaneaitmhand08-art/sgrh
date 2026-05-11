package com.example.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "sanctions")
public class Sanction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Utilisateur employe;

    private String typeSanction;
    private String motif;
    private LocalDate dateSanction;
    private String description;
    private String statut = "ACTIVE";

    public Sanction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Utilisateur getEmploye() { return employe; }
    public void setEmploye(Utilisateur employe) { this.employe = employe; }
    public String getTypeSanction() { return typeSanction; }
    public void setTypeSanction(String typeSanction) { this.typeSanction = typeSanction; }
    public String getMotif() { return motif; }
    public void setMotif(String motif) { this.motif = motif; }
    public LocalDate getDateSanction() { return dateSanction; }
    public void setDateSanction(LocalDate dateSanction) { this.dateSanction = dateSanction; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}