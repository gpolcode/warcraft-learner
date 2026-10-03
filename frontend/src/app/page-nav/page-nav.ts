import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { filter, map } from 'rxjs';

const GITHUB_URL = 'https://github.com/gpolcode/warcraft-learner';
const NEW_ISSUE_URL = `${GITHUB_URL}/issues/new`;

interface NavPage {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
  readonly exact: boolean;
}

const PAGES: readonly NavPage[] = [
  { path: '/pre', label: 'Pre-fight', icon: 'lightbulb', exact: false },
  { path: '/', label: 'Analyze', icon: 'analytics', exact: true },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-page-nav',
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, NgIcon, HlmButtonImports, HlmSeparator, HlmSidebarImports],
  templateUrl: './page-nav.html',
  host: { class: 'block' },
})
export class PageNav {
  protected readonly githubUrl = GITHUB_URL;
  protected readonly newIssueUrl = NEW_ISSUE_URL;
  protected readonly pages = PAGES;

  private readonly router = inject(Router);
  private readonly path = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects.split(/[?#]/)[0] ?? '/'),
    ),
    { initialValue: '/' },
  );

  protected readonly currentPage = computed(() => {
    const path = this.path();
    return PAGES.find(page => (page.exact ? path === page.path : path.startsWith(page.path)));
  });
}
