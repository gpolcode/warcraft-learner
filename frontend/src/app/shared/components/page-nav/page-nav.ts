import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const GITHUB_URL = 'https://github.com/gpolcode/warcraft-learner';
const MOBILE_QUERY = '(max-width: 600px)';

/**
 * App shell nav: a top toolbar plus a side drawer of page links. The drawer is a plain
 * flex child on desktop (persistent, pushes the content) and an absolutely-positioned
 * overlay on mobile (over the content, dismissed by a scrim). This deliberately avoids
 * mat-sidenav / mat-nav-list / mat-menu so the CDK overlay module and @angular/forms stay
 * out of the eager bundle; only the light MatToolbar / MatButton / MatIcon remain.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-page-nav',
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './page-nav.html',
  host: { class: 'flex flex-col h-[100dvh]' },
})
export class PageNavComponent {
  protected readonly githubUrl = GITHUB_URL;
  private readonly breakpoints = inject(BreakpointObserver);

  protected readonly isMobile = toSignal(
    this.breakpoints.observe(MOBILE_QUERY).pipe(map(result => result.matches)),
    { initialValue: false },
  );

  // Desktop: persistent drawer, open by default. Mobile: overlay drawer, closed by default.
  protected readonly desktopOpen = signal(true);
  protected readonly mobileOpen = signal(false);

  /** Whether the drawer is shown: the mobile overlay flag on narrow screens, else the
   *  persistent desktop flag. */
  protected readonly drawerVisible = computed(() =>
    this.isMobile() ? this.mobileOpen() : this.desktopOpen());

  protected toggleNav(): void {
    if (this.isMobile()) {
      this.mobileOpen.update(open => !open);
    } else {
      this.desktopOpen.update(open => !open);
    }
  }

  /** After following a link on mobile, close the overlay (desktop keeps its drawer open). */
  protected onNavigate(): void {
    if (this.isMobile()) {
      this.mobileOpen.set(false);
    }
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
