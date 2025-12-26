import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  createEvent(eventData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/events`, eventData);
  }

  updateEvent(id: number, eventData: FormData): Observable<any> {
    return this.http.put(`${this.API_URL}/events/${id}`, eventData);
  }

  createEventJson(eventData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.API_URL}/events`, JSON.stringify(eventData), { headers });
  }

  updateEventJson(id: number, eventData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put(`${this.API_URL}/events/${id}`, JSON.stringify(eventData), { headers });
  }
}