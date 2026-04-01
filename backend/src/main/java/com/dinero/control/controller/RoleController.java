package com.dinero.control.controller;

import com.dinero.control.model.Role;
import com.dinero.control.repository.RoleRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {
    
    private final RoleRepository roleRepository;
    
    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
    
    @GetMapping
    public List<Role> getAllRoles() {
         return roleRepository.findAll();
    }
}
