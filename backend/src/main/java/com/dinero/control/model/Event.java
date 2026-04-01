package com.dinero.control.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "events")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String city;
    private LocalDate eventDate;
    
    @Column(nullable = false)
    private String projectCode;
    
    private String eventType;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal allocatedBudget;
    
    private String incomeBag;
    private String status; // Created, Approved, Active, Closed

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "delegation_id")
    private User delegationUser; // Simplified mapping of delegation creator to User
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coordinator_id")
    private User coordinator;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Transient
    private BigDecimal formalizedAmount = BigDecimal.ZERO;

    @Transient
    private BigDecimal remainingBalance = BigDecimal.ZERO;

    public Event() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public BigDecimal getAllocatedBudget() { return allocatedBudget; }
    public void setAllocatedBudget(BigDecimal allocatedBudget) { this.allocatedBudget = allocatedBudget; }
    public String getIncomeBag() { return incomeBag; }
    public void setIncomeBag(String incomeBag) { this.incomeBag = incomeBag; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getDelegationUser() { return delegationUser; }
    public void setDelegationUser(User delegationUser) { this.delegationUser = delegationUser; }
    public User getCoordinator() { return coordinator; }
    public void setCoordinator(User coordinator) { this.coordinator = coordinator; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public BigDecimal getFormalizedAmount() { return formalizedAmount; }
    public void setFormalizedAmount(BigDecimal formalizedAmount) { this.formalizedAmount = formalizedAmount; }
    public BigDecimal getRemainingBalance() { return remainingBalance; }
    public void setRemainingBalance(BigDecimal remainingBalance) { this.remainingBalance = remainingBalance; }
}
