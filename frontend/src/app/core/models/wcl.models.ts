export interface WclFight {
  id: number;
  name: string;
  startTime: number;
  endTime: number;
  kill: boolean;
  encounterID: number;
  attempt: number;
  duration_s: number;
  friendlyPlayers: number[];
}

export interface WclPlayer {
  id: number;
  name: string;
  spec: string;
  server: string;
}

export interface WclAbility {
  gameID: number;
  name: string;
  icon: string;
}

/** A single combat-log event row as returned by WCL's `events` query. */
export interface WclEvent {
  type: string;
  timestamp: number;
  abilityGameID: number;
  amount?: number;
  absorbed?: number;
  // Positioning fields. WCL returns these in the raw event blob for many event
  // types (cast, damage, ...); they were previously discarded. Coordinates are
  // in hundredths of a yard, facing in radians. Not every event carries them.
  sourceID?: number;
  targetID?: number;
  x?: number;
  y?: number;
  facing?: number;
  mapID?: number;
}

export interface WclReport {
  title: string;
  fights: WclFight[];
  masterData: {
    actors: Array<{ id: number; name: string; subType: string; server: string }>;
    abilities: WclAbility[];
  };
}

export interface CharacterInfo {
  name: string;
  spec: string | null;
  server: string;
  region: string;
  source_report: string | null;
}

export interface CharacterGear {
  found: boolean;
  spec?: string;
  source_report?: string | null;
  talent_key?: string;
  trinkets?: Array<{ slot: number; id: number; name: string; icon?: string }>;
  enchants?: Array<{ slot: number; id: number; name: string }>;
  missing_enchant_slots?: number[];
  gem_count?: number;
  message?: string;
}

export interface WclUserCharacter {
  id: number;
  name: string;
  serverSlug: string;
  serverRegion: string;
}
