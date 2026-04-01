package com.dinero.control.service;

import com.dinero.control.model.Event;
import com.dinero.control.repository.EventRepository;
import com.dinero.control.repository.UserRepository;
import com.dinero.control.repository.FormalizationRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.math.BigDecimal;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final FormalizationRepository formalizationRepository;

    public EventService(EventRepository eventRepository, UserRepository userRepository, FormalizationRepository formalizationRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.formalizationRepository = formalizationRepository;
    }

    public List<Event> findAll() {
        List<Event> events = eventRepository.findAll();
        for (Event event : events) {
             BigDecimal formalized = formalizationRepository.sumAmountByEventId(event.getId());
             if (formalized == null) formalized = BigDecimal.ZERO;
             
             event.setFormalizedAmount(formalized);
             BigDecimal budget = event.getAllocatedBudget() != null ? event.getAllocatedBudget() : BigDecimal.ZERO;
             event.setRemainingBalance(budget.subtract(formalized));
        }
        return events;
    }

    public Event createEvent(Event event) {
        event.setStatus("Created");
        if (event.getCoordinator() != null && event.getCoordinator().getId() != null) {
            event.setCoordinator(userRepository.findById(event.getCoordinator().getId()).orElse(null));
        }
        if (event.getDelegationUser() != null && event.getDelegationUser().getId() != null) {
            event.setDelegationUser(userRepository.findById(event.getDelegationUser().getId()).orElse(null));
        }
        return eventRepository.save(event);
    }

    public Event approveEvent(Long id) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setStatus("Approved");
        return eventRepository.save(event);
    }
}
