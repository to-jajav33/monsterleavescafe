# Medusa hide mechanic — locked spec

Authoritative design for the Medusa hide event. Implementation is phased; see [GAME_SCOPE.md](../GAME_SCOPE.md) Phase 5.

## Triggers and scope

| Rule | Decision |
|------|----------|
| Who triggers | **Active customer only** (rightmost seat, Exit side). |
| Which monster | **Medusa** (`medusa_idle` appearance) only. |
| How often | **Once per Medusa** while she is that active customer. |
| Concurrency | **Global** — at most one hide event in the run at a time. |

## Event timeline

| Step | Phase | What happens |
|------|--------|----------------|
| 1 | **Telegraph** | Hide button **pulses**. Medusa stays **idle** (no red eyes). |
| 2 | **Early hide (optional)** | Player **press and holds** Hide or Space → **valid** (will not be stoned). |
| 3 | **Reveal** | Medusa **eyes glow red** (dedicated frame; placeholder: angry frame until art exists). |
| 4 | **Danger window** | **0.5s** to be in hide state (already hiding from step 2 counts). **Serve (1/2/3) and Boss disabled** for this window only. |
| 5 | **Fail** | After 0.5s, if **not** hiding → **stoned game over** (Lose 3, not a strike). Medusa must **not** enter rage/stoned-from-rage during this event. |
| 6 | **While hiding** | Camera pans **down** (Y only, **0.25s**) until frame bottom meets **counter bottom**. **All counter patience paused**. **Shift timer keeps running**. |
| 7 | **Safe to release** | **Both**: Medusa eyes back to **idle** **and** Hide button **pulse stops**. Player releases Hide / Space → camera pans **up** to origin (**0.25s**). |

## Input

- **Press and hold** Space or Hide until step 7 is satisfied (matches tutorial).
- Hide button behaves the same as Space (hold, not tap-only).
- Hiding during step 1 (telegraph, before eyes) is **valid and successful** for step 5.

## While hidden / danger

| System | Behavior |
|--------|----------|
| Patience (all counter monsters) | **Paused** while player is in hide state |
| Shift timer | **Runs** |
| Serve 1/2/3 + Boss | **Disabled only during the 0.5s danger window** (step 4) |
| Rage → strike during event | **Blocked** for the active Medusa during the hide event |

## Camera

- **Y only**; fixed X and zoom.
- **Target:** bottom of camera frame aligns with bottom of counter.
- **Duration:** 0.25s down on hide, 0.25s up on release.

## Failure and copy

- Fail → immediate **stoned / fired** overlay (separate from 3-strike game over).
- **Pure Lose 3** — no strike added.

## Implementation slices

1. **State machine + triggers** — done (`MedusaHideController`).
2. **Input** — done (`HideHoldController`: Space + Hide button hold → `setPlayerHiding`; hold through resolve).
3. **Patience pause** — done (`RageSystem` + `isPatiencePausedForHide`).
4. **Danger gating** — done (menu serve blocked during danger window; Boss not wired yet).
5. **Hide button pulse** — done (`HideButtonPulse`).
6. **Medusa eyes art** — replace placeholder angry frame with glow asset.
7. **Camera pan** — done (`HideCameraPan`: 0.25s Y pan to counter bottom while holding hide).
8. **Stoned overlay** — partial (`showStoned()` copy); dedicated art optional.

## Open follow-up

During steps 6–7 (camera under counter), should serve/Boss stay disabled until camera is back up, or only during step 4? Current spec: **danger window only**.
