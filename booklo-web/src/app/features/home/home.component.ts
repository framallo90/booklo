import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { HomeService } from '../../core/services/home.service';
import { Book } from '../../core/services/book.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private homeService = inject(HomeService);

  featured: Book[] = [];
  novedades: Book[] = [];
  topVentas: Book[] = [];

  ngOnInit(): void {
    this.homeService.getFeatured().subscribe({ next: (data) => this.featured = data });
    this.homeService.getNovedades().subscribe({ next: (data) => this.novedades = data });
    this.homeService.getTopVentas().subscribe({ next: (data) => this.topVentas = data });
  }
}
