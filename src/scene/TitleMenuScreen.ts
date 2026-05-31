import "@babylonjs/core/Culling/ray";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";

import type { GameEngine } from "../game/GameEngine.ts";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { debugLog } from "../utils/debugLog.ts";
import { createContainViewport } from "../utils/containViewport.ts";

import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";
import {
  TITLE_BUTTON_DISPLAY_HEIGHT,
  TITLE_BUTTON_DISPLAY_WIDTH,
  TITLE_BUTTON_QUIT_CENTER,
  TITLE_BUTTON_QUIT_URL,
  TITLE_BUTTON_ROTATION_Z,
  TITLE_BUTTON_START_CENTER,
  TITLE_BUTTON_START_URL,
  TITLE_PAGE_CENTER,
  TITLE_PAGE_SIZE,
  TITLE_PAGE_URL,
} from "./titleMenuAssets.ts";

export type TitleMenuScreenOptions = {
  onStart: () => void;
};

/**
 * Main menu — full title mockup + Start / Quit image buttons.
 */
export class TitleMenuScreen {
  readonly scene: Scene;
  readonly camera: FreeCamera;
  private readonly planes: LayoutPlane[] = [];
  private readonly updateOrtho: () => void;

  constructor(
    private readonly gameEngine: GameEngine,
    private readonly options: TitleMenuScreenOptions,
  ) {
    debugLog("TitleMenuScreen.constructor");
    this.scene = new Scene(gameEngine.engine);
    this.scene.clearColor = new Color4(0.1, 0.1, 0.12, 1);
    this.camera = this.createCamera();
    this.scene.activeCamera = this.camera;

    this.updateOrtho = () => {
      const canvas = gameEngine.engine.getRenderingCanvas();
      if (!canvas) return;
      this.camera.orthoLeft = -DESIGN_WIDTH / 2;
      this.camera.orthoRight = DESIGN_WIDTH / 2;
      this.camera.orthoTop = DESIGN_HEIGHT / 2;
      this.camera.orthoBottom = -DESIGN_HEIGHT / 2;
      this.camera.viewport = createContainViewport(
        canvas.width,
        canvas.height,
      );
    };
    gameEngine.onResize(this.updateOrtho);
    this.updateOrtho();
    this.build();
  }

  render(): void {
    this.scene.render();
  }

  dispose(): void {
    debugLog("TitleMenuScreen.dispose");
    this.gameEngine.offResize(this.updateOrtho);
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
    this.scene.dispose();
  }

  private createCamera(): FreeCamera {
    const camera = new FreeCamera(
      "title_camera2d",
      new Vector3(0, 0, -10),
      this.scene,
    );
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.setTarget(Vector3.Zero());
    return camera;
  }

  private build(): void {
    this.planes.push(
      new LayoutPlane(this.scene, {
        name: "layout_title_page",
        center: TITLE_PAGE_CENTER,
        width: TITLE_PAGE_SIZE.width,
        height: TITLE_PAGE_SIZE.height,
        layer: LayoutLayer.backWall,
        depthOffset: -0.02,
        alphaIndex: LayoutAlphaIndex.background,
        color: new Color3(0.2, 0.18, 0.22),
        imageUrl: TITLE_PAGE_URL,
        imageBlend: "alphablend",
      }),
    );

    this.addButton({
      name: "layout_title_button_start",
      center: TITLE_BUTTON_START_CENTER,
      imageUrl: TITLE_BUTTON_START_URL,
      onPick: () => {
        debugLog("TitleMenu: Start");
        this.options.onStart();
      },
    });

    this.addButton({
      name: "layout_title_button_quit",
      center: TITLE_BUTTON_QUIT_CENTER,
      imageUrl: TITLE_BUTTON_QUIT_URL,
      onPick: () => {
        debugLog("TitleMenu: Quit");
        globalThis.location.reload();
      },
    });

    debugLog("TitleMenuScreen.build done", {
      planes: this.planes.length,
      startCenter: TITLE_BUTTON_START_CENTER,
      quitCenter: TITLE_BUTTON_QUIT_CENTER,
    });
  }

  private addButton(config: {
    name: string;
    center: { x: number; y: number };
    imageUrl: string;
    onPick: () => void;
  }): void {
    const plane = new LayoutPlane(this.scene, {
      name: config.name,
      center: config.center,
      width: TITLE_BUTTON_DISPLAY_WIDTH,
      height: TITLE_BUTTON_DISPLAY_HEIGHT,
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.hide,
      alphaIndex: LayoutAlphaIndex.titleMenuButton,
      rotationZ: TITLE_BUTTON_ROTATION_Z,
      color: Color3.White(),
      imageUrl: config.imageUrl,
      imageBlend: "alphablend",
      pickable: true,
    });
    this.planes.push(plane);
    this.bindPick(plane.mesh, config.onPick);
  }

  private bindPick(mesh: Mesh, onPick: () => void): void {
    if (!mesh.actionManager) {
      mesh.actionManager = new ActionManager(this.scene);
    }
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        { trigger: ActionManager.OnPickDownTrigger },
        onPick,
      ),
    );
  }
}
