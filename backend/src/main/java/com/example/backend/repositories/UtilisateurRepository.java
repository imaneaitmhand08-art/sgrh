package com.example.backend.repositories;

import com.example.backend.models.Utilisateur;
import com.example.backend.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    // Trouver par email (login)
    Optional<Utilisateur> findByEmail(String email);

    // Trouver les membres d'une équipe par managerId
    List<Utilisateur> findByManagerId(Long managerId);

    // Trouver par nom d'équipe
    List<Utilisateur> findByEquipe(String equipe);

    // Trouver par rôle
    List<Utilisateur> findByRole(Role role);

    // Trouver par département
    List<Utilisateur> findByDepartement(String departement);

    // Trouver les comptes actifs
    List<Utilisateur> findByEstActif(boolean estActif);

    // Trouver les membres actifs d'un manager
    List<Utilisateur> findByManagerIdAndEstActif(Long managerId, boolean estActif);
}