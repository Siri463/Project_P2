package com.revature.revtickets.service;

import com.revature.revtickets.dto.ShowDTO;
import com.revature.revtickets.entity.Event;
import com.revature.revtickets.entity.Movie;
import com.revature.revtickets.entity.Screen;
import com.revature.revtickets.entity.Show;
import com.revature.revtickets.entity.Venue;
import com.revature.revtickets.exception.BadRequestException;
import com.revature.revtickets.exception.ResourceNotFoundException;
import com.revature.revtickets.repository.EventRepository;
import com.revature.revtickets.repository.MovieRepository;
import com.revature.revtickets.repository.ScreenRepository;
import com.revature.revtickets.repository.ShowRepository;
import com.revature.revtickets.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ShowService {

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private VenueRepository venueRepository;
    
    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private SeatService seatService;

    public List<Show> getShowsByMovieId(Long movieId, LocalDate date) {
        return showRepository.findByMovieMovieIdAndShowDateAndIsActiveTrue(movieId, date);
    }
    
    public List<LocalDate> getAvailableDatesForMovie(Long movieId) {
        return showRepository.findDistinctShowDatesByMovieMovieIdAndIsActiveTrue(movieId);
    }

    public List<Show> getShowsByEventId(Long eventId, LocalDate date) {
        return showRepository.findByEventEventIdAndShowDateAndIsActiveTrue(eventId, date);
    }
    
    public List<LocalDate> getAvailableDatesForEvent(Long eventId) {
        return showRepository.findDistinctShowDatesByEventEventIdAndIsActiveTrue(eventId);
    }

    public List<Show> getShowsByVenueId(Long venueId, LocalDate date) {
        return showRepository.findByVenueVenueIdAndShowDateAndIsActiveTrue(venueId, date);
    }

    public Show getShowById(Long id) {
        return showRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + id));
    }

    public Show createShow(ShowDTO dto) {
        // Validate that either movie or event is provided
        if ((dto.getMovieId() == null && dto.getEventId() == null) || 
            (dto.getMovieId() != null && dto.getEventId() != null)) {
            throw new BadRequestException("Either movieId or eventId must be provided (but not both)");
        }

        Show show = new Show();
        
        if (dto.getMovieId() != null) {
            Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + dto.getMovieId()));
            show.setMovie(movie);
        }
        
        if (dto.getEventId() != null) {
            Event event = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + dto.getEventId()));
            show.setEvent(event);
        }

        Venue venue = venueRepository.findById(dto.getVenueId())
            .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + dto.getVenueId()));
        show.setVenue(venue);

        show.setShowDate(dto.getShowDate());
        show.setShowTime(dto.getShowTime());
        
        Screen screen = screenRepository.findById(dto.getScreenId())
            .orElseThrow(() -> new ResourceNotFoundException("Screen not found with id: " + dto.getScreenId()));
        show.setScreen(screen);
        
        show.setBasePrice(dto.getBasePrice());
        Integer totalSeats = screen.getTotalSeats();
        show.setTotalSeats(totalSeats);
        show.setAvailableSeats(totalSeats);

        Show savedShow = showRepository.save(show);
        
        // Auto-generate seats for the show based on screen seat layout
        try {
            // Parse seat layout from screen to get row and seat counts
            Map<String, Object> seatLayoutMap = screen.getSeatLayout();
            if (seatLayoutMap != null && !seatLayoutMap.isEmpty()) {
                // Parse rows from seat layout to get actual row count
                Object rowsObj = seatLayoutMap.get("rows");
                int totalRows = 10; // default
                int seatsPerRow = 26; // default
                
                if (rowsObj instanceof java.util.List) {
                    totalRows = ((java.util.List<?>) rowsObj).size();
                }
                
                // Parse seatsPerRow if available
                Object seatsPerRowObj = seatLayoutMap.get("seatsPerRow");
                if (seatsPerRowObj instanceof Map) {
                    Map<?, ?> seatsPerRowMap = (Map<?, ?>) seatsPerRowObj;
                    if (!seatsPerRowMap.isEmpty()) {
                        Object firstRowSeats = seatsPerRowMap.values().iterator().next();
                        if (firstRowSeats instanceof Number) {
                            seatsPerRow = ((Number) firstRowSeats).intValue();
                        }
                    }
                }
                
                seatService.generateSeatsForShow(savedShow.getShowId(), totalRows, seatsPerRow);
            }
        } catch (Exception e) {
            // Log error but don't fail show creation
            System.err.println("Failed to generate seats for show: " + e.getMessage());
            e.printStackTrace();
        }

        return savedShow;
    }

    public Show updateShow(Long id, ShowDTO dto) {
        Show show = getShowById(id);

        if (dto.getMovieId() != null) {
            Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found"));
            show.setMovie(movie);
            show.setEvent(null);
        }

        if (dto.getEventId() != null) {
            Event event = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
            show.setEvent(event);
            show.setMovie(null);
        }

        if (dto.getVenueId() != null) {
            Venue venue = venueRepository.findById(dto.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
            show.setVenue(venue);
        }

        show.setShowDate(dto.getShowDate());
        show.setShowTime(dto.getShowTime());
        
        if (dto.getScreenId() != null) {
            Screen screen = screenRepository.findById(dto.getScreenId())
                .orElseThrow(() -> new ResourceNotFoundException("Screen not found"));
            show.setScreen(screen);
            Integer totalSeats = screen.getTotalSeats();
            show.setTotalSeats(totalSeats);
        }
        
        show.setBasePrice(dto.getBasePrice());

        return showRepository.save(show);
    }

    public void deleteShow(Long id) {
        Show show = getShowById(id);
        show.setIsActive(false);
        showRepository.save(show);
    }

    public List<Show> getUpcomingShows() {
        return showRepository.findByShowDateAfterAndIsActiveTrue(LocalDate.now());
    }

    public Show softDeleteShow(Long id) {
        Show show = getShowById(id);
        show.setIsActive(false);
        return showRepository.save(show);
    }

    public Show activateShow(Long id) {
        Show show = getShowById(id);
        show.setIsActive(true);
        return showRepository.save(show);
    }
}
