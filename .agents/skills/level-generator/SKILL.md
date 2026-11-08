---
name: level-generator
description: >-
  Generates balanced, solvable food truck puzzle levels adhering to the strict Godot level schema and difficulty parameters.
---

# Skill: Level Generator

Use this skill when asked to create new food truck puzzle levels, adjust difficulty curves, or generate mock levels for testing.

## Generation Procedure

1. **Parameters Determination**:
   - Determine target `level_id`, `name`, and `difficulty` (`"easy"` | `"medium"` | `"hard"`).
   - Set `track_speed`:
     - Easy: `1.0`
     - Medium: `1.25` - `1.5`
     - Hard: `1.5` - `2.0`
   - Set `track_capacity`:
     - Easy: `5` - `6` (forgiving, extra buffer space)
     - Medium: `4` (requires thoughtful tapping order)
     - Hard: `3` (tight margins; wrong taps cause immediate deadlocks)

2. **Truck & Food Allocation**:
   - Define 2 to 5 trucks depending on difficulty.
   - Assign each truck a distinct `target_food` (e.g. `momo`, `pizza`, `burger`, `fries`, `tacos`).
   - Truck `capacity` should typically be 3 to 5.
   - For total solvability:
     - The total count of each food type across all `initial_stack` arrays MUST equal the number of slots available for that food type across target trucks.
     - Never include food types that do not have a corresponding accepting target truck.

3. **Stack Shuffling & Solvability Heuristics**:
   - Shuffle initial items across trucks so each truck contains items destined for other trucks.
   - Keep at least 1 truck with an exposed top item (index 0) that matches another truck's target food or initial top item to provide an opening move.
   - Avoid creating initial states where all trucks are topped with items that cannot be accepted anywhere while the track capacity is lower than the items needed to unblock.

4. **Verification**:
   - Always run the level through the `level-validator` simulator:
     ```bash
     npm run simulate -- <path-to-level-json>
     ```
   - Only save the level once the simulation confirms a win sequence exists.

## Reference Example
See [sample_easy.json](./examples/sample_easy.json) for a fully validated level configuration.

