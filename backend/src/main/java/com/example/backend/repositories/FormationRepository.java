package com.example.backend.repositories;

import com.example.backend.models.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByEmployeId(Long employeId);
    List<Formation> findByStatut(String statut);
}