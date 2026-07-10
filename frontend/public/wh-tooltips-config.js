// Wowhead tooltip configuration. WowheadTooltipsService injects this as an
// external script (rather than inlining the global) so the Content-Security-Policy
// script-src can stay 'self' https://wow.zamimg.com without needing 'unsafe-inline',
// and injects it before https://wow.zamimg.com/js/tooltips.js so the global is set
// when it runs.
var whTooltips = { colorLinks: true, iconSize: 'small', renameLinks: false };
