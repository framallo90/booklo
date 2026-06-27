import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css',
})
export class PaymentSuccessComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);

  orderId = 0;
  status  = '';

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.queryParams['external_reference'] || 0);
    this.status  = this.route.snapshot.queryParams['status'] || 'approved';

    if (this.orderId) {
      this.paymentService.confirmOrder(this.orderId).subscribe();
    }
  }
}
