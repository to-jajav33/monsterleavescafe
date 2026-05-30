import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import { Vec2 } from "../utils/math.ts";

import { LayoutLayer } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";

const BUBBLE_SIZE = 88;
const MIN_SCALE = 0.14;

const RAGE_SYMBOLS = ["!@#", "$%!", "?!!", "@#$", "!?#", "%@!"] as const;

function randomRageLabel(): string {
  const a = RAGE_SYMBOLS[Math.floor(Math.random() * RAGE_SYMBOLS.length)]!;
  const b = RAGE_SYMBOLS[Math.floor(Math.random() * RAGE_SYMBOLS.length)]!;
  return `${a}\n${b}`;
}

/**
 * Semi-transparent rage overlay on the order bubble — scales with rage 0–100%.
 */
export class RageBubble {
  private readonly plane: LayoutPlane;

  constructor(
    scene: Scene,
    center: Vec2,
    nameSuffix: string,
    depthOffset: number,
  ) {
    this.plane = new LayoutPlane(scene, {
      name: `rage_bubble_${nameSuffix}`,
      center,
      width: BUBBLE_SIZE,
      height: BUBBLE_SIZE,
      layer: LayoutLayer.seats,
      depthOffset: depthOffset + 0.03,
      color: new Color3(0.92, 0.22, 0.28),
      label: randomRageLabel(),
      labelFont: "bold 15px monospace",
      labelTextColor: "#fff5f5",
    });

    const mat = this.plane.mesh.material as StandardMaterial | null;
    if (mat) {
      mat.alpha = 0.62;
    }

    this.setRagePercent(0);
  }

  getMesh(): Mesh {
    return this.plane.mesh;
  }

  setCenter(x: number, y: number): void {
    this.plane.mesh.position.x = x;
    this.plane.mesh.position.y = y;
  }

  /** 0 = tiny; 1 = meets order bubble size. */
  setRagePercent(percent: number): void {
    const p = Math.max(0, Math.min(1, percent));
    const scale = MIN_SCALE + p * (1 - MIN_SCALE);
    this.plane.mesh.scaling.x = scale;
    this.plane.mesh.scaling.y = scale;
  }

  dispose(): void {
    this.plane.dispose();
  }
}
