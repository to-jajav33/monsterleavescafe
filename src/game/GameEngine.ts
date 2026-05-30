import { Engine } from "@babylonjs/core/Engines/engine";

import { fitCanvasToDisplay } from "../utils/canvas.ts";

export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

/** Wraps Babylon Engine construction and canvas sizing. */
export class GameEngine {
  readonly engine: Engine;

  private readonly onResizeBound = (): void => {
    this.engine.resize();
  };

  constructor(private readonly canvas: HTMLCanvasElement) {
    fitCanvasToDisplay(canvas, DESIGN_WIDTH, DESIGN_HEIGHT);
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    window.addEventListener("resize", this.onResizeBound);
  }

  dispose(): void {
    window.removeEventListener("resize", this.onResizeBound);
    this.engine.dispose();
  }
}
