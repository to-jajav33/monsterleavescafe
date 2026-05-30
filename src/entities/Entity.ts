import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import { Vec2 } from "../utils/math.ts";

/** Base on-screen object: mesh + 2D position on the XY plane. */
export abstract class Entity {
  readonly mesh: Mesh;
  protected position: Vec2;

  constructor(
    protected readonly scene: Scene,
    name: string,
    initialPosition: Vec2,
    size: number = 1,
  ) {
    this.position = initialPosition.clone();
    this.mesh = MeshBuilder.CreatePlane(name, { size }, scene);
    this.mesh.position = new Vector3(
      this.position.x,
      this.position.y,
      0,
    );
  }

  /** Call once from subclass constructor after `super()` returns. */
  protected initAppearance(): void {
    this.applyAppearance();
  }

  getPosition(): Vec2 {
    return this.position.clone();
  }

  setPosition(next: Vec2): void {
    this.position = next.clone();
    this.mesh.position.x = this.position.x;
    this.mesh.position.y = this.position.y;
  }

  dispose(): void {
    this.mesh.dispose();
  }

  protected abstract applyAppearance(): void;
}

/** Colored plane placeholder until sprite assets exist. */
export class PlaceholderEntity extends Entity {
  constructor(
    scene: Scene,
    name: string,
    initialPosition: Vec2,
    private readonly color: Color3,
    size: number = 1,
  ) {
    super(scene, name, initialPosition, size);
    this.initAppearance();
  }

  protected applyAppearance(): void {
    const mat = new StandardMaterial(`${this.mesh.name}_mat`, this.scene);
    mat.diffuseColor = this.color;
    mat.emissiveColor = this.color.scale(0.25);
    this.mesh.material = mat;
  }
}
