package com.example.backend.repositories;

import com.example.backend.models.Sanction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SanctionRepository extends JpaRepository<Sanction, Long> {
    List<Sanction> findByEmployeId(Long employeId);
    List<Sanction> findByStatut(String statut);
}