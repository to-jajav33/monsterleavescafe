import { Game } from "./src/game/Game.ts";
import { debugLog } from "./src/utils/debugLog.ts";

debugLog("main.ts load");
const game = new Game();
game.start();

if (import.meta.hot) {
  import.meta.hot.dispose(() => game.dispose());
}
