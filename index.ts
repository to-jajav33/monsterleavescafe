import index from "./index.html";

const server = Bun.serve({
  routes: {
    "/": index,
    "/assets/image-bg.png": () =>
      new Response(Bun.file("./assets/image-bg.png")),
  },
  development: {
    hmr: true,
    console: true,
  },
  port: 3001,
});

console.log(`Monster Leaves Cafe → http://localhost:${server.port}`);
