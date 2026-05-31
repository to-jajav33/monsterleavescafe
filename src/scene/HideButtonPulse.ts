import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { Observer } from "@babylonjs/core/Misc/observable";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Material } from "@babylonjs/core/Materials/material";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import { LayoutAlphaIndex, LayoutLayer } from "./LayoutLayer.ts";

const PULSE_HZ = 2.8;

const GLOW_OUTER_SIZE = { width: 210, height: 96 } as const;
const GLOW_INNER_SIZE = { width: 162, height: 72 } as const;

/**
 * Amber glow halos + button tint while Medusa hide telegraph is active.
 */
export class HideButtonPulse {
  private readonly outerGlow: Mesh;
  private readonly innerGlow: Mesh;
  private readonly outerMat: StandardMaterial;
  private readonly innerMat: StandardMaterial;
  private readonly buttonMat: StandardMaterial | null;
  private readonly renderObserver: Observer<Scene>;
  private pulsePhase = 0;
  private readonly baseButtonEmissive: Color3;

  constructor(
    private readonly scene: Scene,
    private readonly buttonMesh: Mesh,
    private readonly isPulsing: () => boolean,
  ) {
    const x = buttonMesh.position.x;
    const y = buttonMesh.position.y;
    const z = buttonMesh.position.z;

    const outer = this.createGlowMesh(
      "layout_hide_glow_outer",
      GLOW_OUTER_SIZE.width,
      GLOW_OUTER_SIZE.height,
      new Color3(1, 0.42, 0.08),
    );
    this.outerGlow = outer.mesh;
    this.outerMat = outer.mat;
    this.outerGlow.position.set(x, y, z - 0.012);
    this.outerGlow.alphaIndex = LayoutAlphaIndex.hide - 2;

    const inner = this.createGlowMesh(
      "layout_hide_glow_inner",
      GLOW_INNER_SIZE.width,
      GLOW_INNER_SIZE.height,
      new Color3(1, 0.78, 0.22),
    );
    this.innerGlow = inner.mesh;
    this.innerMat = inner.mat;
    this.innerGlow.position.set(x, y, z - 0.008);
    this.innerGlow.alphaIndex = LayoutAlphaIndex.hide - 1;

    const mat = buttonMesh.material;
    this.buttonMat =
      mat instanceof StandardMaterial ? mat : null;
    this.baseButtonEmissive =
      this.buttonMat?.emissiveColor.clone() ?? Color3.White();

    this.outerGlow.isVisible = false;
    this.innerGlow.isVisible = false;

    this.renderObserver = scene.onBeforeRenderObservable.add(() => {
      const dt = scene.getEngine().getDeltaTime() / 1000;
      this.tick(dt);
    });
  }

  dispose(): void {
    this.scene.onBeforeRenderObservable.remove(this.renderObserver);
    this.outerMat.dispose();
    this.outerGlow.dispose();
    this.innerMat.dispose();
    this.innerGlow.dispose();
  }

  private tick(dt: number): void {
    const active = this.isPulsing();
    this.outerGlow.isVisible = active;
    this.innerGlow.isVisible = active;

    if (!active) {
      this.buttonMesh.scaling.set(1, 1, 1);
      if (this.buttonMat) {
        this.buttonMat.emissiveColor.copyFrom(this.baseButtonEmissive);
      }
      return;
    }

    this.pulsePhase += dt * Math.PI * 2 * PULSE_HZ;
    const wave = 0.5 + 0.5 * Math.sin(this.pulsePhase);
    const waveFast = 0.5 + 0.5 * Math.sin(this.pulsePhase * 1.65 + 0.4);

    const outerScale = 1 + wave * 0.14;
    this.outerGlow.scaling.set(outerScale, outerScale, 1);
    this.outerMat.alpha = 0.32 + wave * 0.58;

    const innerScale = 1 + waveFast * 0.1;
    this.innerGlow.scaling.set(innerScale, innerScale, 1);
    this.innerMat.alpha = 0.45 + waveFast * 0.5;

    const buttonScale = 1 + wave * 0.07;
    this.buttonMesh.scaling.set(buttonScale, buttonScale, 1);

    if (this.buttonMat) {
      const warm = 0.35 + wave * 0.65;
      this.buttonMat.emissiveColor.set(
        1,
        0.72 + wave * 0.28,
        0.25 + warm * 0.55,
      );
    }
  }

  private createGlowMesh(
    name: string,
    width: number,
    height: number,
    emissive: Color3,
  ): { mesh: Mesh; mat: StandardMaterial } {
    const mesh = MeshBuilder.CreatePlane(name, { width, height }, this.scene);
    mesh.renderingGroupId = LayoutLayer.ui;
    mesh.isPickable = false;

    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.disableLighting = true;
    mat.disableDepthWrite = true;
    mat.emissiveColor = emissive.clone();
    mat.diffuseColor = emissive.clone();
    mat.transparencyMode = Material.MATERIAL_ALPHABLEND;
    mat.alpha = 0.5;
    mat.backFaceCulling = false;
    mesh.material = mat;

    return { mesh, mat };
  }
}
