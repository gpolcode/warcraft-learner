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
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WclAuthService } from '../../../core/services/wcl-auth';

const GITHUB_URL = 'https://github.com/gpolcode/warcraft-learner';
const MOBILE_QUERY = '(max-width: 600px)';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-page-nav',
  imports: [
    RouterLink, RouterLinkActive, MatToolbarModule, MatSidenavModule, MatListModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, MatTooltipModule,
  ],
  templateUrl: './page-nav.html',
  styleUrl: './page-nav.scss',
})
export class PageNavComponent {
  protected readonly auth = inject(WclAuthService);
  protected readonly githubUrl = GITHUB_URL;
  private readonly breakpoints = inject(BreakpointObserver);

  protected readonly isMobile = toSignal(
    this.breakpoints.observe(MOBILE_QUERY).pipe(map(result => result.matches)),
    { initialValue: false },
  );

  // Desktop: the drawer is always visible and the menu button toggles it between
  // icon-only and labelled. Mobile: the drawer is an overlay opened on demand.
  protected readonly collapsed = signal(true);
  protected readonly mobileOpen = signal(false);

  protected readonly sidenavMode = computed<'over' | 'side'>(() =>
    this.isMobile() ? 'over' : 'side');
  protected readonly sidenavOpened = computed(() =>
    this.isMobile() ? this.mobileOpen() : true);
  protected readonly showLabels = computed(() => this.isMobile() || !this.collapsed());

  protected toggleNav(): void {
    if (this.isMobile()) {
      this.mobileOpen.update(open => !open);
    } else {
      this.collapsed.update(value => !value);
    }
  }

  protected onNavigate(): void {
    if (this.isMobile()) {
      this.mobileOpen.set(false);
    }
  }

  protected onOpenedChange(opened: boolean): void {
    if (this.isMobile()) {
      this.mobileOpen.set(opened);
    }
  }

  protected signIn(): void {
    this.auth.login();
  }

  protected signOut(): void {
    this.auth.logout();
  }
}
