package com.example.backend.repositories;

import com.example.backend.models.Role;
import com.example.backend.models.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    List<Utilisateur> findByManagerId(Long managerId);
    List<Utilisateur> findByRole(Role role);
    List<Utilisateur> findByDepartement(String departement);
}