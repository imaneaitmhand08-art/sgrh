package com.example.backend.controllers;

import com.example.backend.models.Conge;
import com.example.backend.repositories.CongeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conges")
@CrossOrigin(origins = "http://localhost:3000")
public class CongesController {

    @Autowired
    private CongeRepository congeRepository;

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
        return congeRepository.findByEmployeId(id);
    }

    @GetMapping("/en-attente")
    public List<Conge> getCongesEnAttente() {
        return congeRepository.findByStatut("EN_ATTENTE");
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
            return ResponseEntity.ok(congeRepository.save(conge));
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
            return ResponseEntity.ok(congeRepository.save(conge));
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
            return ResponseEntity.ok(congeRepository.save(conge));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur refus: " + e.getMessage());
        }
    }
}