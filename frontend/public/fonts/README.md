# Self-hosted web fonts

The site serves both of its fonts from its own origin, so a page load opens no
connection to `fonts.googleapis.com` / `fonts.gstatic.com`. The `@font-face`
rules and the two `<link rel="preload">` hints live in `frontend/src/index.html`.

| File | Family | Source |
|---|---|---|
| `schibsted-grotesk-latin.woff2` | Schibsted Grotesk, weights 400-600, latin | Google Fonts (SIL Open Font License 1.1) |
| `schibsted-grotesk-latin-ext.woff2` | Schibsted Grotesk, weights 400-600, latin-ext | Google Fonts (SIL Open Font License 1.1) |
| `material-symbols-outlined-subset.woff2` | Material Symbols Outlined, subset to the icons the app renders | Google Fonts (SIL Open Font License 1.1) |

## Refreshing a file

Google Fonts serves a different CSS per user agent, so ask for the woff2
variant with a recent Chrome UA and take the `src: url(...)` out of the reply:

```bash
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
curl -A "$UA" 'https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600'
```

The two Schibsted Grotesk `@font-face` blocks in that reply (`latin` and
`latin-ext`) name the two files above; download each `src` URL over the same
name. Keep the `unicode-range` of each block in sync with `index.html`.

## Adding an icon

The Material Symbols file is subset to an explicit icon list, so a `<mat-icon>`
naming an icon outside that list renders as its ligature text. Add the new name
to the `icon_names` list below (alphabetical), fetch, and overwrite
`material-symbols-outlined-subset.woff2`:

```bash
curl -A "$UA" 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=analytics,arrow_forward,bug_report,check_circle,close,cloud_off,cloud_sync,download,emoji_events,error,expand_less,expand_more,flag,help_outline,info,insights,lightbulb,menu,military_tech,more_vert,my_location,pause,play_arrow,schedule,skull,videocam,warning_amber'
```
