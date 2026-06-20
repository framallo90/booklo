import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:3000';

  loading = true;
  savingProfile = false;
  savingPassword = false;
  profileMessage = '';
  passwordMessage = '';
  showCurrent = false;
  showNew = false;

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.http.get<{ name: string; email: string }>(`${this.API}/auth/me`).subscribe({
      next: (user) => {
        this.profileForm.patchValue({ name: user.name, email: user.email });
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile = true;
    this.profileMessage = '';
    this.http.patch(`${this.API}/auth/me`, this.profileForm.value).subscribe({
      next: () => {
        this.profileMessage = 'Perfil actualizado correctamente';
        this.savingProfile = false;
      },
      error: (err) => {
        this.profileMessage = err.error?.message || 'Error al actualizar el perfil';
        this.savingProfile = false;
      },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword = true;
    this.passwordMessage = '';
    this.http.patch(`${this.API}/auth/me/password`, this.passwordForm.value).subscribe({
      next: () => {
        this.passwordMessage = 'Contraseña actualizada correctamente';
        this.passwordForm.reset();
        this.savingPassword = false;
      },
      error: (err) => {
        this.passwordMessage = err.error?.message || 'Error al actualizar la contraseña';
        this.savingPassword = false;
      },
    });
  }
}