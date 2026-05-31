import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import { debugLog, debugWarn } from "../utils/debugLog.ts";
import { Vec2 } from "../utils/math.ts";

export type ImageBlendMode = "alphablend" | "alphatest";

export type LayoutPlaneConfig = {
  name: string;
  center: Vec2;
  width: number;
  height: number;
  /** Babylon renderingGroupId — higher group draws after lower (0–3). */
  layer: number;
  /** Nudge along Z within a layer to avoid coplanar z-fighting (default 0). */
  depthOffset?: number;
  /** Sort order within transparent pass; higher draws later (on top). */
  alphaIndex?: number;
  color: Color3;
  /** PNG/JPG in world space (e.g. `/assets/image-bg.png`). */
  imageUrl?: string;
  /** How PNG alpha is applied (default alphablend). */
  imageBlend?: ImageBlendMode;
  /** Cutoff for alphatest mode (default 0.35). */
  imageAlphaCutoff?: number;
  /** Overall material alpha for image planes (default 1). */
  imageOpacity?: number;
  /** Rotation on Z (radians) for decals on shelves / angled props. */
  rotationZ?: number;
  /** Drawn on the mesh texture — moves/scales with this plane (not screen GUI). */
  label?: string;
  labelFont?: string;
  labelTextColor?: string;
  /** Default false — only enable on interactive meshes (menu slots, buttons). */
  pickable?: boolean;
  /**
   * Force alphablend so label planes sort with monsters via alphaIndex
   * (opaque labels otherwise draw before transparent PNGs).
   */
  sortTransparent?: boolean;
};

function colorToHex(color: Color3): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `rgb(${r},${g},${b})`;
}

function planeWorldBounds(
  center: Vec2,
  width: number,
  height: number,
): Record<string, number> {
  return {
    top: center.y + height / 2,
    bottom: center.y - height / 2,
    left: center.x - width / 2,
    right: center.x + width / 2,
  };
}

/**
 * Static panel in world/design space. Labels use DynamicTexture on the same mesh.
 */
export class LayoutPlane {
  readonly mesh: Mesh;
  private imageTexture: Texture | null = null;

  constructor(
    private readonly scene: Scene,
    private readonly config: LayoutPlaneConfig,
  ) {
    const {
      name,
      center,
      width,
      height,
      layer,
      depthOffset = 0,
      alphaIndex = 0,
    } = config;
    this.mesh = MeshBuilder.CreatePlane(name, { width, height }, scene);
    const z = layer * 0.1 + depthOffset;
    this.mesh.position = new Vector3(center.x, center.y, z);
    if (config.rotationZ) {
      this.mesh.rotation.z = config.rotationZ;
    }
    this.mesh.renderingGroupId = layer;
    this.mesh.alphaIndex = alphaIndex;
    this.mesh.isPickable = config.pickable ?? false;
    this.applyMaterial();

    if (
      /layout_scene|layout_counter|layout_ghost|layout_flashlight|monster_slime|monster_medusa|menu|hide|boss/i.test(
        name,
      )
    ) {
      debugLog("LayoutPlane created:", {
        name,
        center: { x: center.x, y: center.y },
        size: { width, height },
        worldBounds: planeWorldBounds(center, width, height),
        layer,
        z,
        alphaIndex,
        imageUrl: config.imageUrl ?? null,
        imageBlend: config.imageBlend ?? null,
        label: config.label ?? null,
      });
    }
  }

  get center(): Vec2 {
    return this.config.center.clone();
  }

  dispose(): void {
    this.imageTexture?.dispose();
    this.imageTexture = null;
    this.mesh.material?.dispose();
    this.mesh.dispose();
  }

  private applyMaterial(): void {
    const mat = new StandardMaterial(`${this.config.name}_mat`, this.scene);
    mat.disableLighting = true;
    mat.backFaceCulling = true;
    mat.disableDepthWrite = true;

    if (this.config.imageUrl) {
      const blend = this.config.imageBlend ?? "alphablend";
      const url = this.config.imageUrl;

      const tex = new Texture(url, this.scene, {
        invertY: true,
        onLoad: () => {
          const size = tex.getSize();
          const planeW = this.config.width;
          const planeH = this.config.height;
          const widthMatch = size.width === planeW;
          const heightMatch = size.height === planeH;
          const payload: Record<string, unknown> = {
            mesh: this.config.name,
            url,
            texturePixels: { width: size.width, height: size.height },
            planeWorldUnits: { width: planeW, height: planeH },
            pixelsMatchPlaneUnits: widthMatch && heightMatch,
            widthRatio: planeW > 0 ? size.width / planeW : null,
            blend,
          };
          if (
            /monster|slime|seat_|layout_ghost/i.test(this.config.name) &&
            (!widthMatch || !heightMatch)
          ) {
            debugWarn(
              "LayoutPlane texture px size ≠ plane world size (stretch or wrong pitch):",
              payload,
            );
          } else {
            debugLog("LayoutPlane texture loaded:", payload);
          }
        },
        onError: (_message, exception) => {
          debugWarn("LayoutPlane texture FAILED:", {
            mesh: this.config.name,
            url,
            exception,
          });
        },
      });
      tex.hasAlpha = true;
      tex.wrapU = Texture.CLAMP_ADDRESSMODE;
      tex.wrapV = Texture.CLAMP_ADDRESSMODE;
      this.imageTexture = tex;
      mat.diffuseTexture = tex;
      mat.emissiveTexture = tex;
      mat.diffuseColor = Color3.White();
      mat.emissiveColor = Color3.White();
      mat.useAlphaFromDiffuseTexture = true;

      if (blend === "alphatest") {
        mat.transparencyMode = Material.MATERIAL_ALPHATEST;
        mat.alphaCutOff = this.config.imageAlphaCutoff ?? 0.35;
      } else {
        mat.transparencyMode = Material.MATERIAL_ALPHABLEND;
      }
      mat.alpha = this.config.imageOpacity ?? 1;
    } else if (this.config.label) {
      const tex = this.createLabelTexture();
      mat.diffuseTexture = tex;
      mat.emissiveTexture = tex;
      mat.diffuseColor = Color3.White();
      mat.emissiveColor = Color3.White();
      if (this.config.sortTransparent) {
        mat.transparencyMode = Material.MATERIAL_ALPHABLEND;
        mat.alpha = 1;
      }
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
      this.config.label ?? "",
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
