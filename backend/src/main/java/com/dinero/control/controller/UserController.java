package com.dinero.control.controller;

import com.dinero.control.model.User;
import com.dinero.control.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }
    
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.create(user);
    }
    
    @PatchMapping("/{id}/status")
    public User toggleStatus(@PathVariable Long id) {
        return userService.toggleStatus(id);
    }
}
