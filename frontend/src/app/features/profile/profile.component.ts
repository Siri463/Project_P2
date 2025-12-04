import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#050505] text-white pt-20 pb-32">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10 mb-8">
            <h1 class="text-3xl font-bold mb-6">My Profile</h1>
            
            <div class="space-y-4" *ngIf="user">
              <div>
                <label class="text-gray-400 text-sm">Name</label>
                <p class="text-xl">{{ user.name }}</p>
              </div>
              
              <div>
                <label class="text-gray-400 text-sm">Email</label>
                <p class="text-xl">{{ user.email }}</p>
              </div>
              
              <div>
                <label class="text-gray-400 text-sm">Phone</label>
                <p class="text-xl">{{ user.phone }}</p>
              </div>
              
              <div>
                <label class="text-gray-400 text-sm">Role</label>
                <p class="text-xl">
                  <span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">{{ user.role }}</span>
                </p>
              </div>

              <div class="flex gap-4 pt-4">
                <button (click)="goToBookings()" class="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">My Bookings</button>
                <button *ngIf="user.role === 'ADMIN'" (click)="goToAdmin()" class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Admin Dashboard</button>
                <button (click)="logout()" class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors ml-auto">Logout</button>
              </div>
            </div>
          </div>

          <!-- My Reviews Section -->
          <div class="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10">
            <h2 class="text-2xl font-bold mb-6">My Reviews</h2>
            
            <div *ngIf="loadingReviews" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
            </div>

            <div *ngIf="!loadingReviews && reviews.length === 0" class="text-center py-8">
              <p class="text-gray-400">You haven't written any reviews yet.</p>
            </div>

            <div class="space-y-4" *ngIf="!loadingReviews && reviews.length > 0">
              <div *ngFor="let review of reviews" class="bg-[#121212] rounded-xl p-6 border border-white/5">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <p class="font-semibold text-lg">{{ review.reviewType === 'MOVIE' ? 'Movie' : 'Event' }} Review</p>
                    <p class="text-sm text-gray-400">{{ review.createdAt | date:'dd MMM yyyy, hh:mm a' }}</p>
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span class="font-bold text-lg">{{ review.rating }}/10</span>
                  </div>
                </div>

                <p class="text-gray-300" *ngIf="review.comment">{{ review.comment }}</p>
                <p class="text-gray-400 italic" *ngIf="!review.comment">No review text provided</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: any;
  reviews: any[] = [];
  loadingReviews = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    
    // Redirect admin users directly to admin dashboard
    if (this.user?.role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.loadMyReviews();
    }
  }

  loadMyReviews() {
    this.loadingReviews = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${environment.apiUrl}/reviews/my-reviews`, { headers }).subscribe({
      next: (response) => {
        this.reviews = response.data || [];
        this.loadingReviews = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviews = [];
        this.loadingReviews = false;
      }
    });
  }

  goToBookings() {
    this.router.navigate(['/bookings/my-bookings']);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
