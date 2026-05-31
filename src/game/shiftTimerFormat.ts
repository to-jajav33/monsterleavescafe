/** Full shift length — win / end at 0:00 (GAME_SCOPE: 3:00 shift). */
export const SHIFT_DURATION_SEC = 180;

export function formatShiftCountdown(remainingSec: number): string {
  const total = Math.max(0, Math.ceil(remainingSec));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
