import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FavoriteService, Favorite } from '../../core/services/favorite.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent implements OnInit {
  private favoriteService = inject(FavoriteService);

  favorites: Favorite[] = [];
  loading = true;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.favoriteService.getAll().subscribe({
      next: (data) => { this.favorites = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  remove(bookId: number): void {
    this.favoriteService.remove(bookId).subscribe({
      next: () => this.load(),
    });
  }
}