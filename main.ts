import { Game } from "./src/game/Game.ts";

const game = new Game();
game.start();

if (import.meta.hot) {
  import.meta.hot.dispose(() => game.dispose());
}
