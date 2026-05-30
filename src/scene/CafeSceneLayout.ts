import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { Vec2 } from "../utils/math.ts";

import { ACTIVE_SEAT_INDEX, SeatMarker } from "./CounterSeat.ts";
import {
  LayoutGui,
  parseFontSizePx,
  parseFontWeight,
} from "./LayoutGui.ts";
import { LayoutLayer } from "./LayoutLayer.ts";
import { MenuBoard } from "./MenuBoard.ts";
import { LayoutPlane, type LayoutPlaneConfig } from "./LayoutPlane.ts";

type PanelConfig = LayoutPlaneConfig & {
  label?: string;
  labelFont?: string;
};

/**
 * Phase 1 mockup scene — layout, menu drinks, seat markers.
 * Positions tuned for 1280×720 orthographic space (origin = screen center).
 */
export class CafeSceneLayout {
  private readonly planes: LayoutPlane[] = [];
  private readonly gui: LayoutGui;
  private readonly seatMarkers: SeatMarker[] = [];
  private menuBoard: MenuBoard | null = null;

  constructor(private readonly scene: Scene) {
    this.gui = new LayoutGui(scene);
    this.build();
  }

  dispose(): void {
    this.menuBoard?.dispose();
    this.menuBoard = null;
    for (const seat of this.seatMarkers) {
      seat.dispose();
    }
    this.seatMarkers.length = 0;
    this.gui.dispose();
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
  }

  private add(config: PanelConfig): void {
    const { label, labelFont, ...planeConfig } = config;
    this.planes.push(new LayoutPlane(this.scene, planeConfig));
    if (label) {
      this.gui.addLabel({
        text: label,
        center: planeConfig.center,
        width: planeConfig.width,
        height: planeConfig.height,
        fontSize: parseFontSizePx(labelFont),
        fontWeight: parseFontWeight(labelFont),
      });
    }
  }

  private build(): void {
    this.buildBackWall();
    this.buildWindow();
    this.buildPoster();
    this.buildExitSign();
    this.buildCounter();
    this.buildSeats();
    this.buildExitFlow();
    this.menuBoard = new MenuBoard(this.scene, this.gui);
    this.buildHideButton();
    this.buildBossBell();
  }

  private buildBackWall(): void {
    this.add({
      name: "layout_back_wall",
      center: new Vec2(0, 210),
      width: 1280,
      height: 360,
      layer: LayoutLayer.backWall,
      color: new Color3(0.38, 0.34, 0.42),
    });
  }

  private buildWindow(): void {
    this.add({
      name: "layout_window_frame",
      center: new Vec2(0, 200),
      width: 440,
      height: 220,
      layer: LayoutLayer.decor,
      color: new Color3(0.5, 0.55, 0.62),
      label: "Window",
      labelFont: "bold 28px monospace",
    });
    this.add({
      name: "layout_window_glass",
      center: new Vec2(0, 200),
      width: 380,
      height: 170,
      layer: LayoutLayer.decor,
      color: new Color3(0.32, 0.4, 0.52),
      label: "(queue preview)",
      labelFont: "18px monospace",
    });
  }

  private buildPoster(): void {
    this.add({
      name: "layout_boba_poster",
      center: new Vec2(440, 140),
      width: 170,
      height: 200,
      layer: LayoutLayer.decor,
      color: new Color3(0.72, 0.52, 0.38),
      label: "Boba",
      labelFont: "bold 32px monospace",
    });
  }

  private buildExitSign(): void {
    this.add({
      name: "layout_exit_sign",
      center: new Vec2(520, 220),
      width: 140,
      height: 70,
      layer: LayoutLayer.decor,
      color: new Color3(0.58, 0.48, 0.4),
      label: "Exit →",
      labelFont: "bold 26px monospace",
    });
  }

  private buildCounter(): void {
    this.add({
      name: "layout_counter",
      center: new Vec2(0, -260),
      width: 1280,
      height: 200,
      layer: LayoutLayer.counter,
      color: new Color3(0.52, 0.4, 0.28),
    });
    this.add({
      name: "layout_counter_top",
      center: new Vec2(0, -170),
      width: 1200,
      height: 24,
      layer: LayoutLayer.counter,
      color: new Color3(0.65, 0.5, 0.35),
    });
  }

  /** Three seats — rightmost (R) = active; L/C = queue. */
  private buildSeats(): void {
    for (let i = 0; i < 3; i++) {
      const role = i === ACTIVE_SEAT_INDEX ? "active" : "queue";
      this.seatMarkers.push(
        new SeatMarker(this.scene, this.gui, { index: i, role }),
      );
    }
  }

  private buildExitFlow(): void {
    this.add({
      name: "layout_exit_flow_arrow",
      center: new Vec2(400, -120),
      width: 200,
      height: 48,
      layer: LayoutLayer.seats,
      color: new Color3(0.4, 0.48, 0.55),
      label: "queue →",
      labelFont: "bold 22px monospace",
    });
  }

  private buildHideButton(): void {
    this.add({
      name: "layout_hide_button",
      center: new Vec2(0, -310),
      width: 130,
      height: 52,
      layer: LayoutLayer.ui,
      color: new Color3(0.48, 0.52, 0.62),
      label: "Hide",
      labelFont: "bold 22px monospace",
    });
  }

  private buildBossBell(): void {
    this.add({
      name: "layout_boss_bell",
      center: new Vec2(520, -300),
      width: 110,
      height: 90,
      layer: LayoutLayer.ui,
      color: new Color3(0.7, 0.62, 0.32),
      label: "BOSS",
      labelFont: "bold 24px monospace",
    });
  }
}
