package com.example.backend.repositories;

import com.example.backend.models.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {
    List<Contrat> findByEmployeId(Long employeId);
    List<Contrat> findByStatut(String statut);
    List<Contrat> findByType(String type);

    // Contrats qui expirent dans les 30 prochains jours
    @Query("SELECT c FROM Contrat c WHERE c.dateFin BETWEEN :today AND :in30days AND c.statut = 'actif'")
    List<Contrat> findContratsExpirantBientot(LocalDate today, LocalDate in30days);
}