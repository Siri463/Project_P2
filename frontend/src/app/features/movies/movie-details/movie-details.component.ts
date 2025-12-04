import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#050505] text-white" *ngIf="movie">
      <!-- Hero Section with Banner Background -->
      <div class="relative">
        <!-- Banner Background -->
        <div class="absolute inset-0 h-[500px] overflow-hidden">
          <img 
            [src]="getImageUrl(movie.bannerImageUrl || movie.displayImageUrl)" 
            [alt]="movie.title"
            class="w-full h-full object-cover opacity-70 scale-110"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-[#050505]/20 via-[#050505]/40 to-[#050505]"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-[#050505]/30 via-transparent to-transparent"></div>
        </div>

        <!-- Content -->
        <div class="relative pt-20">
          <div class="container mx-auto px-4 py-8">
            <!-- Back Button -->
            <button (click)="goBack()" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back
            </button>

            <!-- Movie Info Section -->
            <div class="flex flex-col lg:flex-row gap-8 mb-12">
              <!-- Poster -->
              <div class="flex-shrink-0">
                <div class="relative w-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img 
                    [src]="getImageUrl(movie.displayImageUrl)" 
                    [alt]="movie.title"
                    class="w-full h-auto object-cover"
                  />
                  <div class="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-center py-2 text-sm">
                    In cinemas
                  </div>
                </div>
              </div>

              <!-- Movie Details -->
              <div class="flex-1">
                <h1 class="text-4xl lg:text-5xl font-bold mb-4">{{ movie.title }}</h1>
                
                <!-- Rating -->
                <div class="flex items-center gap-4 mb-4">
                  <div class="flex items-center gap-2" *ngIf="averageRating > 0">
                    <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span class="text-2xl font-bold">{{ averageRating }}/10</span>
                    <span class="text-gray-400">({{ totalReviews }}+ Votes)</span>
                  </div>
                  <div *ngIf="averageRating === 0" class="text-gray-400">No ratings yet</div>
                  <button (click)="showRatingModal = true" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">
                    Rate now
                  </button>
                </div>
                
                <!-- Meta Info -->
                <div class="flex flex-wrap gap-3 items-center text-sm mb-6">
                  <span class="px-3 py-1 bg-gray-800 rounded text-gray-300">{{ movie.durationMinutes }} min</span>
                  <span>•</span>
                  <span>{{ movie.genre }}</span>
                  <span>•</span>
                  <span>{{ movie.parentalRating }}</span>
                  <span>•</span>
                  <span>{{ movie.releaseDate | date:'dd MMM, yyyy' }}</span>
                </div>

                <!-- Tags -->
                <div class="flex gap-2 mb-6">
                  <span class="px-3 py-1 bg-gray-800 rounded-lg text-sm">2D</span>
                  <span class="px-3 py-1 bg-gray-800 rounded-lg text-sm">{{ movie.language }}</span>
                </div>

                <!-- Book Tickets Button -->
                <button 
                  *ngIf="!checkingShows && hasShows"
                  (click)="selectShow()" 
                  class="w-full md:w-auto px-12 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg">
                  Book tickets
                </button>
                
                <div 
                  *ngIf="!checkingShows && !hasShows"
                  class="w-full md:w-auto px-12 py-4 bg-gray-700 text-gray-400 rounded-xl font-bold text-lg text-center cursor-not-allowed">
                  No Shows Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="container mx-auto px-4 pb-16">
        <!-- About the movie -->
        <section class="mb-12">
          <h2 class="text-2xl font-bold mb-4">About the movie</h2>
          <p class="text-gray-300 text-lg leading-relaxed">{{ movie.description }}</p>
        </section>

        <!-- Cast -->
        <section class="mb-12" *ngIf="movie.cast">
          <h2 class="text-2xl font-bold mb-4">Cast</h2>
          <p class="text-gray-300">{{ movie.cast }}</p>
        </section>

        <!-- Crew -->
        <section class="mb-12" *ngIf="movie.crew">
          <h2 class="text-2xl font-bold mb-4">Crew</h2>
          <p class="text-gray-300">{{ movie.crew }}</p>
        </section>

        <!-- Trailer Section -->
        <section *ngIf="movie.trailerUrl" class="mb-12">
          <h2 class="text-2xl font-bold mb-4">Trailer</h2>
          <div class="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-w-4xl" style="padding-bottom: 56.25%;">
            <iframe 
              [src]="getTrailerUrl(movie.trailerUrl)" 
              class="absolute top-0 left-0 w-full h-full"
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
        </section>

        <!-- Reviews Section -->
        <section class="mb-12">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold">Reviews</h2>
            <button (click)="toggleReviews()" class="text-red-500 hover:underline" *ngIf="reviews.length > 0">
              {{ showAllReviewsFlag ? 'Show less' : (reviews.length > 6 ? 'Show all ' + reviews.length + ' reviews >' : reviews.length + ' reviews') }}
            </button>
          </div>

          <!-- Loading -->
          <div *ngIf="loadingReviews" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
          </div>

          <!-- No Reviews -->
          <div *ngIf="!loadingReviews && reviews.length === 0" class="text-center py-8">
            <p class="text-gray-400">No reviews yet. Be the first to review!</p>
          </div>

          <!-- Reviews List -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" *ngIf="!loadingReviews && reviews.length > 0">
            <div *ngFor="let review of showAllReviewsFlag ? reviews : reviews.slice(0, 6)" class="bg-[#121212] rounded-xl p-6 border border-white/5">
              <!-- User Info -->
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <span class="text-lg font-bold">{{ review.userName?.charAt(0)?.toUpperCase() || 'A' }}</span>
                </div>
                <div class="flex-1">
                  <p class="font-semibold">{{ review.userName || 'Anonymous' }}</p>
                  <p class="text-xs text-gray-400">{{ review.createdAt | date:'dd MMM yyyy' }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span class="font-bold">{{ review.rating }}/10</span>
                </div>
              </div>

              <!-- Review Text -->
              <p class="text-gray-300 text-sm" *ngIf="review.comment">{{ review.comment }}</p>
              <p class="text-gray-400 text-sm italic" *ngIf="!review.comment">No review text provided</p>

              <!-- Tags -->
              <div class="flex gap-2 mt-3 flex-wrap" *ngIf="review.tags && review.tags.length > 0">
                <span *ngFor="let tag of review.tags" class="text-xs px-2 py-1 bg-red-900/20 text-red-400 rounded">
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Rating Modal -->
    <div *ngIf="showRatingModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" (click)="showRatingModal = false">
      <div class="bg-[#1a1a1a] rounded-2xl p-8 max-w-md w-full border border-white/10" (click)="$event.stopPropagation()">
        <h3 class="text-2xl font-bold mb-6">Rate this movie</h3>
        
        <div class="mb-6">
          <label class="block mb-2">Your Rating</label>
          <div class="flex gap-2">
            <button *ngFor="let star of [1,2,3,4,5,6,7,8,9,10]" 
              (click)="userRating = star"
              [class]="userRating >= star ? 'bg-red-600' : 'bg-gray-700'"
              class="w-10 h-10 rounded-lg hover:bg-red-500 transition-colors font-bold">
              {{star}}
            </button>
          </div>
        </div>

        <div class="mb-6">
          <label class="block mb-2">Review (optional)</label>
          <textarea [(ngModel)]="userReview" rows="4" 
            class="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
            placeholder="Share your thoughts..."></textarea>
        </div>

        <div class="flex gap-3">
          <button (click)="showRatingModal = false" class="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            Cancel
          </button>
          <button (click)="submitRating()" [disabled]="!userRating" 
            class="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors">
            Submit
          </button>
        </div>
      </div>
    </div>
  `
})
export class MovieDetailsComponent implements OnInit {
  movie: any;
  movieId!: number;
  hasShows = false;
  checkingShows = true;
  reviews: any[] = [];
  loadingReviews = false;
  averageRating = 0;
  totalReviews = 0;
  showRatingModal = false;
  userRating = 0;
  userReview = '';
  showAllReviewsFlag = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.movieId = +this.route.snapshot.paramMap.get('id')!;
    this.loadMovie();
    this.checkShowsAvailability();
    this.loadReviews();
  }

  loadMovie() {
    this.http.get<any>(`${environment.apiUrl}/movies/${this.movieId}`).subscribe({
      next: (response) => {
        this.movie = response.data;
      }
    });
  }

  checkShowsAvailability() {
    // Check if there are any upcoming show dates for this movie
    this.http.get<any>(`${environment.apiUrl}/shows/movie/${this.movieId}/dates`).subscribe({
      next: (response) => {
        this.hasShows = response.data && response.data.length > 0;
        this.checkingShows = false;
      },
      error: () => {
        this.hasShows = false;
        this.checkingShows = false;
      }
    });
  }

  loadReviews() {
    this.loadingReviews = true;
    // TODO: Replace with actual MongoDB endpoint when ready
    // For now, using mock data structure
    this.http.get<any>(`${environment.apiUrl}/reviews/movie/${this.movieId}`).subscribe({
      next: (response) => {
        this.reviews = response.data || [];
        this.calculateAverageRating();
        this.loadingReviews = false;
      },
      error: () => {
        this.reviews = [];
        this.averageRating = 0;
        this.totalReviews = 0;
        this.loadingReviews = false;
      }
    });
  }

  calculateAverageRating() {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      this.totalReviews = 0;
      return;
    }
    
    const sum = this.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    this.averageRating = parseFloat((sum / this.reviews.length).toFixed(1));
    this.totalReviews = this.reviews.length;
  }

  getImageUrl(path: string): string {
    if (!path) return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path}`;
  }

  getTrailerUrl(url: string): SafeResourceUrl {
    // Convert YouTube URL to embed format if needed
    let embedUrl = url;
    
    // Handle youtube.com/watch?v= format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle youtu.be/ format
    else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    // If already embed format or other video platform, use as is
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  selectShow() {
    this.router.navigate(['/bookings/select-show'], { 
      queryParams: { movieId: this.movieId } 
    });
  }

  goBack() {
    this.router.navigate(['/movies']);
  }

  toggleReviews() {
    this.showAllReviewsFlag = !this.showAllReviewsFlag;
  }

  submitRating() {
    if (!this.userRating) return;

    const review = {
      movieId: this.movieId,
      rating: this.userRating,
      comment: this.userReview?.trim() || null,
      reviewType: 'MOVIE'
    };

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.post<any>(`${environment.apiUrl}/reviews`, review, { headers }).subscribe({
      next: () => {
        this.showRatingModal = false;
        this.userRating = 0;
        this.userReview = '';
        this.loadReviews();
      },
      error: (err) => {
        console.error('Error submitting rating:', err);
        alert('Failed to submit rating. Please try again.');
      }
    });
  }
}
