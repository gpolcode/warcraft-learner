import { Routes } from '@angular/router';
import { PostRaid } from './post-raid/post-raid';

export const routes: Routes = [
  {
    // Lazy-loading the first-paint route would chain one more round trip behind main.js.
    path: '',
    component: PostRaid,
  },
  {
    path: 'pre',
    loadComponent: () => import('./pre-fight/pre-fight').then(m => m.PreFight),
  },
  { path: '**', redirectTo: '' },
];
