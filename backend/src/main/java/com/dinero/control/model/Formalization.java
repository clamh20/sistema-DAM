package com.dinero.control.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "formalizations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Formalization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String itemName;

    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;

    private String status; // Pending, Review, Approved, Rejected
    private String notes;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "accountant_id_assigned")
    private User accountant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = true)
    private User createdBy;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "formalization_files", joinColumns = @JoinColumn(name = "formalization_id"))
    @Column(name = "file_path", length = 510)
    private List<String> filePaths = new ArrayList<>();

    public Formalization() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public User getAccountant() { return accountant; }
    public void setAccountant(User accountant) { this.accountant = accountant; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<String> getFilePaths() { return filePaths; }
    public void setFilePaths(List<String> filePaths) { this.filePaths = filePaths; }
}
