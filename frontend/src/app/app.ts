import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PortfolioStore } from './core/services/portfolio-store.service';
import { FooterComponent } from './shared/components/footer/footer';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { ScrollProgressComponent } from './shared/components/scroll-progress/scroll-progress';
import { ToastHostComponent } from './shared/components/toast-host/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ScrollProgressComponent, ToastHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly store = inject(PortfolioStore);

  constructor() {
    // Warm the store once; every public page reads the same signals.
    this.store.load();
  }
}
