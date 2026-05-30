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
5. Rage bubbles (active customer only, unless spec changes)  
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

| Slot | Drink | Notes |
|------|--------|--------|
| 1 | **Eyeball drink** | Icon/color TBD |
| 2 | **Blood (O-negative type)** | Icon/color TBD |
| 3 | **Witch brew** | Icon/color TBD |

Player **holds** the matching menu slot to serve the **active** customer only.

---

## Serve targeting (decided)

- **Only the active customer** (closest to Exit) receives drinks.
- Other monsters at the counter are **queue preview** (order visible, not interactable for serve).
- Hold applies to the active monster’s current order (must match menu item held).

### Serve interaction

1. Press and hold correct menu slot.  
2. After **hold duration** (seconds — **TBD**, tunable constant), drink is served to **active** monster.  
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

- **Rage bubble** overlays order bubble on **active customer** (queue behavior for rage — **TBD** if preview monsters ever ramp; default: **rage only on active**).
- Starts small; grows until it meets the order bubble → **burst**.
- Semi-transparent; random symbol gibberish (`!#$@…`) inside.
- On burst: angry **lunge** toward camera → registers a **strike** unless Boss saves (see below).

**Patience duration** (seconds until rage meets order) — **TBD**, tunable.

---

## Boss bell (decided)

- Use when a customer is **about to rage out** (telegraph window — exact timing **TBD**, e.g. near burst threshold).
- Boss arrives and **bows / apologizes**; that customer does **not** count as a **strike**.
- **3 Boss calls per game** (entire run), not per shift.
- Boss can prevent up to **3 strikes** total across the run.
- After 3 Boss uses, no more saves — further rages count as strikes.

---

## Hide — Medusa event (decided)

- **Hide** is not always available; triggers when **Medusa** appears as a customer/event.
- Her **eyes glow red**; player must press **Hide** before petrification (“stone” fail state).
- Failure condition for Medusa — **TBD** (instant strike? separate from strike count?).

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
    → Rage grows on active; possible mind-change before 50% rage
    → Player hold-correct-drink → serve → monster exits right
    → Line advances; refill seats from queue/window
    → Optional: Medusa → Hide
    → Optional: near-rage → BOSS (if calls left)
    → Rage burst without save → strike; 3 strikes → Lose 1
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
| **Monster** | State: queue, active, served, angry, special (Medusa) |
| **Order bubble** | Drink id; mind-change before 50% rage |
| **Rage bubble** | Growth, gibberish, burst threshold |
| **Menu / hold** | Three drinks; hold-to-serve active only |
| **Medusa / Hide** | Event-driven hide input |
| **Refill / backroom** | Mode switch, 2D stealth scroll, dog catch = game over |
| **Anger sequence** | Burst → lunge → strike or Boss interrupt |

---

## UI elements (updated)

| Control | Status |
|---------|--------|
| Menu (3 drinks) | **Required** |
| Order + rage bubbles | **Required** (active; preview orders on queue) |
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

- [ ] Layout: seats, exit flow, menu, bell, hide, poster
- [ ] Three drinks labeled; queue vs active seat markers
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
- [ ] Boss bell (3 calls, apologize, strike cancel)

### Phase 5 — Medusa

- [ ] Medusa spawn/event
- [ ] Hide + eyes red + fail if too slow

### Phase 6 — Refill / backroom (spec incomplete)

- [ ] Random refill trigger
- [ ] UI swap to “Go To Backroom”
- [ ] Forward/back mini-game, dog, instant fail on catch
- [ ] ~2:00 backroom timer (tune)

---

## Open questions (still TBD)

1. **Hold duration** — seconds for a complete serve?  
2. **Patience duration** — seconds until rage meets order?  
3. **Boss window** — how close to burst can player ring Boss?  
4. **Medusa fail** — strike, instant lose, or separate penalty?  
5. **Queue rage** — do non-active monsters grow rage, or only active?  
6. **Mind-change** — random reroll, or weighted by drink?  
7. **Hold feedback** — visual/audio during hold?  
8. **Art pipeline** — single background vs layered sprites?  
9. **Refill event** — frequency, pause counter gameplay?, backroom map layout?  
10. **Rage gibberish** — charset refresh rules?

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
