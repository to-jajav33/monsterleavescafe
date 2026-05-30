import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";

import { debugLog } from "../utils/debugLog.ts";
import { Vec2 } from "../utils/math.ts";

export type LayoutPlaneConfig = {
  name: string;
  center: Vec2;
  width: number;
  height: number;
  /** Babylon renderingGroupId — higher draws on top (2D layer order). */
  layer: number;
  /** Nudge along Z within a layer to avoid coplanar z-fighting (default 0). */
  depthOffset?: number;
  color: Color3;
  /** Drawn on the mesh texture — moves/scales with this plane (not screen GUI). */
  label?: string;
  labelFont?: string;
  labelTextColor?: string;
};

function colorToHex(color: Color3): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgb(${r},${g},${b})`;
}

/**
 * Static panel in world/design space. Labels use DynamicTexture on the same mesh.
 */
export class LayoutPlane {
  readonly mesh: Mesh;

  constructor(
    private readonly scene: Scene,
    private readonly config: LayoutPlaneConfig,
  ) {
    const { name, center, width, height, layer, depthOffset = 0 } = config;
    this.mesh = MeshBuilder.CreatePlane(
      name,
      { width, height },
      scene,
    );
    // Layer-based Z keeps 2D stacks ordered; counter was burying UI at the same Z
    const z = layer * 0.1 + depthOffset;
    this.mesh.position = new Vector3(center.x, center.y, z);
    this.mesh.renderingGroupId = layer;
    this.applyMaterial();

    if (/menu|hide|boss/i.test(name)) {
      debugLog("LayoutPlane created:", {
        name,
        center: { x: center.x, y: center.y },
        size: { width, height },
        layer,
        z,
        label: config.label ?? "(none)",
      });
    }
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
    mat.backFaceCulling = true;
    mat.disableDepthWrite = true;

    if (this.config.label) {
      const tex = this.createLabelTexture();
      mat.diffuseTexture = tex;
      mat.emissiveTexture = tex;
      mat.diffuseColor = Color3.White();
      mat.emissiveColor = Color3.White();
    } else {
      mat.diffuseColor = this.config.color;
      mat.emissiveColor = this.config.color;
    }

    this.mesh.material = mat;
  }

  private createLabelTexture(): DynamicTexture {
    const w = Math.max(128, Math.round(this.config.width));
    const h = Math.max(64, Math.round(this.config.height));
    const tex = new DynamicTexture(
      `${this.config.name}_tex`,
      { width: w, height: h },
      this.scene,
      false,
    );
    const font =
      this.config.labelFont ?? `bold ${Math.floor(h * 0.32)}px monospace`;
    const textColor = this.config.labelTextColor ?? "#f8f8f2";
    tex.drawText(
      this.config.label,
      null,
      null,
      font,
      textColor,
      colorToHex(this.config.color),
      true,
    );
    return tex;
  }
}
