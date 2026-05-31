import index from "./index.html";

const server = Bun.serve({
  routes: {
    "/": index,
    "/assets/image-bg.png": () =>
      new Response(Bun.file("./assets/image-bg.png")),
    "/assets/image-counter-top.png": () =>
      new Response(Bun.file("./assets/image-counter-top.png")),
    "/assets/image-ghost-npc.png": () =>
      new Response(Bun.file("./assets/image-ghost-npc.png")),
    "/assets/image-flashlight.png": () =>
      new Response(Bun.file("./assets/image-flashlight.png")),
    "/assets/image-monster-slime-idle-1.png": () =>
      new Response(Bun.file("./assets/image-monster-slime-idle-1.png")),
  },
  development: {
    hmr: true,
    console: true,
  },
  port: 3001,
});

console.log(`Monster Leaves Cafe → http://localhost:${server.port}`);
