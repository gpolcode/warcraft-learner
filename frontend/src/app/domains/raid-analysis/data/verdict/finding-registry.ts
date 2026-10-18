import { FindingFamily } from './finding-family.models';
import { LOST_CAST_FAMILY, NEVER_USED_FAMILY } from '../rotation/cooldown-use-judge-service';
import { ROTATION_BUTTON_FAMILY } from '../rotation/priority-list/button-judge-service';
import { COOLDOWN_GAP_FAMILY, COOLDOWN_HOLD_FAMILY, LATE_OPENER_FAMILY } from '../rotation/cadence-judge-service';
import { DOWNTIME_FAMILY } from '../rotation/downtime-judge-service';
import { BURST_WINDOW_FAMILY } from '../burst-windows/burst-judge-service';

/** Every finding family the page can color; the conformance spec walks it. */
export const FINDING_REGISTRY: readonly FindingFamily[] = [
  ROTATION_BUTTON_FAMILY, LOST_CAST_FAMILY, NEVER_USED_FAMILY,
  LATE_OPENER_FAMILY, COOLDOWN_GAP_FAMILY, COOLDOWN_HOLD_FAMILY, DOWNTIME_FAMILY,
  BURST_WINDOW_FAMILY,
];
