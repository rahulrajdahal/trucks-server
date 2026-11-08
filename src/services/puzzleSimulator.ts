import { Level, LevelSchema } from '../schemas/level.schema.js';

export interface SimulationResult {
  solvable: boolean;
  minMoves?: number;
  moveSequence?: string[];
  visitedStates: number;
  error?: string;
}

interface GameState {
  truckStacks: { [truckId: string]: string[] };
  track: string[];
  moves: string[];
}

export class LevelSimulator {
  private level: Level;

  constructor(level: Level) {
    this.level = level;
  }

  private serializeState(state: GameState): string {
    const truckKeys = Object.keys(state.truckStacks).sort();
    const truckParts = truckKeys.map(k => `${k}:${state.truckStacks[k].join(',')}`);
    const trackPart = `track:${[...state.track].sort().join(',')}`;
    return `${truckParts.join('|')}#${trackPart}`;
  }

  private isWinState(state: GameState): boolean {
    if (state.track.length > 0) return false;

    for (const truck of this.level.trucks) {
      const currentStack = state.truckStacks[truck.truck_id] || [];
      for (const item of currentStack) {
        if (item !== truck.target_food) {
          return false;
        }
      }
    }
    return true;
  }

  private settleTrack(state: GameState): boolean {
    let changed = false;
    let keepChecking = true;

    while (keepChecking) {
      keepChecking = false;
      for (let i = 0; i < state.track.length; i++) {
        const food = state.track[i];

        for (const truck of this.level.trucks) {
          const currentStack = state.truckStacks[truck.truck_id];

          if (currentStack.length >= truck.capacity) {
            continue;
          }

          const isEmpty = currentStack.length === 0;
          const matchesTop = !isEmpty && currentStack[0] === food;
          const matchesTarget = food === truck.target_food;

          if ((isEmpty && matchesTarget) || matchesTop) {
            state.track.splice(i, 1);
            currentStack.unshift(food);
            changed = true;
            keepChecking = true;
            break;
          }
        }
        if (keepChecking) break;
      }
    }

    return changed;
  }

  public solve(maxStates = 25000): SimulationResult {
    const initialStacks: { [truckId: string]: string[] } = {};
    for (const truck of this.level.trucks) {
      initialStacks[truck.truck_id] = [...truck.initial_stack];
    }

    const initialState: GameState = {
      truckStacks: initialStacks,
      track: [],
      moves: []
    };

    this.settleTrack(initialState);

    if (this.isWinState(initialState)) {
      return {
        solvable: true,
        minMoves: 0,
        moveSequence: [],
        visitedStates: 1
      };
    }

    const visited = new Set<string>();
    visited.add(this.serializeState(initialState));

    const queue: GameState[] = [initialState];
    let statesCount = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      statesCount++;

      if (statesCount > maxStates) {
        return {
          solvable: false,
          visitedStates: statesCount,
          error: `Search limit of ${maxStates} states exceeded. Level may be too complex or unsolvable.`
        };
      }

      for (const truck of this.level.trucks) {
        const stack = current.truckStacks[truck.truck_id];
        if (stack.length === 0) continue;

        if (current.track.length >= this.level.track_capacity) {
          continue;
        }

        const nextStacks: { [k: string]: string[] } = {};
        for (const k of Object.keys(current.truckStacks)) {
          nextStacks[k] = [...current.truckStacks[k]];
        }

        const poppedItem = nextStacks[truck.truck_id].shift()!;
        const nextTrack = [...current.track, poppedItem];

        const nextState: GameState = {
          truckStacks: nextStacks,
          track: nextTrack,
          moves: [...current.moves, `Tap ${truck.name} (popped ${poppedItem})`]
        };

        this.settleTrack(nextState);

        if (this.isWinState(nextState)) {
          return {
            solvable: true,
            minMoves: nextState.moves.length,
            moveSequence: nextState.moves,
            visitedStates: statesCount
          };
        }

        if (nextState.track.length > this.level.track_capacity) {
          continue;
        }

        const serialized = this.serializeState(nextState);
        if (!visited.has(serialized)) {
          visited.add(serialized);
          queue.push(nextState);
        }
      }
    }

    return {
      solvable: false,
      visitedStates: statesCount,
      error: "Exhausted all legal moves without finding a win state. Level has deadlocks."
    };
  }
}

export class PuzzleSimulatorService {
  public static simulate(level: Level): SimulationResult {
    const validated = LevelSchema.parse(level);
    const sim = new LevelSimulator(validated);
    return sim.solve();
  }
}
