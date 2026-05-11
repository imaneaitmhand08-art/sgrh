package com.example.backend.config;

import com.example.backend.models.Role;
import com.example.backend.models.Utilisateur;
import com.example.backend.repositories.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UtilisateurRepository repository) {
        return args -> {
            System.out.println("🚀 Initialisation des données...");
            
            // On vérifie si l'admin existe, sinon on le crée avec le bon Rôle en MAJUSCULES
            if (repository.findByEmail("admin@sgrh.com").isEmpty()) {
                Utilisateur admin = new Utilisateur();
                admin.setNom("Admin");
                admin.setPrenom("Système");
                admin.setEmail("admin@sgrh.com");
                admin.setMotDePasseHash("admin123");
                admin.setRole(Role.ADMIN); 
                admin.setEstActif(true);
                repository.save(admin);
                System.out.println("✅ Compte Admin créé");
            }
        };
    }
}