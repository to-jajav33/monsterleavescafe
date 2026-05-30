import type { Scene } from "@babylonjs/core/scene";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../game/GameEngine.ts";
import { Vec2 } from "../utils/math.ts";
import { designCenterToTopLeft } from "../utils/designCoords.ts";

export type LayoutLabelConfig = {
  text: string;
  center: Vec2;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
};

/** Screen-space labels aligned to 1280×720 design coordinates. */
export class LayoutGui {
  private readonly texture: AdvancedDynamicTexture;
  private readonly controls: TextBlock[] = [];

  constructor(scene: Scene) {
    this.texture = AdvancedDynamicTexture.CreateFullscreenUI(
      "layout_gui",
      true,
      scene,
    );
    this.texture.idealWidth = DESIGN_WIDTH;
    this.texture.idealHeight = DESIGN_HEIGHT;
  }

  addLabel(config: LayoutLabelConfig): void {
    const { left, top } = designCenterToTopLeft(config.center);
    const text = new TextBlock();
    text.text = config.text;
    text.color = "#f8f8f2";
    text.fontSize = config.fontSize ?? 18;
    text.fontFamily = "monospace";
    text.fontWeight = config.fontWeight ?? "bold";
    text.width = `${config.width}px`;
    text.height = `${config.height}px`;
    text.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    text.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    text.left = `${left - config.width / 2}px`;
    text.top = `${top - config.height / 2}px`;
    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.texture.addControl(text);
    this.controls.push(text);
  }

  dispose(): void {
    this.texture.dispose();
    this.controls.length = 0;
  }
}

/** Parse `bold 28px monospace` → 28 */
export function parseFontSizePx(font?: string): number | undefined {
  if (!font) return undefined;
  const match = font.match(/(\d+)px/);
  return match ? Number(match[1]) : undefined;
}

export function parseFontWeight(font?: string): string | undefined {
  if (!font?.includes("bold")) return undefined;
  return "bold";
}
