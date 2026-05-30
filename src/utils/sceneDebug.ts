import type { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/mesh";

import { debugLog, debugWarn } from "./debugLog.ts";

function meshSummary(mesh: AbstractMesh): Record<string, unknown> {
  const mat = mesh.material;
  return {
    name: mesh.name,
    pos: {
      x: mesh.position.x.toFixed(1),
      y: mesh.position.y.toFixed(1),
      z: mesh.position.z.toFixed(3),
    },
    renderingGroupId: mesh.renderingGroupId,
    enabled: mesh.isEnabled(),
    visible: mesh.isVisible,
    hasMaterial: !!mat,
    materialName: mat?.name,
    disableDepthWrite:
      mat && "disableDepthWrite" in mat
        ? (mat as { disableDepthWrite: boolean }).disableDepthWrite
        : undefined,
  };
}

/** Log meshes whose names match a substring (default: menu, hide, boss, layout). */
export function logSceneMeshes(
  scene: Scene,
  nameIncludes?: string[],
): void {
  const needles = nameIncludes ?? [
    "menu",
    "hide",
    "boss",
    "layout_",
    "seat_",
  ];
  const matches = scene.meshes.filter((m) =>
    needles.some((n) => m.name.toLowerCase().includes(n.toLowerCase())),
  );

  debugLog(
    `Scene meshes (filter ${needles.join("|")}): ${matches.length} / ${scene.meshes.length} total`,
  );
  for (const mesh of matches) {
    debugLog(" ", meshSummary(mesh));
  }

  const menuSlots = scene.meshes.filter((m) => m.name.startsWith("menu_slot"));
  if (menuSlots.length === 0) {
    debugWarn("NO menu_slot_* meshes in scene — MenuBoard may not have run");
  }
}

export function logCameraAndCanvas(
  scene: Scene,
  camera: FreeCamera,
  engine: Engine,
): void {
  const canvas = engine.getRenderingCanvas();
  debugLog("Camera ortho:", {
    left: camera.orthoLeft,
    right: camera.orthoRight,
    top: camera.orthoTop,
    bottom: camera.orthoBottom,
  });
  if (camera.viewport) {
    debugLog("Camera viewport:", {
      x: camera.viewport.x,
      y: camera.viewport.y,
      w: camera.viewport.width,
      h: camera.viewport.height,
    });
  }
  if (canvas) {
    debugLog("Canvas buffer:", {
      width: canvas.width,
      height: canvas.height,
      cssWidth: canvas.clientWidth,
      cssHeight: canvas.clientHeight,
    });
  }
  debugLog("Active camera (scene):", scene.activeCamera?.name);
  debugLog("Active camera (engine):", engine.activeCamera?.name);

  const badGroup = scene.meshes.filter((m) => m.renderingGroupId >= 4);
  if (badGroup.length > 0) {
    debugWarn(
      `${badGroup.length} mesh(es) use renderingGroupId >= 4 — Babylon only renders 0–3:`,
      badGroup.map((m) => m.name),
    );
  }
}
