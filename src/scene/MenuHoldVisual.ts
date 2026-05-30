import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import { LayoutLayer } from "./LayoutLayer.ts";

/**
 * Fill overlay on a menu slot while the player holds to pour.
 */
export class MenuHoldVisual {
  private readonly fill: Mesh;
  private readonly slotHeight: number;

  constructor(
    scene: Scene,
    private readonly slotMesh: Mesh,
    slotWidth: number,
    slotHeight: number,
    fillColor: Color3,
  ) {
    this.slotHeight = slotHeight;
    this.fill = MeshBuilder.CreatePlane(
      `${slotMesh.name}_hold_fill`,
      { width: slotWidth, height: slotHeight },
      scene,
    );
    this.fill.renderingGroupId = LayoutLayer.ui;
    this.fill.isPickable = false;
    this.fill.isVisible = false;

    const mat = new StandardMaterial(`${slotMesh.name}_hold_fill_mat`, scene);
    mat.disableLighting = true;
    mat.disableDepthWrite = true;
    mat.emissiveColor = fillColor;
    mat.diffuseColor = fillColor;
    mat.alpha = 0.55;
    this.fill.material = mat;

    const z = slotMesh.position.z + 0.002;
    this.fill.position.z = z;
  }

  setProgress(progress: number): void {
    const p = Math.max(0, Math.min(1, progress));
    this.fill.isVisible = p > 0;
    if (p <= 0) {
      return;
    }

    this.fill.scaling.y = Math.max(0.02, p);
    const slotY = this.slotMesh.position.y;
    const half = this.slotHeight / 2;
    this.fill.position.x = this.slotMesh.position.x;
    this.fill.position.y = slotY - half + (this.slotHeight * p) / 2;
    this.fill.position.z = this.slotMesh.position.z + 0.002;
  }

  hide(): void {
    this.fill.isVisible = false;
    this.fill.scaling.y = 1;
  }

  dispose(): void {
    this.fill.material?.dispose();
    this.fill.dispose();
  }
}
