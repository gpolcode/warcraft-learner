export interface Environment {
  wclClientId: string;
  wclClientSecret: string;
  wclTokenUrl: string;
  wclApiUrl: string;
  wclReportUrl: string;
  raidbotsTalentsUrl: string;
  raidbotsEnchantmentsUrl: string;
  simcRawUrl: string;
  northernSkyRawUrl: string;
  zamimgIconUrl: string;
  zamimgTooltipsUrl: string;
  rpglogsSpecIconUrl: string;
  rpglogsBossIconUrl: string;
  wowheadUrl: string;
  repoUrl: string;
  appUrl: string;
  ingestServerUrl: string;
  /** Empty means the bench data sits in the page's own `data/specs/` folder. */
  dataBaseHref: string;
  /** The WCL zone names ingestion benches. */
  currentRaids: readonly string[];
  prioritySpecs: readonly string[];
  /** Relative to `frontend/`; the file server reads only this default, so a build override can only empty it, which turns the store off. */
  wclResponseCacheDir: string;
  /** The e2e suite picks this report's first pull and first raider blind, so it holds exactly one boss pull, a Mythic kill, whose first-listed raider plays a spec with a benched priority list. */
  e2eReportCode: string;
}

/** URL roots carry no trailing slash. No imports, so plain Node can load this module without Angular. */
export const baseEnvironment: Environment = {
  wclClientId: '',
  wclClientSecret: '',
  wclTokenUrl: 'https://www.warcraftlogs.com/oauth/token',
  wclApiUrl: 'https://www.warcraftlogs.com/api/v2/client',
  wclReportUrl: 'https://www.warcraftlogs.com/reports',
  raidbotsTalentsUrl: 'https://www.raidbots.com/static/data/live/talents.json',
  raidbotsEnchantmentsUrl: 'https://www.raidbots.com/static/data/live/enchantments.json',
  simcRawUrl: 'https://raw.githubusercontent.com/simulationcraft/simc/HEAD',
  northernSkyRawUrl: 'https://raw.githubusercontent.com/Reloe/NorthernSkyRaidTools/main/NorthernSkyRaidTools',
  zamimgIconUrl: 'https://wow.zamimg.com/images/wow/icons/small',
  zamimgTooltipsUrl: 'https://wow.zamimg.com/js/tooltips.js',
  rpglogsSpecIconUrl: 'https://assets.rpglogs.com/img/warcraft/icons',
  rpglogsBossIconUrl: 'https://assets.rpglogs.com/img/warcraft/bosses',
  wowheadUrl: 'https://www.wowhead.com',
  repoUrl: 'https://github.com/gpolcode/warcraft-learner',
  appUrl: 'http://localhost:4200',
  ingestServerUrl: 'http://localhost:3000',
  dataBaseHref: '',
  currentRaids: ['The Venomous Abyss'],
  prioritySpecs: ['AssassinationRogue'],
  wclResponseCacheDir: '.wcl-cache',
  e2eReportCode: 'd9DFngCafqmLyQvN',
};
