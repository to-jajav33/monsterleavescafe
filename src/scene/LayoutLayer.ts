/**
 * 2D draw order (renderingGroupId). Higher = on top.
 *
 * Babylon only renders groups 0–3 (RenderingManager.MAX_RENDERINGGROUPS = 4).
 * Do not use layer 4+ or meshes will never appear.
 */
export const LayoutLayer = {
  backWall: 0,
  decor: 1,
  seats: 2,
  counter: 3,
  /** Menu, drink slots, Hide, BOSS — must share group 3; use depthOffset / build order for stacking */
  ui: 3,
} as const;
