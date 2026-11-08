# Rule: Level JSON Schema & Godot Contract Standards

When generating, modifying, or validating game levels or backend endpoints for the food truck puzzle game, all level JSON structures must adhere to this exact specification.

## Core Properties

- `level_id` (integer, required): Unique positive integer identifier.
- `name` (string, required): Human-readable level title.
- `difficulty` (string, required): `"easy"` | `"medium"` | `"hard"`.
- `track_speed` (number, required): Multiplier for how fast foods revolve around the track (e.g. `1.0`, `1.5`).
- `track_capacity` (integer, required): Maximum number of food items allowed on the track at any one time. If exceeded, the track jams and causes game over.
- `trucks` (array of Truck objects, required, min 2):
  - `truck_id` (string, required): Unique identifier (e.g. `"momo_truck"`, `"burger_truck"`).
  - `name` (string, required): Display name of the truck.
  - `target_food` (string, required): The food item type this truck accepts and aims to collect.
  - `capacity` (integer, required): Maximum number of items the truck's stack can hold (typically 3 to 6).
  - `initial_stack` (array of strings, required): Initial food items stacked on this truck. **Index 0 is the top of the stack** (the first item removed when tapped).
  - `accepts` (array of strings, required): Food types the truck is allowed to accept (must include `target_food`).
  - `releases` (string or null, optional): Bonus or milestone item released upon completing the truck's stack.
- `win_condition` (object, required):
  - `type` (string, required): Defaults to `"sort_all_trucks"`.

## Standard Example

```json
{
  "level_id": 1,
  "name": "Market Square Starter",
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

## Solvability Constraint
Every level must have a valid sequence of taps such that:
1. At no point does the number of revolving items on the track exceed `track_capacity`.
2. All food items end up in trucks where `item == truck.target_food` (or accepted matching rules).
3. No deadlocks occur where all trucks are blocked or full.

```

## Solvability Constraint
Every level must have a valid sequence of taps such that:
1. At no point does the number of revolving items on the track exceed `track_capacity`.
2. All food items end up in trucks where `item == truck.target_food` (or accepted matching rules).
3. No deadlocks occur where all trucks are blocked or full.