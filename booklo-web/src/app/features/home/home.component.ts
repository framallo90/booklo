import { Component, OnInit, AfterViewChecked, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
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
export class HomeComponent implements OnInit, AfterViewChecked, OnDestroy {
  private homeService = inject(HomeService);

  featured: Book[] = [];
  novedades: Book[] = [];
  topVentas: Book[] = [];

  @ViewChild('featuredEl')  featuredEl?:  ElementRef<HTMLElement>;
  @ViewChild('novedadesEl') novedadesEl?: ElementRef<HTMLElement>;
  @ViewChild('topVentasEl') topVentasEl?: ElementRef<HTMLElement>;

  private timers      = new Map<string, ReturnType<typeof setInterval>>();
  private autoStarted = new Set<string>();
  private readonly CARD_WIDTH = 196;
  private readonly AUTO_DELAY = 3500;
  private readonly ANIM_MS    = 700;

  ngOnInit(): void {
    this.homeService.getFeatured().subscribe({  next: (data) => this.featured  = data });
    this.homeService.getNovedades().subscribe({ next: (data) => this.novedades = data });
    this.homeService.getTopVentas().subscribe({ next: (data) => this.topVentas = data });
  }

  ngAfterViewChecked(): void {
    this.tryStart('featured',  this.featuredEl);
    this.tryStart('novedades', this.novedadesEl);
    this.tryStart('topVentas', this.topVentasEl);
  }

  private tryStart(key: string, ref: ElementRef<HTMLElement> | undefined): void {
    if (ref && !this.autoStarted.has(key)) {
      this.autoStarted.add(key);
      this.startInterval(key, ref.nativeElement);
    }
  }

  private startInterval(key: string, el: HTMLElement): void {
    const timer = setInterval(() => {
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 10;
      this.animateScroll(el, atEnd ? 0 : el.scrollLeft + this.CARD_WIDTH, this.ANIM_MS);
    }, this.AUTO_DELAY);
    this.timers.set(key, timer);
  }

  private animateScroll(el: HTMLElement, target: number, duration: number): void {
    const from  = el.scrollLeft;
    const delta = target - from;
    if (delta === 0) return;
    const t0 = performance.now();

    const step = (now: number) => {
      const p    = Math.min((now - t0) / duration, 1);
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
      el.scrollLeft = from + delta * ease;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  pauseScroll(key: string): void {
    const t = this.timers.get(key);
    if (t) clearInterval(t);
  }

  resumeScroll(key: string, el: HTMLElement): void {
    if (this.autoStarted.has(key)) {
      this.pauseScroll(key);
      this.startInterval(key, el);
    }
  }

  scrollCarousel(el: HTMLElement, direction: number): void {
    const target = Math.max(0, Math.min(
      el.scrollLeft + direction * this.CARD_WIDTH,
      el.scrollWidth - el.clientWidth,
    ));
    this.animateScroll(el, target, 450);
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearInterval(t));
  }
}
