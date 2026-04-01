package com.dinero.control.config;

import com.dinero.control.model.Role;
import com.dinero.control.model.User;
import com.dinero.control.repository.RoleRepository;
import com.dinero.control.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Inicializar Roles requeridos
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role("SUPER_ADMIN", "Acceso total al sistema y usuarios"));
            roleRepository.save(new Role("CONTADOR", "Visualizar movimientos y gestionar recursos"));
            roleRepository.save(new Role("APOYO_CONTABLE", "Revisión y validación financiera"));
            roleRepository.save(new Role("COORDINADOR", "Aprobación de eventos de Área"));
            roleRepository.save(new Role("DELEGACION", "Gestión de eventos y formalizaciones"));
        }

        // Sembrar el usuario super administrador base
        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName("SUPER_ADMIN").orElseThrow();
            
            User admin = new User();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setEmail("admin@controldinero.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(adminRole);
            admin.setStatus("Active");

            userRepository.save(admin);
            System.out.println("=========================================================");
            System.out.println("=== USUARIO ADMIN SEMBRADO: admin@controldinero.com ===");
            System.out.println("=== PASSWORD: admin123                                ===");
            System.out.println("=========================================================");
        }
    }
}
