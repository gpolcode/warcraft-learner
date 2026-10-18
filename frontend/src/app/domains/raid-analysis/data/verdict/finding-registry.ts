import { FindingFamily } from './finding-family.models';
import { NEVER_USED_FAMILY } from '../rotation/cooldown-use-judge-service';
import { ROTATION_BUTTON_FAMILY } from '../rotation/priority-list/button-judge-service';
import { COOLDOWN_HOLD_FAMILY } from '../rotation/cadence-judge-service';
import { READY_TIME_FAMILY } from '../rotation/ready-time-judge-service';
import { DOWNTIME_FAMILY } from '../rotation/downtime-judge-service';
import { BLOODLUST_ALIGNMENT_FAMILY, BLOODLUST_TIMING_FAMILY } from '../rotation/bloodlust-judge-service';
import { BURST_WINDOW_FAMILY } from '../burst-windows/burst-judge-service';
import {
  DEAD_IN_WINDOW_FAMILY, DEFENSIVE_HOLD_FAMILY, DEFENSIVE_READY_TIME_FAMILY, DEFENSIVE_USES_FAMILY, DEFENSIVE_WINDOW_FAMILY,
} from '../defensive/defensive-judge-service';
import { ENCHANT_CHOICE_FAMILY, ENCHANT_MISSING_FAMILY, TALENT_BUILD_FAMILY, TRINKET_PAIR_FAMILY } from '../gear/gear-judge-service';

/** Every finding family the page can color; the conformance spec walks it. */
export const FINDING_REGISTRY: readonly FindingFamily[] = [
  ROTATION_BUTTON_FAMILY, READY_TIME_FAMILY, NEVER_USED_FAMILY,
  COOLDOWN_HOLD_FAMILY, DOWNTIME_FAMILY,
  BLOODLUST_ALIGNMENT_FAMILY, BLOODLUST_TIMING_FAMILY,
  BURST_WINDOW_FAMILY,
  DEFENSIVE_USES_FAMILY, DEFENSIVE_READY_TIME_FAMILY, DEFENSIVE_HOLD_FAMILY, DEFENSIVE_WINDOW_FAMILY, DEAD_IN_WINDOW_FAMILY,
  TALENT_BUILD_FAMILY, TRINKET_PAIR_FAMILY, ENCHANT_MISSING_FAMILY, ENCHANT_CHOICE_FAMILY,
];
