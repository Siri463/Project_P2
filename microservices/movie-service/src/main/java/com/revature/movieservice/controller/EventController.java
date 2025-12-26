package com.revature.movieservice.controller;

import com.revature.movieservice.dto.ApiResponse;
import com.revature.movieservice.entity.Event;
import com.revature.movieservice.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Event>>> getAllEvents() {
        try {
            List<Event> events = eventService.getAllActiveEvents();
            return ResponseEntity.ok(new ApiResponse<>(true, "Events retrieved successfully", events));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Event>> getEventById(@PathVariable Long id) {
        try {
            Event event = eventService.getEventById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Event retrieved successfully", event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<Event>>> getUpcomingEvents() {
        try {
            List<Event> events = eventService.getUpcomingEvents();
            return ResponseEntity.ok(new ApiResponse<>(true, "Upcoming events retrieved", events));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<Event>>> getAdminEvents(@RequestParam(defaultValue = "false") boolean activeOnly) {
        try {
            List<Event> events = activeOnly ? eventService.getAllActiveEvents() : eventService.getAllEvents();
            return ResponseEntity.ok(new ApiResponse<>(true, "Events retrieved successfully", events));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<Event>> getAdminEventById(@PathVariable Long id) {
        try {
            Event event = eventService.getEventById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Event retrieved successfully", event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping(value = "/admin", consumes = {"application/json", "multipart/form-data"})
    public ResponseEntity<ApiResponse<Event>> createAdminEvent(@RequestBody Event event) {
        try {
            event.setIsActive(true);
            Event savedEvent = eventService.createEvent(event);
            return ResponseEntity.ok(new ApiResponse<>(true, "Event created successfully", savedEvent));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping(value = "/admin/{id}", consumes = {"application/json", "multipart/form-data"})
    public ResponseEntity<ApiResponse<Event>> updateAdminEvent(@PathVariable Long id, @RequestBody Event event) {
        try {
            Event updatedEvent = eventService.updateEvent(id, event);
            return ResponseEntity.ok(new ApiResponse<>(true, "Event updated successfully", updatedEvent));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAdminEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Event deactivated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/admin/{id}/activate")
    public ResponseEntity<ApiResponse<Event>> activateAdminEvent(@PathVariable Long id) {
        try {
            Event event = eventService.activateEvent(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Event activated successfully", event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
