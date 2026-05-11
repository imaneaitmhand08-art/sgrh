package com.example.backend.controllers;

import com.example.backend.models.Formation;
import com.example.backend.models.Utilisateur;
import com.example.backend.repositories.FormationRepository;
import com.example.backend.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formations")
@CrossOrigin(origins = "http://localhost:3000")
public class FormationController {

    @Autowired private FormationRepository formationRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;

    @GetMapping
    public List<Formation> getAll() { return formationRepository.findAll(); }

    @GetMapping("/employe/{id}")
    public List<Formation> getByEmploye(@PathVariable Long id) {
        return formationRepository.findByEmployeId(id);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Formation f = new Formation();
            Long employeId = Long.valueOf(body.get("employeId").toString());
            utilisateurRepository.findById(employeId).ifPresent(f::setEmploye);
            f.setTitre((String) body.get("titre"));
            f.setDescription((String) body.get("description"));
            f.setOrganisme((String) body.get("organisme"));
            if (body.get("dateDebut") != null) f.setDateDebut(LocalDate.parse(body.get("dateDebut").toString()));
            if (body.get("dateFin") != null)   f.setDateFin(LocalDate.parse(body.get("dateFin").toString()));
            f.setStatut("PLANIFIE");
            return ResponseEntity.ok(formationRepository.save(f));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Formation f = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Non trouvé"));
            f.setStatut((String) body.get("statut"));
            return ResponseEntity.ok(formationRepository.save(f));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { formationRepository.deleteById(id); return ResponseEntity.ok().build(); }
        catch (Exception e) { return ResponseEntity.badRequest().body("Erreur: " + e.getMessage()); }
    }
}