import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PortfolioStore } from '../../../core/services/portfolio-store.service';
import { IconComponent } from '../icon/icon';
import { SocialLinksComponent } from '../social-links/social-links';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent, SocialLinksComponent],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer__top">
          <div class="footer__brand">
            <a class="footer__logo" routerLink="/" fragment="home">
              <span class="footer__mark" aria-hidden="true">AA</span>
              <span>
                <span class="footer__name">{{ settings()?.name || 'Ahmed Ali Abdullah Ashour' }}</span>
                <span class="footer__role">{{ settings()?.title || 'Front-End Developer' }}</span>
              </span>
            </a>
            <p class="footer__blurb">
              Building thoughtful, accessible interfaces with Angular and modern web technology.
            </p>
            <app-social-links [links]="socials()" ariaLabel="Social profiles in footer" />
          </div>

          <nav class="footer__column" aria-label="Footer navigation">
            <h2 class="footer__heading">Navigate</h2>
            <ul class="footer__list">
              @for (link of quickLinks; track link.fragment) {
                <li>
                  <a class="footer__link" [routerLink]="['/']" [fragment]="link.fragment">
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </nav>

          <div class="footer__column">
            <h2 class="footer__heading">Get in touch</h2>
            <ul class="footer__list">
              @if (settings()?.email) {
                <li>
                  <a class="footer__link" [href]="'mailto:' + settings()?.email">
                    <span class="footer__link-icon"><app-icon name="mail" /></span>
                    {{ settings()?.email }}
                  </a>
                </li>
              }
              <li>
                <span class="footer__link footer__link--static">
                  <span class="footer__link-icon"><app-icon name="map-pin" /></span>
                  {{ settings()?.location || 'Egypt' }}
                </span>
              </li>
              <li>
                <span class="footer__status">
                  <span class="status-dot"></span>
                  {{ settings()?.availability || 'Open to opportunities' }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div class="footer__bottom">
          <p class="footer__copy">
            © {{ year }} {{ settings()?.name || 'Ahmed Ali Abdullah Ashour' }}. All rights reserved.
          </p>
          <p class="footer__built">
            <span class="mono">Angular · TypeScript · CSS</span>
            <span class="footer__dot" aria-hidden="true"></span>
            <span>Designed &amp; built with care</span>
          </p>
          <button type="button" class="footer__top-btn" (click)="scrollToTop()">
            Back to top
            <span class="footer__top-icon"><app-icon name="arrow-up" /></span>
          </button>
        </div>
      </div>
    </footer>
  `,
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private readonly store = inject(PortfolioStore);

  protected readonly settings = this.store.settings;
  protected readonly socials = computed(() => this.store.settings()?.socials ?? []);
  protected readonly year = new Date().getFullYear();

  protected readonly quickLinks = [
    { label: 'Home', fragment: 'home' },
    { label: 'About', fragment: 'about' },
    { label: 'Skills', fragment: 'skills' },
    { label: 'Projects', fragment: 'projects' },
    { label: 'Experience', fragment: 'experience' },
    { label: 'Education', fragment: 'education' },
    { label: 'Contact', fragment: 'contact' },
  ];

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
