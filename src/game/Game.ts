import type { Engine } from "@babylonjs/core/Engines/engine";

import { debugLog } from "../utils/debugLog.ts";
import { getRequiredCanvas } from "../utils/canvas.ts";
import { TitleMenuScreen } from "../scene/TitleMenuScreen.ts";
import { TutorialScreen } from "../scene/TutorialScreen.ts";

import { GameEngine } from "./GameEngine.ts";
import { GameScene } from "./GameScene.ts";

/** Top-level game: title menu → tutorial → cafe gameplay. */
export class Game {
  private gameEngine: GameEngine | null = null;
  private titleMenu: TitleMenuScreen | null = null;
  private tutorial: TutorialScreen | null = null;
  private gameScene: GameScene | null = null;

  constructor(private readonly canvasId: string = "game-canvas") {}

  start(): void {
    debugLog("Game.start()");
    const canvas = getRequiredCanvas(this.canvasId);
    canvas.tabIndex = 0;
    canvas.addEventListener("pointerdown", () => {
      canvas.focus();
    });
    this.gameEngine = new GameEngine(canvas);
    this.showTitleMenu();
    debugLog("Game.start() complete — title menu");

    const engine = this.gameEngine.engine;
    engine.runRenderLoop(() => {
      if (this.titleMenu) {
        this.titleMenu.render();
      } else if (this.tutorial) {
        this.tutorial.render();
      } else {
        this.gameScene?.render();
      }
    });
  }

  private showTitleMenu(): void {
    if (!this.gameEngine) return;
    this.titleMenu?.dispose();
    this.tutorial?.dispose();
    this.gameScene?.dispose();
    this.tutorial = null;
    this.gameScene = null;
    this.titleMenu = new TitleMenuScreen(this.gameEngine, {
      onStart: () => this.showTutorial(),
    });
  }

  private showTutorial(): void {
    if (!this.gameEngine) return;
    debugLog("Game.showTutorial()");
    this.titleMenu?.dispose();
    this.titleMenu = null;
    this.gameScene?.dispose();
    this.gameScene = null;
    this.tutorial = new TutorialScreen(this.gameEngine, {
      onStartShift: () => this.beginGameplay(),
    });
  }

  private beginGameplay(): void {
    if (!this.gameEngine) return;
    debugLog("Game.beginGameplay()");
    this.titleMenu?.dispose();
    this.titleMenu = null;
    this.tutorial?.dispose();
    this.tutorial = null;
    getRequiredCanvas(this.canvasId).focus();
    this.gameScene = new GameScene(this.gameEngine, {
      onShiftComplete: () => this.showTitleMenu(),
    });
    debugLog("Game.beginGameplay() complete");
  }

  getEngine(): Engine | null {
    return this.gameEngine?.engine ?? null;
  }

  dispose(): void {
    debugLog("Game.dispose()");
    this.titleMenu?.dispose();
    this.tutorial?.dispose();
    this.gameScene?.dispose();
    this.titleMenu = null;
    this.tutorial = null;
    this.gameScene = null;
    this.gameEngine?.dispose();
    this.gameEngine = null;
  }
}
