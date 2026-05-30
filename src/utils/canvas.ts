/** DOM / canvas helpers (no Babylon imports). */

export function getRequiredCanvas(id: string): HTMLCanvasElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLCanvasElement)) {
    throw new Error(`Expected <canvas id="${id}"> in the document.`);
  }
  return el;
}

/** Match canvas buffer to the window (respect devicePixelRatio). */
export function resizeCanvasToWindow(canvas: HTMLCanvasElement): void {
  const dpr = window.devicePixelRatio ?? 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
}

/** Initial fit using design resolution (used before first layout). */
export function fitCanvasToDisplay(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): void {
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
}
