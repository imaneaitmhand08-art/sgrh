package com.example.backend.repositories;

import com.example.backend.models.Conge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CongeRepository extends JpaRepository<Conge, Long> {

    List<Conge> findByEmploye_Id(Long employeId);

    List<Conge> findByStatut(String statut);

}