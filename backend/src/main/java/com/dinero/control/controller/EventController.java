package com.dinero.control.controller;

import com.dinero.control.model.Event;
import com.dinero.control.service.EventService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {
    private final EventService eventService;

    public EventController(EventService eventService) {
         this.eventService = eventService;
    }

    @GetMapping
    public List<Event> getEvents() {
        return eventService.findAll();
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return eventService.createEvent(event);
    }

    @PatchMapping("/{id}/approve")
    public Event approveEvent(@PathVariable Long id) {
        return eventService.approveEvent(id);
    }
}
