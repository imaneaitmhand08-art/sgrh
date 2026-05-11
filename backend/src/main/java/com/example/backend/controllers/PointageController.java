package com.example.backend.controllers;

import com.example.backend.models.Pointage;
import com.example.backend.models.StatutPointage;
import com.example.backend.models.Utilisateur;
import com.example.backend.repositories.PointageRepository;
import com.example.backend.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pointages")
@CrossOrigin(origins = "http://localhost:3000")
public class PointageController {

    @Autowired
    private PointageRepository pointageRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // ── POINTER ENTRÉE
    @PostMapping("/entree/{employeId}")
    public ResponseEntity<?> pointerEntree(@PathVariable Long employeId) {
        try {
            LocalDate today = LocalDate.now();
            LocalTime now = LocalTime.now();

            // Vérifier si déjà pointé aujourd'hui
            Optional<Pointage> existing = pointageRepository
                .findFirstByEmployeIdAndDateOrderByIdDesc(employeId, today);

            if (existing.isPresent() && existing.get().getHeureEntree() != null) {
                return ResponseEntity.badRequest().body("Déjà pointé ce matin !");
            }

            Utilisateur employe = utilisateurRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));

            Pointage pointage = new Pointage();
            pointage.setEmploye(employe);
            pointage.setDate(today);
            pointage.setHeureEntree(now);

            // Retard si après 9h00
            if (now.isAfter(LocalTime.of(9, 0))) {
                pointage.setStatut(StatutPointage.retard);
            } else {
                pointage.setStatut(StatutPointage.present);
            }

            return ResponseEntity.ok(pointageRepository.save(pointage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── POINTER SORTIE
    @PutMapping("/sortie/{employeId}")
    public ResponseEntity<?> pointerSortie(@PathVariable Long employeId) {
        try {
            LocalDate today = LocalDate.now();
            LocalTime now = LocalTime.now();

            Pointage pointage = pointageRepository
                .findFirstByEmployeIdAndDateOrderByIdDesc(employeId, today)
                .orElseThrow(() -> new RuntimeException("Pas de pointage d'entrée aujourd'hui"));

            if (pointage.getHeureSortie() != null) {
                return ResponseEntity.badRequest().body("Sortie déjà enregistrée !");
            }

            pointage.setHeureSortie(now);
            return ResponseEntity.ok(pointageRepository.save(pointage));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── POINTAGE D'AUJOURD'HUI POUR UN EMPLOYÉ
    @GetMapping("/aujourd-hui/{employeId}")
    public ResponseEntity<?> getAujourdhui(@PathVariable Long employeId) {
        try {
            Optional<Pointage> p = pointageRepository
                .findFirstByEmployeIdAndDateOrderByIdDesc(employeId, LocalDate.now());
            return ResponseEntity.ok(p.orElse(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── HISTORIQUE D'UN EMPLOYÉ
    @GetMapping("/employe/{employeId}")
    public ResponseEntity<?> getByEmploye(@PathVariable Long employeId) {
        try {
            List<Pointage> pointages = pointageRepository.findByEmployeId(employeId);
            return ResponseEntity.ok(pointages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── TOUS LES POINTAGES (ADMIN)
    @GetMapping
    public ResponseEntity<?> getAll() {
        try {
            return ResponseEntity.ok(pointageRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── POINTAGES ÉQUIPE D'UN MANAGER
    @GetMapping("/equipe/{managerId}")
    public ResponseEntity<?> getEquipe(@PathVariable Long managerId) {
        try {
            List<Pointage> pointages = pointageRepository.findByManagerId(managerId);
            return ResponseEntity.ok(pointages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── MARQUER RETARD (MANAGER)
    @PutMapping("/{id}/retard")
    public ResponseEntity<?> marquerRetard(@PathVariable Long id) {
        try {
            Pointage p = pointageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pointage non trouvé"));
            p.setStatut(StatutPointage.retard);
            return ResponseEntity.ok(pointageRepository.save(p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── MARQUER ABSENT
    @PutMapping("/{id}/absent")
    public ResponseEntity<?> marquerAbsent(@PathVariable Long id) {
        try {
            Pointage p = pointageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pointage non trouvé"));
            p.setStatut(StatutPointage.absent);
            return ResponseEntity.ok(pointageRepository.save(p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── STATS POUR DASHBOARD
    @GetMapping("/stats/{employeId}")
    public ResponseEntity<?> getStats(@PathVariable Long employeId) {
        try {
            List<Pointage> tous = pointageRepository.findByEmployeId(employeId);
            long presents = tous.stream().filter(p -> p.getStatut() == StatutPointage.present).count();
            long retards  = tous.stream().filter(p -> p.getStatut() == StatutPointage.retard).count();
            long absents  = tous.stream().filter(p -> p.getStatut() == StatutPointage.absent).count();
            return ResponseEntity.ok(Map.of(
                "total",   tous.size(),
                "presents", presents,
                "retards",  retards,
                "absents",  absents
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}