import { serve } from "bun";
import index from "./index.html";
import { XRIF_EXAMPLES } from "./examples/xrif";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildPrompt } from "./server/prompts";

const SYNAPSE_PROMPT_URL = Bun.env.SYNAPSE_URL + "/v1/text_prompt";


const genAI = new GoogleGenerativeAI(Bun.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    "/api/xrif": {
      async POST(req) {
        const body = await req.json();
        const { message } = body;

        // const randomIndex = Math.floor(Math.random() * XRIF_EXAMPLES.length);
        // const example = XRIF_EXAMPLES[randomIndex];
        // const result = { ...example, prompt: message };

        const text_response = await prompt_gemini(message);

        // Parse json out
        const result = parseXRIF(text_response);

        return Response.json(result);
      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);

async function prompt_gemini(message: string) {
  const prompt = buildPrompt(message);

  const result = await model.generateContent(prompt);

  return result.response.text();
}

function parseXRIF(text: string) {
  // Get json from what is in ```json block
  const match = text.match(/```json([\s\S]*?)```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      return null;
    }
  }
  return null;
}
