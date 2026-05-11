package com.example.backend.repositories;

import com.example.backend.models.Recrutement;
import com.example.backend.models.TypeRecrutement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecrutementRepository extends JpaRepository<Recrutement, Long> {
    List<Recrutement> findByType(TypeRecrutement type);
    List<Recrutement> findByOffreParenteId(Long offreId);
    List<Recrutement> findByTypeAndStatut(TypeRecrutement type, String statut);
}