import express from 'express';
import cors from 'cors';
import { levelRouter } from './routes/levelRoutes.js';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'food-truck-puzzle-cms' });
});
// Level management & Godot client endpoints
app.use('/api/levels', levelRouter);
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Food Truck Puzzle Backend running at http://localhost:${PORT}`);
    });
}
export default app;
