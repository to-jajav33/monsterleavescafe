/**
 * 2D draw order (renderingGroupId). Higher = on top.
 * Do not rely on tiny Z offsets — ortho + overlapping Y needs explicit groups.
 */
export const LayoutLayer = {
  backWall: 0,
  decor: 1,
  seats: 2,
  counter: 3,
  ui: 4,
} as const;
