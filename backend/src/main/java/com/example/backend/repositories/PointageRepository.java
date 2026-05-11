package com.example.backend.repositories;

import com.example.backend.models.Pointage;
import com.example.backend.models.StatutPointage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PointageRepository extends JpaRepository<Pointage, Long> {
    List<Pointage> findByEmployeId(Long employeId);
    List<Pointage> findByEmployeIdAndDate(Long employeId, LocalDate date);
    List<Pointage> findByDate(LocalDate date);
    List<Pointage> findByStatut(StatutPointage statut);
    Optional<Pointage> findFirstByEmployeIdAndDateOrderByIdDesc(Long employeId, LocalDate date);

    // Tous les pointages des membres d'une équipe (manager)
    @Query("SELECT p FROM Pointage p WHERE p.employe.managerId = :managerId ORDER BY p.date DESC")
    List<Pointage> findByManagerId(Long managerId);

    // Pointages équipe pour une date
    @Query("SELECT p FROM Pointage p WHERE p.employe.managerId = :managerId AND p.date = :date")
    List<Pointage> findByManagerIdAndDate(Long managerId, LocalDate date);
}