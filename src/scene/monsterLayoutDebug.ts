import type { AbstractMesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";

import { debugLog, debugWarn } from "../utils/debugLog.ts";

import { SEAT_X } from "./CounterSeat.ts";
import {
  MONSTER_FRAME_BOTTOM_Y,
  monsterSpriteCenterY,
} from "./monsterLayout.ts";

/** Allowed error (design px) between mesh bottom and frame bottom. */
export const MONSTER_BOTTOM_ALIGN_TOLERANCE = 0.5;

const ART_MONSTER_MESH_RE =
  /^monster_(slime|medusa|bigfoot)_idle_(\d)$/;

export type MonsterBottomAlignmentReport = {
  meshName: string;
  seatIndex: number;
  seatX: number;
  expectedBottomY: number;
  expectedCenterY: number;
  actualCenterX: number;
  actualCenterY: number;
  actualBottomY: number;
  bottomDeltaPx: number;
  centerYDeltaPx: number;
  centerXDeltaPx: number;
  configuredHeight: number;
  bboxHeight: number;
  aligned: boolean;
};

export function meshBottomY(mesh: AbstractMesh): number {
  const halfH =
    mesh.getBoundingInfo().boundingBox.extendSize.y * mesh.scaling.y;
  return mesh.position.y - halfH;
}

export function checkMonsterBottomAlignment(
  mesh: AbstractMesh,
  configuredHeight: number,
  seatX: number,
  seatIndex: number,
): MonsterBottomAlignmentReport {
  const expectedBottomY = MONSTER_FRAME_BOTTOM_Y;
  const expectedCenterY = monsterSpriteCenterY(configuredHeight);
  const actualBottomY = meshBottomY(mesh);
  const bottomDeltaPx = actualBottomY - expectedBottomY;
  const centerYDeltaPx = mesh.position.y - expectedCenterY;
  const centerXDeltaPx = mesh.position.x - seatX;
  const bboxHeight =
    mesh.getBoundingInfo().boundingBox.extendSize.y * mesh.scaling.y * 2;

  const aligned =
    Math.abs(bottomDeltaPx) <= MONSTER_BOTTOM_ALIGN_TOLERANCE &&
    Math.abs(centerYDeltaPx) <= MONSTER_BOTTOM_ALIGN_TOLERANCE &&
    Math.abs(centerXDeltaPx) <= MONSTER_BOTTOM_ALIGN_TOLERANCE;

  return {
    meshName: mesh.name,
    seatIndex,
    seatX,
    expectedBottomY,
    expectedCenterY,
    actualCenterX: mesh.position.x,
    actualCenterY: mesh.position.y,
    actualBottomY,
    bottomDeltaPx,
    centerYDeltaPx,
    centerXDeltaPx,
    configuredHeight,
    bboxHeight,
    aligned,
  };
}

export function logMonsterBottomAlignment(
  report: MonsterBottomAlignmentReport,
): void {
  const payload = {
    ...report,
    tolerancePx: MONSTER_BOTTOM_ALIGN_TOLERANCE,
    rule: "bottomY = MONSTER_FRAME_BOTTOM_Y; centerX = SEAT_X[seat]",
  };
  if (report.aligned) {
    debugLog("MonsterBottomAlignment OK:", payload);
  } else {
    debugWarn("MonsterBottomAlignment MISMATCH:", payload);
  }
}

/** Scan all art monster idle meshes in the scene (build / post-texture). */
export function logArtMonsterBottomAlignmentScan(
  scene: Scene,
  label = "scan",
): void {
  debugLog(`=== MONSTER FRAME-BOTTOM ALIGNMENT (${label}) ===`);
  debugLog("  expectedBottomY:", MONSTER_FRAME_BOTTOM_Y);

  const meshes = scene.meshes.filter((m) => ART_MONSTER_MESH_RE.test(m.name));
  if (meshes.length === 0) {
    debugWarn("  No monster_*_idle_* meshes found");
    debugLog(`=== end MONSTER FRAME-BOTTOM ALIGNMENT (${label}) ===`);
    return;
  }

  let failCount = 0;
  for (const mesh of meshes) {
    const match = ART_MONSTER_MESH_RE.exec(mesh.name);
    const seatIndex = Number(match?.[2] ?? -1);
    const seatX = SEAT_X[seatIndex];
    if (seatX === undefined) {
      debugWarn("  Unknown seat index on mesh:", mesh.name);
      continue;
    }
    const halfH =
      mesh.getBoundingInfo().boundingBox.extendSize.y * mesh.scaling.y;
    const configuredHeight = halfH * 2;
    const report = checkMonsterBottomAlignment(
      mesh,
      configuredHeight,
      seatX,
      seatIndex,
    );
    logMonsterBottomAlignment(report);
    if (!report.aligned) {
      failCount += 1;
    }
  }

  debugLog(`  summary: ${meshes.length} art monster(s), ${failCount} misaligned`);
  debugLog(`=== end MONSTER FRAME-BOTTOM ALIGNMENT (${label}) ===`);
}
