package com.dinero.control.service;

import com.dinero.control.model.User;
import com.dinero.control.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public User create(User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setStatus("Active");
        return userRepository.save(user);
    }

    public User toggleStatus(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        if ("Active".equals(user.getStatus())) {
             user.setStatus("Inactive");
        } else {
             user.setStatus("Active");
        }
        return userRepository.save(user);
    }
}
