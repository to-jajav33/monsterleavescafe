import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import { Vec2 } from "../utils/math.ts";

export type LayoutPlaneConfig = {
  name: string;
  center: Vec2;
  width: number;
  height: number;
  /** Babylon renderingGroupId — higher draws on top (2D layer order). */
  layer: number;
  color: Color3;
};

/** Static colored panel for mockup layout (counter, UI zones, seats). */
export class LayoutPlane {
  readonly mesh: Mesh;

  constructor(
    private readonly scene: Scene,
    private readonly config: LayoutPlaneConfig,
  ) {
    const { name, center, width, height, layer } = config;
    this.mesh = MeshBuilder.CreatePlane(
      name,
      { width, height },
      scene,
    );
    this.mesh.position = new Vector3(center.x, center.y, 0);
    this.mesh.renderingGroupId = layer;
    this.applyMaterial();
  }

  get center(): Vec2 {
    return this.config.center.clone();
  }

  dispose(): void {
    this.mesh.material?.dispose();
    this.mesh.dispose();
  }

  private applyMaterial(): void {
    const mat = new StandardMaterial(`${this.config.name}_mat`, this.scene);
    mat.disableLighting = true;
    mat.backFaceCulling = false;
    mat.diffuseColor = this.config.color;
    mat.emissiveColor = this.config.color;
    this.mesh.material = mat;
  }
}
