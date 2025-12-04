package com.revature.revtickets.service;

import com.revature.revtickets.dto.BookingRequest;
import com.revature.revtickets.dto.BookingResponse;
import com.revature.revtickets.entity.*;
import com.revature.revtickets.exception.BadRequestException;
import com.revature.revtickets.exception.ResourceNotFoundException;
import com.revature.revtickets.repository.*;
import com.revature.revtickets.util.BookingReferenceGenerator;
import com.revature.revtickets.util.QRCodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingSeatRepository bookingSeatRepository;

    @Autowired
    private QRCodeGenerator qrCodeGenerator;

    @Autowired
    private BookingReferenceGenerator bookingReferenceGenerator;

    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Show show = showRepository.findById(request.getShowId())
            .orElseThrow(() -> new ResourceNotFoundException("Show not found"));

        // Validate seats
        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new BadRequestException("One or more seats not found");
        }

        // Check if any seat is already booked
        for (Seat seat : seats) {
            if (!seat.getIsAvailable()) {
                throw new BadRequestException("Seat " + seat.getRowLabel() + seat.getSeatNumber() + " is already booked");
            }
        }

        // Calculate total amount
        BigDecimal totalAmount = seats.stream()
            .map(Seat::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShow(show);
        booking.setBookingReference(bookingReferenceGenerator.generateBookingReference());
        booking.setTotalAmount(totalAmount);
        booking.setTotalSeats(seats.size());
        booking.setBookingStatus(Booking.BookingStatus.PENDING);

        booking = bookingRepository.save(booking);

        // Create booking seats
        for (Seat seat : seats) {
            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(booking);
            bookingSeat.setSeat(seat);
            bookingSeat.setSeatPrice(seat.getPrice());
            bookingSeatRepository.save(bookingSeat);

            // Mark seat as available = false
            seat.setIsAvailable(false);
            seatRepository.save(seat);
        }

        // Update available seats in show
        show.setAvailableSeats(show.getAvailableSeats() - seats.size());
        showRepository.save(show);

        // Generate QR code
        String qrCodeBase64 = "";
        try {
            String qrData = String.format("REV-%s-%s", booking.getBookingReference(), booking.getBookingId());
            qrCodeBase64 = qrCodeGenerator.generateQRCodeBase64(qrData, 300, 300);
            booking.setQrCodeBase64(qrCodeBase64);
            bookingRepository.save(booking);
        } catch (Exception e) {
            // Log error but don't fail the booking
            System.err.println("Failed to generate QR code: " + e.getMessage());
        }

        // Build response
        BookingResponse response = new BookingResponse();
        response.setBookingId(booking.getBookingId());
        response.setBookingReference(booking.getBookingReference());
        String showTitle = show.getMovie() != null ? show.getMovie().getTitle() : show.getEvent().getTitle();
        response.setShowTitle(showTitle);
        response.setVenueName(show.getVenue().getVenueName());
        String showDateTime = show.getShowDate() + " " + show.getShowTime();
        response.setShowDateTime(showDateTime);
        response.setTotalAmount(totalAmount);
        response.setStatus(booking.getBookingStatus().name());
        response.setQrCodeBase64(qrCodeBase64);
        response.setBookingDate(booking.getBookingDate());

        return response;
    }

    public List<Booking> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<Booking> bookings = bookingRepository.findByUserUserIdOrderByBookingDateDesc(user.getUserId());
        System.out.println("Fetched " + bookings.size() + " bookings for user: " + userEmail);
        return bookings;
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public Booking getBookingByReference(String reference) {
        return bookingRepository.findByBookingReference(reference)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + reference));
    }

    public void cancelBooking(Long bookingId, String userEmail) {
        Booking booking = getBookingById(bookingId);
        
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("You are not authorized to cancel this booking");
        }

        if ("CANCELLED".equals(booking.getBookingStatus())) {
            throw new BadRequestException("Booking is already cancelled");
        }

        // Release seats
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingId(bookingId);
        for (BookingSeat bookingSeat : bookingSeats) {
            Seat seat = bookingSeat.getSeat();
            seat.setIsAvailable(true);
            seatRepository.save(seat);
        }

        // Update show available seats
        Show show = booking.getShow();
        show.setAvailableSeats(show.getAvailableSeats() + booking.getTotalSeats());
        showRepository.save(show);

        // Update booking status
        booking.setBookingStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public void confirmBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        booking.setBookingStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
    }
}
