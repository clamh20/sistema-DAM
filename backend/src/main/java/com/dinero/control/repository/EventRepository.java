package com.dinero.control.repository;

import com.dinero.control.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
    long countByStatus(String status);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(e.allocatedBudget) FROM Event e")
    java.math.BigDecimal sumAllocatedBudget();
}
