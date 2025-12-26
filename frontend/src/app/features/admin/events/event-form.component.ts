import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#0a0f1e] p-8">
      <div class="max-w-4xl mx-auto">
        <button (click)="goBack()" class="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Events
        </button>
        
        <h1 class="text-4xl font-bold mb-8">{{isEditMode ? 'Edit' : 'Add New'}} Event</h1>
        
        <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Basic Information -->
          <div class="bg-[#141b2d] rounded-2xl border border-white/10 p-8">
            <h2 class="text-2xl font-bold mb-6">Event Information</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
                <input formControlName="title" type="text" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" placeholder="Coldplay Live in Concert">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea formControlName="description" rows="4" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" placeholder="Enter event description..."></textarea>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select formControlName="category" class="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500">
                    <option value="" class="bg-[#1a1a2e] text-white">Select Category</option>
                    <option value="CONCERT" class="bg-[#1a1a2e] text-white">Concert</option>
                    <option value="SPORTS" class="bg-[#1a1a2e] text-white">Sports</option>
                    <option value="THEATER" class="bg-[#1a1a2e] text-white">Theater</option>
                    <option value="COMEDY" class="bg-[#1a1a2e] text-white">Comedy</option>
                    <option value="FESTIVAL" class="bg-[#1a1a2e] text-white">Festival</option>
                    <option value="WORKSHOP" class="bg-[#1a1a2e] text-white">Workshop</option>
                    <option value="CONFERENCE" class="bg-[#1a1a2e] text-white">Conference</option>
                    <option value="OTHER" class="bg-[#1a1a2e] text-white">Other</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Age Restriction</label>
                  <select formControlName="ageRestriction" class="w-full px-4 py-3 bg-[#1a1a2e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500">
                    <option value="ALL" class="bg-[#1a1a2e] text-white">All Ages</option>
                    <option value="13+" class="bg-[#1a1a2e] text-white">13+</option>
                    <option value="16+" class="bg-[#1a1a2e] text-white">16+</option>
                    <option value="18+" class="bg-[#1a1a2e] text-white">18+</option>
                    <option value="21+" class="bg-[#1a1a2e] text-white">21+</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Artist/Team/Performer</label>
                  <input formControlName="artist" type="text" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" placeholder="Coldplay">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                  <input formControlName="duration" type="number" min="1" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" placeholder="180">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Event Date</label>
                  <input formControlName="eventDate" type="date" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Event Start Time</label>
                  <input formControlName="eventTime" type="time" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Language</label>
                <input formControlName="language" type="text" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500" placeholder="English">
              </div>
            </div>
          </div>

          <!-- Image Upload -->
          <div class="bg-[#141b2d] rounded-2xl border border-white/10 p-8">
            <h2 class="text-2xl font-bold mb-6">Event Images</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Display Image (Vertical Poster) -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Vertical Poster</h3>
                <label class="cursor-pointer block">
                  <input type="file" (change)="onDisplayImageSelect($event)" accept="image/*" class="hidden">
                  <div class="px-6 py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-center hover:border-red-500 transition-colors">
                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="text-sm text-gray-400">Upload vertical poster (2:3 ratio)</p>
                  </div>
                </label>
                
                <div *ngIf="displayImagePreview" class="relative mt-4 w-full h-96 rounded-xl overflow-hidden border border-white/10">
                  <img [src]="displayImagePreview" alt="Display preview" class="w-full h-full object-cover">
                  <button type="button" (click)="removeDisplayImage()" class="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Banner Image (Horizontal) -->
              <div>
                <h3 class="text-lg font-semibold mb-4">Banner Image</h3>
                <label class="cursor-pointer block">
                  <input type="file" (change)="onBannerImageSelect($event)" accept="image/*" class="hidden">
                  <div class="px-6 py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-center hover:border-red-500 transition-colors">
                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="text-sm text-gray-400">Upload banner (16:9 ratio)</p>
                  </div>
                </label>
                
                <div *ngIf="bannerImagePreview" class="relative mt-4 w-full h-96 rounded-xl overflow-hidden border border-white/10">
                  <img [src]="bannerImagePreview" alt="Banner preview" class="w-full h-full object-cover">
                  <button type="button" (click)="removeBannerImage()" class="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-4">
            <button type="submit" [disabled]="eventForm.invalid || submitting" 
                    class="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {{submitting ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}}
            </button>
            <button type="button" (click)="goBack()" class="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;
  eventId: number | null = null;
  submitting = false;
  selectedDisplayImage: File | null = null;
  displayImagePreview: string | null = null;
  selectedBannerImage: File | null = null;
  bannerImagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      artist: ['', Validators.required],
      ageRestriction: ['ALL', Validators.required],
      duration: [120, [Validators.required, Validators.min(1)]],
      eventDate: ['', Validators.required],
      eventTime: ['', Validators.required],
      language: ['English']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.eventId = +id;
      this.loadEvent();
    }
  }

  onDisplayImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedDisplayImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.displayImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onBannerImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedBannerImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.bannerImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeDisplayImage() {
    this.selectedDisplayImage = null;
    this.displayImagePreview = null;
  }

  removeBannerImage() {
    this.selectedBannerImage = null;
    this.bannerImagePreview = null;
  }

  loadEvent() {
    this.http.get<any>(`${environment.apiUrl}/admin/events/${this.eventId}`).subscribe({
      next: (response) => {
        const event = response.data;
        this.eventForm.patchValue({
          title: event.title,
          description: event.description,
          category: event.category,
          artist: event.artistOrTeam,
          ageRestriction: event.ageRestriction,
          duration: event.durationMinutes,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          language: event.language
        });
        
        if (event.displayImageUrl) {
          this.displayImagePreview = `${environment.apiUrl.replace('/api', '')}${event.displayImageUrl}`;
        }
        if (event.bannerImageUrl) {
          this.bannerImagePreview = `${environment.apiUrl.replace('/api', '')}${event.bannerImageUrl}`;
        }
        console.log('Event loaded for editing:', event);
      },
      error: (err) => {
        console.error('Error loading event:', err);
      }
    });
  }

  onSubmit() {
    if (this.eventForm.invalid) return;

    this.submitting = true;
    
    // If we have images, use FormData
    if (this.selectedDisplayImage || this.selectedBannerImage) {
      const formData = new FormData();
      
      Object.keys(this.eventForm.value).forEach(key => {
        const value = this.eventForm.value[key];
        if (value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      if (this.selectedDisplayImage) {
        formData.append('displayImage', this.selectedDisplayImage);
      }

      if (this.selectedBannerImage) {
        formData.append('bannerImage', this.selectedBannerImage);
      }

      const request = this.isEditMode
        ? this.adminService.updateEvent(this.eventId!, formData)
        : this.adminService.createEvent(formData);

      request.subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/events']);
        },
        error: (err) => {
          this.submitting = false;
          console.error('Error saving event:', err);
          alert('Failed to save event. Please try again.');
        }
      });
    } else {
      // No images, use JSON
      const eventData = {
        ...this.eventForm.value,
        artistOrTeam: this.eventForm.value.artist
      };

      const request = this.isEditMode
        ? this.adminService.updateEventJson(this.eventId!, eventData)
        : this.adminService.createEventJson(eventData);

      request.subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/events']);
        },
        error: (err) => {
          this.submitting = false;
          console.error('Error saving event:', err);
          alert('Failed to save event. Please try again.');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/events']);
  }
}
