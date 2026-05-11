package com.example.backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "evenements_rh")
@Data
public class EvenementRh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employe_id")
    private Utilisateur employe;

    @ManyToOne
    @JoinColumn(name = "cree_par")
    private Utilisateur creePar;

    @Enumerated(EnumType.STRING)
    private TypeEvenement type; // evaluation, formation, sanction, onboarding, depart

    private LocalDate date;
    private String titre;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String urlFichier; // Pour le PDF si besoin
    private boolean estComplete = false;
}

enum TypeEvenement { evaluation, formation, sanction, onboarding, depart }