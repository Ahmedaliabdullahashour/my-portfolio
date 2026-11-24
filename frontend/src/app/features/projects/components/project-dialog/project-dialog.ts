import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

import type { Project } from '../../../../core/models';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { AssetUrlPipe } from '../../../../shared/pipes/asset-url.pipe';

@Component({
  selector: 'app-project-dialog',
  imports: [IconComponent, AssetUrlPipe],
  templateUrl: './project-dialog.html',
  styleUrl: './project-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'close()',
  },
})
export class ProjectDialogComponent implements OnInit, OnDestroy {
  private readonly toast = inject(ToastService);
  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');
  private previousOverflow = '';
  private previouslyFocused: HTMLElement | null = null;

  readonly project = input.required<Project>();
  readonly closed = output<void>();

  protected onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.dataset['fallback']) {
      img.dataset['fallback'] = 'true';
      img.src = '/assets/images/projects/aurora.svg';
    }
  }

  ngOnInit(): void {
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      this.dialog()?.nativeElement.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.previousOverflow;
    this.previouslyFocused?.focus();
  }

  protected close(): void {
    this.closed.emit();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected missingLink(network: 'GitHub' | 'live demo'): void {
    this.toast.show(
      `This is sample content — add a real ${network} URL for "${this.project().title}" in the portfolio data service.`,
      'info',
    );
  }
}
