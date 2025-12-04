package com.revature.revtickets.repository;

import com.revature.revtickets.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {
    List<Show> findByMovieMovieIdAndIsActiveTrue(Long movieId);
    List<Show> findByMovieMovieIdAndShowDateAndIsActiveTrue(Long movieId, LocalDate showDate);
    List<Show> findByEventEventIdAndIsActiveTrue(Long eventId);
    List<Show> findByEventEventIdAndShowDateAndIsActiveTrue(Long eventId, LocalDate showDate);
    List<Show> findByVenueVenueIdAndShowDateAndIsActiveTrue(Long venueId, LocalDate showDate);
    List<Show> findByShowDateAfterAndIsActiveTrue(LocalDate date);
    
    @Query("SELECT DISTINCT s.showDate FROM Show s WHERE s.movie.movieId = :movieId AND s.isActive = true ORDER BY s.showDate")
    List<LocalDate> findDistinctShowDatesByMovieMovieIdAndIsActiveTrue(Long movieId);
    
    @Query("SELECT DISTINCT s.showDate FROM Show s WHERE s.event.eventId = :eventId AND s.isActive = true ORDER BY s.showDate")
    List<LocalDate> findDistinctShowDatesByEventEventIdAndIsActiveTrue(Long eventId);
    
    @Query("SELECT s FROM Show s WHERE s.showDate >= :date AND s.isActive = true ORDER BY s.showDate, s.showTime")
    List<Show> findUpcomingShows(LocalDate date);
}
