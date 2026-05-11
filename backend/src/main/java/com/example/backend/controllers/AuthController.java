package com.example.backend.controllers;

import com.example.backend.models.Utilisateur;
import com.example.backend.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        String roleStr = loginData.get("role").toLowerCase(); // On convertit pour matcher l'enum

        Optional<Utilisateur> user = utilisateurRepository.findByEmail(email);

        if (user.isPresent() && 
            user.get().getMotDePasseHash().equals(password) && 
            user.get().getRole().toString().equals(roleStr)) {
            
            return ResponseEntity.ok(user.get()); // Connexion réussie
        }

        return ResponseEntity.status(401).body("Identifiants ou rôle incorrects");
    }
}