package com.dinero.control.repository;

import com.dinero.control.model.Formalization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;

import org.springframework.data.repository.query.Param;

public interface FormalizationRepository extends JpaRepository<Formalization, Long> {
    @Query("SELECT SUM(f.amount) FROM Formalization f WHERE f.status = 'Approved'")
    BigDecimal sumApprovedAmounts();

    @Query("SELECT SUM(f.amount) FROM Formalization f WHERE f.event.id = :eventId AND f.status != 'Rejected'")
    BigDecimal sumAmountByEventId(@Param("eventId") Long eventId);
}
