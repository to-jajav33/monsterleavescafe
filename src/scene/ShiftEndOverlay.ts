import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

import { Vec2 } from "../utils/math.ts";

import { BossCutieGameOverRunner } from "./BossCutieGameOverRunner.ts";
import {
  GAMEOVER_FIRED_SUBTITLE_Y,
  GAMEOVER_FIRED_TITLE_Y,
  GAMEOVER_YOURE_FIRED_DISPLAY_SIZE,
  GAMEOVER_YOURE_FIRED_URL,
} from "./gameOverAssets.ts";
import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

type OverlayMode = "shiftOver" | "fired" | "stoned";

/** Defeat / shift-end UI with optional boss cutie loop. */
export class ShiftEndOverlay {
  private readonly shiftOverTitle: LayoutPlane;
  private readonly firedTitle: LayoutPlane;
  private readonly subtitle: LayoutPlane;
  private readonly bossRunner: BossCutieGameOverRunner;
  private visible = false;
  private mode: OverlayMode = "shiftOver";

  constructor(scene: Scene) {
    this.bossRunner = new BossCutieGameOverRunner(scene);

    this.shiftOverTitle = new LayoutPlane(scene, {
      name: "layout_shift_end_title",
      center: new Vec2(0, 40),
      width: 520,
      height: 80,
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.shiftTimer + 0.03,
      alphaIndex: LayoutAlphaIndex.shiftEndOverlay,
      color: new Color3(0.18, 0.14, 0.22),
      label: "SHIFT OVER",
      labelFont: "bold 48px monospace",
      labelTextColor: "#f5e6c8",
      sortTransparent: true,
    });

    this.firedTitle = new LayoutPlane(scene, {
      name: "layout_gameover_youre_fired",
      center: new Vec2(0, GAMEOVER_FIRED_TITLE_Y),
      width: GAMEOVER_YOURE_FIRED_DISPLAY_SIZE,
      height: GAMEOVER_YOURE_FIRED_DISPLAY_SIZE,
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.shiftTimer + 0.03,
      alphaIndex: LayoutAlphaIndex.shiftEndOverlay,
      color: new Color3(1, 1, 1),
      imageUrl: GAMEOVER_YOURE_FIRED_URL,
      imageBlend: "alphablend",
      sortTransparent: true,
    });

    this.subtitle = new LayoutPlane(scene, {
      name: "layout_shift_end_subtitle",
      center: new Vec2(0, -40),
      width: 480,
      height: 48,
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.shiftTimer + 0.03,
      alphaIndex: LayoutAlphaIndex.shiftEndOverlay,
      color: new Color3(0.14, 0.12, 0.18),
      label: "click to continue",
      labelFont: "bold 22px monospace",
      labelTextColor: "#c8b8a0",
      sortTransparent: true,
    });

    this.setVisible(false);
  }

  show(): void {
    this.mode = "shiftOver";
    this.subtitle.updateLabel("3:00 — click to continue");
    this.applyLayoutPositions();
    this.setVisible(true);
  }

  showOutOfLives(): void {
    this.mode = "fired";
    this.subtitle.updateLabel("click to continue");
    this.applyLayoutPositions();
    this.setVisible(true);
  }

  /** Lose 3 — failed Medusa hide (stoned). */
  showStoned(): void {
    this.mode = "stoned";
    this.subtitle.updateLabel("You're fired for being stoned! — click to continue");
    this.applyLayoutPositions();
    this.setVisible(true);
  }

  private applyLayoutPositions(): void {
    if (this.mode === "fired") {
      this.firedTitle.mesh.position.y = GAMEOVER_FIRED_TITLE_Y;
      this.subtitle.mesh.position.y = GAMEOVER_FIRED_SUBTITLE_Y;
      return;
    }
    this.shiftOverTitle.mesh.position.y = 40;
    this.subtitle.mesh.position.y = -40;
  }

  private setVisible(visible: boolean): void {
    this.visible = visible;
    this.shiftOverTitle.mesh.isVisible = visible && this.mode === "shiftOver";
    this.firedTitle.mesh.isVisible =
      visible && (this.mode === "fired" || this.mode === "stoned");
    this.subtitle.mesh.isVisible = visible;
    if (visible) {
      this.bossRunner.start();
    } else {
      this.bossRunner.stop();
    }
  }

  get isVisible(): boolean {
    return this.visible;
  }

  dispose(): void {
    this.bossRunner.dispose();
    this.shiftOverTitle.dispose();
    this.firedTitle.dispose();
    this.subtitle.dispose();
  }
}
