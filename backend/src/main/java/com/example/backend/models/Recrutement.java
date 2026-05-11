package com.example.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "recrutement")
public class Recrutement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Recrutement offreParente;

    @ManyToOne
    @JoinColumn(name = "responsable_id")
    private Utilisateur responsable;

    @Enumerated(EnumType.STRING)
    private TypeRecrutement type;

    private String titre;
    private String nom;
    private String prenom;
    private String email;
    private String cvUrl;
    private String description;
    private String departement;
    private Integer noteEntretien;
    private LocalDate dateEntretien;
    private String statut = "EN_ATTENTE";

    public Recrutement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Recrutement getOffreParente() { return offreParente; }
    public void setOffreParente(Recrutement offreParente) { this.offreParente = offreParente; }

    public Utilisateur getResponsable() { return responsable; }
    public void setResponsable(Utilisateur responsable) { this.responsable = responsable; }

    public TypeRecrutement getType() { return type; }
    public void setType(TypeRecrutement type) { this.type = type; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCvUrl() { return cvUrl; }
    public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDepartement() { return departement; }
    public void setDepartement(String departement) { this.departement = departement; }

    public Integer getNoteEntretien() { return noteEntretien; }
    public void setNoteEntretien(Integer noteEntretien) { this.noteEntretien = noteEntretien; }

    public LocalDate getDateEntretien() { return dateEntretien; }
    public void setDateEntretien(LocalDate dateEntretien) { this.dateEntretien = dateEntretien; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}