import { EnvironmentProviders, Provider, signal } from '@angular/core';
import { TUI_DARK_MODE, provideTaiga, tuiButtonOptionsProvider, tuiIconsProvider, tuiTextfieldOptionsProvider } from '@taiga-ui/core';
import { tuiCardOptionsProvider } from '@taiga-ui/layout';
import arrowRight from '@taiga-ui/icons/src/arrow-right.svg';
import bug from '@taiga-ui/icons/src/bug.svg';
import chartColumn from '@taiga-ui/icons/src/chart-column.svg';
import chartSpline from '@taiga-ui/icons/src/chart-spline.svg';
import check from '@taiga-ui/icons/src/check.svg';
import chevronDown from '@taiga-ui/icons/src/chevron-down.svg';
import chevronRight from '@taiga-ui/icons/src/chevron-right.svg';
import circleAlert from '@taiga-ui/icons/src/circle-alert.svg';
import circleCheck from '@taiga-ui/icons/src/circle-check.svg';
import circleHelp from '@taiga-ui/icons/src/circle-help.svg';
import clock from '@taiga-ui/icons/src/clock.svg';
import cloudOff from '@taiga-ui/icons/src/cloud-off.svg';
import cloudSync from '@taiga-ui/icons/src/cloud-sync.svg';
import copy from '@taiga-ui/icons/src/copy.svg';
import download from '@taiga-ui/icons/src/download.svg';
import flag from '@taiga-ui/icons/src/flag.svg';
import info from '@taiga-ui/icons/src/info.svg';
import lightbulb from '@taiga-ui/icons/src/lightbulb.svg';
import link from '@taiga-ui/icons/src/link.svg';
import locateFixed from '@taiga-ui/icons/src/locate-fixed.svg';
import medal from '@taiga-ui/icons/src/medal.svg';
import panelLeftClose from '@taiga-ui/icons/src/panel-left-close.svg';
import panelLeftOpen from '@taiga-ui/icons/src/panel-left-open.svg';
import pause from '@taiga-ui/icons/src/pause.svg';
import play from '@taiga-ui/icons/src/play.svg';
import skull from '@taiga-ui/icons/src/skull.svg';
import triangleAlert from '@taiga-ui/icons/src/triangle-alert.svg';
import trophy from '@taiga-ui/icons/src/trophy.svg';
import video from '@taiga-ui/icons/src/video.svg';
import x from '@taiga-ui/icons/src/x.svg';
import github from './github.svg';

// Keyed by the snake_case names the data layer emits (a window's statusIcon, a finding's severity), so a name stays the one contract between data and template.
const APP_ICONS: Record<string, string> = {
  analytics: chartColumn,
  arrow_forward: arrowRight,
  bug_report: bug,
  check,
  check_circle: circleCheck,
  close: x,
  cloud_off: cloudOff,
  cloud_sync: cloudSync,
  download,
  emoji_events: trophy,
  error: circleAlert,
  flag,
  github,
  help_outline: circleHelp,
  info,
  insights: chartSpline,
  left_panel_close: panelLeftClose,
  left_panel_open: panelLeftOpen,
  lightbulb,
  link,
  military_tech: medal,
  my_location: locateFixed,
  pause,
  play_arrow: play,
  schedule: clock,
  skull,
  videocam: video,
  warning_amber: triangleAlert,
};

// Taiga's own controls ask for these; registered inline, an unregistered name would fetch from an icon folder the deploy never ships.
const TAIGA_ICONS: Record<string, string> = {
  '@tui.check': check,
  '@tui.chevron-down': chevronDown,
  '@tui.chevron-right': chevronRight,
  // The copy buttons swap to it once copied; unregistered, the confirmation shows as an empty box.
  '@tui.circle-check': circleCheck,
  '@tui.copy': copy,
  '@tui.info': info,
  '@tui.x': x,
};

export const TAIGA_PROVIDERS: (Provider | EnvironmentProviders)[] = [
  // Text is sized in px roles, so the OS font scale must not grow Taiga's rem-based text alone.
  ...provideTaiga({ fontScaling: false }),
  // Dark-only: a fixed signal, since Taiga's own would follow the OS theme or, once pinned, write the choice to localStorage.
  { provide: TUI_DARK_MODE, useValue: Object.assign(signal(true), { reset: () => undefined }) },
  tuiIconsProvider({ ...TAIGA_ICONS, ...APP_ICONS }),
  // One control size app-wide, so a button or field never sizes by where it sits; every select also has a value, so none offers a clear button.
  tuiButtonOptionsProvider({ size: 's' }),
  tuiTextfieldOptionsProvider({ size: signal('s'), cleaner: signal(false) }),
  // Taiga's tightest card spacing, so a data card reads as a dense table rather than its roomier default.
  tuiCardOptionsProvider({ space: '' }),
];
