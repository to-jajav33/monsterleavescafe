# Monster Leaves Cafe — Game Scope

Planning document for the current mockup and core mechanics. **No implementation detail here** — defines what we are building and in what order.

**Reference mockups:**

- `assets/image-85f7502a-f98a-4277-84ff-d4fbe51f11dd.png` — current layout sketch

---

## Elevator pitch

You are a **barista** at a **boba shop for monsters**. First-person behind the counter. One **active customer** (seat closest to the **Exit**) must be served; others in line show **upcoming orders**. **Click and hold** the correct drink from three menu items. Wait too long and a **rage bubble** overtakes their order → **burst** → angry **lunge** → **strike** (unless **Boss** saves you). Survive until **0300** (**3 minutes**) without **3 strikes**. Special events: **Medusa** (Hide), **refill** (backroom mini-game — spec later).

---

## Player fantasy

- Role: barista; fixed POV; no walking the shop in counter gameplay.
- Goal: serve the active monster, manage the line, survive the shift timer, avoid 3 strikes.
- Tools: menu holds, **Boss bell** (3 uses per run), **Hide** (Medusa), eventual **backroom** during refill.

---

## Perspective and scene (from mockup)

| Element | Role in game |
|---------|----------------|
| Counter (foreground) | Player workspace |
| Menu (bottom-left) | Three drinks — only serve inputs |
| Hide (bottom-center) | **Medusa event only** — duck before petrification |
| Service bell “BOSS” (bottom-right) | Call manager to apologize; negates a strike (3 uses per game) |
| Three counter positions | Line of up to 3 monsters; **rightmost = active** (closest to Exit) |
| Speech bubbles | Order on active + queue preview on others |
| Window / mirror | Waiting-line atmosphere; can reflect queue |
| Boba poster | Static branding |
| Exit (right wall) | **Not a button** — visual flow of queue; monsters leave **off-screen right** |

**Camera:** fixed first-person. **Presentation:** layered 2D / orthographic composition.

### Layer order (back → front)

1. Back wall, window, poster, exit sign  
2. Queue silhouettes in window  
3. Monster bodies (seat anchors)  
4. Order bubbles  
5. Rage bubbles (all counter monsters — active + queue)  
6. Counter  
7. Menu, Hide, BOSS bell  
8. Juice / lunge / Medusa overlay  

### Seat layout and queue flow

- Three seats along the counter; **Exit is on the right** → **active customer = rightmost occupied seat** (closest to Exit).
- **Queue seats** (not active): monster + order bubble visible so player sees **what’s coming**; **cannot be served** until they advance.
- When active monster is **served** or **removed**, line **shifts toward Exit**; next monster becomes active.
- Departure: monster moves **off-screen to the right** along the exit flow (not a clickable exit).

---

## Drinks (menu slots 1–3)

Fixed menu for v1 — map slot → identity for art/UI:

| Slot | Drink | Hold duration (relative) | Implementation |
|------|--------|---------------------------|----------------|
| 1 | **Eyeball drink** | **Longest** | `holdDurationSeconds` on drink config / `Drink` class |
| 2 | **Blood (O-negative type)** | **Shortest** | same |
| 3 | **Witch brew** | **Middle** | same |

Exact seconds are **tunable constants** (placeholder starting points for playtesting):

| Drink | Suggested start (seconds) |
|-------|---------------------------|
| Blood | 1.0 |
| Witch brew | 1.5 |
| Eyeball | 2.5 |

Player **holds** the matching menu slot to serve the **active** customer only. Hold time required = drink being poured (not the monster’s order type if they changed mind — always the **currently displayed** order’s drink hold time).

---

## Serve targeting (decided)

- **Only the active customer** (closest to Exit) receives drinks.
- Other monsters at the counter are **queue preview** (order visible, not interactable for serve).
- Hold applies to the active monster’s current order (must match menu item held).

### Serve interaction

1. Press and hold correct menu slot.  
2. After that drink’s **`holdDurationSeconds`**, serve completes on **active** monster.  
3. Release early → cancel hold. Switch menu slot → cancel previous hold.  
4. Visual hold feedback — **TBD** (fill on slot, pour anim, etc.).

---

## Orders and mind-change

- Active and queue monsters can show orders in speech bubbles (queue = preview).
- **Mind-change:** while rage bubble is below **50%** of the order bubble’s size (radius/scale), the monster may **change their order** to another of the three drinks (implementation: reroll + update bubble art).
- At **≥50%** rage growth, order is **locked** until served or failure.

Order source: random among three drinks unless later spec adds weights/types.

---

## Patience and rage bubble

- **All monsters at the counter** (active + queue) grow a **rage bubble** on their order bubble.
- Growth rate derives from that monster’s **`patienceSeconds`** (time for rage to reach **100%** / meet order bubble).
- **`patienceSeconds` is per monster type** — defined on an abstract **`Monster`** base class; each concrete monster subtype overrides (e.g. impatient imp vs slow golem).
- Starts small; grows to **100%** where rage meets order bubble.
- Semi-transparent; random symbol gibberish (`!#$@…`) inside.
- At **100% rage**: monster shows **anger** for **0.5s** before resolving (strike or Boss save — see Boss).
- If anger window expires without Boss save → **burst** + **lunge** → **strike** (unless already resolved).

Per-type patience values — **tunable per subclass**; no global single constant.

---

## Boss bell (decided)

- **3 Boss calls per entire run.** Each successful call consumes one call and prevents **one** strike.
- Boss animation: arrives and **bows / apologizes**.

### Two forgive modes

| When you ring Boss | Who is forgiven |
|--------------------|-----------------|
| **Before** that monster reaches **100%** rage | **Active monster only** (the one currently being served at Exit) |
| **After** a monster hits **100%** rage | That **specific monster** (active **or** queue) during its **0.5s anger window** |

**Post-rage window:** up to **0.5 seconds** after rage hits **100%**, while the monster is displaying anger. Boss forgives **that** monster; no strike.

**Pre-rage:** calling Boss while active monster is below 100% rage forgives **only the active** customer — not queue monsters.

**After any Boss forgive (pre- or post-rage):** that monster’s **patience timer resets** — rage bubble returns to **0%** and growth starts again from scratch. Order bubble / current order unchanged unless mind-change rules apply separately.

**Queue + Boss:** because queue monsters also ramp rage, you may need Boss to save a queue monster who hit 100% during the 0.5s window (e.g. neglected line while focusing on active).

If anger window ends without Boss → strike + usual fail flow for that monster.

After **3 Boss uses** exhausted, no more saves.

---

## Hide — Medusa event (decided)

- **Hide** appears when **Medusa** is in play (customer/event).
- Her **eyes glow red**; player must press **Hide** before petrification.
- **Fail Hide** → separate **lose condition** (not a strike; does not use strike budget).
- **Game over scene:** Boss angry — *“You’re fired for being stoned!”* (dedicated fired/stoned screen).

---

## Win and lose (decided)

### Win

- Survive **3 minutes** of real-time play.
- Fiction: cafe **closes at 0300**; reaching closing time without losing = **win**.
- Must finish with **fewer than 3 strikes**.

### Lose 1 — Three strikes

- Each monster **rage out** that is **not** saved by Boss counts as **one strike**.
- **3 strikes** = run over (lost).
- Boss saves within the 3-call limit prevent the strike from incrementing.

### Lose 3 — Medusa / petrified

- Failed **Hide** during Medusa → **immediate game over** (fired line above).
- Does **not** add to strike count; independent loss.

### Lose 2 — Refill / backroom (later phase)

- **Random refill event** during a run.
- Hide control relabels to **“Go To Backroom”** (timer-driven mini-game, ~**2 minutes** — subject to tuning).
- Controls: **forward** and **back** only (scroll/move right through backroom).
- **Monster dog** sleeps/guards; player must advance **without detection**.
- If caught: dog **lunges at screen** → **instant game over** (ignores strike count and Boss saves remaining).

_Backroom layout, detection rules, and refill trigger rate — **discuss later** (see Reserved)._

---

## Core loop (counter gameplay)

```
Run starts (3:00 shift timer, 0 strikes, 3 Boss calls remaining)
    → Monsters fill counter (≤3); rightmost = active
    → Active gets order bubble; queue seats show preview orders
    → Rage grows on ALL counter monsters (patience per type); mind-change before 50% on each
    → Player hold-correct-drink (hold time = drink config) → serve active → exits right
    → Line advances; refill seats from queue/window
    → Optional: Medusa → Hide or Lose 3 (stoned / fired)
    → BOSS: pre-rage saves active OR post-100% saves that monster (0.5s window)
    → Unsaved 100% rage → strike; 3 strikes → Lose 1
    → Optional: refill event → backroom mini-game → Lose 2 if caught
    → Timer hits 3:00 with <3 strikes → Win
```

---

## Systems overview

| System | Responsibility |
|--------|----------------|
| **Shift timer** | 3:00 countdown; win at 0300 |
| **Strike tracker** | 0–3 strikes; Boss saves |
| **Boss calls** | 3 per run; apologize negates pending strike |
| **Queue / seats** | Active vs preview; advance on exit right |
| **Monster** (abstract) | `patienceSeconds`; subtypes; queue/active/angry/Medusa |
| **Drink** | `holdDurationSeconds`; eye / blood / brew |
| **Order bubble** | Drink id; mind-change before 50% rage |
| **Rage bubble** | Per-monster growth to 100%; 0.5s anger; gibberish |
| **Menu / hold** | Hold duration from selected drink config |
| **Medusa / Hide** | Event-driven hide input |
| **Refill / backroom** | Mode switch, 2D stealth scroll, dog catch = game over |
| **Anger sequence** | Burst → lunge → strike or Boss interrupt |

---

## UI elements (updated)

| Control | Status |
|---------|--------|
| Menu (3 drinks) | **Required** |
| Order + rage bubbles | **Required** — all seats; rage ramps on queue too |
| BOSS bell | **Required** — 3 uses, strike save |
| Hide | **Required** — Medusa events |
| Exit sign | **Art only** — queue direction, not clickable |
| “Go To Backroom” | **Later** — replaces Hide during refill event |

---

## Implementation phases

### Phase 0 — Foundation

- [x] Bun + Babylon scaffold, OOP skeleton
- [ ] Static mockup scene layout

### Phase 1 — Read-only scene

- [x] Layout: seats, exit flow, menu, bell, hide, poster
- [x] Three drinks labeled; queue vs active seat markers
- [ ] Placeholder monsters + static bubbles

### Phase 2 — Queue and serve

- [ ] Active vs queue targeting (rightmost = active)
- [ ] Hold-to-serve + hold duration (tune constant)
- [ ] Exit-right departure + line advance

### Phase 3 — Rage, mind-change, anger

- [ ] Rage growth; 50% mind-change lock
- [ ] Burst + lunge + strike increment

### Phase 4 — Shift win/lose + Boss

- [ ] 3:00 timer; 0300 win presentation
- [ ] 3 strikes lose
- [ ] Boss bell — pre-rage (active) + post-100% (0.5s, any seat)

### Phase 5 — Medusa

- [ ] Medusa spawn/event
- [ ] Hide + eyes red + Lose 3 fired/stoned game over

### Phase 6 — Refill / backroom (spec incomplete)

- [ ] Random refill trigger
- [ ] UI swap to “Go To Backroom”
- [ ] Forward/back mini-game, dog, instant fail on catch
- [ ] ~2:00 backroom timer (tune)

---

## OOP model (planned)

Aligns with [AGENTS.md](./AGENTS.md) class-based structure.

### `Monster` (abstract)

- `patienceSeconds: number` — time for rage to go from 0% → 100% (override per subclass).
- Seat index, active vs queue role, order, rage state, anger window flag.
- Subclasses: concrete monster types (patience + art); **Medusa** may be special event type.

### `Drink` (or drink config registry)

- `id`, display name, art.
- `holdDurationSeconds: number` — **Blood (short) < Witch brew (mid) < Eyeball (long)**.

### `BossSystem`

- Tracks `callsRemaining` (starts at 3).
- Resolves pre-rage target = active monster; post-100% target = monster in anger window.
- On success: `resetPatience()` — rage 0%, timer restarts (`patienceSeconds` full duration again).

---

## Open questions (still TBD)

1. **Exact `patienceSeconds`** per monster subtype (first pass table).  
2. **Exact `holdDurationSeconds`** after playtest (starting placeholders in drink table).  
3. **Mind-change** — random reroll, or weighted by drink/monster?  
4. **Hold feedback** — visual/audio during hold?  
5. **Art pipeline** — single background vs layered sprites?  
6. **Refill event** — frequency, pause shift timer?, backroom layout?  
7. **Rage gibberish** — charset refresh rules?

---

## Reserved — backroom mini-game (your next pass)

_Detail when ready; not blocking Phases 1–4._

- Refill event probability and whether shift timer pauses  
- Backroom scene art (side-scroll / depth illusion with forward-back only)  
- Dog detection: line-of-sight, noise, timers?  
- Win condition exiting backroom (return to counter automatically?)  
- Relationship between 2:00 backroom timer and 3:00 shift timer  

---

## Document maintenance

- Update this file when design changes.
- Mirror summary in [AGENTS.md](./AGENTS.md).
- Move answered items out of **Open questions** into the relevant section.
