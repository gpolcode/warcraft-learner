import { mapToCanDeactivate, Routes } from '@angular/router';
import { PostRaid } from './post-raid/post-raid';
import { LeaveLiveSessionGuard } from './post-raid/leave-live-session-guard';

export const routes: Routes = [
  {
    // Lazy-loading the first-paint route would chain one more round trip behind main.js.
    path: '',
    component: PostRaid,
    data: { pageTitle: 'Analyze' },
    canDeactivate: mapToCanDeactivate([LeaveLiveSessionGuard]),
  },
  {
    path: 'pre',
    data: { pageTitle: 'Pre-fight' },
    loadComponent: () => import('./pre-fight/pre-fight').then(m => m.PreFight),
  },
  { path: '**', redirectTo: '' },
];
