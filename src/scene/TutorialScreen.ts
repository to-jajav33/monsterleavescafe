import "@babylonjs/core/Culling/ray";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";

import type { GameEngine } from "../game/GameEngine.ts";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { debugLog } from "../utils/debugLog.ts";
import { createContainViewport } from "../utils/containViewport.ts";
import { Vec2 } from "../utils/math.ts";

import { LayoutAlphaIndex, LayoutLayer, LayoutZOffset } from "./LayoutLayer.ts";
import { LayoutPlane } from "./LayoutPlane.ts";
import {
  TUTORIAL_BACKGROUND_URL,
  TUTORIAL_BOSS_CENTER,
  TUTORIAL_BOSS_DISPLAY_HEIGHT,
  TUTORIAL_BOSS_DISPLAY_WIDTH,
  TUTORIAL_BOSS_URL,
  TUTORIAL_BUTTON_HEIGHT,
  TUTORIAL_BUTTON_NEXT_CENTER,
  TUTORIAL_BUTTON_NEXT_URL,
  TUTORIAL_BUTTON_START_SHIFT_CENTER,
  TUTORIAL_BUTTON_START_SHIFT_URL,
  TUTORIAL_START_SHIFT_HEIGHT,
  TUTORIAL_BUTTON_WIDTH,
  TUTORIAL_FRAME_SIZE,
  TUTORIAL_LABEL_FONT,
  TUTORIAL_LABEL_PADDING,
  TUTORIAL_PROMPTS,
  TUTORIAL_START_SHIFT_WIDTH,
  TUTORIAL_TEXT_BOX_CENTER,
  TUTORIAL_TEXT_BOX_SIZE,
} from "./tutorialAssets.ts";

export type TutorialScreenOptions = {
  onStartShift: () => void;
};

/**
 * Pre-shift tutorial — cafe bg, boss art, text panel, Next / Start Shift.
 */
export class TutorialScreen {
  readonly scene: Scene;
  readonly camera: FreeCamera;
  private readonly planes: LayoutPlane[] = [];
  private readonly textBox: LayoutPlane;
  private readonly updateOrtho: () => void;
  private promptIndex = 0;

  constructor(
    private readonly gameEngine: GameEngine,
    private readonly options: TutorialScreenOptions,
  ) {
    debugLog("TutorialScreen.constructor");
    this.scene = new Scene(gameEngine.engine);
    this.scene.clearColor = new Color4(0.1, 0.1, 0.12, 1);
    this.camera = this.createCamera();
    this.scene.activeCamera = this.camera;

    this.updateOrtho = () => {
      const canvas = gameEngine.engine.getRenderingCanvas();
      if (!canvas) return;
      this.camera.orthoLeft = -DESIGN_WIDTH / 2;
      this.camera.orthoRight = DESIGN_WIDTH / 2;
      this.camera.orthoTop = DESIGN_HEIGHT / 2;
      this.camera.orthoBottom = -DESIGN_HEIGHT / 2;
      this.camera.viewport = createContainViewport(
        canvas.width,
        canvas.height,
      );
    };
    gameEngine.onResize(this.updateOrtho);
    this.updateOrtho();
    this.textBox = this.build();
  }

  render(): void {
    this.scene.render();
  }

  dispose(): void {
    debugLog("TutorialScreen.dispose");
    this.gameEngine.offResize(this.updateOrtho);
    for (const plane of this.planes) {
      plane.dispose();
    }
    this.planes.length = 0;
    this.scene.dispose();
  }

  private createCamera(): FreeCamera {
    const camera = new FreeCamera(
      "tutorial_camera2d",
      new Vector3(0, 0, -10),
      this.scene,
    );
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.setTarget(Vector3.Zero());
    return camera;
  }

  private build(): LayoutPlane {
    this.planes.push(
      new LayoutPlane(this.scene, {
        name: "layout_tutorial_background",
        center: new Vec2(0, 0),
        width: TUTORIAL_FRAME_SIZE.width,
        height: TUTORIAL_FRAME_SIZE.height,
        layer: LayoutLayer.backWall,
        depthOffset: -0.02,
        alphaIndex: LayoutAlphaIndex.background,
        color: new Color3(0.2, 0.18, 0.22),
        imageUrl: TUTORIAL_BACKGROUND_URL,
        imageBlend: "alphablend",
      }),
    );

    this.planes.push(
      new LayoutPlane(this.scene, {
        name: "layout_tutorial_boss",
        center: TUTORIAL_BOSS_CENTER,
        width: TUTORIAL_BOSS_DISPLAY_WIDTH,
        height: TUTORIAL_BOSS_DISPLAY_HEIGHT,
        layer: LayoutLayer.decor,
        depthOffset: 0.02,
        alphaIndex: LayoutAlphaIndex.ghostNpc,
        color: Color3.White(),
        imageUrl: TUTORIAL_BOSS_URL,
        imageBlend: "alphablend",
      }),
    );

    const textBoxFrame = new LayoutPlane(this.scene, {
      name: "layout_tutorial_text_box_frame",
      center: TUTORIAL_TEXT_BOX_CENTER,
      width: TUTORIAL_TEXT_BOX_SIZE.width + 12,
      height: TUTORIAL_TEXT_BOX_SIZE.height + 12,
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.hide,
      alphaIndex: LayoutAlphaIndex.tutorialUi,
      color: new Color3(0.35, 0.28, 0.38),
      sortTransparent: true,
    });
    this.planes.push(textBoxFrame);

    const textBox = new LayoutPlane(this.scene, {
      name: "layout_tutorial_text_box",
      center: TUTORIAL_TEXT_BOX_CENTER,
      width: TUTORIAL_TEXT_BOX_SIZE.width,
      height: TUTORIAL_TEXT_BOX_SIZE.height,
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.hide + 0.01,
      alphaIndex: LayoutAlphaIndex.tutorialUi + 1,
      color: new Color3(0.96, 0.94, 0.9),
      label: TUTORIAL_PROMPTS[0],
      labelFont: TUTORIAL_LABEL_FONT,
      labelPadding: TUTORIAL_LABEL_PADDING,
      labelTextColor: "#2a2438",
      sortTransparent: true,
    });
    this.planes.push(textBox);

    this.addButton({
      name: "layout_tutorial_button_start_shift",
      center: TUTORIAL_BUTTON_START_SHIFT_CENTER,
      width: TUTORIAL_START_SHIFT_WIDTH,
      height: TUTORIAL_START_SHIFT_HEIGHT,
      imageUrl: TUTORIAL_BUTTON_START_SHIFT_URL,
      onPick: () => {
        debugLog("Tutorial: Start Shift");
        this.options.onStartShift();
      },
    });

    this.addButton({
      name: "layout_tutorial_button_next",
      center: TUTORIAL_BUTTON_NEXT_CENTER,
      width: TUTORIAL_BUTTON_WIDTH,
      height: TUTORIAL_BUTTON_HEIGHT,
      imageUrl: TUTORIAL_BUTTON_NEXT_URL,
      onPick: () => this.advancePrompt(),
    });

    debugLog("TutorialScreen.build done", { prompts: TUTORIAL_PROMPTS.length });
    return textBox;
  }

  private advancePrompt(): void {
    if (this.promptIndex >= TUTORIAL_PROMPTS.length - 1) {
      debugLog("Tutorial: Next on last prompt");
      return;
    }
    this.promptIndex += 1;
    this.textBox.updateLabel(TUTORIAL_PROMPTS[this.promptIndex]!);
    debugLog("Tutorial: prompt", this.promptIndex + 1);
  }

  private addButton(config: {
    name: string;
    center: Vec2;
    width: number;
    height: number;
    imageUrl: string;
    onPick: () => void;
  }): void {
    const plane = new LayoutPlane(this.scene, {
      name: config.name,
      center: config.center,
      width: config.width,
      height: config.height,
      layer: LayoutLayer.ui,
      depthOffset: LayoutZOffset.boss + 0.02,
      alphaIndex: LayoutAlphaIndex.titleMenuButton,
      color: Color3.White(),
      imageUrl: config.imageUrl,
      imageBlend: "alphablend",
      pickable: true,
    });
    this.planes.push(plane);
    this.bindPick(plane.mesh, config.onPick);
  }

  private bindPick(mesh: Mesh, onPick: () => void): void {
    if (!mesh.actionManager) {
      mesh.actionManager = new ActionManager(this.scene);
    }
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(
        { trigger: ActionManager.OnPickDownTrigger },
        onPick,
      ),
    );
  }
}
