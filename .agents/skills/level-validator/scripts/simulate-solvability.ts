import * as fs from 'fs';
import * as path from 'path';
import { LevelSimulator } from '../../../../src/services/puzzleSimulator.js';
import { Level } from '../../../../src/schemas/level.schema.js';

export { LevelSimulator };

const targetFile = process.argv[2];
if (!targetFile) {
  console.error("Usage: tsx simulate-solvability.ts <path-to-level-json>");
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), targetFile);
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

try {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const levelData: Level = JSON.parse(raw);
  console.log(`Running solvability simulation for Level ${levelData.level_id}: "${levelData.name}"...`);
  console.log(`Track Capacity: ${levelData.track_capacity}, Trucks: ${levelData.trucks.length}`);

  const sim = new LevelSimulator(levelData);
  const result = sim.solve();

  if (result.solvable) {
    console.log(`\n Solvable in ${result.minMoves} taps! (Visited ${result.visitedStates} states)`);
    console.log("Move Sequence:");
    result.moveSequence?.forEach((m, idx) => console.log(`  ${idx + 1}. ${m}`));
    process.exit(0);
  } else {
    console.error(`\n Unsolvable: ${result.error}`);
    console.error(`Visited ${result.visitedStates} states.`);
    process.exit(1);
  }
} catch (err) {
  console.error("Error executing simulation:", err);
  process.exit(1);
}
