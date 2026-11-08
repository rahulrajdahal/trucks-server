# Backend Agent Instructions & Project Context

## Project Overview
This repository contains the backend CMS and API server for a mobile food truck puzzle game built in Godot. The backend is built with **Node.js, TypeScript, Express, Zod, and CORS**. It serves dynamic level configurations to the Godot game client and provides level management endpoints for the React/Vite admin dashboard.

## Tech Stack & Architecture
- **Runtime:** Node.js (v18+)
- **Language:** TypeScript (strict mode enabled)
- **Framework:** Express.js with CORS enabled
- **Validation:** Zod for runtime schema validation on all level payloads and API requests
- **Data Persistence:** Local JSON files in `data/levels/` managed via a `LevelRepository` interface (designed for swappable PostgreSQL/Supabase migration)
- **Development Tooling:** `tsx` for TypeScript execution without pre-compilation, `vitest` for automated testing

## Core Game Mechanics (The Puzzle Loop)
1. **Initial Setup:** Each level features multiple food trucks. Each truck starts with a mixed stack of foods (`initial_stack`, index 0 is the top).
2. **Player Action (Tap to Unload):** Tapping a truck removes the food item from the top of its stack and places it onto the revolving track.
3. **Revolving Track:** The food moves continuously around the track past all trucks.
4. **Auto-Stacking / Acceptance:** When a food on the track passes a truck:
   - The truck accepts the food if it matches the truck's current top item or dedicated `target_food`, AND the truck has not reached its `capacity`.
   - If the truck is full or does not accept that food, the food continues revolving along the track.
5. **Fail Condition (Track Capacity):** The track has a strict `track_capacity`. If the player pops too many unaccepted foods onto the track and it reaches capacity, the track jams and the player loses.
6. **Win Condition:** Clear and sort all trucks so each truck holds only its target food up to the required count (`win_condition.type: "sort_all_trucks"`).

## API & Data Contracts
All level files (`data/levels/<level_id>.json`) and API payloads must strictly conform to the Zod schema in `src/schemas/level.schema.ts`. Godot's JSON parser relies on these exact property names and data types.

### Standard Level Schema
```json
{
  "level_id": 1,
  "name": "Downtown Lunch Rush",
  "difficulty": "easy",
  "track_speed": 1.0,
  "track_capacity": 5,
  "trucks": [
    {
      "truck_id": "momo_truck",
      "name": "Momo Truck",
      "target_food": "momo",
      "capacity": 4,
      "initial_stack": ["pizza", "momo", "fries"],
      "accepts": ["momo"],
      "releases": null
    },
    {
      "truck_id": "pizza_truck",
      "name": "Pizza Truck",
      "target_food": "pizza",
      "capacity": 4,
      "initial_stack": ["momo", "fries", "pizza"],
      "accepts": ["pizza"],
      "releases": null
    },
    {
      "truck_id": "fries_truck",
      "name": "Fries Truck",
      "target_food": "fries",
      "capacity": 4,
      "initial_stack": ["fries", "momo", "pizza"],
      "accepts": ["fries"],
      "releases": null
    }
  ],
  "win_condition": {
    "type": "sort_all_trucks"
  }
}
```

## AI Development Customizations (`.agents/`)
- **Rules (`.agents/rules/`):**
  - `level-schema.md`: Strict definition of Godot level JSON schema and validation rules.
  - `backend-standards.md`: Express architecture, repository pattern, error formatting, and TypeScript conventions.
- **Skills (`.agents/skills/`):**
  - `level-generator`: Generates balanced, solvable puzzle levels conforming to difficulty targets.
  - `level-validator`: Validates JSON schemas and runs the search-based simulator (`simulate-solvability.ts`) to ensure levels can be cleared without exceeding `track_capacity`.

## Project Commands
- `npm install` - Install dependencies
- `npm run dev` - Launch local Express server with hot-reload (`tsx watch src/index.ts`)
- `npm run build` - Compile TypeScript to `dist/`
- `npm start` - Run compiled production server
- `npm test` - Run automated test suite with Vitest
- `npm run simulate -- data/levels/1.json` - Run the puzzle solvability simulator on a level file

## Guidelines for AI Coding Assistants
1. **Never Bypass Zod:** Any endpoint creating or updating levels must pass data through `LevelSchema.parse()`.
2. **Preserve Godot Compatibility:** Do not change or remove field names in level schemas without coordinating client-side updates.
3. **Repository Abstraction:** Do not write direct `fs` calls inside Express route handlers. Always route through `levelStorage` / `LevelRepository`.
4. **Zero Unsolvable Levels:** Whenever generating new levels, verify they are winnable using the `level-validator` simulator.
