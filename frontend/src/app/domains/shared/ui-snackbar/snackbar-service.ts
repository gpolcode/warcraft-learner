import { inject, Injectable } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

const COPY_FAILED_MESSAGE = 'Clipboard write failed. Retry the copy.';
// Material's default duration is 0, which never auto-dismisses, and these bars carry no dismiss action.
const CONFIRM_DURATION_MS = 3000;
const WARN_DURATION_MS = 6000;

/** Transient feedback for an action the user just took; anything that outlives the action belongs on the page instead. */
@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  confirm(message: string): void {
    this.snackBar.open(message, undefined, { duration: CONFIRM_DURATION_MS });
  }

  warn(message: string): void {
    this.snackBar.open(message, undefined, { duration: WARN_DURATION_MS, politeness: 'assertive' });
  }

  /** A refused write reports itself, so callers name only what a successful paste lands in. */
  copyAndConfirm(text: string, confirmation: string): void {
    if (this.clipboard.copy(text)) this.confirm(confirmation);
    else this.warn(COPY_FAILED_MESSAGE);
  }
}
