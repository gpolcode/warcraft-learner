import { Injectable } from '@angular/core';
import { DefensiveWindow } from '../analysis/analysis.models';
import { TimedEvent } from '../analysis/wcl-projections-service';

type BuffSpan = readonly [number, number | null];

// Covers the few ms a press and its self aura can land apart in either order; an aura from another source rarely opens this close to a press.
const OPENS_WITHIN_S = 1;

@Injectable({ providedIn: 'root' })
export class DefensiveUsesService {
  /** A button's return press logs under another id of its name (Alter Time returns as 342247), so only the button's own id is a press. */
  castTimesS(castEvents: readonly TimedEvent[], spellId: number): number[] {
    return castEvents.filter(event => event.type === 'cast' && event.abilityGameID === spellId).map(event => event.atS);
  }

  /** WCL gives a self-cast the caster's enemy as target, so only a self aura of the button's name opening at the press tells a self-buff (its window) from an external (a point use); an aura no press opened came from elsewhere and counts only when up at the pull. */
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
