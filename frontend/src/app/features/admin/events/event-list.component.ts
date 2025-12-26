import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#0a0f1e] p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-4xl font-bold mb-2">Manage Events</h1>
            <p class="text-gray-400">Create and manage concerts and events</p>
          </div>
          <div class="flex gap-4">
            <button (click)="showInactive = !showInactive; loadEvents()" 
                    [class]="showInactive ? 'px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-semibold transition-all' : 'px-6 py-3 bg-gray-700/50 hover:bg-gray-600 rounded-xl font-semibold transition-all'">
              {{ showInactive ? 'Show Active Only' : 'Show Inactive' }}
            </button>
            <button (click)="addEvent()" class="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5 shadow-lg shadow-red-900/20">
              + Add New Event
            </button>
          </div>
        </div>

        <div class="bg-[#141b2d] rounded-2xl border border-white/10 overflow-hidden">
          <div *ngIf="loading" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p class="mt-4 text-gray-400">Loading events...</p>
          </div>

          <div *ngIf="!loading && events.length === 0" class="p-12 text-center">
            <p class="text-xl text-gray-400 mb-6">No events found. Add your first event!</p>
            <button (click)="addEvent()" class="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all">
              + Add Event
            </button>
          </div>

          <table *ngIf="!loading && events.length > 0" class="w-full">
            <thead class="bg-[#1e293b] border-b border-white/10">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Poster</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Event Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Artist/Organizer</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Venue</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let event of events" class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4">
                  <img [src]="getImageUrl(event.displayImageUrl)" [alt]="event.title" 
                       class="w-16 h-24 object-cover rounded-lg border border-white/10"
                       onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
                </td>
                <td class="px-6 py-4 font-semibold text-white">{{ event.title }}</td>
                <td class="px-6 py-4 text-gray-300">{{ event.artistOrTeam }}</td>
                <td class="px-6 py-4 text-gray-400">{{ event.category }}</td>
                <td class="px-6 py-4 text-gray-300">{{ event.eventDate | date:'mediumDate' }}</td>
                <td class="px-6 py-4 text-gray-300">-</td>
                <td class="px-6 py-4">
                  <span [class]="event.isActive ? 'px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium' : 'px-3 py-1 bg-red-600/20 text-red-400 rounded-lg text-sm font-medium'">
                    {{ event.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-end gap-2">
                    <button (click)="editEvent(event.eventId)" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all">
                      Edit
                    </button>
                    <button *ngIf="!event.isActive" (click)="activateEvent(event.eventId)" 
                            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all">
                      Activate
                    </button>
                    <button *ngIf="event.isActive" (click)="deleteEvent(event.eventId)" 
                            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all">
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class EventListComponent implements OnInit {
  events: any[] = [];
  loading = true;
  showInactive = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    const activeOnly = !this.showInactive;
    this.http.get<any>(`${environment.apiUrl}/admin/events?activeOnly=${activeOnly}`).subscribe({
      next: (response) => {
        this.events = response.data || response;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.events = [];
      }
    });
  }

  getImageUrl(path: string): string {
    if (!path) return 'https://via.placeholder.com/200x300?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;  // path is already /display/filename or /banner/filename
  }

  addEvent() {
    this.router.navigate(['/admin/events/add']);
  }

  editEvent(id: number) {
    this.router.navigate(['/admin/events/edit', id]);
  }

  deleteEvent(id: number) {
    if (confirm('Are you sure you want to deactivate this event?')) {
      this.http.delete(`${environment.apiUrl}/admin/events/${id}`).subscribe({
        next: () => this.loadEvents()
      });
    }
  }

  activateEvent(id: number) {
    if (confirm('Are you sure you want to activate this event?')) {
      this.http.put(`${environment.apiUrl}/admin/events/${id}/activate`, {}).subscribe({
        next: () => this.loadEvents(),
        error: (err) => {
          console.error('Error activating event:', err);
          alert('Failed to activate event. Please try again.');
        }
      });
    }
  }
}
