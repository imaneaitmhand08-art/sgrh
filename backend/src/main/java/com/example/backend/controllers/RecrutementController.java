package com.example.backend.controllers;

import com.example.backend.models.Recrutement;
import com.example.backend.models.TypeRecrutement;
import com.example.backend.models.Utilisateur;
import com.example.backend.repositories.RecrutementRepository;
import com.example.backend.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recrutement")
@CrossOrigin(origins = "*")
public class RecrutementController {

    @Autowired
    private RecrutementRepository recrutementRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // ── CRÉER OFFRE
    @PostMapping
    public ResponseEntity<?> creerOffre(@RequestBody Map<String, Object> body) {
        try {
            Recrutement offre = new Recrutement();
            offre.setTitre((String) body.get("titre"));
            offre.setDescription((String) body.get("description"));
            offre.setDepartement((String) body.get("departement"));
            offre.setType(TypeRecrutement.offre);
            offre.setStatut("OUVERT");

            Object responsableIdObj = body.get("responsableId");
            if (responsableIdObj != null) {
                Long responsableId = Long.valueOf(responsableIdObj.toString());
                utilisateurRepository.findById(responsableId)
                    .ifPresent(offre::setResponsable);
            }
            return ResponseEntity.ok(recrutementRepository.save(offre));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── LISTE OFFRES
    @GetMapping
    public ResponseEntity<?> listeOffres() {
        try {
            return ResponseEntity.ok(recrutementRepository.findByType(TypeRecrutement.offre));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── GET OFFRE PAR ID (page publique)
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            Recrutement offre = recrutementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));
            return ResponseEntity.ok(offre);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── POSTULER À UNE OFFRE (page publique, pas besoin de login)
    @PostMapping("/{offreId}/postuler")
    public ResponseEntity<?> postuler(@PathVariable Long offreId,
                                       @RequestBody Map<String, Object> body) {
        try {
            Recrutement offre = recrutementRepository.findById(offreId)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));

            Recrutement candidature = new Recrutement();
            candidature.setType(TypeRecrutement.candidat);
            candidature.setOffreParente(offre);
            candidature.setNom((String) body.get("nom"));
            candidature.setPrenom((String) body.get("prenom"));
            candidature.setEmail((String) body.get("email"));
            candidature.setCvUrl((String) body.get("cvUrl"));
            candidature.setDescription((String) body.get("motivation"));
            candidature.setStatut("EN_ATTENTE");

            return ResponseEntity.ok(recrutementRepository.save(candidature));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur candidature: " + e.getMessage());
        }
    }

    // ── LISTE CANDIDATURES D'UNE OFFRE
    @GetMapping("/{offreId}/candidatures")
    public ResponseEntity<?> getCandidatures(@PathVariable Long offreId) {
        try {
            List<Recrutement> candidatures = recrutementRepository.findByOffreParenteId(offreId);
            return ResponseEntity.ok(candidatures);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── METTRE À JOUR STATUT CANDIDATURE
    @PutMapping("/candidature/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        try {
            Recrutement candidature = recrutementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));
            candidature.setStatut((String) body.get("statut"));
            if (body.get("noteEntretien") != null) {
                candidature.setNoteEntretien(Integer.valueOf(body.get("noteEntretien").toString()));
            }
            if (body.get("dateEntretien") != null) {
                candidature.setDateEntretien(LocalDate.parse(body.get("dateEntretien").toString()));
            }
            return ResponseEntity.ok(recrutementRepository.save(candidature));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── EMBAUCHER → CRÉER COMPTE EMPLOYÉ
    @PostMapping("/candidature/{id}/embaucher")
    public ResponseEntity<?> embaucher(@PathVariable Long id) {
        try {
            Recrutement candidature = recrutementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));

            Utilisateur nouvelEmploye = new Utilisateur();
            nouvelEmploye.setNom(candidature.getNom());
            nouvelEmploye.setPrenom(candidature.getPrenom());
            nouvelEmploye.setEmail(candidature.getEmail());
            nouvelEmploye.setMotDePasseHash("password123");
            nouvelEmploye.setRole(com.example.backend.models.Role.RH);
            nouvelEmploye.setDepartement(
                candidature.getOffreParente() != null ?
                candidature.getOffreParente().getDepartement() : null
            );
            nouvelEmploye.setPoste(
                candidature.getOffreParente() != null ?
                candidature.getOffreParente().getTitre() : null
            );
            nouvelEmploye.setEstActif(true);

            candidature.setStatut("ACCEPTE");
            recrutementRepository.save(candidature);

            Utilisateur saved = utilisateurRepository.save(nouvelEmploye);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur embauche: " + e.getMessage());
        }
    }

    // ── SUPPRIMER OFFRE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimer(@PathVariable Long id) {
        try {
            recrutementRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur suppression: " + e.getMessage());
        }
    }
}