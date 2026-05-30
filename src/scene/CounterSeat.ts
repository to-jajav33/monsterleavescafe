import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { Vec2 } from "../utils/math.ts";

import { LayoutGui } from "./LayoutGui.ts";
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

/** Counter seat placeholder with active vs queue styling. */
export class SeatMarker {
  private readonly planes: LayoutPlane[] = [];

  constructor(
    scene: Scene,
    gui: LayoutGui,
    private readonly config: SeatMarkerConfig,
  ) {
    const x = SEAT_X[config.index]!;
    const center = new Vec2(x, SEAT_Y);
    const isActive = config.role === "active";

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
      }),
    );

    gui.addLabel({
      text: isActive ? "ACTIVE" : "QUEUE",
      center: new Vec2(x, SEAT_Y + 38),
      width: 120,
      height: 22,
      fontSize: isActive ? 14 : 12,
      fontWeight: "bold",
      color: isActive ? "#ffe08a" : "#b8c0cc",
    });

    gui.addLabel({
      text: `Seat ${config.index === 0 ? "L" : config.index === 1 ? "C" : "R"}`,
      center: new Vec2(x, SEAT_Y - 32),
      width: 120,
      height: 22,
      fontSize: 14,
    });
  }

  dispose(): void {
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
  }
}
