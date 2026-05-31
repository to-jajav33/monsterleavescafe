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
    "/assets/image-monster-slime-angry-1.png": () =>
      new Response(Bun.file("./assets/image-monster-slime-angry-1.png")),
    "/assets/image-monster-slime-angry-2.png": () =>
      new Response(Bun.file("./assets/image-monster-slime-angry-2.png")),
    "/assets/image-monster-slime-jump-scare-1.png": () =>
      new Response(Bun.file("./assets/image-monster-slime-jump-scare-1.png")),
    "/assets/image-monster-medusa-idle-1.png": () =>
      new Response(Bun.file("./assets/image-monster-medusa-idle-1.png")),
    "/assets/image-monster-medusa-angry-1.png": () =>
      new Response(Bun.file("./assets/image-monster-medusa-angry-1.png")),
    "/assets/image-monster-medusa-jumpscare-2.png": () =>
      new Response(Bun.file("./assets/image-monster-medusa-jumpscare-2.png")),
    "/assets/image-monster-medusa-stone-1.png": () =>
      new Response(Bun.file("./assets/image-monster-medusa-stone-1.png")),
    "/assets/image-monster-bigfoot-idle-1.png": () =>
      new Response(Bun.file("./assets/image-monster-bigfoot-idle-1.png")),
    "/assets/image-monster-bigfoot-angry-1.png": () =>
      new Response(Bun.file("./assets/image-monster-bigfoot-angry-1.png")),
    "/assets/image-monster-bigfoot-angry-2.png": () =>
      new Response(Bun.file("./assets/image-monster-bigfoot-angry-2.png")),
    "/assets/image-monster-bigfoot-jumpscare-1.png": () =>
      new Response(Bun.file("./assets/image-monster-bigfoot-jumpscare-1.png")),
    "/assets/image-title-page.png": () =>
      new Response(Bun.file("./assets/image-title-page.png")),
    "/assets/image-button-start.png": () =>
      new Response(Bun.file("./assets/image-button-start.png")),
    "/assets/image-button-quit.png": () =>
      new Response(Bun.file("./assets/image-button-quit.png")),
  },
  development: {
    hmr: true,
    console: true,
  },
  port: 3001,
});

console.log(`Monster Leaves Cafe → http://localhost:${server.port}`);
