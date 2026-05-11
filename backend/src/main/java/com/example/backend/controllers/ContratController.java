package com.example.backend.controllers;

import com.example.backend.models.Contrat;
import com.example.backend.repositories.ContratRepository;
import com.example.backend.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contrats")
@CrossOrigin(origins = "http://localhost:3000")
public class ContratController {

    @Autowired private ContratRepository contratRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;

    @GetMapping
    public List<Contrat> getAll() { return contratRepository.findAll(); }

    @GetMapping("/employe/{id}")
    public List<Contrat> getByEmploye(@PathVariable Long id) {
        return contratRepository.findByEmployeId(id);
    }

    // Alertes — contrats expirant dans 30 jours
    @GetMapping("/alertes")
    public ResponseEntity<?> getAlertes() {
        try {
            LocalDate today = LocalDate.now();
            LocalDate in30days = today.plusDays(30);
            List<Contrat> alertes = contratRepository.findContratsExpirantBientot(today, in30days);
            return ResponseEntity.ok(alertes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Contrat c = new Contrat();
            Long employeId = Long.valueOf(body.get("employeId").toString());
            utilisateurRepository.findById(employeId).ifPresent(c::setEmploye);
            c.setType((String) body.get("type"));
            if (body.get("dateDebut") != null)
                c.setDateDebut(LocalDate.parse(body.get("dateDebut").toString()));
            if (body.get("dateFin") != null)
                c.setDateFin(LocalDate.parse(body.get("dateFin").toString()));
            if (body.get("salaireBrut") != null)
                c.setSalaireBrut(Double.valueOf(body.get("salaireBrut").toString()));
            c.setStatut("actif");
            return ResponseEntity.ok(contratRepository.save(c));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/terminer")
    public ResponseEntity<?> terminer(@PathVariable Long id) {
        try {
            Contrat c = contratRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contrat non trouvé"));
            c.setStatut("termine");
            return ResponseEntity.ok(contratRepository.save(c));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { contratRepository.deleteById(id); return ResponseEntity.ok().build(); }
        catch (Exception e) { return ResponseEntity.badRequest().body("Erreur: " + e.getMessage()); }
    }
}