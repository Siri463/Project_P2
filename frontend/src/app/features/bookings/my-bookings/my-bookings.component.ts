import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#050505] text-white pt-20 pb-32">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">My Bookings</h1>
        
        <div class="space-y-6">
          <div *ngFor="let booking of bookings" class="bg-gradient-to-b from-[#1a0a0a] via-[#0a0a0a] to-[#050505] rounded-3xl border border-red-900/30 shadow-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300">
            <div class="p-6">
              <!-- Header Section -->
              <div class="flex justify-between items-start mb-6">
                <div class="flex-1">
                  <h3 class="text-2xl font-bold mb-2">
                    {{ booking.show?.movie?.title || booking.show?.event?.title || booking.openEventShow?.event?.title }}
                  </h3>
                  <div class="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      Ref: <span class="font-mono text-red-400">{{ booking.bookingReference }}</span>
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {{ formatDate(booking.bookingDate) }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-bold text-red-500 mb-2">₹{{ booking.totalAmount | number:'1.2-2' }}</p>
                  <span [ngClass]="{
                    'bg-green-500/20 text-green-400 border-green-500/30': booking.bookingStatus === 'CONFIRMED',
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30': booking.bookingStatus === 'PENDING',
                    'bg-red-500/20 text-red-400 border-red-500/30': booking.bookingStatus === 'CANCELLED'
                  }" class="inline-block px-4 py-1.5 rounded-full text-sm font-semibold border">
                    {{ booking.bookingStatus }}
                  </span>
                </div>
              </div>

              <!-- Show Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-black/40 rounded-xl p-4 border border-white/5">
                  <h4 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Show Details</h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-400">Date:</span>
                      <span class="font-medium">{{ formatShowDate(booking.show?.showDate || booking.openEventShow?.showDate) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-400">Time:</span>
                      <span class="font-medium">{{ formatTime(booking.show?.showTime || booking.openEventShow?.showTime) }}</span>
                    </div>
                    <div *ngIf="booking.show?.venue" class="flex justify-between">
                      <span class="text-gray-400">Venue:</span>
                      <span class="font-medium">{{ booking.show.venue.venueName }}, {{ booking.show.venue.city }}</span>
                    </div>
                    <div *ngIf="booking.show?.screen" class="flex justify-between">
                      <span class="text-gray-400">Screen:</span>
                      <span class="font-medium">Screen {{ booking.show.screen.screenNumber }}</span>
                    </div>
                  </div>
                </div>

                <div class="bg-black/40 rounded-xl p-4 border border-white/5">
                  <h4 class="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Booking Details</h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-400">Total Seats:</span>
                      <span class="font-medium">{{ booking.totalSeats }}</span>
                    </div>
                    <div *ngIf="booking.seatNumbers && booking.seatNumbers.length > 0" class="flex justify-between">
                      <span class="text-gray-400">Seats:</span>
                      <span class="font-medium text-red-400">{{ booking.seatNumbers.join(', ') }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-400">Payment:</span>
                      <span class="font-medium" [ngClass]="{
                        'text-green-400': booking.paymentStatus === 'PAID',
                        'text-yellow-400': booking.paymentStatus === 'PENDING',
                        'text-red-400': booking.paymentStatus === 'FAILED'
                      }">{{ booking.paymentStatus }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Zone Bookings for Open Events -->
              <div *ngIf="booking.zoneBookings && booking.zoneBookings.length > 0" class="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30 mb-6">
                <h4 class="text-sm font-semibold text-purple-300 mb-3 uppercase tracking-wider">Zone Tickets</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div *ngFor="let zone of booking.zoneBookings" class="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="font-semibold text-lg">{{ zone.zoneName }}</p>
                        <p class="text-sm text-gray-400">{{ zone.quantity }} × ₹{{ zone.pricePerTicket | number:'1.2-2' }}</p>
                      </div>
                      <p class="text-xl font-bold text-purple-400">₹{{ (zone.quantity * zone.pricePerTicket) | number:'1.2-2' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- QR Code -->
              <div *ngIf="getQRCodeUrl(booking) && booking.bookingStatus === 'CONFIRMED'" class="flex justify-center items-center bg-white rounded-xl p-4">
                <div class="text-center">
                  <img [src]="getQRCodeUrl(booking)" alt="Booking QR Code" class="w-48 h-48 mx-auto mb-2">
                  <p class="text-sm text-gray-600 font-medium">Scan at venue</p>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="loading" class="text-center py-16">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            <p class="mt-4 text-gray-400">Loading bookings...</p>
          </div>

          <div *ngIf="!loading && bookings.length === 0" class="text-center py-16">
            <svg class="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
            <p class="text-xl text-gray-400">No bookings found</p>
            <p class="text-sm text-gray-500 mt-2">Book your first movie or event ticket!</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(`${environment.apiUrl}/bookings/my-bookings`, { headers }).subscribe({
      next: (response) => {
        console.log('My bookings response:', response);
        this.bookings = response.data || [];
        console.log('Total bookings loaded:', this.bookings.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading my bookings:', error);
        this.loading = false;
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatShowDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    if (!time) return '';
    // Handle time format like "15:30:00" or Date object
    if (typeof time === 'string' && time.includes(':')) {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  }

  getQRCodeUrl(booking: any): string | null {
    if (booking.qrCodeBase64) {
      return `data:image/png;base64,${booking.qrCodeBase64}`;
    }
    if (booking.qrCodeUrl) {
      return booking.qrCodeUrl;
    }
    return null;
  }
}
