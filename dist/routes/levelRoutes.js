import { Router } from 'express';
import { ZodError } from 'zod';
import { LevelSchema } from '../schemas/level.schema.js';
import { levelRepository } from '../services/levelStorage.js';
import { PuzzleSimulatorService } from '../services/puzzleSimulator.js';
export const levelRouter = Router();
// GET /api/levels - List all level summaries
levelRouter.get('/', async (_req, res) => {
    try {
        const levels = await levelRepository.getAll();
        res.json({ success: true, data: levels });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GET /api/levels/:id - Get full level config (for Godot client)
levelRouter.get('/:id', async (req, res) => {
    const levelId = parseInt(req.params.id, 10);
    if (isNaN(levelId)) {
        res.status(400).json({ success: false, error: 'Invalid level ID' });
        return;
    }
    try {
        const level = await levelRepository.getById(levelId);
        if (!level) {
            res.status(404).json({ success: false, error: `Level ${levelId} not found` });
            return;
        }
        res.json({ success: true, data: level });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// POST /api/levels - Create or update level with Zod validation
levelRouter.post('/', async (req, res) => {
    try {
        const validated = LevelSchema.parse(req.body);
        const saved = await levelRepository.save(validated);
        res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                issues: error.issues
            });
            return;
        }
        res.status(500).json({ success: false, error: error.message });
    }
});
// POST /api/levels/:id/validate - Run solvability simulation on saved level
levelRouter.post('/:id/validate', async (req, res) => {
    const levelId = parseInt(req.params.id, 10);
    if (isNaN(levelId)) {
        res.status(400).json({ success: false, error: 'Invalid level ID' });
        return;
    }
    try {
        const level = await levelRepository.getById(levelId);
        if (!level) {
            res.status(404).json({ success: false, error: `Level ${levelId} not found` });
            return;
        }
        const simulation = PuzzleSimulatorService.simulate(level);
        res.json({ success: true, data: simulation });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// DELETE /api/levels/:id - Delete level
levelRouter.delete('/:id', async (req, res) => {
    const levelId = parseInt(req.params.id, 10);
    if (isNaN(levelId)) {
        res.status(400).json({ success: false, error: 'Invalid level ID' });
        return;
    }
    try {
        const deleted = await levelRepository.delete(levelId);
        if (!deleted) {
            res.status(404).json({ success: false, error: `Level ${levelId} not found` });
            return;
        }
        res.json({ success: true, message: `Level ${levelId} deleted` });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
