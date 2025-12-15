import { CommonModule } from '@angular/common';
import {  Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../Sevices/auth.service';

@Component({
  selector: 'app-panel',
  imports: [RouterOutlet, CommonModule , RouterLink,RouterLinkActive],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel {
  

  constructor(private authService:AuthService){}
  isMenuOpen = false;  

  toggleUserMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnClickOutside(event: MouseEvent) {
    const clickedInside = document.getElementById('userMenu')?.contains(event.target as Node);
    const clickedButton = document.getElementById('userMenuBtn')?.contains(event.target as Node);

    // اگر کلیک خارج از منو و دکمه باشد، منو بسته می‌شود
    if (!clickedInside && !clickedButton) {
      this.isMenuOpen = false;
    }
  }

    logOut(): void {
    this.authService.logOut();
  }

  
}
