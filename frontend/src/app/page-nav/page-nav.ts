import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { TUI_BREAKPOINT, TuiButton } from '@taiga-ui/core';
import { TuiTabBar } from '@taiga-ui/addon-mobile';
import { TuiNavigation } from '@taiga-ui/layout';
import { NavStateStore } from './nav-state-store';
import { ENVIRONMENT } from '../../environments/environment-token';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-page-nav',
  imports: [RouterLink, RouterLinkActive, TuiNavigation, TuiButton, TuiTabBar],
  templateUrl: './page-nav.html',
  host: { class: 'block' },
})
export class PageNav {
  protected readonly githubUrl = inject(ENVIRONMENT).repoUrl;
  protected readonly newIssueUrl = `${this.githubUrl}/issues/new`;
  private readonly router = inject(Router);
  private readonly navState = inject(NavStateStore);
  private readonly breakpoint = inject(TUI_BREAKPOINT);

  protected readonly isMobile = computed(() => this.breakpoint() === 'mobile');
  protected readonly expanded = signal(!this.navState.loadCollapsed());

  protected readonly pageTitle = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.titleOf(this.router.routerState.snapshot.root)),
    ),
    { initialValue: '' },
  );

  protected toggleRail(): void {
    this.expanded.update(expanded => !expanded);
    this.navState.saveCollapsed(!this.expanded());
  }

  private titleOf(route: ActivatedRouteSnapshot): string {
    const child = route.firstChild;
    const own: unknown = route.data['pageTitle'];
    return child ? this.titleOf(child) : typeof own === 'string' ? own : '';
  }
}
