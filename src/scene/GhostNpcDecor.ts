import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import gsap from "gsap";

import { debugLog } from "../utils/debugLog.ts";
import { killMeshTweens } from "../utils/animateMeshes.ts";

import { LayoutAlphaIndex, LayoutLayer } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";
import {
  GHOST_NPC_CENTER,
  GHOST_NPC_DISPLAY_HEIGHT,
  GHOST_NPC_DISPLAY_WIDTH,
  GHOST_NPC_HOVER_AMPLITUDE,
  GHOST_NPC_HOVER_DURATION_SEC,
  GHOST_NPC_OPACITY,
  GHOST_NPC_URL,
} from "./sceneAssets.ts";

/**
 * Background ghost — semi-transparent, gentle hover behind the counter area.
 */
export class GhostNpcDecor {
  private readonly plane: LayoutPlane;
  private readonly baseY: number;
  private hoverTween: gsap.core.Tween | null = null;

  constructor(scene: Scene) {
    this.baseY = GHOST_NPC_CENTER.y;
    debugLog("GhostNpcDecor.create", {
      url: GHOST_NPC_URL,
      center: { x: GHOST_NPC_CENTER.x, y: GHOST_NPC_CENTER.y },
      size: {
        width: GHOST_NPC_DISPLAY_WIDTH,
        height: GHOST_NPC_DISPLAY_HEIGHT,
      },
      opacity: GHOST_NPC_OPACITY,
      hover: {
        amplitude: GHOST_NPC_HOVER_AMPLITUDE,
        durationSec: GHOST_NPC_HOVER_DURATION_SEC,
      },
    });

    this.plane = new LayoutPlane(scene, {
      name: "layout_ghost_npc",
      center: GHOST_NPC_CENTER,
      width: GHOST_NPC_DISPLAY_WIDTH,
      height: GHOST_NPC_DISPLAY_HEIGHT,
      layer: LayoutLayer.decor,
      depthOffset: 0.02,
      alphaIndex: LayoutAlphaIndex.ghostNpc,
      color: new Color3(0.85, 0.88, 0.95),
      imageUrl: GHOST_NPC_URL,
      imageBlend: "alphablend",
      imageOpacity: GHOST_NPC_OPACITY,
    });

    this.startHover();
  }

  private startHover(): void {
    const mesh = this.plane.mesh;
    this.hoverTween = gsap.to(mesh.position, {
      y: this.baseY + GHOST_NPC_HOVER_AMPLITUDE,
      duration: GHOST_NPC_HOVER_DURATION_SEC,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  dispose(): void {
    this.hoverTween?.kill();
    this.hoverTween = null;
    killMeshTweens([this.plane.mesh]);
    this.plane.dispose();
  }
}
