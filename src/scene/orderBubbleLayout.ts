import { Vec2 } from "../utils/math.ts";

import {
  ORDER_BUBBLE_GAP_FROM_MONSTER,
  ORDER_BUBBLE_SIZE,
} from "./OrderBubble.ts";

/**
 * Center for order/rage bubbles — to the right of an anchor point.
 *
 * @param anchorCenter — use seat X + body Y (not full artboard center for wide PNGs).
 * @param anchorWidth — visible body width for horizontal offset, not texture width.
 */
export function bubbleCenterBesideMonster(
  anchorCenter: Vec2,
  anchorWidth: number,
): Vec2 {
  const halfBody = anchorWidth / 2;
  const halfBubble = ORDER_BUBBLE_SIZE / 2;
  return new Vec2(
    anchorCenter.x + halfBody + ORDER_BUBBLE_GAP_FROM_MONSTER + halfBubble,
    anchorCenter.y,
  );
}
