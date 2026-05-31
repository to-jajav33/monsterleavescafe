import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import gsap from "gsap";

import { Vec2 } from "../utils/math.ts";

import {
  LIVES_HUD_CENTER,
  LIVES_HUD_SIZE,
  livesImageUrl,
  STARTING_LIVES,
  type LivesCount,
} from "./livesAssets.ts";
import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

/** Brief scale pulse when a life is lost. */
const LOSS_FLASH_SCALE = 1.04;
const LOSS_FLASH_DURATION_SEC = 0.22;

const LIVES_PLANE_CONFIG = {
  center: new Vec2(LIVES_HUD_CENTER.x, LIVES_HUD_CENTER.y),
  width: LIVES_HUD_SIZE.width,
  height: LIVES_HUD_SIZE.height,
  color: new Color3(1, 1, 1),
  imageBlend: "alphablend" as const,
  sortTransparent: true,
};

/**
 * Lights stack:
 * - `image-lives-3` … `image-lives-1` on seats layer (bg &lt; lights &lt; monsters)
 * - `image-lives-0` on UI layer on top — darkens everything beneath
 */
export class LivesHud {
  /** Lives 1–3 — behind monsters, in front of background. */
  private readonly lightsPlane: LayoutPlane;
  /** Lives 0 only — top paint order, full-frame darken. */
  private readonly zeroDarkenPlane: LayoutPlane;
  private flashTween: gsap.core.Tween | null = null;

  constructor(scene: Scene) {
    this.lightsPlane = new LayoutPlane(scene, {
      ...LIVES_PLANE_CONFIG,
      name: "layout_lives_hud",
      layer: LayoutLayer.seats,
      depthOffset: LayoutZOffset.livesHud,
      alphaIndex: LayoutAlphaIndex.livesHud,
      imageUrl: livesImageUrl(STARTING_LIVES),
    });

    this.zeroDarkenPlane = new LayoutPlane(scene, {
      ...LIVES_PLANE_CONFIG,
      name: "layout_lives_zero_darken",
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.livesZeroDarken,
      alphaIndex: LayoutAlphaIndex.livesZeroDarken,
      imageUrl: livesImageUrl(0),
    });
    this.zeroDarkenPlane.mesh.isVisible = false;
  }

  setLives(count: LivesCount): void {
    if (count === 0) {
      this.lightsPlane.mesh.isVisible = false;
      this.zeroDarkenPlane.mesh.isVisible = true;
      return;
    }
    this.zeroDarkenPlane.mesh.isVisible = false;
    this.lightsPlane.mesh.isVisible = true;
    this.lightsPlane.setImageUrl(livesImageUrl(count));
  }

  flashLoss(): void {
    const mesh = this.activeFlashMesh();
    this.flashTween?.kill();
    mesh.scaling.set(1, 1, 1);
    this.flashTween = gsap.to(mesh.scaling, {
      x: LOSS_FLASH_SCALE,
      y: LOSS_FLASH_SCALE,
      duration: LOSS_FLASH_DURATION_SEC / 2,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
      onComplete: () => {
        mesh.scaling.set(1, 1, 1);
        this.flashTween = null;
      },
    });
  }

  private activeFlashMesh(): Mesh {
    return this.zeroDarkenPlane.mesh.isVisible
      ? this.zeroDarkenPlane.mesh
      : this.lightsPlane.mesh;
  }

  dispose(): void {
    this.flashTween?.kill();
    this.flashTween = null;
    gsap.killTweensOf(this.lightsPlane.mesh.scaling);
    gsap.killTweensOf(this.zeroDarkenPlane.mesh.scaling);
    this.lightsPlane.dispose();
    this.zeroDarkenPlane.dispose();
  }
}
