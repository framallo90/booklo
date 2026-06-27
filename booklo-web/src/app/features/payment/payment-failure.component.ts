import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './payment-failure.component.html',
  styleUrl: './payment-failure.component.css',
})
export class PaymentFailureComponent {
  private route = inject(ActivatedRoute);
  orderId = Number(this.route.snapshot.queryParams['external_reference'] || 0);
}
