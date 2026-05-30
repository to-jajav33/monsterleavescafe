import type { Engine } from "@babylonjs/core/Engines/engine";

import { debugLog } from "../utils/debugLog.ts";
import { getRequiredCanvas } from "../utils/canvas.ts";

import { GameEngine } from "./GameEngine.ts";
import { GameScene } from "./GameScene.ts";

/** Top-level game: owns engine, scene, and the render loop. */
export class Game {
  private gameEngine: GameEngine | null = null;
  private gameScene: GameScene | null = null;

  constructor(private readonly canvasId: string = "game-canvas") {}

  start(): void {
    debugLog("Game.start()");
    const canvas = getRequiredCanvas(this.canvasId);
    this.gameEngine = new GameEngine(canvas);
    this.gameScene = new GameScene(this.gameEngine);
    debugLog("Game.start() complete");

    const engine = this.gameEngine.engine;
    engine.runRenderLoop(() => {
      this.gameScene?.render();
    });
  }

  getEngine(): Engine | null {
    return this.gameEngine?.engine ?? null;
  }

  dispose(): void {
    debugLog("Game.dispose()");
    this.gameScene?.dispose();
    this.gameEngine?.dispose();
    this.gameScene = null;
    this.gameEngine = null;
  }
}
