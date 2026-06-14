import { describe, it, expect } from 'vitest';
import { computeAnalysis, AnalysisInput } from './analysis-core';

describe('analysis-core', () => {
  const fStart = 1000000;
  const fEnd = 1100000; // 100s fight

  const mockInput: AnalysisInput = {
    playerName: 'TestPlayer',
    spec: 'SubtletyRogue',
    fStart,
    fEnd,
    castEvents: [],
    buffEvents: [],
    dmgEvents: [],
    dtEvents: [],
    rulebook: {
      spec: 'SubtletyRogue',
      major_cooldowns: [
        { name: 'Shadow Dance', spell_id: 185313, cooldown: 60, duration: 8 }
      ],
      rules: [
        {
          type: 'cooldown_pairing',
          priority: 'critical',
          description: 'Secret Technique always inside Shadow Dance',
          condition: {
            kind: 'cast_without_prior',
            spell_id: 280719,
            spell_name: 'Secret Technique',
            required_spell_id: 185313,
            required_spell_name: 'Shadow Dance',
            window_s: 8
          },
          action: 'Always cast Secret Technique immediately after activating Shadow Dance'
        }
      ]
    },
    bench: null,
    masterAbilities: []
  };

  it('should flag Secret Technique cast without Shadow Dance', () => {
    const input: AnalysisInput = {
      ...mockInput,
      castEvents: [
        { type: 'cast', timestamp: fStart + 10000, abilityGameID: 280719 } // SecTech at 10s
      ]
    };

    const result = computeAnalysis(input);
    const violation = result.findings.find(f => f.category === 'rule_violation');
    expect(violation).toBeDefined();
    expect(violation?.message).toContain('Secret Technique without Shadow Dance');
  });

  it('should NOT flag Secret Technique cast within Shadow Dance window', () => {
    const input: AnalysisInput = {
      ...mockInput,
      castEvents: [
        { type: 'cast', timestamp: fStart + 10000, abilityGameID: 185313 }, // Dance at 10s
        { type: 'cast', timestamp: fStart + 12000, abilityGameID: 280719 }  // SecTech at 12s
      ]
    };

    const result = computeAnalysis(input);
    const violation = result.findings.find(f => f.category === 'rule_violation');
    expect(violation).toBeUndefined();
  });

  describe('buff-based rules', () => {
    const buffInput: AnalysisInput = {
      ...mockInput,
      rulebook: {
        spec: 'AssassinationRogue',
        rules: [
          {
            description: 'Never Rupture during Darkest Night',
            condition: {
              kind: 'cast_with_buff',
              spell_id: 1943, // Rupture
              spell_name: 'Rupture',
              buff_id: 441064, // Darkest Night
              buff_name: 'Darkest Night'
            },
            action: 'Never cast Rupture when you have the Darkest Night buff active'
          },
          {
            description: 'Kingsbane only during Deathmark',
            condition: {
              kind: 'cast_without_buff',
              spell_id: 385627, // Kingsbane
              spell_name: 'Kingsbane',
              buff_id: 360194, // Deathmark
              buff_name: 'Deathmark'
            },
            action: 'Kingsbane should only be used while Deathmark is active'
          }
        ]
      }
    };

    it('should flag cast_with_buff violation', () => {
      const input: AnalysisInput = {
        ...buffInput,
        castEvents: [{ type: 'cast', timestamp: fStart + 10000, abilityGameID: 1943 }],
        buffEvents: [
          { type: 'applybuff', timestamp: fStart + 5000, abilityGameID: 441064 },
          { type: 'removebuff', timestamp: fStart + 15000, abilityGameID: 441064 }
        ]
      };
      const result = computeAnalysis(input);
      const violation = result.findings.find(f => f.message.includes('Rupture while Darkest Night active'));
      expect(violation).toBeDefined();
    });

    it('should NOT flag cast_with_buff when buff is NOT active', () => {
      const input: AnalysisInput = {
        ...buffInput,
        castEvents: [{ type: 'cast', timestamp: fStart + 20000, abilityGameID: 1943 }],
        buffEvents: [
          { type: 'applybuff', timestamp: fStart + 5000, abilityGameID: 441064 },
          { type: 'removebuff', timestamp: fStart + 15000, abilityGameID: 441064 }
        ]
      };
      const result = computeAnalysis(input);
      const violation = result.findings.find(f => f.message.includes('Rupture while Darkest Night active'));
      expect(violation).toBeUndefined();
    });

    it('should flag cast_without_buff violation', () => {
      const input: AnalysisInput = {
        ...buffInput,
        castEvents: [{ type: 'cast', timestamp: fStart + 10000, abilityGameID: 385627 }],
        buffEvents: [] // No Deathmark
      };
      const result = computeAnalysis(input);
      const violation = result.findings.find(f => f.message.includes('Kingsbane without Deathmark active'));
      expect(violation).toBeDefined();
    });

    it('should NOT flag cast_without_buff when buff IS active', () => {
      const input: AnalysisInput = {
        ...buffInput,
        castEvents: [{ type: 'cast', timestamp: fStart + 10000, abilityGameID: 385627 }],
        buffEvents: [
          { type: 'applybuff', timestamp: fStart + 5000, abilityGameID: 360194 },
          { type: 'removebuff', timestamp: fStart + 15000, abilityGameID: 360194 }
        ]
      };
      const result = computeAnalysis(input);
      const violation = result.findings.find(f => f.message.includes('Kingsbane without Deathmark active'));
      expect(violation).toBeUndefined();
    });
  });
});
