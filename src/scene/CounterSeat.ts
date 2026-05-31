import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { debugLog } from "../utils/debugLog.ts";
import { horizSpan } from "../utils/seatLayoutDebug.ts";
import { Vec2 } from "../utils/math.ts";

import { LayoutLayer } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

export const SEAT_Y = -90;

/** Active seat (right) — aligned with stools / queue UI in the bg mockup. */
export const SEAT_R_X = 280;

/** Center-to-center distance between stool slots (L→C→R). */
export const SEAT_STOOL_SPACING = 560;

/**
 * Seat index 0 = left, 1 = center, 2 = right (active).
 *
 * Anchored to painted stools in `image-bg.png`, not {@link MONSTER_SEAT_PITCH}.
 * Full-width slime (1320px) overlaps at these centers — see seat layout logs.
 */
export const SEAT_X: readonly number[] = [
  SEAT_R_X - SEAT_STOOL_SPACING * 2,
  SEAT_R_X - SEAT_STOOL_SPACING,
  SEAT_R_X,
] as const;

export const ACTIVE_SEAT_INDEX = 2;

export type SeatRole = "active" | "queue";

export type SeatMarkerConfig = {
  index: number;
  role: SeatRole;
};

/** Counter seat — labels baked on mesh textures at seat position. */
export class SeatMarker {
  private readonly planes: LayoutPlane[] = [];

  constructor(scene: Scene, config: SeatMarkerConfig) {
    const x = SEAT_X[config.index]!;
    const center = new Vec2(x, SEAT_Y);
    const isActive = config.role === "active";
    const seatName = config.index === 0 ? "L" : config.index === 1 ? "C" : "R";

    if (isActive) {
      this.planes.push(
        new LayoutPlane(scene, {
          name: `seat_${config.index}_active_ring`,
          center,
          width: 148,
          height: 128,
          layer: LayoutLayer.seats,
          color: new Color3(0.85, 0.75, 0.25),
        }),
      );
    }

    debugLog("SeatMarker.create", {
      index: config.index,
      seatName,
      role: config.role,
      center: { x, y: SEAT_Y },
      markerSpan: horizSpan(x, 130),
      note: "Marker Y is SEAT_Y (-90), not slime counter Y (~95)",
    });

    this.planes.push(
      new LayoutPlane(scene, {
        name: `seat_${config.index}_pad`,
        center,
        width: 130,
        height: 110,
        layer: LayoutLayer.seats,
        color: isActive
          ? new Color3(0.5, 0.58, 0.42)
          : new Color3(0.38, 0.42, 0.48),
        label: isActive
          ? `ACTIVE\nSeat ${seatName}`
          : `QUEUE\nSeat ${seatName}`,
        labelFont: isActive ? "bold 15px monospace" : "14px monospace",
        labelTextColor: isActive ? "#ffe08a" : "#d8e0ec",
      }),
    );
  }

  dispose(): void {
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
  }
}
