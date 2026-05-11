package com.example.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "evaluations")
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Utilisateur employe;

    @ManyToOne
    @JoinColumn(name = "evaluateur_id")
    private Utilisateur evaluateur;

    private LocalDate dateEvaluation;
    private String periode;
    private Integer noteGlobale;
    private String objectifs;
    private String commentaire;
    private String statut = "EN_COURS";

    public Evaluation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Utilisateur getEmploye() { return employe; }
    public void setEmploye(Utilisateur employe) { this.employe = employe; }
    public Utilisateur getEvaluateur() { return evaluateur; }
    public void setEvaluateur(Utilisateur evaluateur) { this.evaluateur = evaluateur; }
    public LocalDate getDateEvaluation() { return dateEvaluation; }
    public void setDateEvaluation(LocalDate dateEvaluation) { this.dateEvaluation = dateEvaluation; }
    public String getPeriode() { return periode; }
    public void setPeriode(String periode) { this.periode = periode; }
    public Integer getNoteGlobale() { return noteGlobale; }
    public void setNoteGlobale(Integer noteGlobale) { this.noteGlobale = noteGlobale; }
    public String getObjectifs() { return objectifs; }
    public void setObjectifs(String objectifs) { this.objectifs = objectifs; }
    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}