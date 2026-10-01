import { Injectable } from '@angular/core';
import { DefensiveWindow } from '../analysis/analysis.models';
import { TimedEvent } from '../analysis/wcl-projections-service';

type BuffSpan = readonly [number, number | null];

// A press and its self aura log a few ms apart in either order; an aura from another source rarely opens this close to a press.
const OPENS_WITHIN_S = 1;

@Injectable({ providedIn: 'root' })
export class DefensiveUsesService {
  // A return press logs under another id of the button's name (Alter Time returns as 342247).
  castTimesS(castEvents: readonly TimedEvent[], spellId: number): number[] {
    return castEvents.filter(event => event.type === 'cast' && event.abilityGameID === spellId).map(event => event.atS);
  }

  // WCL gives a self-cast the caster's enemy as target, so only a self aura opening at the press tells a self-buff from an external.
  uses(spans: readonly BuffSpan[], castTimesS: readonly number[], fightEndS: number): DefensiveWindow[] {
    const endOf = (span: BuffSpan): number => span[1] ?? fightEndS;
    const unclaimed = [...spans];
    const claimed: BuffSpan[] = [];
    const uses: DefensiveWindow[] = [];
    const inFight = castTimesS.filter(castS => castS >= 0 && castS <= fightEndS).sort((a, b) => a - b);
    for (const castS of inFight) {
      // A second press while the aura it opened runs (a return, a cancel) ends that use rather than starting one.
      if (claimed.some(span => span[0] < castS && castS <= endOf(span))) continue;
      const opened = unclaimed.findIndex(span => Math.abs(span[0] - castS) <= OPENS_WITHIN_S);
      const [span] = opened >= 0 ? unclaimed.splice(opened, 1) : [];
      if (span) claimed.push(span);
      uses.push({ start_s: castS, end_s: span ? endOf(span) : castS });
    }
    const prePull = unclaimed.filter(span => span[0] === 0).map(span => ({ start_s: 0, end_s: endOf(span) }));
    return [...prePull, ...uses];
  }
}
