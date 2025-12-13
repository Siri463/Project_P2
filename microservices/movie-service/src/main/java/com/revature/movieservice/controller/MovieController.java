package com.revature.movieservice.controller;

import com.revature.movieservice.dto.ApiResponse;
import com.revature.movieservice.entity.Movie;
import com.revature.movieservice.service.MovieService;
import com.revature.movieservice.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    private MovieService movieService;
    
    @Autowired
    private FileService fileService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Movie>>> getAllMovies() {
        List<Movie> movies = movieService.getAllActiveMovies();
        return ResponseEntity.ok(new ApiResponse<>(true, "Movies retrieved successfully", movies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Movie>> getMovieById(@PathVariable Long id) {
        Movie movie = movieService.getMovieById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movie retrieved successfully", movie));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Movie>>> searchMovies(@RequestParam String title) {
        List<Movie> movies = movieService.searchMovies(title);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movies found", movies));
    }

    @GetMapping("/now-showing")
    public ResponseEntity<ApiResponse<List<Movie>>> getNowShowingMovies() {
        List<Movie> movies = movieService.getAllActiveMovies();
        return ResponseEntity.ok(new ApiResponse<>(true, "Now showing movies retrieved successfully", movies));
    }

    @GetMapping("/coming-soon")
    public ResponseEntity<ApiResponse<List<Movie>>> getComingSoonMovies() {
        List<Movie> movies = movieService.getAllActiveMovies();
        return ResponseEntity.ok(new ApiResponse<>(true, "Coming soon movies retrieved successfully", movies));
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<ApiResponse<List<Movie>>> getMoviesByGenre(@PathVariable String genre) {
        List<Movie> movies = movieService.getMoviesByGenre(genre);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movies by genre retrieved successfully", movies));
    }

    @GetMapping("/language/{language}")
    public ResponseEntity<ApiResponse<List<Movie>>> getMoviesByLanguage(@PathVariable String language) {
        List<Movie> movies = movieService.getMoviesByLanguage(language);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movies by language retrieved successfully", movies));
    }

    @GetMapping("/admin/count")
    public ResponseEntity<ApiResponse<Long>> getTotalMovies() {
        long count = movieService.getTotalMovies();
        return ResponseEntity.ok(new ApiResponse<>(true, "Movie count retrieved successfully", count));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<List<Movie>>> getAdminMovies(@RequestParam(defaultValue = "false") boolean activeOnly) {
        List<Movie> movies = activeOnly ? movieService.getAllActiveMovies() : movieService.getAllMovies();
        return ResponseEntity.ok(new ApiResponse<>(true, "Movies retrieved successfully", movies));
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<Movie>> getAdminMovieById(@PathVariable Long id) {
        Movie movie = movieService.getMovieById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Movie retrieved successfully", movie));
    }

    @PostMapping(value = "/admin", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Movie>> createAdminMovie(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String language,
            @RequestParam(value = "durationMinutes", required = false) String durationMinutes,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(required = false) String releaseDate,
            @RequestParam(required = false) String parentalRating,
            @RequestParam(required = false) String cast,
            @RequestParam(required = false) String crew,
            @RequestParam(required = false) String trailerUrl,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile displayImage,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile bannerImage,
            HttpServletRequest request) {
        try {
            // Validate required fields
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Title is required", null));
            }
            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Description is required", null));
            }
            if (genre == null || genre.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Genre is required", null));
            }
            if (language == null || language.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Language is required", null));
            }
            // Handle both durationMinutes and duration parameter names
            String durationValue = durationMinutes;
            if (durationValue == null || durationValue.trim().isEmpty()) {
                durationValue = duration;
            }
            if (durationValue == null || durationValue.trim().isEmpty()) {
                // Debug: log all parameters
                System.out.println("All parameters: " + request.getParameterMap().keySet());
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Duration is required", null));
            }
            if (releaseDate == null || releaseDate.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Release date is required", null));
            }
            if (parentalRating == null || parentalRating.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Parental rating is required", null));
            }
            
            Movie movie = new Movie();
            movie.setTitle(title.trim());
            movie.setDescription(description.trim());
            movie.setGenre(genre.trim());
            movie.setLanguage(language.trim());
            movie.setDurationMinutes(Integer.parseInt(durationValue));
            movie.setReleaseDate(java.time.LocalDate.parse(releaseDate));
            movie.setParentalRating(parentalRating.trim());
            movie.setCast(cast != null ? cast.trim() : null);
            movie.setCrew(crew != null ? crew.trim() : null);
            movie.setTrailerUrl(trailerUrl != null ? trailerUrl.trim() : null);
            
            // Handle file uploads
            if (displayImage != null && !displayImage.isEmpty()) {
                try {
                    String filename = fileService.saveDisplayImage(displayImage);
                    movie.setDisplayImageUrl("/display/" + filename);
                } catch (Exception e) {
                    System.err.println("Failed to save display image: " + e.getMessage());
                }
            }
            
            if (bannerImage != null && !bannerImage.isEmpty()) {
                try {
                    String filename = fileService.saveBannerImage(bannerImage);
                    movie.setBannerImageUrl("/banner/" + filename);
                } catch (Exception e) {
                    System.err.println("Failed to save banner image: " + e.getMessage());
                }
            }
            
            movie.setIsActive(true);
            
            Movie savedMovie = movieService.createMovie(movie);
            return ResponseEntity.ok(new ApiResponse<>(true, "Movie created successfully", savedMovie));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid duration format", null));
        } catch (java.time.format.DateTimeParseException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid date format. Use YYYY-MM-DD", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Failed to create movie: " + e.getMessage(), null));
        }
    }

    @PutMapping(value = "/admin/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Movie>> updateAdminMovie(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String language,
            @RequestParam(value = "durationMinutes", required = false) String durationMinutes,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(required = false) String releaseDate,
            @RequestParam(required = false) String parentalRating,
            @RequestParam(required = false) String cast,
            @RequestParam(required = false) String crew,
            @RequestParam(required = false) String trailerUrl,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile displayImage,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile bannerImage) {
        try {
            Movie movie = movieService.getMovieById(id);
            
            if (title != null && !title.trim().isEmpty()) movie.setTitle(title.trim());
            if (description != null && !description.trim().isEmpty()) movie.setDescription(description.trim());
            if (genre != null && !genre.trim().isEmpty()) movie.setGenre(genre.trim());
            if (language != null && !language.trim().isEmpty()) movie.setLanguage(language.trim());
            
            String durationValue = durationMinutes != null ? durationMinutes : duration;
            if (durationValue != null && !durationValue.trim().isEmpty()) {
                movie.setDurationMinutes(Integer.parseInt(durationValue));
            }
            
            if (releaseDate != null && !releaseDate.trim().isEmpty()) {
                movie.setReleaseDate(java.time.LocalDate.parse(releaseDate));
            }
            if (parentalRating != null && !parentalRating.trim().isEmpty()) movie.setParentalRating(parentalRating.trim());
            if (cast != null) movie.setCast(cast.trim());
            if (crew != null) movie.setCrew(crew.trim());
            if (trailerUrl != null) movie.setTrailerUrl(trailerUrl.trim());
            
            // Handle file uploads
            if (displayImage != null && !displayImage.isEmpty()) {
                try {
                    String filename = fileService.saveDisplayImage(displayImage);
                    movie.setDisplayImageUrl("/display/" + filename);
                } catch (Exception e) {
                    System.err.println("Failed to save display image: " + e.getMessage());
                }
            }
            
            if (bannerImage != null && !bannerImage.isEmpty()) {
                try {
                    String filename = fileService.saveBannerImage(bannerImage);
                    movie.setBannerImageUrl("/banner/" + filename);
                } catch (Exception e) {
                    System.err.println("Failed to save banner image: " + e.getMessage());
                }
            }
            
            Movie updatedMovie = movieService.updateMovie(id, movie);
            return ResponseEntity.ok(new ApiResponse<>(true, "Movie updated successfully", updatedMovie));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAdminMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Movie deactivated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/admin/{id}/activate")
    public ResponseEntity<ApiResponse<Movie>> activateAdminMovie(@PathVariable Long id) {
        try {
            Movie movie = movieService.activateMovie(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Movie activated successfully", movie));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/display/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> getDisplayImage(@PathVariable String filename) {
        try {
            org.springframework.core.io.Resource resource = fileService.loadDisplayImage(filename);
            return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/banner/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> getBannerImage(@PathVariable String filename) {
        try {
            org.springframework.core.io.Resource resource = fileService.loadBannerImage(filename);
            return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
