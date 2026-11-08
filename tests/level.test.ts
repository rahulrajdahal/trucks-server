import { describe, it, expect } from 'vitest';
import { LevelSchema } from '../src/schemas/level.schema.js';
import { LevelSimulator } from '../src/services/puzzleSimulator.js';
import level1 from '../data/levels/1.json';
import level2 from '../data/levels/2.json';

describe('Level Schema Validation', () => {
  it('validates level 1 successfully', () => {
    const parsed = LevelSchema.safeParse(level1);
    expect(parsed.success).toBe(true);
  });

  it('validates level 2 successfully', () => {
    const parsed = LevelSchema.safeParse(level2);
    expect(parsed.success).toBe(true);
  });

  it('rejects a level with missing trucks', () => {
    const invalid = { ...level1, trucks: [] };
    const parsed = LevelSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects a level with negative track capacity', () => {
    const invalid = { ...level1, track_capacity: -1 };
    const parsed = LevelSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});

describe('Level Solvability Simulator', () => {
  it('confirms Level 1 is solvable within track capacity', () => {
    const sim = new LevelSimulator(level1 as any);
    const result = sim.solve();
    expect(result.solvable).toBe(true);
    expect(result.minMoves).toBeGreaterThan(0);
  });
});
