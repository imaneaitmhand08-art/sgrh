package com.example.backend.repositories;

import com.example.backend.models.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByEmployeId(Long employeId);
    List<Evaluation> findByEvaluateurId(Long evaluateurId);
    List<Evaluation> findByStatut(String statut);
}