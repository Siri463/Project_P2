import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar *ngIf="showNavbar"></app-navbar>
    <router-outlet></router-outlet>
    <app-footer *ngIf="showNavbar"></app-footer>
  `
})
export class AppComponent {
  title = 'RevTickets';
  showNavbar = true;

  constructor(private router: Router) {
    // Initially check the current URL
    this.showNavbar = !this.router.url.startsWith('/admin');
    
    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide navbar on admin routes
      this.showNavbar = !event.url.startsWith('/admin');
    });
  }
}
