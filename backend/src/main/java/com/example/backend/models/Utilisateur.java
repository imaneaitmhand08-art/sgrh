package com.example.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "utilisateurs")
public class Utilisateur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;
    private String email;
    private String motDePasseHash = "password123";

    @Enumerated(EnumType.STRING)
    private Role role = Role.RH;

    private String departement;
    private String poste;
    private String equipe;
    private Long managerId;

    private LocalDate dateEmbauche = LocalDate.now();
    private boolean estActif = true;

    private Integer soldeConges = 18;

    // Procédure de départ
    private LocalDate dateDepart;
    private String motifDepart;
    private String statutDepart;

    public Utilisateur() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasseHash() { return motDePasseHash; }
    public void setMotDePasseHash(String motDePasseHash) { this.motDePasseHash = motDePasseHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getDepartement() { return departement; }
    public void setDepartement(String departement) { this.departement = departement; }

    public String getPoste() { return poste; }
    public void setPoste(String poste) { this.poste = poste; }

    public String getEquipe() { return equipe; }
    public void setEquipe(String equipe) { this.equipe = equipe; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public LocalDate getDateEmbauche() { return dateEmbauche; }
    public void setDateEmbauche(LocalDate dateEmbauche) { this.dateEmbauche = dateEmbauche; }

    public boolean isEstActif() { return estActif; }
    public void setEstActif(boolean estActif) { this.estActif = estActif; }

    public Integer getSoldeConges() { return soldeConges; }
    public void setSoldeConges(Integer soldeConges) { this.soldeConges = soldeConges; }

    public LocalDate getDateDepart() { return dateDepart; }
    public void setDateDepart(LocalDate dateDepart) { this.dateDepart = dateDepart; }

    public String getMotifDepart() { return motifDepart; }
    public void setMotifDepart(String motifDepart) { this.motifDepart = motifDepart; }

    public String getStatutDepart() { return statutDepart; }
    public void setStatutDepart(String statutDepart) { this.statutDepart = statutDepart; }
}