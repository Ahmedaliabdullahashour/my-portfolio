import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PortfolioStore } from '../../core/services/portfolio-store.service';
import { IconComponent } from '../../shared/components/icon/icon';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-about',
  imports: [RouterLink, IconComponent, SectionHeadingComponent, RevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly store = inject(PortfolioStore);
  protected readonly settings = this.store.settings;
  protected readonly loading = this.store.loading;
  protected readonly education = computed(() => this.store.education()[0] ?? null);
  protected readonly facts = computed(() => [
    { label: 'Based in', value: this.settings()?.location ?? 'Egypt', icon: 'map-pin' },
    { label: 'Focus', value: 'Front-End Engineering', icon: 'target' },
    { label: 'Status', value: 'Open to opportunities', icon: 'sparkles' },
  ]);
}
