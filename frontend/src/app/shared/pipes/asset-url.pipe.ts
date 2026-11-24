import { Pipe, PipeTransform } from '@angular/core';
import { resolveAssetUrl } from '../../core/utils/asset-url.util';

/**
 * Angular pipe to resolve any asset/image URL for display.
 * Reusable across public and admin templates.
 *
 * Usage:
 *   [src]="project().image | assetUrl"
 *   [src]="settings()?.profileImage | assetUrl"
 *   [href]="settings()?.cvUrl | assetUrl"
 *   [src]="item.image | assetUrl:'/assets/images/placeholder.svg'"
 */
@Pipe({
  name: 'assetUrl',
  standalone: true,
})
export class AssetUrlPipe implements PipeTransform {
  transform(value: string | null | undefined, fallback?: string): string {
    const resolved = resolveAssetUrl(value);
    if (!resolved && fallback) {
      return resolveAssetUrl(fallback);
    }
    return resolved;
  }
}
