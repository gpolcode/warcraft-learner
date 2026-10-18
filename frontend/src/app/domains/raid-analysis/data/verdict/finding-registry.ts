import { FindingFamily } from './finding-family.models';
import { LOST_CAST_FAMILY, NEVER_USED_FAMILY } from '../rotation/cooldown-use-judge-service';
import { ROTATION_BUTTON_FAMILY } from '../rotation/priority-list/button-judge-service';

/** Every finding family the page can color; the conformance spec walks it. */
export const FINDING_REGISTRY: readonly FindingFamily[] = [ROTATION_BUTTON_FAMILY, LOST_CAST_FAMILY, NEVER_USED_FAMILY];
