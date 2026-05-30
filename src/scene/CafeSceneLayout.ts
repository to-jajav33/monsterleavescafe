import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vec2 } from "../utils/math.ts";
import type { GameEngine } from "../game/GameEngine.ts";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { debugLog } from "../utils/debugLog.ts";
import { logCameraAndCanvas, logSceneMeshes } from "../utils/sceneDebug.ts";
import { createContainViewport } from "../utils/containViewport.ts";
import { DRINK_MENU } from "../game/Drink.ts";

import { ACTIVE_SEAT_INDEX, SeatMarker } from "./CounterSeat.ts";
import {
  PHASE1_DEMO_CUSTOMERS,
  SeatCustomer,
} from "./SeatCustomer.ts";
import { LayoutLayer } from "./LayoutLayer.ts";
import { GameplayController } from "../game/GameplayController.ts";
import { MenuBoard } from "./MenuBoard.ts";
import { LayoutPlane, type LayoutPlaneConfig } from "./LayoutPlane.ts";
import { SCENE_BACKGROUND_URL } from "./sceneAssets.ts";

type PanelConfig = LayoutPlaneConfig;

/**
 * Phase 1 mockup scene — layout, menu drinks, seat markers.
 * Labels live on mesh textures (design/world space), not screen GUI.
 */
export class CafeSceneLayout {
  private readonly planes: LayoutPlane[] = [];
  private readonly seatMarkers: SeatMarker[] = [];
  private readonly seatCustomers: SeatCustomer[] = [];
  private menuBoard: MenuBoard | null = null;
  private gameplay: GameplayController | null = null;
  private readonly updateOrtho: () => void;

  constructor(
    private readonly scene: Scene,
    private readonly gameEngine: GameEngine,
    private readonly camera: FreeCamera,
  ) {
    debugLog("CafeSceneLayout.constructor");
    this.updateOrtho = () => {
      debugLog("resize → applyContainLayout");
      this.applyContainLayout();
      logCameraAndCanvas(this.scene, this.camera, this.gameEngine.engine);
    };
    this.gameEngine.onResize(this.updateOrtho);
    this.applyContainLayout();
    this.build();
    this.logBuildSummary();
  }

  dispose(): void {
    this.gameEngine.offResize(this.updateOrtho);
    this.gameplay?.dispose();
    this.gameplay = null;
    this.menuBoard?.dispose();
    this.menuBoard = null;
    for (const customer of this.seatCustomers) {
      customer.dispose();
    }
    this.seatCustomers.length = 0;
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
    this.buildSceneBackground();
    this.buildExitSign();
    this.buildCounter();
    this.buildSeats();
    this.buildSeatCustomers();
    this.buildExitFlow();
    debugLog("CafeSceneLayout.build → creating MenuBoard");
    this.menuBoard = new MenuBoard(this.scene);
    debugLog("CafeSceneLayout.build → MenuBoard planeCount", this.menuBoard.planeCount);
    this.gameplay = new GameplayController(
      this.scene,
      this.menuBoard,
      this.seatCustomers,
    );
    this.buildHideButton();
    this.buildBossBell();
  }

  private logBuildSummary(): void {
    debugLog("=== CafeSceneLayout build summary ===");
    debugLog("DRINK_MENU from Drink.ts:", DRINK_MENU.length, "items");
    debugLog("Tracked layout planes:", this.planes.length);
    debugLog("Seat markers:", this.seatMarkers.length);
    debugLog("Seat customers:", this.seatCustomers.length);
    debugLog("MenuBoard planeCount:", this.menuBoard?.planeCount ?? "null");
    logCameraAndCanvas(this.scene, this.camera, this.gameEngine.engine);
    logSceneMeshes(this.scene);
    debugLog("=== end summary ===");
  }

  /** Full-design backdrop from `assets/image-bg.png`. */
  private buildSceneBackground(): void {
    debugLog("CafeSceneLayout.build → scene background", SCENE_BACKGROUND_URL);
    this.add({
      name: "layout_scene_background",
      center: new Vec2(0, 0),
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT,
      layer: LayoutLayer.backWall,
      depthOffset: -0.02,
      color: new Color3(0.2, 0.18, 0.22),
      imageUrl: SCENE_BACKGROUND_URL,
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

  /** Placeholder monsters + static order bubbles (Phase 1 item 3). */
  private buildSeatCustomers(): void {
    debugLog("CafeSceneLayout.build → seat customers", PHASE1_DEMO_CUSTOMERS.length);
    for (const config of PHASE1_DEMO_CUSTOMERS) {
      this.seatCustomers.push(new SeatCustomer(this.scene, config));
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
      center: new Vec2(0, -250),
      width: 130,
      height: 52,
      layer: LayoutLayer.ui,
      depthOffset: 0.05,
      color: new Color3(0.48, 0.52, 0.62),
      label: "Hide",
      labelFont: "bold 22px monospace",
    });
  }

  private buildBossBell(): void {
    this.add({
      name: "layout_boss_bell",
      center: new Vec2(520, -250),
      width: 110,
      height: 90,
      layer: LayoutLayer.ui,
      depthOffset: 0.06,
      color: new Color3(0.7, 0.62, 0.32),
      label: "BOSS",
      labelFont: "bold 24px monospace",
    });
  }
}
