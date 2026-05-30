import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { Vec2 } from "../utils/math.ts";

import {
  LayoutGui,
  parseFontSizePx,
  parseFontWeight,
} from "./LayoutGui.ts";
import { LayoutPlane, type LayoutPlaneConfig } from "./LayoutPlane.ts";

/**
 * 2D draw order (renderingGroupId). Higher = on top.
 * Do not rely on tiny Z offsets — ortho + overlapping Y needs explicit groups.
 */
export const LayoutLayer = {
  backWall: 0,
  decor: 1,
  seats: 2,
  counter: 3,
  ui: 4,
} as const;

type PanelConfig = LayoutPlaneConfig & {
  label?: string;
  labelFont?: string;
};

/**
 * Phase 1 — item 1: mockup layout only (no monsters, drink slots, or bubbles).
 * Positions tuned for 1280×720 orthographic space (origin = screen center).
 */
export class CafeSceneLayout {
  private readonly planes: LayoutPlane[] = [];
  private readonly gui: LayoutGui;

  constructor(private readonly scene: Scene) {
    this.gui = new LayoutGui(scene);
    this.build();
  }

  dispose(): void {
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
    this.buildMenuBoard();
    this.buildHideButton();
    this.buildBossBell();
  }

  private buildBackWall(): void {
    // Upper wall only — must not extend down over seats/counter (was y bottom ≈ -120)
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

  /** Three fixed seat anchors along the counter (right = toward Exit). */
  private buildSeats(): void {
    const seatY = -90;
    const positions = [
      { x: -280, label: "Seat L" },
      { x: 0, label: "Seat C" },
      { x: 280, label: "Seat R" },
    ];
    for (const seat of positions) {
      this.add({
        name: `layout_seat_${seat.label.replace(/\s/g, "")}`,
        center: new Vec2(seat.x, seatY),
        width: 130,
        height: 110,
        layer: LayoutLayer.seats,
        color: new Color3(0.45, 0.5, 0.58),
        label: seat.label,
        labelFont: "16px monospace",
      });
    }
  }

  /** Visual queue direction toward off-screen exit (right). */
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

  private buildMenuBoard(): void {
    this.add({
      name: "layout_menu_board",
      center: new Vec2(-520, -300),
      width: 200,
      height: 150,
      layer: LayoutLayer.ui,
      color: new Color3(0.55, 0.48, 0.36),
      label: "Menu",
      labelFont: "bold 30px monospace",
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
