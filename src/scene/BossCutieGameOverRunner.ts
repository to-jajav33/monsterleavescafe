import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import gsap from "gsap";

import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { killMeshTweens } from "../utils/animateMeshes.ts";
import { Vec2 } from "../utils/math.ts";

import {
  BOSS_CUTIE_DISPLAY_HEIGHT,
  BOSS_CUTIE_DISPLAY_WIDTH,
  BOSS_CUTIE_RUNNING_URL,
} from "./bossCutieGameOverAssets.ts";
import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

const PATH_EDGE_PAD = 16;
const LAP_DURATION_SEC = 2.4;
const ANGRY_WOBBLE_Z = 0.12;
const ANGRY_WOBBLE_SEC = 0.07;
const ANGRY_PULSE_SCALE = 1.1;
const ANGRY_PULSE_SEC = 0.09;

/** Inset so plane center stays inside frame (half-size + angry pulse/wobble slack). */
function spritePathInset(): { halfW: number; halfH: number } {
  const wobbleSlack =
    Math.hypot(BOSS_CUTIE_DISPLAY_WIDTH, BOSS_CUTIE_DISPLAY_HEIGHT) *
    Math.sin(ANGRY_WOBBLE_Z);
  const halfW =
    (BOSS_CUTIE_DISPLAY_WIDTH * ANGRY_PULSE_SCALE) / 2 + PATH_EDGE_PAD + wobbleSlack;
  const halfH =
    (BOSS_CUTIE_DISPLAY_HEIGHT * ANGRY_PULSE_SCALE) / 2 + PATH_EDGE_PAD + wobbleSlack;
  return { halfW, halfH };
}

/** Clockwise loop around the defeat overlay (design-space). */
function buildRunPath(): Vec2[] {
  const { halfW, halfH } = spritePathInset();
  const left = -DESIGN_WIDTH / 2 + halfW;
  const right = DESIGN_WIDTH / 2 - halfW;
  const top = DESIGN_HEIGHT / 2 - halfH;
  const bottom = -DESIGN_HEIGHT / 2 + halfH;
  return [
    new Vec2(left, top),
    new Vec2(right, top),
    new Vec2(right, bottom),
    new Vec2(left, bottom),
  ];
}

/**
 * Angry boss cutie — runs a loop around the game-over frame on top of the overlay.
 */
export class BossCutieGameOverRunner {
  private readonly plane: LayoutPlane;
  private readonly baseScaleX: number;
  private runTimeline: gsap.core.Timeline | null = null;
  private wobbleTween: gsap.core.Tween | null = null;
  private pulseTween: gsap.core.Tween | null = null;

  constructor(scene: Scene) {
    const path = buildRunPath();
    const start = path[0]!;

    this.plane = new LayoutPlane(scene, {
      name: "layout_boss_cutie_game_over",
      center: start,
      width: BOSS_CUTIE_DISPLAY_WIDTH,
      height: BOSS_CUTIE_DISPLAY_HEIGHT,
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.bossGameOver,
      alphaIndex: LayoutAlphaIndex.bossGameOver,
      color: new Color3(1, 0.92, 0.88),
      imageUrl: BOSS_CUTIE_RUNNING_URL,
      imageBlend: "alphablend",
      sortTransparent: true,
    });
    this.baseScaleX = 1;
    this.plane.mesh.isVisible = false;
  }

  start(): void {
    const mesh = this.plane.mesh;
    const path = buildRunPath();
    const start = path[0]!;

    this.stop();
    mesh.isVisible = true;
    mesh.position.x = start.x;
    mesh.position.y = start.y;
    mesh.rotation.z = 0;
    mesh.scaling.x = this.baseScaleX;
    mesh.scaling.y = 1;

    const segments: { from: Vec2; to: Vec2; length: number }[] = [];
    let perimeter = 0;
    for (let i = 0; i < path.length; i += 1) {
      const from = path[i]!;
      const to = path[(i + 1) % path.length]!;
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      segments.push({ from, to, length });
      perimeter += length;
    }

    const tl = gsap.timeline({ repeat: -1 });
    for (const seg of segments) {
      const duration = (seg.length / perimeter) * LAP_DURATION_SEC;
      const dx = seg.to.x - seg.from.x;
      tl.to(mesh.position, {
        x: seg.to.x,
        y: seg.to.y,
        duration,
        ease: "power1.inOut",
        onStart: () => {
          if (dx !== 0) {
            mesh.scaling.x = dx > 0 ? this.baseScaleX : -this.baseScaleX;
          }
        },
      });
    }
    this.runTimeline = tl;

    this.wobbleTween = gsap.to(mesh.rotation, {
      z: ANGRY_WOBBLE_Z,
      duration: ANGRY_WOBBLE_SEC,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });

    this.pulseTween = gsap.to(mesh.scaling, {
      y: ANGRY_PULSE_SCALE,
      duration: ANGRY_PULSE_SEC,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
    });
  }

  stop(): void {
    this.runTimeline?.kill();
    this.runTimeline = null;
    this.wobbleTween?.kill();
    this.wobbleTween = null;
    this.pulseTween?.kill();
    this.pulseTween = null;
    killMeshTweens([this.plane.mesh]);
    gsap.killTweensOf(this.plane.mesh.rotation);
    gsap.killTweensOf(this.plane.mesh.scaling);
    this.plane.mesh.rotation.z = 0;
    this.plane.mesh.scaling.y = 1;
    this.plane.mesh.isVisible = false;
  }

  dispose(): void {
    this.stop();
    this.plane.dispose();
  }
}
