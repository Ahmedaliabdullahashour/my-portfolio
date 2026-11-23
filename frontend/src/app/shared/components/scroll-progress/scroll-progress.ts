import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

/** Thin blue reading-progress bar pinned to the top of the viewport. */
@Component({
  selector: 'app-scroll-progress',
  template: `
    <div class="progress" aria-hidden="true">
      <span class="progress__bar" [style.transform]="'scaleX(' + progress() / 100 + ')'"></span>
    </div>
  `,
  styles: `
    .progress {
      position: fixed;
      inset-inline: 0;
      top: 0;
      z-index: 110;
      height: 2px;
      background: transparent;
      pointer-events: none;
    }

    .progress__bar {
      display: block;
      height: 100%;
      transform-origin: left center;
      background: linear-gradient(90deg, var(--accent-deep), var(--accent-bright));
      box-shadow: 0 0 12px rgba(99, 164, 255, 0.8);
      transition: transform 0.12s linear;
      will-change: transform;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollProgressComponent {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly progress = signal(0);

  constructor() {
    afterNextRender(() => {
      let frame = 0;

      const update = () => {
        frame = 0;
        const scrollTop = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        this.progress.set(height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0);
      };

      const onScroll = () => {
        if (!frame) {
          frame = requestAnimationFrame(update);
        }
      };

      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        if (frame) {
          cancelAnimationFrame(frame);
        }
      });
    });
  }
}
