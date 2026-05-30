import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import gsap from "gsap";

export type MeshMoveTarget = {
  mesh: Mesh;
  x: number;
  y: number;
};

export type MeshMoveOptions = {
  duration: number;
  /** GSAP ease name — https://gsap.com/docs/v3/Eases */
  ease?: string;
};

const DEFAULT_EASE = "power2.inOut";

/**
 * Move one or more Babylon mesh positions in parallel via GSAP.
 */
export function animateMeshTargets(
  targets: readonly MeshMoveTarget[],
  options: MeshMoveOptions,
): Promise<void> {
  if (targets.length === 0) {
    return Promise.resolve();
  }

  const { duration, ease = DEFAULT_EASE } = options;

  return new Promise((resolve) => {
    const timeline = gsap.timeline({ onComplete: resolve });

    for (const target of targets) {
      timeline.to(
        target.mesh.position,
        {
          x: target.x,
          y: target.y,
          duration,
          ease,
        },
        0,
      );
    }
  });
}

/** Stop in-flight tweens before disposing meshes. */
export function killMeshTweens(meshes: readonly Mesh[]): void {
  for (const mesh of meshes) {
    gsap.killTweensOf(mesh.position);
  }
}
