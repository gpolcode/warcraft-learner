import { Pipe, PipeTransform } from '@angular/core';
import { classIconUrl } from '../../core/spec-meta';

/** No-space class name (e.g. 'DeathKnight') -> zamimg class-icon URL, or '' when empty. */
// A pure pipe would cache the pre-hydration ''.
@Pipe({ name: 'classIcon', pure: false })
export class ClassIconPipe implements PipeTransform {
  transform(className: string | null | undefined): string {
    return classIconUrl(className ?? '');
  }
}
