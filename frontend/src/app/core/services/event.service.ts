import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Event {
  eventId: number;
  title: string;
  description: string;
  category: string;
  artistOrTeam: string;
  eventDate: string;
  displayImageUrl: string;
  bannerImageUrl: string;
  active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = `${environment.apiUrl}/events`;
  
  events = signal<Event[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<ApiResponse<Event[]>> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<ApiResponse<Event[]>>(this.API_URL).pipe(
      tap({
        next: (response) => {
          this.events.set(response.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
          console.error('Error loading events:', err);
        }
      })
    );
  }

  getUpcomingEvents(): Observable<ApiResponse<Event[]>> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<ApiResponse<Event[]>>(`${this.API_URL}/upcoming`).pipe(
      tap({
        next: (response) => {
          this.events.set(response.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
          console.error('Error loading upcoming events:', err);
        }
      })
    );
  }

  getEventById(id: number): Observable<ApiResponse<Event>> {
    return this.http.get<ApiResponse<Event>>(`${this.API_URL}/${id}`);
  }

  getEventsByCategory(category: string): Observable<ApiResponse<Event[]>> {
    return this.http.get<ApiResponse<Event[]>>(`${this.API_URL}/category/${category}`);
  }

  getImageUrl(path: string): string {
    if (!path) return 'https://via.placeholder.com/200x300?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
}
