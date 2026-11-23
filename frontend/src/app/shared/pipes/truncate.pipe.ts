import { Pipe, PipeTransform } from '@angular/core';

/** Truncates long copy on a word boundary. */
@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 140, suffix = '…'): string {
    if (!value) {
      return '';
    }

    if (value.length <= limit) {
      return value;
    }

    const cut = value.slice(0, limit);
    const lastSpace = cut.lastIndexOf(' ');

    return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}${suffix}`;
  }
}
