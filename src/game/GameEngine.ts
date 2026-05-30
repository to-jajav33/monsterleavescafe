import { Engine } from "@babylonjs/core/Engines/engine";

import {
  fitCanvasToDisplay,
  resizeCanvasToWindow,
} from "../utils/canvas.ts";

export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;
export const DESIGN_ASPECT = DESIGN_WIDTH / DESIGN_HEIGHT;

/** Wraps Babylon Engine construction and canvas sizing. */
export class GameEngine {
  readonly engine: Engine;
  private readonly resizeListeners = new Set<() => void>();

  private readonly onResizeBound = (): void => {
    resizeCanvasToWindow(this.canvas);
    this.engine.resize();
    for (const listener of this.resizeListeners) {
      listener();
    }
  };

  constructor(private readonly canvas: HTMLCanvasElement) {
    fitCanvasToDisplay(canvas, DESIGN_WIDTH, DESIGN_HEIGHT);
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    window.addEventListener("resize", this.onResizeBound);
    this.onResizeBound();
  }

  onResize(listener: () => void): void {
    this.resizeListeners.add(listener);
  }

  offResize(listener: () => void): void {
    this.resizeListeners.delete(listener);
  }

  dispose(): void {
    window.removeEventListener("resize", this.onResizeBound);
    this.resizeListeners.clear();
    this.engine.dispose();
  }
}
