export type { Level, Truck, WinCondition } from '../schemas/level.schema.js';

export interface LevelSummary {
  level_id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  truck_count: number;
  track_capacity: number;
}

