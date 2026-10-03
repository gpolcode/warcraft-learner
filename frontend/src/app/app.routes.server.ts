import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'pre', renderMode: RenderMode.Prerender },
  // Also emits index.csr.html, the unrendered shell the deploy serves as the site-wide 404.html.
  { path: '**', renderMode: RenderMode.Client },
];
