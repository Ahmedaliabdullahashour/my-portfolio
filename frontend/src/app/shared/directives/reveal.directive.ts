import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';
import { numberAttribute } from '@angular/core';

/**
 * Reveals an element with a subtle rise + fade the first time it enters the
 * viewport. Falls back to "always visible" when IntersectionObserver is
 * unavailable and automatically disabled for reduced-motion users (via CSS).
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  /** Optional stagger delay in milliseconds. */
  readonly revealDelay = input(0, { transform: numberAttribute });

  ngOnInit(): void {
    const element = this.host.nativeElement;
    const delay = this.revealDelay();

    if (delay > 0) {
      element.style.transitionDelay = `${delay}ms`;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      element.classList.add('is-revealed');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.classList.add('is-revealed');
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
