import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";

export type MeshMoveTarget = {
  mesh: Mesh;
  x: number;
  y: number;
};

/**
 * Linear XY move for one or more meshes over a fixed duration.
 */
export function animateMeshTargets(
  scene: Scene,
  targets: readonly MeshMoveTarget[],
  durationSeconds: number,
): Promise<void> {
  if (targets.length === 0) {
    return Promise.resolve();
  }

  const starts = targets.map((t) => ({
    x: t.mesh.position.x,
    y: t.mesh.position.y,
  }));

  let elapsed = 0;

  return new Promise((resolve) => {
    const observer = scene.onBeforeRenderObservable.add(() => {
      elapsed += scene.getEngine().getDeltaTime() / 1000;
      const t = Math.min(1, elapsed / durationSeconds);

      for (let i = 0; i < targets.length; i++) {
        const start = starts[i]!;
        const end = targets[i]!;
        end.mesh.position.x = start.x + (end.x - start.x) * t;
        end.mesh.position.y = start.y + (end.y - start.y) * t;
      }

      if (t >= 1) {
        scene.onBeforeRenderObservable.remove(observer);
        resolve();
      }
    });
  });
}
