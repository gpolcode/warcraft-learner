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
  /** An empty `dataBaseHref` resolves `data/specs/` relative to `document.baseURI`. */
  dataBaseHref: string;
  /** WCL zone names to bench; an empty list benches and prunes nothing. */
  currentRaids: readonly string[];
  prioritySpecs: readonly string[];
}

/** URL roots carry no trailing slash. The Node scripts load this module too, so it imports nothing from Angular. */
export function withEnvironment(deltas: Partial<Environment>): Environment {
  return {
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
    currentRaids: [],
    prioritySpecs: [],
    ...deltas,
  };
}
