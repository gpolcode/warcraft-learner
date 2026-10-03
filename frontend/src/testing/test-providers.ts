import { signal } from '@angular/core';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { TUI_DARK_MODE, TUI_OPTIONS } from '@taiga-ui/core';

// The parts of provideTaiga the components read, without its boot hook, which writes to a DOCUMENT some specs fake. The app's TAIGA_PROVIDERS cannot be imported here: an app module in this file leaves @angular/common unlinked in the test bundle.
export default [
  // Taiga's own templates bind `.self`, `.prevent` and `.zoneless` event modifiers, which do nothing without its plugins.
  provideEventPlugins(),
  { provide: TUI_OPTIONS, useValue: { apis: 'stable', fontScaling: false, scrollbars: 'native' } },
  // The default signal reads localStorage on first inject, which a spec that makes storage throw must not trip.
  { provide: TUI_DARK_MODE, useValue: Object.assign(signal(true), { reset: () => undefined }) },
];
