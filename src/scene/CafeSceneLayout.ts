import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vec2 } from "../utils/math.ts";
import type { GameEngine } from "../game/GameEngine.ts";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { createContainViewport } from "../utils/containViewport.ts";

import { ACTIVE_SEAT_INDEX, SeatMarker } from "./CounterSeat.ts";
import { LayoutLayer } from "./LayoutLayer.ts";
import { MenuBoard } from "./MenuBoard.ts";
import { LayoutPlane, type LayoutPlaneConfig } from "./LayoutPlane.ts";

type PanelConfig = LayoutPlaneConfig;

/**
 * Phase 1 mockup scene — layout, menu drinks, seat markers.
 * Labels live on mesh textures (design/world space), not screen GUI.
 */
export class CafeSceneLayout {
  private readonly planes: LayoutPlane[] = [];
  private readonly seatMarkers: SeatMarker[] = [];
  private menuBoard: MenuBoard | null = null;
  private readonly updateOrtho: () => void;

  constructor(
    private readonly scene: Scene,
    private readonly gameEngine: GameEngine,
    private readonly camera: FreeCamera,
  ) {
    this.updateOrtho = () => this.applyContainLayout();
    this.gameEngine.onResize(this.updateOrtho);
    this.applyContainLayout();
    this.build();
  }

  dispose(): void {
    this.gameEngine.offResize(this.updateOrtho);
    this.menuBoard?.dispose();
    this.menuBoard = null;
    for (const seat of this.seatMarkers) {
      seat.dispose();
    }
    this.seatMarkers.length = 0;
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
  }

  /**
   * Fixed 1280×720 world units + viewport letterbox (like CSS object-fit: contain).
   */
  private applyContainLayout(): void {
    const canvas = this.gameEngine.engine.getRenderingCanvas();
    if (!canvas) return;

    const halfW = DESIGN_WIDTH / 2;
    const halfH = DESIGN_HEIGHT / 2;
    this.camera.orthoLeft = -halfW;
    this.camera.orthoRight = halfW;
    this.camera.orthoTop = halfH;
    this.camera.orthoBottom = -halfH;
    this.camera.viewport = createContainViewport(
      canvas.width,
      canvas.height,
    );
  }

  private add(config: PanelConfig): void {
    this.planes.push(new LayoutPlane(this.scene, config));
  }

  private build(): void {
    this.buildBackWall();
    this.buildWindow();
    this.buildPoster();
    this.buildExitSign();
    this.buildCounter();
    this.buildSeats();
    this.buildExitFlow();
    this.menuBoard = new MenuBoard(this.scene);
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
      center: new Vec2(0, 165),
      width: 360,
      height: 120,
      layer: LayoutLayer.decor,
      color: new Color3(0.32, 0.4, 0.52),
      label: "queue preview",
      labelFont: "16px monospace",
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

  private buildSeats(): void {
    for (let i = 0; i < 3; i++) {
      const role = i === ACTIVE_SEAT_INDEX ? "active" : "queue";
      this.seatMarkers.push(new SeatMarker(this.scene, { index: i, role }));
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
