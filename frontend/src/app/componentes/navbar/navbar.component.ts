import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  userData: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(
      status => {
        this.isLoggedIn = status;
        if (status) {
          this.userData = this.authService.getUserData();
        }
      }
    );
  }

  onLogout(): void {
    this.authService.logout();
  }
}