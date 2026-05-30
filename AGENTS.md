# Monster Leaves Cafe — Agent Specs

Living document for AI agents and contributors. Update this file when specs, architecture, or milestones change.

## Vision

2D game built with **Babylon.js** and **TypeScript**, served in development via **Bun**. **Boba shop for monsters** — first-person barista sim. Full design scope: [GAME_SCOPE.md](./GAME_SCOPE.md).

## Tech stack

| Layer | Choice |
|-------|--------|
| Runtime / dev server | Bun via `npx bun` (`Bun.serve`, HTML imports) |
| Renderer | `@babylonjs/core` |
| Language | TypeScript (strict) |
| Structure | Object-oriented classes under `src/` |
| Utilities | Pure helpers in `src/utils/` (no game state) |

## Architecture (OOP)

```
main.ts          → entry: constructs Game, starts loop
Game             → owns lifecycle; wires Engine + Scene
GameEngine       → Babylon Engine + canvas resize
GameScene        → Scene, orthographic 2D camera, render loop hook
Entity (base)    → position, mesh/sprite hookup; subclasses for actors
```

**Rules for agents**

- Add behavior via **classes**, not loose functions in `src/game/` or `src/entities/`.
- Put **reusable, stateless** logic in `src/utils/` only.
- Do not import `utils` from `utils` into each other in cycles; keep utils leaf modules.
- Prefer extending `Entity` for on-screen objects instead of ad-hoc meshes in `GameScene`.
- **Bun CLI**: always invoke Bun with `npx bun` (e.g. `npx bun install`, `npx bun run dev`) — do not assume `bun` is on `PATH`.

## Folder layout

```
AGENTS.md
index.html          # canvas + script entry
index.ts            # Bun dev server
main.ts             # game bootstrap (imported by HTML)
src/
  game/
    Game.ts
    GameEngine.ts
    GameScene.ts
  entities/
    Entity.ts
  entities/
    Monster.ts
  scene/
    LayoutPlane.ts
    SeatCustomer.ts
    OrderBubble.ts
    CafeSceneLayout.ts
  input/
    InputMap.ts
    SceneInputSystem.ts
    defaultBindings.ts
  utils/
    math.ts
    canvas.ts
```

## 2D rendering conventions

- **Camera**: orthographic (`Camera.ORTHOGRAPHIC_CAMERA`), Y-up, gameplay on XY plane (Z for layering).
- **Units**: 1 world unit ≈ 1 logical pixel at base resolution unless spec says otherwise.
- **Base resolution** (design): `1280 × 720` — scale canvas via CSS; engine resize follows display size.
- **Sprites / meshes**: prefer simple planes or GUI textures until asset pipeline is defined.
- **Input**: Godot-style `InputMap` in `src/input/` — providers emit raw events; actions (`menu_slot_1`…`3`) drive gameplay. Default bindings: keys `1`/`2`/`3` + menu slot pointer pick.

## Game design specs

See [GAME_SCOPE.md](./GAME_SCOPE.md) for full detail. Summary:

| Area | Status | Notes |
|------|--------|-------|
| Core loop | Scoped | Active = seat by Exit; queue preview; hold-to-serve |
| Player | Scoped | Barista, fixed first-person |
| Monsters | Scoped | Abstract `patienceSeconds`; queue + active rage |
| Drinks | Scoped | `holdDurationSeconds`: blood \< brew \< eyeball |
| Boss | Scoped | Pre-rage → active; post-100% → that monster (0.5s) |
| Hide | Scoped | Medusa; fail → fired/stoned game over |
| Win / lose | Scoped | Win 3 min; Lose strikes / backroom / Medusa |
| Refill / backroom | Later | Forward/back stealth; instant lose if caught |
| Audio | Planned | Post-core juice |
| Save data | Out of v1 | |

## Milestones

- [x] Project scaffold: Bun + Babylon 2D ortho scene
- [x] OOP skeleton: `Game`, `GameEngine`, `GameScene`, `Entity`
- [x] `src/utils/` helpers (math, canvas)
- [x] Static mockup scene — Phase 1 complete
- [x] Active vs queue targeting (Seat R) — Phase 2 item 1
- [x] Hold-to-serve — Phase 2 item 2
- [ ] Exit-right + line advance — Phase 2 item 3
- [ ] Rage, 50% mind-change, burst, lunge, strikes — Phase 3
- [ ] 3:00 timer, Boss (3 calls), win/lose — Phase 4
- [ ] Medusa + Hide — Phase 5
- [ ] Refill backroom mini-game — Phase 6

## Commands

Use **`npx bun`** for all Bun commands (install, run, test, add packages):

```bash
npx bun install
npx bun run dev      # dev server + HMR
npx bun test         # when tests exist
```

## Agent workflow

1. Read this file before large changes.
2. Match existing class patterns under `src/game/` and `src/entities/`.
3. Update the **Milestones** and **Game design specs** tables when implementing features.
4. Run shell commands with `npx bun` (not bare `bun`); use `npx bun test` for tests when added.
5. Do not introduce Vite/npm for bundling unless this spec changes.
