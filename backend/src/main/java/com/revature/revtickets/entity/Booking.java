package com.revature.revtickets.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_user", columnList = "user_id"),
    @Index(name = "idx_booking_reference", columnList = "booking_reference"),
    @Index(name = "idx_status", columnList = "booking_status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"bookings", "password"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "show_id", nullable = true)
    @JsonIgnoreProperties({"bookings", "seats", "screen", "venue"})
    private Show show;
    
    @ManyToOne
    @JoinColumn(name = "open_show_id", nullable = true)
    @JsonIgnoreProperties({"bookings"})
    private OpenEventShow openEventShow;

    @Column(name = "booking_reference", unique = true, nullable = false, length = 50)
    private String bookingReference;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false)
    private BookingStatus bookingStatus = BookingStatus.PENDING;
    
    @Column(name = "payment_status", length = 20)
    private String paymentStatus = "PENDING"; // PENDING, PAID, FAILED, REFUNDED
    
    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;
    
    @Column(name = "razorpay_payment_id", length = 100)
    private String razorpayPaymentId;
    
    @Column(name = "razorpay_signature", length = 100)
    private String razorpaySignature;
    
    // Booking seats (for regular shows) - stored in `booking_seats` table via BookingSeat entity
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"booking", "seat"})
    private List<BookingSeat> bookingSeats;
    
    @Column(name = "zone_bookings", columnDefinition = "JSON")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private List<ZoneBooking> zoneBookings; // For open event shows

    @Column(name = "qr_code_url", length = 500)
    private String qrCodeUrl;

    @Column(name = "qr_code_base64", columnDefinition = "TEXT")
    private String qrCodeBase64;

    @CreationTimestamp
    @Column(name = "booking_date", updatable = false)
    private LocalDateTime bookingDate;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoneBooking {
        private String zoneName;
        private Integer quantity;
        private BigDecimal pricePerTicket;
    }
}
