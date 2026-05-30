# Monster Leaves Cafe — Game Scope

Planning document for the current mockup and core mechanics. **No implementation detail here** — defines what we are building and in what order.

**Reference mockups** (latest first):

- `assets/image-85f7502a-f98a-4277-84ff-d4fbe51f11dd.png` — current layout sketch
- `assets/image-85f7502a-f98a-4277-84ff-d4fbe51f11dd.png` — earlier pass (same composition)

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

| Element                               | Role in game                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Counter (foreground)                  | Player’s workspace; menu and interactables live here                                                                                                    |
| Menu (bottom-left)                    | **3 drink slots** — the only items the player can serve in v1                                                                                           |
| Hide (bottom-center)                  | UI control — **purpose TBD** (see open questions)                                                                                                       |
| Service bell “BOSS” (bottom-right)    | Ambient / future mechanic — **not in v1 core loop** unless specified later                                                                              |
| Three monster seats (center)          | Max **3 active customers** at once                                                                                                                      |
| Speech bubbles (above monsters)       | Show **which of the 3 drinks** that monster wants                                                                                                       |
| Window / mirror (center back)         | Large frame behind seats; sketch shows **extra monster silhouettes** — treat as **waiting line preview** (cosmetic in v1, can tie to spawn queue later) |
| Boba poster (right wall)              | Branding / atmosphere; static in v1                                                                                                                     |
| Exit sign (right wall, above counter) | Arrow + “Exit” label — **deferred** (end of shift / meta)                                                                                               |

**Camera:** fixed first-person, no walking. Player hands are **not** drawn in the mockup (implied barista POV only).

**Presentation:** 2D layers (Babylon orthographic or layered planes/sprites) composed to feel like an illustrated diorama, not a free-roaming 3D space. Target readability: **indie storyboard / sketch** until final art replaces placeholders.

### Layer order (back → front)

Use consistent Z-order when compositing:

1. Back wall, window/mirror, poster, exit sign
2. Far queue silhouettes (inside window frame)
3. Monster bodies (three fixed seat anchors)
4. Order speech bubbles
5. Rage bubbles (same anchor as order, on top)
6. Counter surface
7. Menu board, Hide, BOSS bell (interactive UI)
8. Juice / particles / lunge overlay (temporary, top)

### Seat and bubble layout (from mockup)

- **Three fixed seats** across the counter (left, center, right) — not free placement.
- **Order bubbles:** large circles **centered above each monster’s head**; sketch is empty; game fills with drink **1 / 2 / 3** (icon or numeral — art TBD).
- **Menu board:** labeled “Menu”; **three vertical slots** on the left of the counter — only valid serve inputs.
- **Bottom UI band:** menu (left), Hide (center), bell (right) — reserve **safe hit areas** so holds/clicks do not overlap.

### Parallel state (important for v1)

Each of the **three seats** runs **independently**:

- Own order (drink id)
- Own patience / rage bubble growth
- Own success or anger outcome

Serving one monster does not pause timers on the others.

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

| System             | Responsibility                                                     |
| ------------------ | ------------------------------------------------------------------ |
| **Shift / wave**   | When monsters appear, how many, pacing                             |
| **Monster**        | Seat index, state (waiting, served, angry), visuals                |
| **Order bubble**   | Displays drink id (1–3), burst on failure                          |
| **Rage bubble**    | Overlay on order bubble; scale + opacity over time; gibberish text |
| **Menu**           | Three items; pointer down/up; hold progress                        |
| **Serve resolver** | Match held drink to monster; complete serve after hold time        |
| **Patience**       | Per-monster timer driving rage bubble growth                       |
| **Anger sequence** | Burst → angry state → lunge toward camera                          |
| **UI chrome**      | Hide, bell, poster — mostly static in v1                           |

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

| Control               | v1 status                                                             |
| --------------------- | --------------------------------------------------------------------- |
| Menu (3 items)        | **Required** — core interaction                                       |
| Monster order bubbles | **Required**                                                          |
| Rage bubbles          | **Required**                                                          |
| Hide                  | **Deferred** — define behavior (peek under counter? pause? tutorial?) |
| BOSS bell             | **Deferred** — possible boss wave or call next customer               |
| Exit                  | **Deferred** — end of shift / meta progression                        |

---

## Win, lose, and progression (TBD)

Decide before balancing; placeholders:

| Outcome         | Candidate rules                                                     |
| --------------- | ------------------------------------------------------------------- |
| **Lose**        | N angry monsters per shift; single angry = instant fail; time limit |
| **Win**         | Serve M monsters without failure; survive until closing time        |
| **Progression** | Faster patience, more order variety, monster types — post-v1        |

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

## Scoped now, detail later (good to add when you return)

Short list of **worth documenting next** — not blocking Phase 1, but avoids rework:

| Topic                       | Why add it soon                                             |
| --------------------------- | ----------------------------------------------------------- |
| **Drink identity**          | Names, colors, icons for slots 1–3 (players learn by sight) |
| **Serve targeting**         | Required before Phase 2 (duplicate orders at two seats)     |
| **Hold + patience seconds** | Tuning constants; drives feel of tension                    |
| **Success feedback**        | Monster leave animation? SFX? points?                       |
| **Window queue**            | Pure backdrop vs silhouettes update as line advances        |
| **Hide**                    | Duck / cover / skip tutorial / pause?                       |
| **BOSS bell**               | Spawn boss, speed up line, or shop “manager” interrupt      |
| **Shift structure**         | Single endless wave vs N customers per day                  |
| **Rage gibberish rules**    | Charset, refresh rate, max symbols, font style              |

---

## Open questions (resolve before coding each phase)

1. **Serve targeting:** which monster receives the drink when multiple share the same order? (see Serve interaction)
2. **Hold duration:** seconds for a full serve?
3. **Patience duration:** seconds until rage bubble meets order?
4. **Hold feedback:** radial fill on slot, pour animation, progress bar elsewhere?
5. **Hide button:** what does it do?
6. **BOSS bell:** boss wave, spawn pacing, or cosmetic only?
7. **Failure rule:** one strike vs lives vs shift timer?
8. **Art pipeline:** single full background image vs layered sprites per monster/bubble?
9. **Monster identity:** one silhouette vs types with different patience?
10. **Window silhouettes:** static art vs reflect remaining queue count?

---

## Reserved for your next pass

_Add subsections here when you have more mockups or notes (e.g. boss monster, drink recipes, day/night, upgrades). No implementation until moved into phases above._

- _(empty — waiting on more design input)_

---

## Document maintenance

- Update this file when mockup or rules change.
- Mirror high-level status in [AGENTS.md](./AGENTS.md) milestones and design table.
- When an open question is answered, move the decision into the relevant section and strike it from the list.
