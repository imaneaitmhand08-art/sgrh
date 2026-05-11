package com.example.backend.controllers;

import com.example.backend.models.Sanction;
import com.example.backend.repositories.SanctionRepository;
import com.example.backend.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sanctions")
@CrossOrigin(origins = "http://localhost:3000")
public class SanctionController {

    @Autowired private SanctionRepository sanctionRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;

    @GetMapping
    public List<Sanction> getAll() { return sanctionRepository.findAll(); }

    @GetMapping("/employe/{id}")
    public List<Sanction> getByEmploye(@PathVariable Long id) {
        return sanctionRepository.findByEmployeId(id);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            Sanction s = new Sanction();
            Long employeId = Long.valueOf(body.get("employeId").toString());
            utilisateurRepository.findById(employeId).ifPresent(s::setEmploye);
            s.setTypeSanction((String) body.get("typeSanction"));
            s.setMotif((String) body.get("motif"));
            s.setDescription((String) body.get("description"));
            if (body.get("dateSanction") != null)
                s.setDateSanction(LocalDate.parse(body.get("dateSanction").toString()));
            else s.setDateSanction(LocalDate.now());
            s.setStatut("ACTIVE");
            return ResponseEntity.ok(sanctionRepository.save(s));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { sanctionRepository.deleteById(id); return ResponseEntity.ok().build(); }
        catch (Exception e) { return ResponseEntity.badRequest().body("Erreur: " + e.getMessage()); }
    }
}