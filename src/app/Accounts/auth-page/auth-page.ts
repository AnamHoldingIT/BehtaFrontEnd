import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthErrorService } from '../service/auth-error.service';
import { Subscription } from 'rxjs';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-auth-page',
  imports: [RouterOutlet , NgClass , RouterLink],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css',
})
export class AuthPage implements OnInit, OnDestroy {
  showError = false;
  errorMessage = '';

  private sub?: Subscription;

  constructor(private authError: AuthErrorService) {}

  ngOnInit(): void {
    this.sub = this.authError.error$.subscribe((msg) => {
      if (msg) {
        this.errorMessage = msg;
        this.showError = true;
      } else {
        this.showError = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}