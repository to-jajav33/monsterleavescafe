import { Scene } from "@babylonjs/core/scene";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import type { Engine } from "@babylonjs/core/Engines/engine";

import { CafeSceneLayout } from "../scene/CafeSceneLayout.ts";

import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./GameEngine.ts";

/** Babylon scene configured for orthographic 2D. */
export class GameScene {
  readonly scene: Scene;
  private layout: CafeSceneLayout | null = null;

  constructor(private readonly engine: Engine) {
    this.scene = new Scene(engine);
    // Slightly lighter clear so empty areas are not pure black
    this.scene.clearColor = new Color4(0.18, 0.17, 0.2, 1);
    this.setupCamera();
    this.layout = new CafeSceneLayout(this.scene);
  }

  private setupCamera(): void {
    const camera = new FreeCamera(
      "camera2d",
      new Vector3(0, 0, -10),
      this.scene,
    );
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    const halfW = DESIGN_WIDTH / 2;
    const halfH = DESIGN_HEIGHT / 2;
    camera.orthoLeft = -halfW;
    camera.orthoRight = halfW;
    camera.orthoTop = halfH;
    camera.orthoBottom = -halfH;
    camera.setTarget(Vector3.Zero());
    // Required — without activeCamera the scene renders essentially blank
    this.scene.activeCamera = camera;
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
