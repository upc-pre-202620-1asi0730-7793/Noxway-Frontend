import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Non-blocking UI feedback toast service replacing browser alert()/confirm()/prompt().
 */
@Injectable({ providedIn: 'root' })
export class NotificationToastService {
  private readonly snackBar = inject(MatSnackBar);

  info(message: string): void {
    this.open(message, 'OK', 3500);
  }

  success(message: string): void {
    this.open(message, 'OK', 3500);
  }

  error(message: string): void {
    this.open(message, 'Cerrar', 5500);
  }

  private open(message: string, action: string, duration: number): void {
    try {
      this.snackBar.open(message, action, {
        duration,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });
    } catch {
      // Fallback-safe in headless test environments
    }
  }
}
