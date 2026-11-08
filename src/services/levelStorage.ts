import * as fs from 'fs';
import * as path from 'path';
import { Level, LevelSchema } from '../schemas/level.schema.js';
import { LevelSummary } from '../types/level.js';

export interface LevelRepository {
  getAll(): Promise<LevelSummary[]>;
  getById(levelId: number): Promise<Level | null>;
  save(level: Level): Promise<Level>;
  delete(levelId: number): Promise<boolean>;
}

export class JsonFileLevelRepository implements LevelRepository {
  private dataDir: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.resolve(process.cwd(), 'data', 'levels');
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private getFilePath(levelId: number): string {
    return path.join(this.dataDir, `${levelId}.json`);
  }

  public async getAll(): Promise<LevelSummary[]> {
    const files = fs.readdirSync(this.dataDir).filter(f => f.endsWith('.json'));
    const summaries: LevelSummary[] = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.dataDir, file), 'utf-8');
        const parsed = JSON.parse(content);
        const validated = LevelSchema.parse(parsed);
        summaries.push({
          level_id: validated.level_id,
          name: validated.name,
          difficulty: validated.difficulty,
          truck_count: validated.trucks.length,
          track_capacity: validated.track_capacity
        });
      } catch (err) {
        // Skip or log corrupted files
        console.warn(`[LevelStorage] Could not parse level file ${file}:`, err);
      }
    }

    return summaries.sort((a, b) => a.level_id - b.level_id);
  }

  public async getById(levelId: number): Promise<Level | null> {
    const filePath = this.getFilePath(levelId);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return LevelSchema.parse(parsed);
  }

  public async save(level: Level): Promise<Level> {
    const validated = LevelSchema.parse(level);
    const filePath = this.getFilePath(validated.level_id);
    fs.writeFileSync(filePath, JSON.stringify(validated, null, 2), 'utf-8');
    return validated;
  }

  public async delete(levelId: number): Promise<boolean> {
    const filePath = this.getFilePath(levelId);
    if (!fs.existsSync(filePath)) {
      return false;
    }
    fs.unlinkSync(filePath);
    return true;
  }
}

export const levelRepository: LevelRepository = new JsonFileLevelRepository();

