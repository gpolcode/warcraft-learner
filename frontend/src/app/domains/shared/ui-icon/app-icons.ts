import {
  lucideArrowRight, lucideBug, lucideChartColumn, lucideCheck, lucideChevronDown, lucideChevronUp, lucideCircleAlert,
  lucideCircleCheck, lucideCircleHelp, lucideClock, lucideCloudOff, lucideCopy, lucideDownload, lucideFlag,
  lucideInfo, lucideLightbulb, lucideLink, lucideLocateFixed, lucideMedal, lucidePause, lucidePlay, lucideRefreshCw,
  lucideSkull, lucideTrendingUp, lucideTriangleAlert, lucideTrophy, lucideVideo, lucideX,
} from '@ng-icons/lucide';

// Lucide ships no brand marks.
const GITHUB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577
    0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756
    -1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997
    .107-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.465-2.381 1.235-3.221
    -.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138
    3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.911 1.23 3.221
    0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286
    0 .315.21.69.825.57C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
</svg>`;

// ng-icon camel-cases the name it is given, so the data layer's snake_case status icons (warning_amber) land on these keys.
export const APP_ICONS = {
  analytics: lucideChartColumn,
  arrowForward: lucideArrowRight,
  bugReport: lucideBug,
  check: lucideCheck,
  checkCircle: lucideCircleCheck,
  close: lucideX,
  cloudOff: lucideCloudOff,
  cloudSync: lucideRefreshCw,
  contentCopy: lucideCopy,
  download: lucideDownload,
  emojiEvents: lucideTrophy,
  error: lucideCircleAlert,
  expandLess: lucideChevronUp,
  expandMore: lucideChevronDown,
  flag: lucideFlag,
  github: GITHUB_SVG,
  helpOutline: lucideCircleHelp,
  info: lucideInfo,
  insights: lucideTrendingUp,
  lightbulb: lucideLightbulb,
  link: lucideLink,
  militaryTech: lucideMedal,
  myLocation: lucideLocateFixed,
  pause: lucidePause,
  playArrow: lucidePlay,
  schedule: lucideClock,
  skull: lucideSkull,
  videocam: lucideVideo,
  warningAmber: lucideTriangleAlert,
};
