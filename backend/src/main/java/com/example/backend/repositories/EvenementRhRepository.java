package com.example.backend.repositories;

import com.example.backend.models.EvenementRh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvenementRhRepository extends JpaRepository<EvenementRh, Long> {
}