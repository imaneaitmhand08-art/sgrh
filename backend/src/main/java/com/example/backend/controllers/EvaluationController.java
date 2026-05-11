package com.example.backend.controllers;

import com.example.backend.models.Evaluation;
import com.example.backend.models.Utilisateur;
import com.example.backend.repositories.EvaluationRepository;
import com.example.backend.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin(origins = "http://localhost:3000")
public class EvaluationController {

    @Autowired private EvaluationRepository evaluationRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;

    @GetMapping
    public List<Evaluation> getAll() {
        return evaluationRepository.findAll();
    }

    @GetMapping("/employe/{id}")
    public List<Evaluation> getByEmploye(@PathVariable Long id) {
        return evaluationRepository.findByEmployeId(id);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Evaluation eval = new Evaluation();
            Long employeId = Long.valueOf(body.get("employeId").toString());
            Long evaluateurId = Long.valueOf(body.get("evaluateurId").toString());
            utilisateurRepository.findById(employeId).ifPresent(eval::setEmploye);
            utilisateurRepository.findById(evaluateurId).ifPresent(eval::setEvaluateur);
            eval.setPeriode((String) body.get("periode"));
            eval.setObjectifs((String) body.get("objectifs"));
            eval.setCommentaire((String) body.get("commentaire"));
            if (body.get("noteGlobale") != null)
                eval.setNoteGlobale(Integer.valueOf(body.get("noteGlobale").toString()));
            if (body.get("dateEvaluation") != null)
                eval.setDateEvaluation(LocalDate.parse(body.get("dateEvaluation").toString()));
            eval.setStatut("EN_COURS");
            return ResponseEntity.ok(evaluationRepository.save(eval));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Evaluation eval = evaluationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Non trouvé"));
            if (body.get("noteGlobale") != null)
                eval.setNoteGlobale(Integer.valueOf(body.get("noteGlobale").toString()));
            if (body.get("objectifs") != null) eval.setObjectifs((String) body.get("objectifs"));
            if (body.get("commentaire") != null) eval.setCommentaire((String) body.get("commentaire"));
            if (body.get("statut") != null) eval.setStatut((String) body.get("statut"));
            return ResponseEntity.ok(evaluationRepository.save(eval));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { evaluationRepository.deleteById(id); return ResponseEntity.ok().build(); }
        catch (Exception e) { return ResponseEntity.badRequest().body("Erreur: " + e.getMessage()); }
    }
}