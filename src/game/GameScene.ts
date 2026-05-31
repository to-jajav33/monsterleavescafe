// Side-effect: registers Scene.pick / picking ray (required for mesh actions).
import "@babylonjs/core/Culling/ray";
import { Scene } from "@babylonjs/core/scene";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { CafeSceneLayout } from "../scene/CafeSceneLayout.ts";
import { debugLog } from "../utils/debugLog.ts";

import type { GameEngine } from "./GameEngine.ts";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./GameEngine.ts";

export type GameSceneOptions = {
  /** Fired when the player dismisses the shift-end overlay (returns to title). */
  onShiftComplete?: () => void;
};

/** Babylon scene configured for orthographic 2D. */
export class GameScene {
  readonly scene: Scene;
  readonly camera: FreeCamera;
  private layout: CafeSceneLayout | null = null;

  constructor(
    private readonly gameEngine: GameEngine,
    options: GameSceneOptions = {},
  ) {
    debugLog("GameScene.constructor");
    this.scene = new Scene(gameEngine.engine);
    this.scene.clearColor = new Color4(0.18, 0.17, 0.2, 1);
    this.camera = this.createCamera();
    this.scene.activeCamera = this.camera;
    this.layout = new CafeSceneLayout(
      this.scene,
      gameEngine,
      this.camera,
      options.onShiftComplete,
    );
  }

  private createCamera(): FreeCamera {
    const camera = new FreeCamera(
      "camera2d",
      new Vector3(0, 0, -10),
      this.scene,
    );
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoLeft = -DESIGN_WIDTH / 2;
    camera.orthoRight = DESIGN_WIDTH / 2;
    camera.orthoTop = DESIGN_HEIGHT / 2;
    camera.orthoBottom = -DESIGN_HEIGHT / 2;
    camera.setTarget(Vector3.Zero());
    return camera;
  }

  render(): void {
    this.scene.render();
  }

  dispose(): void {
    this.layout?.dispose();
    this.layout = null;
    this.scene.dispose();
  }
}
