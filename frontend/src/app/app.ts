import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiRoot } from '@taiga-ui/core';
import { PageNav } from './page-nav/page-nav';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-root',
  imports: [TuiRoot, RouterOutlet, PageNav],
  templateUrl: './app.html',
  host: { class: 'block' },
})
export class App {}
