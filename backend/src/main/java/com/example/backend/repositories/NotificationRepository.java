package com.example.backend.repositories;

import com.example.backend.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUtilisateurIdOrderByCreeLeDesc(Long utilisateurId);
    long countByUtilisateurIdAndEstLueFalse(Long utilisateurId);
}