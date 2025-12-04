import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-select-show',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#050505] text-white pt-20 pb-16">
      <div class="container mx-auto px-4">
        <!-- Back Button -->
        <button (click)="goBack()" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back
        </button>

        <!-- Movie Info -->
        <div *ngIf="movie" class="mb-8">
          <h1 class="text-4xl font-bold mb-2">{{ movie.title }}</h1>
          <div class="flex gap-3">
            <span class="px-3 py-1 bg-gray-800 rounded-lg text-sm">{{ movie.genre }}</span>
            <span class="px-3 py-1 bg-gray-800 rounded-lg text-sm">{{ movie.durationMinutes }} min</span>
            <span class="px-3 py-1 bg-gray-800 rounded-lg text-sm">{{ movie.language }}</span>
          </div>
        </div>

        <!-- Date Selection -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Select Date</h2>
          <div class="flex gap-3 overflow-x-auto pb-2">
            <button 
              *ngFor="let date of dates"
              (click)="selectDate(date)"
              [class]="selectedDate === date ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'"
              class="px-6 py-3 rounded-xl min-w-[120px] transition-all">
              <div class="text-sm text-gray-400">{{ date | date:'EEE' }}</div>
              <div class="text-lg font-bold">{{ date | date:'MMM d' }}</div>
            </button>
          </div>
        </div>

        <!-- Shows by Venue -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          <p class="mt-4 text-gray-400">Loading shows...</p>
        </div>

        <div *ngIf="!loading && shows.length === 0" class="text-center py-12">
          <svg class="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
          </svg>
          <h3 class="text-2xl font-bold mb-2">No Shows Available</h3>
          <p class="text-gray-400">There are no shows scheduled for this date. Please try another date.</p>
        </div>

        <div *ngIf="!loading && shows.length > 0">
          <div *ngFor="let venueGroup of groupedShows" class="mb-8 bg-[#121212] rounded-2xl p-6 border border-white/5">
            <h3 class="text-xl font-bold mb-4">{{ venueGroup.venueName }}</h3>
            <p class="text-gray-400 text-sm mb-4">{{ venueGroup.venueCity }}</p>
            
            <div class="flex flex-wrap gap-3">
              <button 
                *ngFor="let show of venueGroup.shows"
                (click)="selectShow(show)"
                class="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border border-white/10 hover:border-red-600">
                <div class="text-lg font-bold">{{ formatShowTime(show.showTime) }}</div>
                <div class="text-sm text-green-400 mt-1">₹{{ show.basePrice }}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SelectShowComponent implements OnInit {
  movieId!: number;
  eventId!: number;
  movie: any;
  event: any;
  dates: Date[] = [];
  selectedDate!: Date;
  shows: any[] = [];
  groupedShows: any[] = [];
  loading = false;
  isEvent = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const movieIdParam = this.route.snapshot.queryParamMap.get('movieId');
    const eventIdParam = this.route.snapshot.queryParamMap.get('eventId');
    
    if (eventIdParam) {
      this.isEvent = true;
      this.eventId = +eventIdParam;
      this.loadEvent();
    } else if (movieIdParam) {
      this.isEvent = false;
      this.movieId = +movieIdParam;
      this.loadMovie();
      this.loadAvailableDates();
    }
  }

  loadMovie() {
    this.http.get<any>(`${environment.apiUrl}/movies/${this.movieId}`).subscribe({
      next: (response) => {
        this.movie = response.data;
      }
    });
  }

  loadEvent() {
    this.http.get<any>(`${environment.apiUrl}/events/${this.eventId}`).subscribe({
      next: (response) => {
        this.event = response.data;
        // Map event to movie-like structure for template compatibility
        this.movie = {
          title: this.event.title,
          genre: this.event.category,
          durationMinutes: this.event.durationMinutes,
          language: this.event.language
        };
        // Load available dates with shows for this event
        this.loadAvailableDates();
      }
    });
  }
  
  loadAvailableDates() {
    if (this.isEvent) {
      // For events, fetch all dates that have shows
      this.http.get<any>(`${environment.apiUrl}/shows/event/${this.eventId}/dates`).subscribe({
        next: (response) => {
          const showDates = response.data || [];
          if (showDates.length > 0) {
            this.dates = showDates.map((dateStr: string) => this.parseDate(dateStr));
            this.selectedDate = this.dates[0];
            this.loadShows();
          } else {
            // No shows available, show empty state
            this.dates = [];
            this.shows = [];
          }
        },
        error: () => {
          // Fallback to generating dates
          this.generateDates();
          this.selectedDate = this.dates[0];
          this.loadShows();
        }
      });
    } else {
      // For movies, use the same logic
      this.http.get<any>(`${environment.apiUrl}/shows/movie/${this.movieId}/dates`).subscribe({
        next: (response) => {
          const showDates = response.data || [];
          if (showDates.length > 0) {
            this.dates = showDates.map((dateStr: string) => this.parseDate(dateStr));
            this.selectedDate = this.dates[0];
            this.loadShows();
          } else {
            this.dates = [];
            this.shows = [];
          }
        },
        error: () => {
          this.generateDates();
          this.selectedDate = this.dates[0];
          this.loadShows();
        }
      });
    }
  }
  
  parseDate(dateStr: string): Date {
    // Parse date without timezone conversion
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }

  generateDates() {
    const today = new Date();
    // For movies, only show next 7 days
    const daysToShow = this.isEvent ? 30 : 7;
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      this.dates.push(date);
    }
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.loadShows();
  }
  
  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadShows() {
    this.loading = true;
    const dateStr = this.formatDateForAPI(this.selectedDate);
    
    const endpoint = this.isEvent 
      ? `${environment.apiUrl}/shows/event/${this.eventId}`
      : `${environment.apiUrl}/shows/movie/${this.movieId}`;
    
    this.http.get<any>(endpoint, {
      params: { date: dateStr }
    }).subscribe({
      next: (response) => {
        console.log('Show response:', response);
        if (this.isEvent && response.data && typeof response.data === 'object' && 'regularShows' in response.data) {
          // New structure with separate regular and open event shows
          const regularShows = response.data.regularShows || [];
          const openEventShows = response.data.openEventShows || [];
          console.log('Regular shows:', regularShows);
          console.log('Open event shows:', openEventShows);
          
          // Map open event shows to match regular show structure
          const mappedOpenShows = openEventShows.map((openShow: any) => ({
            showId: `open-${openShow.openShowId}`,
            openShowId: openShow.openShowId,
            isOpenEventShow: true,
            showTime: openShow.showTime,
            showDate: openShow.showDate,
            basePrice: this.getBasePrice(openShow.pricingZones),
            pricingZones: openShow.pricingZones,
            availableCapacity: openShow.availableCapacity,
            totalCapacity: openShow.totalCapacity,
            event: openShow.event
          }));
          
          this.shows = [...regularShows, ...mappedOpenShows];
        } else {
          // Old structure or movie shows
          this.shows = response.data || [];
        }
        
        this.groupShowsByVenue();
        this.loading = false;
      },
      error: () => {
        this.shows = [];
        this.groupedShows = [];
        this.loading = false;
      }
    });
  }
  
  filterPastShows(shows: any[]): any[] {
    const now = new Date();
    return shows.filter(show => {
      const showDateTime = this.getShowDateTime(show.showDate, show.showTime);
      return showDateTime > now;
    });
  }
  
  getShowDateTime(date: any, time: any): Date {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    let hours = 0;
    let minutes = 0;
    
    if (typeof time === 'string') {
      const parts = time.split(':');
      hours = parseInt(parts[0]);
      minutes = parseInt(parts[1]);
    } else if (Array.isArray(time)) {
      hours = time[0];
      minutes = time[1];
    }
    
    const showDateTime = new Date(dateStr);
    showDateTime.setHours(hours, minutes, 0, 0);
    return showDateTime;
  }
  
  getBasePrice(pricingZones: any[]): number {
    if (!pricingZones || pricingZones.length === 0) return 0;
    // Return the minimum price from pricing zones
    return Math.min(...pricingZones.map((zone: any) => Number(zone.price)));
  }

  groupShowsByVenue() {
    const venueMap = new Map();
    
    this.shows.forEach(show => {
      // Handle open ground/event shows (no venue)
      if (show.isOpenEventShow || show.isOpenGround || !show.venue) {
        const openGroundKey = 'OPEN_GROUND';
        if (!venueMap.has(openGroundKey)) {
          venueMap.set(openGroundKey, {
            venueName: 'Open Ground Event',
            venueCity: '',
            shows: []
          });
        }
        venueMap.get(openGroundKey).shows.push(show);
      } else {
        // Regular venue shows
        const venueId = show.venue.venueId;
        if (!venueMap.has(venueId)) {
          venueMap.set(venueId, {
            venueName: show.venue.venueName,
            venueCity: show.venue.city,
            shows: []
          });
        }
        venueMap.get(venueId).shows.push(show);
      }
    });
    
    this.groupedShows = Array.from(venueMap.values());
  }

  selectShow(show: any) {
    if (show.isOpenEventShow) {
      // For open event shows, navigate with openShowId
      this.router.navigate(['/bookings/seat-selection'], {
        queryParams: { 
          openShowId: show.openShowId,
          isOpenEvent: true
        }
      });
    } else {
      // Regular show
      this.router.navigate(['/bookings/seat-selection'], {
        queryParams: { showId: show.showId }
      });
    }
  }

  goBack() {
    if (this.isEvent) {
      this.router.navigate(['/events', this.eventId]);
    } else {
      this.router.navigate(['/movies', this.movieId]);
    }
  }

  formatShowTime(time: any): string {
    if (!time) return '';
    
    // If time is a string in format "HH:mm:ss" or "HH:mm"
    if (typeof time === 'string') {
      const parts = time.split(':');
      const hours = parseInt(parts[0]);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    }
    
    // If time is an array [hours, minutes, seconds]
    if (Array.isArray(time)) {
      const hours = time[0];
      const minutes = time[1].toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    }
    
    return time.toString();
  }
}
