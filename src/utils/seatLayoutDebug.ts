import type { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/mesh";

import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { logArtMonsterBottomAlignmentScan } from "../scene/monsterLayoutDebug.ts";
import { MONSTER_FRAME_BOTTOM_Y } from "../scene/monsterLayout.ts";
import {
  MONSTER_SEAT_PITCH,
  SLIME_IDLE_NATIVE,
  slimeSpriteCenterAtSeat,
} from "../scene/monsterSlimeAssets.ts";
import {
  ACTIVE_SEAT_INDEX,
  SEAT_R_X,
  SEAT_STOOL_SPACING,
  SEAT_X,
  SEAT_Y,
} from "../scene/CounterSeat.ts";
import {
  GHOST_NPC_CENTER,
  GHOST_NPC_DISPLAY_WIDTH,
} from "../scene/sceneAssets.ts";

import { debugLog, debugWarn } from "./debugLog.ts";

const ORTHO_LEFT = -DESIGN_WIDTH / 2;
const ORTHO_RIGHT = DESIGN_WIDTH / 2;
const SEAT_NAMES = ["L", "C", "R"] as const;

export type HorizSpan = {
  center: number;
  width: number;
  left: number;
  right: number;
};

export function horizSpan(centerX: number, width: number): HorizSpan {
  const half = width / 2;
  return {
    center: centerX,
    width,
    left: centerX - half,
    right: centerX + half,
  };
}

function visibleInDesignFrame(span: HorizSpan): {
  visibleWidth: number;
  fraction: number;
} {
  const visLeft = Math.max(span.left, ORTHO_LEFT);
  const visRight = Math.min(span.right, ORTHO_RIGHT);
  const visibleWidth = Math.max(0, visRight - visLeft);
  return {
    visibleWidth,
    fraction: span.width > 0 ? visibleWidth / span.width : 0,
  };
}

/**
 * Approximate CSS pixel X for a design-space X (ortho + letterbox viewport).
 * Useful to compare console numbers with what you see in the browser window.
 */
export function designXToCanvasCssX(
  designX: number,
  camera: FreeCamera,
  canvasCssWidth: number,
): number {
  const left = camera.orthoLeft ?? ORTHO_LEFT;
  const right = camera.orthoRight ?? ORTHO_RIGHT;
  const u = (designX - left) / (right - left);
  const vp = camera.viewport;
  if (!vp) {
    return u * canvasCssWidth;
  }
  const nx = vp.x + u * vp.width;
  return nx * canvasCssWidth;
}

function meshHorizSpan(mesh: AbstractMesh): HorizSpan {
  const halfW =
    mesh.getBoundingInfo().boundingBox.extendSize.x * mesh.scaling.x;
  return horizSpan(mesh.position.x, halfW * 2);
}

/** Planned seats + slime spans before / without reading meshes. */
export function logSeatLayoutTheory(): void {
  debugLog(
    "=== SEAT LAYOUT THEORY (design units: 1 unit = 1px in 1280×720 mockup) ===",
  );
  debugLog("Design frame:", {
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    orthoX: [ORTHO_LEFT, ORTHO_RIGHT],
    orthoY: [-DESIGN_HEIGHT / 2, DESIGN_HEIGHT / 2],
  });
  debugLog("Pitch & seats:", {
    MONSTER_SEAT_PITCH_noOverlap: MONSTER_SEAT_PITCH,
    SEAT_STOOL_SPACING,
    SLIME_IDLE_NATIVE,
    SEAT_X_stoolAnchored: [...SEAT_X],
    SEAT_R_X,
    SEAT_Y_markersOnly: SEAT_Y,
    ACTIVE_SEAT_INDEX,
    MONSTER_FRAME_BOTTOM_Y,
  });

  if (MONSTER_SEAT_PITCH > DESIGN_WIDTH) {
    debugWarn(
      "  MONSTER_SEAT_PITCH exceeds design width — three non-overlapping full-width slimes cannot fit in one 1280px frame.",
      {
        pitch: MONSTER_SEAT_PITCH,
        designWidth: DESIGN_WIDTH,
        seatsIfUsingFullPitch: [
          SEAT_R_X - MONSTER_SEAT_PITCH * 2,
          SEAT_R_X - MONSTER_SEAT_PITCH,
          SEAT_R_X,
        ],
      },
    );
  }

  for (let i = 0; i < 3; i++) {
    const x = SEAT_X[i]!;
    const slime = horizSpan(x, SLIME_IDLE_NATIVE.width);
    const slimeCenter = slimeSpriteCenterAtSeat(x);
    const vis = visibleInDesignFrame(slime);
    debugLog(`  Seat ${SEAT_NAMES[i]} (index ${i}) centerX=${x}`, {
      slimePlaneSize: SLIME_IDLE_NATIVE,
      slimeSpriteCenter: { x: slimeCenter.x, y: slimeCenter.y },
      slimeHorizontalSpan: slime,
      visibleInFramePx: vis.visibleWidth,
      visiblePercent: `${(vis.fraction * 100).toFixed(1)}%`,
      offScreenLeft: slime.left < ORTHO_LEFT,
      offScreenRight: slime.right > ORTHO_RIGHT,
    });
  }

  for (let i = 0; i < 2; i++) {
    const a = horizSpan(SEAT_X[i]!, SLIME_IDLE_NATIVE.width);
    const b = horizSpan(SEAT_X[i + 1]!, SLIME_IDLE_NATIVE.width);
    const gap = b.left - a.right;
    if (gap < 0) {
      debugWarn(`  OVERLAP ${SEAT_NAMES[i]}-${SEAT_NAMES[i + 1]}:`, {
        overlapPx: -gap,
        leftSeatRight: a.right,
        rightSeatLeft: b.left,
      });
    } else {
      debugLog(`  Gap ${SEAT_NAMES[i]} → ${SEAT_NAMES[i + 1]}:`, {
        gapPx: gap,
        leftSeatRight: a.right,
        rightSeatLeft: b.left,
      });
    }
  }

  debugLog("  Decor ghost ≠ gameplay customer seat:", {
    ghostCenter: GHOST_NPC_CENTER,
    ghostSpan: horizSpan(GHOST_NPC_CENTER.x, GHOST_NPC_DISPLAY_WIDTH),
    seatMarkerR_center: { x: SEAT_R_X, y: SEAT_Y },
    seatMarkerR_span: horizSpan(SEAT_R_X, 130),
    deltaX_designUnits: SEAT_R_X - GHOST_NPC_CENTER.x,
    note:
      "Ghost is wall/table decor. Slime/placeholders use SEAT_X + counter Y, not GHOST_NPC_CENTER.",
  });

  logSeatLayoutVerdict();
  debugLog("=== end SEAT LAYOUT THEORY ===");
}

/** One-line diagnosis after theory math — sizing vs seating. */
export function logSeatLayoutVerdict(): void {
  const lVis = visibleInDesignFrame(
    horizSpan(SEAT_X[0]!, SLIME_IDLE_NATIVE.width),
  );
  const cVis = visibleInDesignFrame(
    horizSpan(SEAT_X[1]!, SLIME_IDLE_NATIVE.width),
  );
  const rVis = visibleInDesignFrame(
    horizSpan(SEAT_X[2]!, SLIME_IDLE_NATIVE.width),
  );
  const lcOverlap =
    horizSpan(SEAT_X[1]!, SLIME_IDLE_NATIVE.width).left -
    horizSpan(SEAT_X[0]!, SLIME_IDLE_NATIVE.width).right;

  debugLog("=== SEAT LAYOUT VERDICT ===");
  debugLog(
    "  Texture/plane sizing: OK when pixelsMatchPlaneUnits=true on monster_slime (1 design unit = 1 texture px).",
  );
  debugLog(
    "  Screen mapping: use approxCssX in MESHES log; ortho is always -640…640 design units.",
  );
  debugLog("  Stool seats vs full pitch:", {
    SEAT_X,
    visibleSlimePercent: {
      L: `${(lVis.fraction * 100).toFixed(0)}%`,
      C: `${(cVis.fraction * 100).toFixed(0)}%`,
      R: `${(rVis.fraction * 100).toFixed(0)}%`,
    },
    overlapPx_ifAllSlimesAtStools: {
      L_C: lcOverlap < 0 ? -lcOverlap : 0,
      note: "Transparent PNG padding may look fine with overlap",
    },
  });

  if (lVis.fraction < 0.05 || cVis.fraction < 0.05) {
    debugWarn(
      "  Seat(s) nearly invisible — you may be using MONSTER_SEAT_PITCH for SEAT_X; use SEAT_STOOL_SPACING instead.",
    );
  }
  debugLog("=== end VERDICT ===");
}

/** Babylon mesh bounds vs theory + design → browser CSS mapping. */
export function logSeatLayoutMeshes(
  scene: Scene,
  camera: FreeCamera,
  engine: Engine,
  label = "build",
): void {
  const canvas = engine.getRenderingCanvas();
  const cssW = canvas?.clientWidth ?? 0;
  const cssH = canvas?.clientHeight ?? 0;

  debugLog(`=== SEAT LAYOUT MESHES (${label}) ===`);

  if (camera.viewport) {
    debugLog("  Camera viewport (normalized letterbox):", {
      x: camera.viewport.x,
      y: camera.viewport.y,
      w: camera.viewport.width,
      h: camera.viewport.height,
    });
  }
  debugLog("  Canvas:", {
    bufferPx: { w: canvas?.width, h: canvas?.height },
    cssPx: { w: cssW, h: cssH },
    devicePixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1,
  });
  debugLog("  Design X → approx CSS X (for eyeballing vs screenshot):", {
    x_minus640: Math.round(designXToCanvasCssX(ORTHO_LEFT, camera, cssW)),
    x_0: Math.round(designXToCanvasCssX(0, camera, cssW)),
    x_plus640: Math.round(designXToCanvasCssX(ORTHO_RIGHT, camera, cssW)),
    SEAT_L: Math.round(designXToCanvasCssX(SEAT_X[0]!, camera, cssW)),
    SEAT_C: Math.round(designXToCanvasCssX(SEAT_X[1]!, camera, cssW)),
    SEAT_R: Math.round(designXToCanvasCssX(SEAT_X[2]!, camera, cssW)),
    ghostDecor: Math.round(
      designXToCanvasCssX(GHOST_NPC_CENTER.x, camera, cssW),
    ),
  });

  const groups: { tag: string; re: RegExp }[] = [
    { tag: "slime", re: /^monster_slime/ },
    { tag: "medusa", re: /^monster_medusa/ },
    { tag: "bigfoot", re: /^monster_bigfoot/ },
    { tag: "placeholder", re: /^monster_body/ },
    { tag: "seat_marker", re: /^seat_\d/ },
    { tag: "order_bubble", re: /^order_bubble/ },
    { tag: "ghost_decor", re: /^layout_ghost/ },
  ];

  for (const { tag, re } of groups) {
    const meshes = scene.meshes.filter((m) => re.test(m.name));
    if (meshes.length === 0) {
      debugWarn(`  [${tag}] no meshes matched ${re}`);
      continue;
    }
    for (const mesh of meshes) {
      const span = meshHorizSpan(mesh);
      const vis = visibleInDesignFrame(span);
      debugLog(`  [${tag}] ${mesh.name}`, {
        position: {
          x: mesh.position.x,
          y: mesh.position.y,
          z: mesh.position.z,
        },
        bboxHorizontalSpan: span,
        visibleInDesignFramePx: vis.visibleWidth,
        visiblePercent: `${(vis.fraction * 100).toFixed(1)}%`,
        approxCssX: {
          left: Math.round(designXToCanvasCssX(span.left, camera, cssW)),
          center: Math.round(designXToCanvasCssX(span.center, camera, cssW)),
          right: Math.round(designXToCanvasCssX(span.right, camera, cssW)),
        },
        renderingGroupId: mesh.renderingGroupId,
        alphaIndex: mesh.alphaIndex,
      });
    }
  }

  const slimeL = scene.meshes.find((m) =>
    m.name.startsWith("monster_slime_idle_0"),
  );
  if (slimeL) {
    const expected = horizSpan(SEAT_X[0]!, SLIME_IDLE_NATIVE.width);
    const actual = meshHorizSpan(slimeL);
    const widthDelta = actual.width - expected.width;
    if (Math.abs(widthDelta) > 0.5) {
      debugWarn("  Slime L: plane width ≠ mesh bbox width", {
        configuredPlaneWidth: expected.width,
        meshBBoxWidth: actual.width,
        delta: widthDelta,
      });
    } else {
      debugLog("  Slime L: plane width matches mesh bbox", {
        width: actual.width,
        expectedCenterX: SEAT_X[0],
        actualCenterX: slimeL.position.x,
        centerDelta: slimeL.position.x - SEAT_X[0]!,
      });
    }
  } else {
    debugWarn(
      "  No monster_slime_idle_0 — Seat L slime not in scene (check appearance / build)",
    );
  }

  logArtMonsterBottomAlignmentScan(scene, label);

  debugLog(`=== end SEAT LAYOUT MESHES (${label}) ===`);
}

export function logSeatLayoutAudit(
  scene: Scene,
  camera: FreeCamera,
  engine: Engine,
  label = "audit",
): void {
  logSeatLayoutTheory();
  logSeatLayoutMeshes(scene, camera, engine, label);
}
