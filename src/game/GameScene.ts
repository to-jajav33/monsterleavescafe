import { Scene } from "@babylonjs/core/scene";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import type { Engine } from "@babylonjs/core/Engines/engine";

import { PlaceholderEntity } from "../entities/Entity.ts";
import { Vec2 } from "../utils/math.ts";

import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./GameEngine.ts";

/** Babylon scene configured for orthographic 2D. */
export class GameScene {
  readonly scene: Scene;
  private readonly entities: PlaceholderEntity[] = [];

  constructor(private readonly engine: Engine) {
    this.scene = new Scene(engine);
    this.scene.clearColor = new Color4(0.12, 0.14, 0.18, 1);
    this.setupCamera();
    this.setupLight();
    this.spawnDemoEntities();
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
  }

  private setupLight(): void {
    new HemisphericLight(
      "light",
      new Vector3(0, 0, -1),
      this.scene,
    );
  }

  private spawnDemoEntities(): void {
    const marker = new PlaceholderEntity(
      this.scene,
      "cafe_marker",
      new Vec2(0, 0),
      new Color3(0.45, 0.75, 0.55),
      80,
    );
    this.entities.push(marker);
  }

  render(): void {
    this.scene.render();
  }

  dispose(): void {
    for (const entity of this.entities) {
      entity.dispose();
    }
    this.entities.length = 0;
    this.scene.dispose();
  }
}
