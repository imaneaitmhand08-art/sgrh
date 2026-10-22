package com.example.backend.controllers;

import com.example.backend.models.Conge;
import com.example.backend.models.Notification;
import com.example.backend.models.Utilisateur;
import com.example.backend.repositories.CongeRepository;
import com.example.backend.repositories.NotificationRepository;
import com.example.backend.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conges")
@CrossOrigin(origins = "http://localhost:3000")
public class CongesController {

    @Autowired
    private CongeRepository congeRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @PostMapping
    public ResponseEntity<?> creerConge(@RequestBody Conge nouveauConge) {
        try {
            nouveauConge.setStatut("EN_ATTENTE");
            return ResponseEntity.ok(congeRepository.save(nouveauConge));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur création: " + e.getMessage());
        }
    }

    @GetMapping("/mon-suivi/{id}")
    public List<Conge> getMesConges(@PathVariable Long id) {
        return congeRepository.findByEmploye_Id(id);
    }

    @GetMapping("/en-attente")
    public List<Conge> getCongesEnAttente() {
        return congeRepository.findByStatut("EN_ATTENTE");
    }

    @GetMapping("/solde/{employeId}")
    public ResponseEntity<?> getSolde(@PathVariable Long employeId) {
        try {
            Utilisateur emp = utilisateurRepository.findById(employeId)
                .orElseThrow(() -> new RuntimeException("Employé introuvable"));

            int joursAlloues = emp.getSoldeConges() != null ? emp.getSoldeConges() : 18;
            int anneeActuelle = LocalDate.now().getYear();

            List<Conge> congesApprouves = congeRepository.findByEmploye_Id(employeId).stream()
                .filter(c -> "APPROUVE".equals(c.getStatut()))
                .filter(c -> c.getDateDebut() != null && c.getDateDebut().getYear() == anneeActuelle)
                .toList();

            int joursPris = congesApprouves.stream()
                .mapToInt(c -> compterJoursOuvres(c.getDateDebut(), c.getDateFin()))
                .sum();

            Map<String, Object> result = new HashMap<>();
            result.put("joursAlloues", joursAlloues);
            result.put("joursPris", joursPris);
            result.put("soldeRestant", joursAlloues - joursPris);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    /**
     * Compte le nombre de jours ouvrés (lundi à vendredi inclus)
     * entre deux dates, bornes incluses. Les week-ends (samedi, dimanche)
     * ne sont pas comptabilisés dans le solde de congés.
     */
    private int compterJoursOuvres(LocalDate debut, LocalDate fin) {
        if (debut == null || fin == null || fin.isBefore(debut)) return 0;
        int jours = 0;
        LocalDate date = debut;
        while (!date.isAfter(fin)) {
            DayOfWeek jourSemaine = date.getDayOfWeek();
            if (jourSemaine != DayOfWeek.SATURDAY && jourSemaine != DayOfWeek.SUNDAY) {
                jours++;
            }
            date = date.plusDays(1);
        }
        return jours;
    }

    @PutMapping("/{id}/decision")
    public ResponseEntity<?> updateStatut(
            @PathVariable Long id,
            @RequestParam String decision,
            @RequestParam Long adminId) {
        try {
            Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Congé introuvable"));
            conge.setStatut(decision);
            conge.setValidePar(adminId);
            Conge saved = congeRepository.save(conge);
            creerNotificationDecision(saved);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/approuver")
    public ResponseEntity<?> approuver(@PathVariable Long id) {
        try {
            Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Congé introuvable"));
            conge.setStatut("APPROUVE");
            Conge saved = congeRepository.save(conge);
            creerNotificationDecision(saved);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur approbation: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/refuser")
    public ResponseEntity<?> refuser(@PathVariable Long id) {
        try {
            Conge conge = congeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Congé introuvable"));
            conge.setStatut("REFUSE");
            Conge saved = congeRepository.save(conge);
            creerNotificationDecision(saved);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur refus: " + e.getMessage());
        }
    }

    private void creerNotificationDecision(Conge conge) {
        try {
            Utilisateur emp = conge.getEmploye();
            if (emp == null) return;

            Notification notif = new Notification();
            notif.setUtilisateur(emp);
            notif.setType("conge");
            if ("APPROUVE".equals(conge.getStatut())) {
                notif.setMessage("Votre demande de congé (" + conge.getType() + ") du " + conge.getDateDebut() + " au " + conge.getDateFin() + " a été approuvée ✅");
                notificationRepository.save(notif);
            } else if ("REFUSE".equals(conge.getStatut())) {
                notif.setMessage("Votre demande de congé (" + conge.getType() + ") du " + conge.getDateDebut() + " au " + conge.getDateFin() + " a été refusée ❌");
                notificationRepository.save(notif);
            }
        } catch (Exception ignored) {}
    }
}