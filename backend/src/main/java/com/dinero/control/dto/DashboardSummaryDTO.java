package com.dinero.control.dto;
import java.math.BigDecimal;

public class DashboardSummaryDTO {
    private long activeEventsCount;
    private long newEventsThisMonth;
    private BigDecimal totalFormalizations;
    private BigDecimal remainingBalance;

    public long getActiveEventsCount() { return activeEventsCount; }
    public void setActiveEventsCount(long activeEventsCount) { this.activeEventsCount = activeEventsCount; }
    public long getNewEventsThisMonth() { return newEventsThisMonth; }
    public void setNewEventsThisMonth(long newEventsThisMonth) { this.newEventsThisMonth = newEventsThisMonth; }
    public BigDecimal getTotalFormalizations() { return totalFormalizations; }
    public void setTotalFormalizations(BigDecimal totalFormalizations) { this.totalFormalizations = totalFormalizations; }
    public BigDecimal getRemainingBalance() { return remainingBalance; }
    public void setRemainingBalance(BigDecimal remainingBalance) { this.remainingBalance = remainingBalance; }
}
