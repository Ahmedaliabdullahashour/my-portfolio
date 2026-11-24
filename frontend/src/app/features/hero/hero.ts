import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PortfolioStore } from '../../core/services/portfolio-store.service';
import { IconComponent } from '../../shared/components/icon/icon';
import { SocialLinksComponent } from '../../shared/components/social-links/social-links';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';

@Component({
  selector: 'app-hero',
  imports: [RouterLink, IconComponent, SocialLinksComponent, RevealDirective, AssetUrlPipe],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  private readonly store = inject(PortfolioStore);

  protected readonly settings = this.store.settings;
  protected readonly loading = this.store.loading;

  protected readonly nameParts = computed(() => {
    const name = this.store.settings()?.name ?? 'Ahmed Ali Abdullah Ashour';
    const parts = name.trim().split(/a+/);
    const last = parts.length > 1 ? parts.pop()! : '';
    return { lead: parts.join(' '), last };
  });
  protected readonly socials = computed(() => this.store.settings()?.socials ?? []);

  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.dataset['fallback']) {
      img.dataset['fallback'] = 'true';
      img.src = '/assets/images/profile.svg';
    }
  }
}
