import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

const GITHUB_URL = 'https://github.com/gpolcode/warcraft-learner';
const MOBILE_QUERY = '(max-width: 600px)';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-page-nav',
  imports: [
    RouterLink, RouterLinkActive, MatToolbarModule, MatSidenavModule, MatListModule,
    MatButtonModule, MatIconModule, MatDividerModule, MatTooltipModule,
  ],
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

  // Mobile: a modal drawer that overlays everything (top app bar included),
  // closed by default. Desktop: a permanent drawer that collapses to an
  // icons-only rail, expanded by default.
  protected readonly mobileOpen = signal(false);
  protected readonly desktopCollapsed = signal(false);

  protected readonly sidenavMode = computed<'over' | 'side'>(() =>
    this.isMobile() ? 'over' : 'side');
  // The desktop drawer stays open at all times; the hamburger toggles its width,
  // not its opened state, so it never fully disappears.
  protected readonly sidenavOpened = computed(() =>
    this.isMobile() ? this.mobileOpen() : true);
  protected readonly railCollapsed = computed(() =>
    !this.isMobile() && this.desktopCollapsed());

  protected toggleNav(): void {
    if (this.isMobile()) {
      this.mobileOpen.update(open => !open);
    } else {
      this.desktopCollapsed.update(collapsed => !collapsed);
    }
  }

  protected onNavigate(): void {
    if (this.isMobile()) {
      this.mobileOpen.set(false);
    }
  }

  protected onOpenedChange(opened: boolean): void {
    // Backdrop click / escape only closes the mobile overlay; the desktop rail
    // is permanent and toggled through its width, not its opened state.
    if (this.isMobile()) {
      this.mobileOpen.set(opened);
    }
  }
}
