import { inject, Injectable } from '@angular/core';
import { GearBench, GearParseMeasures } from '../../gear/gear-data-source';
import {
  ENCHANT_CHOICE_FAMILY, ENCHANT_MISSING_FAMILY, GearJudgeService, PickReference, TALENT_BUILD_FAMILY, TRINKET_PAIR_FAMILY,
} from '../../gear/gear-judge-service';
import { ToneService } from '../tone-service';
import { VERDICT_CHOICES } from '../verdict-choices';
import { HeldOutRow } from './calibration.models';
import { HeldOutRowService } from './held-out-row-service';

@Injectable({ providedIn: 'root' })
export class GearHeldOutService {
  private readonly rows = inject(HeldOutRowService);
  private readonly judges = inject(GearJudgeService);
  private readonly tones = inject(ToneService);

  /** `fold` is the bench rebuilt without the held-out log; its ranked lists and node counts come from the fold's own logs, since the baked ones count the held-out log too. */
  judge(fold: GearBench, picks: GearParseMeasures): HeldOutRow[] {
    const talents = this.judges.talentReference(fold);
    const trinkets = this.judges.trinketReference(fold.per_parse);
    const trinket = this.judges.trinketVerdict(this.judges.trinketKey(picks.trinket_ids), this.ranked(trinkets), trinkets);
    return [
      ...this.judges.nodeTones(picks.talent_key, talents).flatMap(node => this.rows.toneRow(TALENT_BUILD_FAMILY.id, node.tone, talents.n)),
      ...trinket ? this.rows.toneRow(TRINKET_PAIR_FAMILY.id, trinket.tone, trinket.n) : [],
      ...this.enchantRows(fold, picks),
    ];
  }

  /** Every slot the other top logs enchant is one test of each enchant family; the row the judge gives the slot sets its tone. */
  private enchantRows(fold: GearBench, picks: GearParseMeasures): HeldOutRow[] {
    const gear = { enchants: Object.entries(picks.enchant_ids).map(([slot, id]) => ({ slot: Number(slot), id, name: '' })) };
    const judged = this.judges.enchantRows(gear, fold.enchants, fold.per_parse, String);
    return this.judges.enchantLeaders(fold.enchants, fold.per_parse)
      .filter(leader => leader.n >= VERDICT_CHOICES.minReferenceN)
      .flatMap(leader => {
        const row = judged.find(entry => entry.slotName === String(leader.slot));
        return [ENCHANT_MISSING_FAMILY, ENCHANT_CHOICE_FAMILY].flatMap(family => this.rows.toneRow(
          family.id, row?.family === family.id ? row.tone : this.tones.neutral(), leader.n,
        ));
      });
  }

  /** Most common first; a tie keeps the order the keys first appear in. */
  private ranked(reference: PickReference): { key: string; label: string }[] {
    return [...reference.counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([key], rank) => ({ key, label: rank === 0 ? 'Most common' : 'Common' }));
  }
}
