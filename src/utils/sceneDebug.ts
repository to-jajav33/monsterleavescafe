import type { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/mesh";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import { debugLog, debugWarn } from "./debugLog.ts";

function materialSummary(mat: StandardMaterial | null): Record<string, unknown> {
  if (!mat) {
    return {};
  }
  return {
    materialName: mat.name,
    transparencyMode: mat.transparencyMode,
    alpha: mat.alpha,
    alphaCutOff: mat.alphaCutOff,
    useAlphaFromDiffuseTexture: mat.useAlphaFromDiffuseTexture,
    disableDepthWrite: mat.disableDepthWrite,
    hasDiffuseTexture: !!mat.diffuseTexture,
    diffuseTextureName: mat.diffuseTexture?.name,
  };
}

function meshSummary(mesh: AbstractMesh): Record<string, unknown> {
  const mat = mesh.material as StandardMaterial | null;
  const halfH =
    mesh.getBoundingInfo().boundingBox.extendSize.y * mesh.scaling.y;
  const halfW =
    mesh.getBoundingInfo().boundingBox.extendSize.x * mesh.scaling.x;
  return {
    name: mesh.name,
    pos: {
      x: mesh.position.x.toFixed(1),
      y: mesh.position.y.toFixed(1),
      z: mesh.position.z.toFixed(3),
    },
    bounds: {
      top: (mesh.position.y + halfH).toFixed(1),
      bottom: (mesh.position.y - halfH).toFixed(1),
      left: (mesh.position.x - halfW).toFixed(1),
      right: (mesh.position.x + halfW).toFixed(1),
    },
    renderingGroupId: mesh.renderingGroupId,
    alphaIndex: mesh.alphaIndex,
    enabled: mesh.isEnabled(),
    visible: mesh.isVisible,
    ...materialSummary(mat),
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
    "monster",
    "order_bubble",
    "rage_bubble",
    "ghost",
    "slime",
    "medusa",
    "bigfoot",
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

/** Draw order: renderingGroupId → alphaIndex → mesh name. */
export function logDrawStack(scene: Scene): void {
  const sorted = [...scene.meshes]
    .filter((m) => m.name && !m.name.startsWith("__"))
    .sort((a, b) => {
      if (a.renderingGroupId !== b.renderingGroupId) {
        return a.renderingGroupId - b.renderingGroupId;
      }
      if (a.alphaIndex !== b.alphaIndex) {
        return a.alphaIndex - b.alphaIndex;
      }
      return a.name.localeCompare(b.name);
    });

  debugLog("=== Draw stack (group → alphaIndex → name) ===");
  for (const mesh of sorted) {
    debugLog(
      `  [g${mesh.renderingGroupId} α${mesh.alphaIndex}] ${mesh.name} z=${mesh.position.z.toFixed(3)}`,
    );
  }
  debugLog("=== end draw stack ===");
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
