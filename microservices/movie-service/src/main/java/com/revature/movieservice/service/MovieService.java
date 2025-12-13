package com.revature.movieservice.service;

import com.revature.movieservice.entity.Movie;
import com.revature.movieservice.exception.ResourceNotFoundException;
import com.revature.movieservice.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public List<Movie> getAllActiveMovies() {
        return movieRepository.findByIsActiveTrue();
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
    }

    public List<Movie> searchMovies(String title) {
        return movieRepository.findByTitleContainingIgnoreCaseAndIsActiveTrue(title);
    }

    public Movie activateMovie(Long id) {
        Movie movie = getMovieById(id);
        movie.setIsActive(true);
        return movieRepository.save(movie);
    }

    public Movie createMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Movie updateMovie(Long id, Movie movieDetails) {
        Movie movie = getMovieById(id);
        movie.setTitle(movieDetails.getTitle());
        movie.setDescription(movieDetails.getDescription());
        movie.setGenre(movieDetails.getGenre());
        movie.setLanguage(movieDetails.getLanguage());
        movie.setDurationMinutes(movieDetails.getDurationMinutes());
        movie.setReleaseDate(movieDetails.getReleaseDate());
        movie.setParentalRating(movieDetails.getParentalRating());
        movie.setCast(movieDetails.getCast());
        movie.setCrew(movieDetails.getCrew());
        movie.setTrailerUrl(movieDetails.getTrailerUrl());
        movie.setRating(movieDetails.getRating());
        return movieRepository.save(movie);
    }

    public void deleteMovie(Long id) {
        Movie movie = getMovieById(id);
        movie.setIsActive(false);
        movieRepository.save(movie);
    }

    public List<Movie> getMoviesByGenre(String genre) {
        return movieRepository.findByGenreContainingIgnoreCaseAndIsActiveTrue(genre);
    }

    public List<Movie> getMoviesByLanguage(String language) {
        return movieRepository.findByLanguageAndIsActiveTrue(language);
    }

    public List<Movie> getNowShowingMovies() {
        return movieRepository.findByIsActiveTrue();
    }

    public List<Movie> getComingSoonMovies() {
        return movieRepository.findByIsActiveTrue();
    }

    public long getTotalMovies() {
        return movieRepository.count();
    }
}
