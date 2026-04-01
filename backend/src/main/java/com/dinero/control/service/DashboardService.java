package com.dinero.control.service;

import com.dinero.control.dto.DashboardSummaryDTO;
import com.dinero.control.repository.EventRepository;
import com.dinero.control.repository.FormalizationRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class DashboardService {
    private final EventRepository eventRepository;
    private final FormalizationRepository formalizationRepository;

    public DashboardService(EventRepository eventRepository, FormalizationRepository formalizationRepository) {
        this.eventRepository = eventRepository;
        this.formalizationRepository = formalizationRepository;
    }

    public DashboardSummaryDTO getSummary() {
        DashboardSummaryDTO dto = new DashboardSummaryDTO();
        dto.setActiveEventsCount(eventRepository.countByStatus("Active") + eventRepository.countByStatus("Approved") + eventRepository.countByStatus("Created"));
        dto.setNewEventsThisMonth(eventRepository.count());
        
        BigDecimal totalFormalized = formalizationRepository.sumApprovedAmounts();
        if (totalFormalized == null) totalFormalized = BigDecimal.ZERO;
        dto.setTotalFormalizations(totalFormalized);
        
        BigDecimal totalBudget = eventRepository.sumAllocatedBudget();
        if (totalBudget == null) totalBudget = BigDecimal.ZERO;
        
        dto.setRemainingBalance(totalBudget.subtract(totalFormalized));
        
        return dto;
    }
}
