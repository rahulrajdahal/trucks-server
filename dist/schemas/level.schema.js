import { z } from 'zod';
export const TruckSchema = z.object({
    truck_id: z.string().min(1, 'truck_id is required'),
    name: z.string().min(1, 'truck name is required'),
    target_food: z.string().min(1, 'target_food is required'),
    capacity: z.number().int().positive('capacity must be a positive integer'),
    initial_stack: z.array(z.string()).min(0),
    accepts: z.array(z.string()).min(1, 'accepts must include at least one food type'),
    releases: z.string().nullable().optional()
});
export const WinConditionSchema = z.object({
    type: z.string().min(1, 'win condition type is required')
});
export const LevelSchema = z.object({
    level_id: z.number().int().positive('level_id must be a positive integer'),
    name: z.string().min(1, 'level name is required'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    track_speed: z.number().positive('track_speed must be positive'),
    track_capacity: z.number().int().positive('track_capacity must be a positive integer'),
    trucks: z.array(TruckSchema).min(2, 'level must have at least 2 trucks'),
    win_condition: WinConditionSchema
});
