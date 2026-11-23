import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/components/icon/icon';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, IconComponent],
  template: `
    <section class="not-found" aria-labelledby="not-found-title">
      <div class="not-found__bg" aria-hidden="true"></div>
      <div class="container not-found__inner">
        <span class="eyebrow">Error 404</span>
        <h1 class="not-found__code" id="not-found-title">404</h1>
        <h2 class="not-found__title">This page took a different route.</h2>
        <p class="not-found__text">
          The page you are looking for does not exist or has been moved. Let's get you back to the portfolio.
        </p>
        <div class="not-found__actions">
          <a class="btn btn--primary" routerLink="/">
            <span class="btn__icon"><app-icon name="arrow-right" /></span>
            Back to home
          </a>
          <a class="btn btn--ghost" routerLink="/" fragment="contact">
            Contact me
          </a>
        </div>
      </div>
    </section>
  `,
  styleUrl: './not-found.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
