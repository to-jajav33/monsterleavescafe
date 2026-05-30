import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { Vec2 } from "../utils/math.ts";

import { LayoutLayer } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

export const SEAT_Y = -90;

/** Seat index 0 = left, 1 = center, 2 = right (active — closest to Exit). */
export const SEAT_X: readonly number[] = [-280, 0, 280] as const;

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
    const seatName =
      config.index === 0 ? "L" : config.index === 1 ? "C" : "R";

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
        label: isActive ? `ACTIVE\nSeat ${seatName}` : `QUEUE\nSeat ${seatName}`,
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
