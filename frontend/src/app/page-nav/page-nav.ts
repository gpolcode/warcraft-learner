import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { NavStateStore } from './nav-state-store';

const GITHUB_URL = 'https://github.com/gpolcode/warcraft-learner';
const NEW_ISSUE_URL = `${GITHUB_URL}/issues/new`;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-page-nav',
  imports: [RouterLink, RouterLinkActive, NgIcon, HlmButtonImports, HlmSidebarImports],
  templateUrl: './page-nav.html',
  host: { class: 'block' },
})
export class PageNav {
  protected readonly githubUrl = GITHUB_URL;
  protected readonly newIssueUrl = NEW_ISSUE_URL;
  private readonly sidebar = inject(HlmSidebarService);
  private readonly navState = inject(NavStateStore);

  constructor() {
    this.sidebar.setOpen(!this.navState.loadCollapsed());
    effect(() => { this.navState.saveCollapsed(!this.sidebar.open()); });
  }
}
