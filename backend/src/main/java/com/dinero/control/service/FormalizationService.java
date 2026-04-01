package com.dinero.control.service;

import com.dinero.control.model.Formalization;
import com.dinero.control.model.Event;
import com.dinero.control.repository.FormalizationRepository;
import com.dinero.control.repository.EventRepository;
import com.dinero.control.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.math.BigDecimal;

@Service
public class FormalizationService {
    private final FormalizationRepository formalizationRepository;
    private final EventRepository eventRepository;
    private final FileStorageService fileStorageService;

    private final UserRepository userRepository;

    public FormalizationService(FormalizationRepository formalizationRepository, EventRepository eventRepository, FileStorageService fileStorageService, UserRepository userRepository) {
         this.formalizationRepository = formalizationRepository;
         this.eventRepository = eventRepository;
         this.fileStorageService = fileStorageService;
         this.userRepository = userRepository;
    }

    public List<Formalization> findAll() {
         return formalizationRepository.findAll();
    }

    public Formalization create(Formalization formalization) {
         if (formalization.getEvent() == null || formalization.getEvent().getId() == null) {
              throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe seleccionar un evento válido.");
         }
         
         Event realEvent = eventRepository.findById(formalization.getEvent().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evento no existe"));
         
         // Fix: Asignar usuario creador automáticamente para evitar error de base de datos
         if (formalization.getCreatedBy() == null) {
              userRepository.findByEmail("admin@controldinero.com").ifPresent(formalization::setCreatedBy);
         }

         // Verificar Saldo (Contabilidad Interconectada)
         BigDecimal alreadyFormalized = formalizationRepository.sumAmountByEventId(realEvent.getId());
         if (alreadyFormalized == null) alreadyFormalized = BigDecimal.ZERO;
         
         BigDecimal budget = realEvent.getAllocatedBudget() != null ? realEvent.getAllocatedBudget() : BigDecimal.ZERO;
         BigDecimal available = budget.subtract(alreadyFormalized);
         
         if (formalization.getAmount().compareTo(available) > 0) {
              throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "¡Presupuesto Excedido! El evento dispone de $" + available + " y usted intenta subir $" + formalization.getAmount());
         }

         formalization.setStatus("Pending");
         formalization.setEvent(realEvent);
         return formalizationRepository.save(formalization);
    }

    public Formalization changeStatus(Long id, String status) {
         Formalization form = formalizationRepository.findById(id).orElseThrow();
         form.setStatus(status);
         return formalizationRepository.save(form);
    }

    public Formalization uploadFiles(Long id, MultipartFile[] files) {
         Formalization formalization = formalizationRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Formalización no encontrada"));
         
         // Control del límite de 50 documentos por formalización
         int currentCount = formalization.getFilePaths().size();
         if (currentCount + files.length > 50) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Límite excedido: Esta formalización ya tiene " + currentCount + 
                " archivos de los 50 permitidos por norma.");
         }

         for (MultipartFile file : files) {
             String fileName = fileStorageService.storeFile(file);
             formalization.getFilePaths().add(fileName);
         }
         return formalizationRepository.save(formalization);
    }
}
