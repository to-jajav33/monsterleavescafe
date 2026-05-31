import type { Scene } from "@babylonjs/core/scene";
import {
  PointerEventTypes,
  type PointerInfo,
} from "@babylonjs/core/Events/pointerEvents";
import type { Observer } from "@babylonjs/core/Misc/observable";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vec2 } from "../utils/math.ts";
import type { GameEngine } from "../game/GameEngine.ts";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { debugLog } from "../utils/debugLog.ts";
import {
  logCameraAndCanvas,
  logDrawStack,
  logSceneMeshes,
} from "../utils/sceneDebug.ts";
import { logArtMonsterBottomAlignmentScan } from "./monsterLayoutDebug.ts";
import {
  logSeatLayoutAudit,
  logSeatLayoutMeshes,
} from "../utils/seatLayoutDebug.ts";
import { createContainViewport } from "../utils/containViewport.ts";
import { DRINK_MENU } from "../game/Drink.ts";

import type { SeatMarker } from "./CounterSeat.ts";
import { SeatCustomer } from "./SeatCustomer.ts";
import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { GameplayController } from "../game/GameplayController.ts";
import { MenuBoard } from "./MenuBoard.ts";
import { CounterFlashlightDecal } from "./CounterFlashlightDecal.ts";
import { HideButtonPulse } from "./HideButtonPulse.ts";
import { GhostNpcDecor } from "./GhostNpcDecor.ts";
import { LayoutPlane, type LayoutPlaneConfig } from "./LayoutPlane.ts";
import { LivesHud } from "./LivesHud.ts";
import { ShiftEndOverlay } from "./ShiftEndOverlay.ts";
import { ShiftTimerHud } from "./ShiftTimerHud.ts";
import {
  COUNTER_TOP_BRICK_ROW_FROM_BACK_WALL,
  COUNTER_TOP_CENTER,
  COUNTER_TOP_EDGE_Y,
  COUNTER_TOP_HEIGHT,
  COUNTER_TOP_WIDTH,
  SCENE_BACKGROUND_URL,
  SCENE_COUNTER_TOP_URL,
} from "./sceneAssets.ts";

type PanelConfig = LayoutPlaneConfig;

/** Set true to hide counter while checking feet vs frame bottom. */
const DEBUG_HIDE_COUNTER = false;

/**
 * Phase 1 mockup scene — layout, menu drinks, seat markers.
 * Labels live on mesh textures (design/world space), not screen GUI.
 */
export class CafeSceneLayout {
  private readonly planes: LayoutPlane[] = [];
  private readonly seatMarkers: SeatMarker[] = [];
  private readonly seatCustomers: SeatCustomer[] = [];
  private menuBoard: MenuBoard | null = null;
  private ghostNpc: GhostNpcDecor | null = null;
  private flashlightDecal: CounterFlashlightDecal | null = null;
  private gameplay: GameplayController | null = null;
  private shiftTimerHud: ShiftTimerHud | null = null;
  private livesHud: LivesHud | null = null;
  private shiftEndOverlay: ShiftEndOverlay | null = null;
  private hideButtonPulse: HideButtonPulse | null = null;
  private shiftEndPointerObserver: Observer<PointerInfo> | null = null;
  private readonly updateOrtho: () => void;

  constructor(
    private readonly scene: Scene,
    private readonly gameEngine: GameEngine,
    private readonly camera: FreeCamera,
    private readonly onShiftComplete?: () => void,
  ) {
    debugLog("CafeSceneLayout.constructor");
    this.updateOrtho = () => {
      debugLog("resize → applyContainLayout");
      this.applyContainLayout();
      logCameraAndCanvas(this.scene, this.camera, this.gameEngine.engine);
      logSeatLayoutMeshes(
        this.scene,
        this.camera,
        this.gameEngine.engine,
        "resize",
      );
    };
    this.gameEngine.onResize(this.updateOrtho);
    this.applyContainLayout();
    this.build();
    this.logBuildSummary();
  }

  dispose(): void {
    if (this.shiftEndPointerObserver) {
      this.scene.onPointerObservable.remove(this.shiftEndPointerObserver);
      this.shiftEndPointerObserver = null;
    }
    this.gameEngine.offResize(this.updateOrtho);
    this.shiftEndOverlay?.dispose();
    this.shiftEndOverlay = null;
    this.shiftTimerHud?.dispose();
    this.shiftTimerHud = null;
    this.livesHud?.dispose();
    this.livesHud = null;
    this.hideButtonPulse?.dispose();
    this.hideButtonPulse = null;
    this.gameplay?.dispose();
    this.gameplay = null;
    this.ghostNpc?.dispose();
    this.ghostNpc = null;
    this.flashlightDecal?.dispose();
    this.flashlightDecal = null;
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
    this.camera.viewport = createContainViewport(canvas.width, canvas.height);
  }

  private add(config: PanelConfig): void {
    this.planes.push(new LayoutPlane(this.scene, config));
  }

  private build(): void {
    this.buildSceneBackground();
    this.buildGhostNpc();
    this.buildExitSign();
    this.buildSeats();
    if (!DEBUG_HIDE_COUNTER) {
      this.buildCounter();
      this.buildFlashlightDecal();
    } else {
      debugLog("CafeSceneLayout: counter hidden (DEBUG_HIDE_COUNTER)");
    }
    this.buildSeatCustomers();
    this.buildExitFlow();
    this.shiftTimerHud = new ShiftTimerHud(this.scene);
    this.livesHud = new LivesHud(this.scene);
    this.shiftEndOverlay = new ShiftEndOverlay(this.scene);
    this.bindShiftEndDismiss();
    debugLog("CafeSceneLayout.build → creating MenuBoard");
    this.menuBoard = new MenuBoard(this.scene);
    debugLog(
      "CafeSceneLayout.build → MenuBoard planeCount",
      this.menuBoard.planeCount,
    );
    this.buildHideButton();
    const hideButtonMesh =
      this.planes.find((p) => p.mesh.name === "layout_hide_button")?.mesh ??
      null;
    this.gameplay = new GameplayController(
      this.scene,
      this.menuBoard,
      this.seatCustomers,
      this.shiftTimerHud,
      this.shiftEndOverlay,
      this.livesHud,
      hideButtonMesh,
    );
    this.wireHideButtonPulse();
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
    logSeatLayoutAudit(
      this.scene,
      this.camera,
      this.gameEngine.engine,
      "build",
    );
    logSceneMeshes(this.scene);
    logDrawStack(this.scene);
    debugLog("=== end summary ===");

    // Re-log after textures load (async) — catches px vs plane mismatches.
    globalThis.setTimeout(() => {
      debugLog("=== post-texture seat layout (500ms) ===");
      logSeatLayoutMeshes(
        this.scene,
        this.camera,
        this.gameEngine.engine,
        "textures-loaded",
      );
    }, 500);
    globalThis.setTimeout(() => {
      logArtMonsterBottomAlignmentScan(this.scene, "textures-loaded-800ms");
    }, 800);
  }

  /** Full-design backdrop from `assets/image-bg.png`. */
  private buildSceneBackground(): void {
    debugLog("CafeSceneLayout.build → scene background", SCENE_BACKGROUND_URL);
    const bgBounds = {
      top: DESIGN_HEIGHT / 2,
      bottom: -DESIGN_HEIGHT / 2,
    };
    debugLog("Scene background world bounds (floor in texture):", bgBounds);
    this.add({
      name: "layout_scene_background",
      center: new Vec2(0, 0),
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT,
      layer: LayoutLayer.backWall,
      depthOffset: -0.02,
      alphaIndex: LayoutAlphaIndex.background,
      color: new Color3(0.2, 0.18, 0.22),
      imageUrl: SCENE_BACKGROUND_URL,
      imageBlend: "alphablend",
    });
  }

  private buildGhostNpc(): void {
    this.ghostNpc = new GhostNpcDecor(this.scene);
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
    const counterBounds = {
      top: COUNTER_TOP_EDGE_Y,
      bottom: COUNTER_TOP_CENTER.y - COUNTER_TOP_HEIGHT / 2,
      left: -COUNTER_TOP_WIDTH / 2,
      right: COUNTER_TOP_WIDTH / 2,
    };
    debugLog("CafeSceneLayout.build → counter top", {
      url: SCENE_COUNTER_TOP_URL,
      brickRowFromBackWall: COUNTER_TOP_BRICK_ROW_FROM_BACK_WALL,
      topEdgeY: COUNTER_TOP_EDGE_Y,
      center: { x: COUNTER_TOP_CENTER.x, y: COUNTER_TOP_CENTER.y },
      size: { width: COUNTER_TOP_WIDTH, height: COUNTER_TOP_HEIGHT },
      worldBounds: counterBounds,
      renderGroup: LayoutLayer.seats,
      alphaIndex: LayoutAlphaIndex.counterTop,
      note: "alphablend + transparent PNG — floor shows through non-opaque pixels",
    });
    this.add({
      name: "layout_counter_top",
      center: COUNTER_TOP_CENTER,
      width: COUNTER_TOP_WIDTH,
      height: COUNTER_TOP_HEIGHT,
      layer: LayoutLayer.seats,
      depthOffset: LayoutZOffset.counterTop,
      alphaIndex: LayoutAlphaIndex.counterTop,
      color: new Color3(0.65, 0.5, 0.35),
      imageUrl: SCENE_COUNTER_TOP_URL,
      imageBlend: "alphablend",
    });
  }

  private buildSeats(): void {
    // Full-size monster sprites cover seat pads — no SeatMarker planes.
  }

  /** Customers spawn via intro + line advance (empty at scene load). */
  private buildSeatCustomers(): void {
    debugLog("CafeSceneLayout.build → seat customers (none until intro)");
  }

  private buildFlashlightDecal(): void {
    this.flashlightDecal = new CounterFlashlightDecal(this.scene);
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
      depthOffset: LayoutZOffset.hide,
      alphaIndex: LayoutAlphaIndex.hide,
      color: new Color3(0.48, 0.52, 0.62),
      label: "Hide",
      labelFont: "bold 22px monospace",
      pickable: true,
      sortTransparent: true,
    });
  }

  private wireHideButtonPulse(): void {
    const buttonPlane = this.planes.find(
      (p) => p.mesh.name === "layout_hide_button",
    );
    if (!buttonPlane || !this.gameplay) {
      debugLog("CafeSceneLayout: hide button pulse skipped (no mesh/gameplay)");
      return;
    }
    this.hideButtonPulse = new HideButtonPulse(
      this.scene,
      buttonPlane.mesh,
      () => this.gameplay!.isHideButtonPulsing,
    );
    debugLog("CafeSceneLayout: hide button pulse wired");
  }

  private bindShiftEndDismiss(): void {
    this.shiftEndPointerObserver = this.scene.onPointerObservable.add(
      (pointerInfo) => {
        if (
          pointerInfo.type !== PointerEventTypes.POINTERDOWN ||
          !this.shiftEndOverlay?.isVisible
        ) {
          return;
        }
        debugLog("CafeSceneLayout: shift complete — return to title");
        this.onShiftComplete?.();
      },
    );
  }

  private buildBossBell(): void {
    this.add({
      name: "layout_boss_bell",
      center: new Vec2(520, -250),
      width: 110,
      height: 90,
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.boss,
      alphaIndex: LayoutAlphaIndex.boss,
      color: new Color3(0.7, 0.62, 0.32),
      label: "BOSS",
      labelFont: "bold 24px monospace",
    });
  }
}
