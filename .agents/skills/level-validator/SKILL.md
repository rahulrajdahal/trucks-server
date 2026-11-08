---
name: level-validator
description: >-
  Validates game level JSON schemas against Godot specifications and runs puzzle solvability simulations to verify winnability without jamming track capacity.
---

# Skill: Level Validator

Use this skill when reviewing, testing, or verifying food truck puzzle levels before committing or deploying them.

## Validation Protocol

1. **Schema Validation**:
   - Verify all required fields exist: `level_id`, `name`, `difficulty`, `track_speed`, `track_capacity`, `trucks`, `win_condition`.
   - Ensure each truck has `truck_id`, `name`, `target_food`, `capacity`, `initial_stack`, and `accepts`.
   - Verify array index 0 in `initial_stack` represents the top of the stack.

2. **Food Item Inventory Conservation**:
   - Check that the total count of each food item present in all `initial_stack` arrays matches the total capacity required across matching `target_food` trucks.
   - Example: If there are 3 `momo`, 3 `pizza`, and 3 `fries` across initial stacks, there must be target trucks with sufficient capacity for 3 momos, 3 pizzas, and 3 fries.

3. **Solvability Simulation**:
   - Run the simulator script to verify there is a winning move sequence that never exceeds `track_capacity`:
   ```bash
   npx tsx .agents/skills/level-validator/scripts/simulate-solvability.ts <path-to-level.json>
   ```
   - Analyze the output:
     - If solvable: Observe the minimum taps required to verify it matches the intended difficulty level.
     - If unsolvable: Inspect where the deadlock occurred (e.g., track jam or blocking item) and adjust the `initial_stack` or `track_capacity`.

