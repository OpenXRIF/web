import { serve } from "bun";
import index from "./index.html";
import { XRIF_EXAMPLES } from "./examples/xrif";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    "/api/echo": {
      async POST(req) {
        const body = await req.json();
        const { message } = body;
        const randomIndex = Math.floor(Math.random() * XRIF_EXAMPLES.length);
        const example = XRIF_EXAMPLES[randomIndex];
        const result = { ...example, prompt: message };
        return Response.json(result);
      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
