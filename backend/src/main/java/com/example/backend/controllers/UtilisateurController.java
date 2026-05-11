package com.example.backend.controllers;

import com.example.backend.models.Utilisateur;
import com.example.backend.models.Role;
import com.example.backend.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "http://localhost:3000")
public class UtilisateurController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // ── GET TOUS
    @GetMapping
    public List<Utilisateur> getAll() {
        return utilisateurRepository.findAll();
    }

    // ── GET PAR ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── GET ÉQUIPE D'UN MANAGER
    @GetMapping("/equipe/{managerId}")
    public ResponseEntity<?> getEquipe(@PathVariable Long managerId) {
        try {
            List<Utilisateur> equipe = utilisateurRepository.findByManagerId(managerId);
            return ResponseEntity.ok(equipe);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── GET PAR RÔLE
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getByRole(@PathVariable String role) {
        try {
            Role r = Role.valueOf(role.toUpperCase());
            List<Utilisateur> users = utilisateurRepository.findByRole(r);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── GET PAR DÉPARTEMENT
    @GetMapping("/departement/{departement}")
    public ResponseEntity<?> getByDepartement(@PathVariable String departement) {
        try {
            List<Utilisateur> users = utilisateurRepository.findByDepartement(departement);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── CRÉER
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Utilisateur user) {
        try {
            if (user.getMotDePasseHash() == null || user.getMotDePasseHash().isEmpty()) {
                user.setMotDePasseHash("password123");
            }
            if (user.getRole() == null) {
                user.setRole(Role.RH);
            }
            user.setEstActif(true);
            Utilisateur saved = utilisateurRepository.save(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur création: " + e.getMessage());
        }
    }

    // ── MODIFIER
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Utilisateur userDetails) {
        try {
            Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (userDetails.getNom() != null)          user.setNom(userDetails.getNom());
            if (userDetails.getPrenom() != null)        user.setPrenom(userDetails.getPrenom());
            if (userDetails.getEmail() != null)         user.setEmail(userDetails.getEmail());
            if (userDetails.getRole() != null)          user.setRole(userDetails.getRole());
            if (userDetails.getDepartement() != null)   user.setDepartement(userDetails.getDepartement());
            if (userDetails.getPoste() != null)         user.setPoste(userDetails.getPoste());
            if (userDetails.getEquipe() != null)        user.setEquipe(userDetails.getEquipe());
            if (userDetails.getManagerId() != null)     user.setManagerId(userDetails.getManagerId());
            if (userDetails.getDateEmbauche() != null)  user.setDateEmbauche(userDetails.getDateEmbauche());

            Utilisateur updated = utilisateurRepository.save(user);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur modification: " + e.getMessage());
        }
    }

    // ── ARCHIVER
    @PutMapping("/{id}/archiver")
    public ResponseEntity<?> archiver(@PathVariable Long id) {
        try {
            Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            user.setEstActif(false);
            return ResponseEntity.ok(utilisateurRepository.save(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur archivage: " + e.getMessage());
        }
    }

    // ── RÉACTIVER
    @PutMapping("/{id}/reactiver")
    public ResponseEntity<?> reactiver(@PathVariable Long id) {
        try {
            Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            user.setEstActif(true);
            user.setStatutDepart(null);
            user.setDateDepart(null);
            user.setMotifDepart(null);
            return ResponseEntity.ok(utilisateurRepository.save(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur réactivation: " + e.getMessage());
        }
    }

    // ── PROCÉDURE DE DÉPART
    @PutMapping("/{id}/depart")
    public ResponseEntity<?> enregistrerDepart(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (body.get("dateDepart") != null)
                user.setDateDepart(LocalDate.parse(body.get("dateDepart").toString()));
            if (body.get("motifDepart") != null)
                user.setMotifDepart((String) body.get("motifDepart"));

            user.setStatutDepart("EN_COURS");
            user.setEstActif(false);

            return ResponseEntity.ok(utilisateurRepository.save(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur départ: " + e.getMessage());
        }
    }

    // ── FINALISER DÉPART
    @PutMapping("/{id}/depart/finaliser")
    public ResponseEntity<?> finaliserDepart(@PathVariable Long id) {
        try {
            Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            user.setStatutDepart("FINALISE");
            return ResponseEntity.ok(utilisateurRepository.save(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── MODIFIER MOT DE PASSE
    @PutMapping("/{id}/mot-de-passe")
    public ResponseEntity<?> changerMotDePasse(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            String ancien = body.get("ancienMotDePasse");
            String nouveau = body.get("nouveauMotDePasse");

            if (!user.getMotDePasseHash().equals(ancien)) {
                return ResponseEntity.status(401).body("Ancien mot de passe incorrect");
            }
            if (nouveau == null || nouveau.length() < 6) {
                return ResponseEntity.badRequest().body("Le nouveau mot de passe doit faire au moins 6 caractères");
            }

            user.setMotDePasseHash(nouveau);
            return ResponseEntity.ok(utilisateurRepository.save(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // ── SUPPRIMER
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            utilisateurRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur suppression: " + e.getMessage());
        }
    }

    // ── LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email      = credentials.get("email");
            String motDePasse = credentials.get("motDePasse");

            Utilisateur user = utilisateurRepository.findByEmail(email).orElse(null);

            if (user == null)
                return ResponseEntity.status(401).body("Email introuvable");
            if (!user.getMotDePasseHash().equals(motDePasse))
                return ResponseEntity.status(401).body("Mot de passe incorrect");
            if (!user.isEstActif())
                return ResponseEntity.status(403).body("Compte désactivé");

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }
}