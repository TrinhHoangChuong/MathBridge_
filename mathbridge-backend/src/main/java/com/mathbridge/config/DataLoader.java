package com.mathbridge.config;

import com.mathbridge.entity.User;
import com.mathbridge.entity.UserRole;
import com.mathbridge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create demo users if they don't exist
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@mathbridge.com", 
                    passwordEncoder.encode("admin123"), "Admin", "User", UserRole.ADMIN);
            userRepository.save(admin);
        }
        
        if (!userRepository.existsByUsername("student1")) {
            User student = new User("student1", "student1@mathbridge.com", 
                    passwordEncoder.encode("student123"), "John", "Doe", UserRole.STUDENT);
            userRepository.save(student);
        }
        
        if (!userRepository.existsByUsername("tutor1")) {
            User tutor = new User("tutor1", "tutor1@mathbridge.com", 
                    passwordEncoder.encode("tutor123"), "Jane", "Smith", UserRole.TUTOR);
            userRepository.save(tutor);
        }
        
        System.out.println("Demo data loaded successfully!");
        System.out.println("Demo accounts:");
        System.out.println("Admin - Username: admin, Password: admin123");
        System.out.println("Student - Username: student1, Password: student123");
        System.out.println("Tutor - Username: tutor1, Password: tutor123");
    }
}
