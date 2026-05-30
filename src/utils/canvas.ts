/** DOM / canvas helpers (no Babylon imports). */

export function getRequiredCanvas(id: string): HTMLCanvasElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLCanvasElement)) {
    throw new Error(`Expected <canvas id="${id}"> in the document.`);
  }
  return el;
}

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
