import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PortfolioStore } from '../../../core/services/portfolio-store.service';
import { IconComponent } from '../icon/icon';
import { SocialLinksComponent } from '../social-links/social-links';

interface NavLink {
  label: string;
  fragment: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, IconComponent, SocialLinksComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(PortfolioStore);
  private readonly navPanel = viewChild<ElementRef<HTMLElement>>('navPanel');

  protected readonly links: NavLink[] = [
    { label: 'Home', fragment: 'home' },
    { label: 'About', fragment: 'about' },
    { label: 'Skills', fragment: 'skills' },
    { label: 'Projects', fragment: 'projects' },
    { label: 'Experience', fragment: 'experience' },
    { label: 'Education', fragment: 'education' },
    { label: 'Contact', fragment: 'contact' },
  ];

  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly activeFragment = signal('home');
  protected readonly settings = this.store.settings;
  protected readonly initials = computed(() => initialsOf(this.store.settings()?.name ?? 'AA'));

  private sections: HTMLElement[] = [];

  constructor() {
    afterNextRender(() => {
      const onScroll = () => {
        this.scrolled.set(window.scrollY > 24);
        this.updateActiveSection();
      };

      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        this.releaseScroll();
      });

      this.refreshSections();
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.closeMenu();
        if (event.urlAfterRedirects === '/' || event.urlAfterRedirects.startsWith('/#')) {
          // Let the lazy-loaded home page render before caching its sections.
          setTimeout(() => {
            this.refreshSections();
            this.updateActiveSection();
          });
        }
      });
  }

  protected navigate(fragment: string, event: Event): void {
    event.preventDefault();
    this.closeMenu();
    void this.router.navigate(['/'], { fragment });
  }

  protected toggleMenu(): void {
    const next = !this.menuOpen();
    this.menuOpen.set(next);

    if (next) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => this.navPanel()?.nativeElement.querySelector<HTMLElement>('a, button')?.focus());
    } else {
      this.releaseScroll();
    }
  }

  protected closeMenu(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      this.releaseScroll();
    }
  }

  protected onEscape(): void {
    this.closeMenu();
  }

  private releaseScroll(): void {
    document.body.style.overflow = '';
  }

  private refreshSections(): void {
    this.sections = this.links
      .map((link) => document.getElementById(link.fragment))
      .filter((section): section is HTMLElement => Boolean(section));
  }

  private updateActiveSection(): void {
    if (!this.sections.length) {
      return;
    }

    const marker = window.scrollY + window.innerHeight * 0.35;
    let current = this.sections[0];

    for (const section of this.sections) {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top <= marker) {
        current = section;
      }
    }

    this.activeFragment.set(current.id);
  }
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? 'A') + (parts[parts.length - 1]?.[0] ?? 'A')).toUpperCase();
}
