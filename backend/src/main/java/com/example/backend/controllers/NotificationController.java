package com.example.backend.controllers;

import com.example.backend.models.Notification;
import com.example.backend.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/employe/{id}")
    public List<Notification> getNotifications(@PathVariable Long id) {
        return notificationRepository.findByUtilisateurIdOrderByCreeLeDesc(id);
    }

    @GetMapping("/non-lues/{id}")
    public ResponseEntity<?> getNonLues(@PathVariable Long id) {
        long count = notificationRepository.countByUtilisateurIdAndEstLueFalse(id);
        Map<String, Object> result = new HashMap<>();
        result.put("nonLues", count);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/lire")
    public ResponseEntity<?> marquerLue(@PathVariable Long id) {
        try {
            Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));
            notif.setEstLue(true);
            return ResponseEntity.ok(notificationRepository.save(notif));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/lire-tout/{employeId}")
    public ResponseEntity<?> marquerToutesLues(@PathVariable Long employeId) {
        try {
            List<Notification> notifs = notificationRepository.findByUtilisateurIdOrderByCreeLeDesc(employeId);
            notifs.forEach(n -> n.setEstLue(true));
            notificationRepository.saveAll(notifs);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}