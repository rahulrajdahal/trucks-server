import * as fs from 'fs';
import * as path from 'path';
import { LevelSchema } from '../schemas/level.schema.js';
export class JsonFileLevelRepository {
    dataDir;
    constructor(dataDir) {
        this.dataDir = dataDir || path.resolve(process.cwd(), 'data', 'levels');
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }
    getFilePath(levelId) {
        return path.join(this.dataDir, `${levelId}.json`);
    }
    async getAll() {
        const files = fs.readdirSync(this.dataDir).filter(f => f.endsWith('.json'));
        const summaries = [];
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
            }
            catch (err) {
                // Skip or log corrupted files
                console.warn(`[LevelStorage] Could not parse level file ${file}:`, err);
            }
        }
        return summaries.sort((a, b) => a.level_id - b.level_id);
    }
    async getById(levelId) {
        const filePath = this.getFilePath(levelId);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        return LevelSchema.parse(parsed);
    }
    async save(level) {
        const validated = LevelSchema.parse(level);
        const filePath = this.getFilePath(validated.level_id);
        fs.writeFileSync(filePath, JSON.stringify(validated, null, 2), 'utf-8');
        return validated;
    }
    async delete(levelId) {
        const filePath = this.getFilePath(levelId);
        if (!fs.existsSync(filePath)) {
            return false;
        }
        fs.unlinkSync(filePath);
        return true;
    }
}
export const levelRepository = new JsonFileLevelRepository();
