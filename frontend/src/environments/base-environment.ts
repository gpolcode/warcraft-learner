export interface Environment {
  /** Empty when the build did not run through `scripts/ng-env.mjs`, which is the only thing that defines the pair. */
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
  /** WCL zone names ingestion benches; every other raid's data is pruned, and an empty list prunes nothing. */
  currentRaids: readonly string[];
  prioritySpecs: readonly string[];
}

/** URL roots carry no trailing slash. The Node scripts read these defaults too, so this module imports nothing. */
export function withEnvironment(deltas: Partial<Environment>): Environment {
  return {
    // `typeof` because unit tests and the Node scripts load this outside an `ng` build, where neither global exists.
    wclClientId: typeof WCL_CLIENT_ID === 'string' ? WCL_CLIENT_ID : '',
    wclClientSecret: typeof WCL_CLIENT_SECRET === 'string' ? WCL_CLIENT_SECRET : '',
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
