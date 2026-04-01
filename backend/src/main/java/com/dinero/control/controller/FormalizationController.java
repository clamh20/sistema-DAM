package com.dinero.control.controller;

import com.dinero.control.model.Formalization;
import com.dinero.control.service.FormalizationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/v1/formalizations")
public class FormalizationController {
    private final FormalizationService formalizationService;

    public FormalizationController(FormalizationService formalizationService) {
        this.formalizationService = formalizationService;
    }

    @GetMapping
    public List<Formalization> getFormalizations() {
        return formalizationService.findAll();
    }

    @PostMapping
    public Formalization create(@RequestBody Formalization formalization) {
        return formalizationService.create(formalization);
    }

    @PatchMapping("/{id}/status")
    public Formalization changeStatus(@PathVariable Long id, @RequestParam String status) {
        return formalizationService.changeStatus(id, status);
    }

    @PostMapping("/{id}/upload")
    public Formalization uploadFiles(@PathVariable Long id, @RequestParam("files") MultipartFile[] files) {
        return formalizationService.uploadFiles(id, files);
    }
}
