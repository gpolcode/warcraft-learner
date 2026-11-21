import { Injectable } from '@angular/core';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { FINDING_REGISTRY } from '../finding-registry';
import { VERDICT_CHOICES } from '../verdict-choices';

const HASH_LENGTH = 16;

@Injectable({ providedIn: 'root' })
export class RegistryHashService {
  /** Every id, version, tier, cost class and rule, and every chosen number: a change to any re-runs calibration and invalidates the index. */
  registryHash(): string {
    const families = FINDING_REGISTRY.map(family => [family.id, family.version, family.tier, family.costClass, family.rule]);
    return bytesToHex(sha256(utf8ToBytes(JSON.stringify({ families, choices: VERDICT_CHOICES })))).slice(0, HASH_LENGTH);
  }
}
