# Monster Leaves Cafe — Game Scope

Planning document for the current mockup and core mechanics. **No implementation detail here** — defines what we are building and in what order.

**Reference mockup:** `assets/image-a31e2bdf-f387-4f7e-90aa-d0e67fb695f7.png` (first-person counter view, boba shop interior).

---

## Elevator pitch

You are a **barista** at a **boba shop for monsters**. From a **first-person** view behind the counter, up to **three monsters** sit in front of you, each showing an **order** in a speech bubble. You **click and hold** the matching drink on the menu to serve them. If you wait too long, a **rage bubble** grows over their order; when it meets the order bubble it **bursts**, the monster **gets angry**, and **lunges toward the camera**.

---

## Player fantasy

- Role: barista (hands implied at counter; player does not move around the shop in v1).
- Goal: serve the correct drink to each monster before their patience runs out.
- Failure moment: monster rage + jump-scare toward the player (primary tension / comedy).

---

## Perspective and scene (from mockup)

| Element | Role in game |
|---------|----------------|
| Counter (foreground) | Player’s workspace; menu and interactables live here |
| Menu (bottom-left) | **3 drink slots** — the only items the player can serve in v1 |
| Hide (bottom-center) | UI control — **purpose TBD** (see open questions) |
| Service bell “BOSS” (bottom-right) | Ambient / future mechanic — **not in v1 core loop** unless specified later |
| Three monster seats (center) | Max **3 active customers** at once |
| Speech bubbles (above monsters) | Show **which of the 3 drinks** that monster wants |
| Mirror / back wall | Set dressing; reflects shop depth |
| Boba poster (right wall) | Branding / atmosphere |
| Exit arrow (right) | **Out of scope for v1** unless we add day/shift structure later |

**Camera:** fixed first-person, no walking. Parallax or subtle counter depth optional later.

**Presentation:** 2D layers (Babylon orthographic or layered planes/sprites) composed to feel like a illustrated diorama, not a free-roaming 3D space.

---

## Core loop (v1)

```
Spawn wave (≤3 monsters)
    → Each monster gets an order bubble (drink 1, 2, or 3)
    → Patience timer starts per monster (rage bubble grows)
    → Player holds correct menu item → serve after hold duration
        → Success: monster satisfied, leaves / clears slot
    → If rage bubble reaches order bubble before serve
        → Order bubble bursts
        → Monster angry animation (lunge toward camera)
        → Failure handling (life lost, shift penalty, game over — TBD)
    → Refill empty slots until wave/shift rules say stop
```

---

## Systems overview

Planned OOP-shaped systems (names indicative, not file commitments):

| System | Responsibility |
|--------|----------------|
| **Shift / wave** | When monsters appear, how many, pacing |
| **Monster** | Seat index, state (waiting, served, angry), visuals |
| **Order bubble** | Displays drink id (1–3), burst on failure |
| **Rage bubble** | Overlay on order bubble; scale + opacity over time; gibberish text |
| **Menu** | Three items; pointer down/up; hold progress |
| **Serve resolver** | Match held drink to monster; complete serve after hold time |
| **Patience** | Per-monster timer driving rage bubble growth |
| **Anger sequence** | Burst → angry state → lunge toward camera |
| **UI chrome** | Hide, bell, poster — mostly static in v1 |

---

## Drink menu and serving

### Menu

- Exactly **three drinks**, fixed for v1 (names/art TBD; slots labeled 1 / 2 / 3 in mockup).
- Player selects by **pointer on menu slot** (mouse / touch).

### Serve interaction

1. Player **presses and holds** on the menu item matching a monster’s order.
2. After **N seconds** of continuous hold (tunable constant), drink is **served**.
3. Serve target rules (pick one for implementation — **decide before coding**):
   - **A)** Hold always serves the **leftmost** (or highest-priority) monster with that order.
   - **B)** Hold serves the monster whose seat was **last clicked / focused**.
   - **C)** Hold serves **all monsters** with that order simultaneously (probably too easy).

**Recommendation for v1:** **B** or **A** — keeps one clear target; document choice in this file when decided.

### Release / cancel

- Releasing pointer before hold completes → **cancel** serve (no drink spent).
- Switching to another menu item → cancel previous hold.

---

## Orders (speech bubbles)

- Each active monster has **one primary bubble** showing their drink (icon or slot number 1–3).
- Orders are drawn from the same **three-item pool** (uniform random or weighted table — TBD).
- Bubble position: above monster head, readable in first-person layout.

---

## Patience and rage bubble

### Rage bubble behavior

- **Second bubble** layered **on top of** the order bubble (same anchor, higher Z).
- Starts **small**; **grows** over time until its edge **contacts** the order bubble edge.
- **Visual:** increasingly visible but stays **semi-transparent**; text inside is **random symbols** (`!`, `#`, `$`, `@`, etc.) standing in for censored “curse words” — refreshed or scrolled optionally.
- On **contact / overlap threshold:** order bubble **bursts** (particles or pop animation).

### Timing

- Per-monster **patience duration** before rage meets order (global constant vs per-monster type — TBD).
- Rage growth should be **linear or ease-in** (tunable); must be readable so players learn the telegraph.

### After burst

1. Order bubble destroyed / hidden.
2. Monster enters **angry** state.
3. **Lunge animation** toward camera (scale + position + optional screen shake; brief, snappy).
4. Apply failure rule (see win/lose).

---

## Monster anger (jump-scare)

- **Not** free movement AI — scripted animation on a fixed seat rig.
- Motion: monster graphic moves **forward** (toward player / larger on screen) over ~0.3–0.8s, may hold one frame at peak.
- Optional: brief **full-screen flash**, **SFX**, **camera shake** (still fixed FOV).
- After lunge: monster despawns or resets slot; player faces consequence.

---

## Capacity and spawning

- **Maximum 3 monsters** visible at counter simultaneously (matches mockup).
- When a monster is served or removed after anger, slot can **refill** per wave rules.
- v1 can use simple **queue**: always keep 3 slots filled until wave ends.

---

## UI elements (mockup)

| Control | v1 status |
|---------|-----------|
| Menu (3 items) | **Required** — core interaction |
| Monster order bubbles | **Required** |
| Rage bubbles | **Required** |
| Hide | **Deferred** — define behavior (peek under counter? pause? tutorial?) |
| BOSS bell | **Deferred** — possible boss wave or call next customer |
| Exit | **Deferred** — end of shift / meta progression |

---

## Win, lose, and progression (TBD)

Decide before balancing; placeholders:

| Outcome | Candidate rules |
|---------|-----------------|
| **Lose** | N angry monsters per shift; single angry = instant fail; time limit |
| **Win** | Serve M monsters without failure; survive until closing time |
| **Progression** | Faster patience, more order variety, monster types — post-v1 |

---

## Audio and juice (post-core)

- Hold progress sound / fill indicator on menu item.
- Serve “ding” or pour sound.
- Bubble burst pop.
- Angry roar + lunge whoosh.
- Low ambient cafe loop.

---

## Technical direction (high level)

Aligns with [AGENTS.md](./AGENTS.md):

- **Babylon.js** 2D-style composition: orthographic camera, layered quads/sprites, GUI for menu hit areas if needed.
- **TypeScript**, **OOP** under `src/`; stateless helpers in `src/utils/`.
- **Input:** pointer events for hold-to-serve (separate `InputSystem` or `MenuController` class).
- **No code in this doc** — implementation phases below.

---

## Implementation phases (suggested order)

### Phase 0 — Foundation (done / in progress)

- [x] Bun + Babylon scaffold, OOP skeleton
- [ ] Static mockup scene layout (counter, seats, placeholder art)

### Phase 1 — Read-only scene

- [ ] First-person layout matching mockup proportions
- [ ] Three seat anchors + placeholder monsters
- [ ] Menu with three inactive slots
- [ ] Static order bubbles (hard-coded orders for testing)

### Phase 2 — Serve interaction

- [ ] Pointer hold detection + progress feedback on menu
- [ ] Serve timer and success feedback
- [ ] Clear monster / order on success

### Phase 3 — Patience and rage

- [ ] Rage bubble growth + gibberish text
- [ ] Collision/overlap test vs order bubble → burst
- [ ] Angry + lunge sequence

### Phase 4 — Loop and polish

- [ ] Spawn queue (max 3), refill slots
- [ ] Win/lose rules
- [ ] Sound, particles, tuning

### Phase 5 — Deferred mockup features

- [ ] Hide button behavior
- [ ] BOSS bell mechanic
- [ ] Exit / shift meta

---

## Open questions (resolve before coding each phase)

1. **Serve targeting:** which monster receives the drink when multiple share the same order? (see Serve interaction)
2. **Hold duration:** seconds for a full serve?
3. **Patience duration:** seconds until rage bubble meets order?
4. **Hide button:** what does it do?
5. **BOSS bell:** boss wave, spawn pacing, or cosmetic only?
6. **Failure rule:** one strike vs lives vs shift timer?
7. **Art pipeline:** single illustrated background vs separate layers per monster?
8. **Monster identity:** one silhouette vs multiple types affecting patience?

---

## Document maintenance

- Update this file when mockup or rules change.
- Mirror high-level status in [AGENTS.md](./AGENTS.md) milestones and design table.
- When an open question is answered, move the decision into the relevant section and strike it from the list.
