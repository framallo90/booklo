import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { HomeService } from '../../core/services/home.service';
import { Book } from '../../core/services/book.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private homeService = inject(HomeService);

  featured: Book[] = [];
  novedades: Book[] = [];
  topVentas: Book[] = [];

  @ViewChild('featuredEl') featuredEl?: ElementRef<HTMLElement>;
  @ViewChild('novedadesEl') novedadesEl?: ElementRef<HTMLElement>;
  @ViewChild('topVentasEl') topVentasEl?: ElementRef<HTMLElement>;

  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private readonly CARD_WIDTH = 196; // 180px + 16px gap
  private readonly AUTO_DELAY = 3000;

  ngOnInit(): void {
    this.homeService.getFeatured().subscribe({
      next: (data) => {
        this.featured = data;
        setTimeout(() => this.startTimer('featured', this.featuredEl?.nativeElement), 0);
      }
    });
    this.homeService.getNovedades().subscribe({
      next: (data) => {
        this.novedades = data;
        setTimeout(() => this.startTimer('novedades', this.novedadesEl?.nativeElement), 0);
      }
    });
    this.homeService.getTopVentas().subscribe({
      next: (data) => {
        this.topVentas = data;
        setTimeout(() => this.startTimer('topVentas', this.topVentasEl?.nativeElement), 0);
      }
    });
  }

  private startTimer(key: string, el: HTMLElement | undefined): void {
    if (!el) return;
    const timer = setInterval(() => {
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + this.CARD_WIDTH, behavior: 'smooth' });
    }, this.AUTO_DELAY);
    this.timers.set(key, timer);
  }

  pauseScroll(key: string): void {
    const t = this.timers.get(key);
    if (t) clearInterval(t);
  }

  resumeScroll(key: string, el: HTMLElement): void {
    this.pauseScroll(key);
    this.startTimer(key, el);
  }

  scrollCarousel(el: HTMLElement, direction: number): void {
    el.scrollBy({ left: direction * this.CARD_WIDTH, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearInterval(t));
  }
}
