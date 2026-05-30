# Monster Leaves Cafe

2D game using Babylon.js, TypeScript, and Bun. Project conventions and specs live in [AGENTS.md](./AGENTS.md).

## Setup

```bash
npx bun install
```

## Run

```bash
npx bun run dev
```

Open the URL printed in the terminal (default Bun port).

## Structure

- `src/game/` — `Game`, `GameEngine`, `GameScene` (OOP core)
- `src/entities/` — `Entity` base and game objects
- `src/utils/` — stateless helpers (`math`, `canvas`)
