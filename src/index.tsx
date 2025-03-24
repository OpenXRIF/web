import { serve } from "bun";
import index from "./index.html";
import { XRIF_EXAMPLES } from "./examples/xrif";

const SYNAPSE_URL = "http://127.0.0.1:8080/v1/text_prompt";

const { GoogleGenerativeAI } = require("@google/generative-ai");

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

        const randomIndex = Math.floor(Math.random() * XRIF_EXAMPLES.length);
        // const example = XRIF_EXAMPLES[randomIndex];
        // const result = { ...example, prompt: message };

        const text_response = await prompt_gemini(message);

        // Parse json out
        const result = parseXRIF(text_response);

        // const result = await fetch(SYNAPSE_URL, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ prompt_format: message }),
        // }).then((res) => res.json());

        return Response.json(result);
      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);

async function prompt_gemini(message: string) {
  const prompt = `
  # Role
You control a robot that navigates through a building using a JSON instruction format. You have access to several pre-defined waypoints and functions. Your goal is to interpret the user's natural language requests and output valid JSON instructions that the robot will follow.

# JSON Output Format
Each output must be valid JSON (following RFC 8259) with the following structure:
{{
  "actions": [
    {{
      "action": "<action_type>",  // Must be one of: "navigate", "speak", "wait"
      "input": <value>  // For "navigate": an object with "name", "x", and "y"; for "speak": a string; for "wait": a number (in seconds)
    }},
    ...
  ]
}}
Ensure there are no trailing commas and all JSON rules are followed.

# Context
- Available Waypoints: 
[
  {
    "name": "RoboHub",
    "x": 1339,
    "y": 906,
    "floor": 1,
    "keywords": ["robotics", "1339", "robot", "drone"]
  },
  {
    "name": "Ideas Clinic",
    "x": 2065,
    "y": 1008,
    "floor": 1,
    "keywords": ["workshop", "event", "big room", "machines", "1427"]
  },
  {
    "name": "C&D Main Entrance",
    "x": 1965,
    "y": 1132,
    "floor": 1,
    "keywords": ["coffee and donuts", "cafe", "coffee shop", "store", "snacks", "drinks", "1416"],
    "aliases": ["CnD", "C and D"]
  },
  {
    "name": "Novelties",
    "x": 1935,
    "y": 1006,
    "floor": 1,
    "keywords": ["engsoc", "engineering society", "merch", "merchandise", "store", "patches", "clothes", "1419"]
  },
  {
    "name": "Microwaves",
    "x": 1817,
    "y": 1334,
    "floor": 1,
    "keywords": ["food", "heating", "eating", "1414", "lunch"]
  },
  {
    "name": "Elevators",
    "x": 1709,
    "y": 778,
    "floor": 1,
    "keywords": ["floor", "1841", "1842", "1843"]
  },
  {
    "name": "Silent Study",
    "x": 1443,
    "y": 572,
    "floor": 1,
    "keywords": ["study", "quiet", "studyspace", "work", "1302", "independant"]
  },
  {
    "name": "Shower A",
    "x": 951,
    "y": 616,
    "floor": 1,
    "keywords": ["clean", "wash", "1918"]
  },
  {
    "name": "Shower B",
    "x": 827,
    "y": 610,
    "floor": 1,
    "keywords": ["clean", "wash", "1919"]
  },
  {
    "name": "Assembly Room",
    "x": 1865,
    "y": 434,
    "floor": 1,
    "keywords": ["workspace", "machines", "repair", "work", "build", "manufacture", "assemble", "1401"]
  },
  {
    "name": "E5 Entrance",
    "x": 1535,
    "y": 1535,
    "floor": 1,
    "keywords": ["e5", "engineering 5", "design teams", "machine shop", "student shop", "1834"]
  },
  {
    "name": "Temporary Booth",
    "x": 1425,
    "y": 1229,
    "floor": 1,
    "keywords": ["engsoc", "engineering society", "gradcomm", "pizza", "foyer", "booth", "1348"]
  },
  {
    "name": "North Entrance",
    "x": 739,
    "y": 1225,
    "floor": 1,
    "keywords": ["front", "engineering sign", "bus stop", "1831"]
  },
  {
    "name": "South Entrance",
    "x": 2243,
    "y": 1083,
    "floor": 1,
    "keywords": ["back", "plaza", "1851"]
  },
  {
    "name": "East Entrance",
    "x": 1611,
    "y": 413,
    "floor": 1,
    "keywords": ["side", "e6", "engineering 6", "philip street", "1821"]
  },
  {
    "name": "C&D - Coffee Area",
    "x": 2227,
    "y": 1169,
    "floor": 1,
    "keywords": ["coffee", "tea", "hot chocolate", "french vanilla", "hot drink"],
    "aliases": ["CnD", "C and D"]
  },
  {
    "name": "C&D - Hot Food Area",
    "x": 2091,
    "y": 1157,
    "floor": 1,
    "keywords": ["pizza", "jamacian patties", "breakfast sandwiches", "egg mcmuffin", "lunch"],
    "aliases": ["CnD", "C and D"]
  },
  {
    "name": "C&D - Snack Area",
    "x": 2071,
    "y": 1247,
    "floor": 1,
    "keywords": ["chips", "chocolate bar", "protein bar", "snack"],
    "aliases": ["CnD", "C and D"]
  },
  {
    "name": "C&D - Cold Drink Area",
    "x": 2005,
    "y": 1277,
    "floor": 1,
    "keywords": ["water", "iced tea", "pop", "soda", "energy drink", "sports drink", "cold drink"],
    "aliases": ["CnD", "C and D"]
  },
  {
    "name": "C&D - Pastry Area",
    "x": 2069,
    "y": 1199,
    "floor": 1,
    "keywords": ["snack", "cookie", "croissant", "rice crispy square", "bagel", "donut", "biscuit"],
    "aliases": ["CnD", "C and D"]
  }
]
  Each waypoint in the list includes its name and a set of corresponding keywords.
- Available Functions: Navigate, speak, and wait.

# Understanding User Prompts – Keyword-Based Waypoint Matching
When interpreting the user's request, follow these strict rules for identifying the referenced waypoint using its corresponding keywords:

1. Ignore Extra Tokens:  
   If the user's input begins with extra tokens (such as an alphanumeric building code or other prefixes), ignore them. For example, treat "E7 ideas clinic" as "ideas clinic".

2. Keyword Matching:  
   Each available waypoint comes with a set of keywords. For example, if a waypoint is defined as "ideas clinic" with keywords like ["ideas", "clinic", "room"], then a valid reference must include at least one or more of these keywords and the words in the waypoint name.  
   - The input "ideas clinic" or "ideas room" should both match this waypoint because they include the core identifier "ideas".

3. Strict Match Requirement:  
   After ignoring extra tokens, if the remaining text does not contain any of the keywords or the words in the waypoint name for a given waypoint, or if more than one waypoint could be inferred without a clear winner, then the reference is considered invalid.  
   In other words, a waypoint is only valid if the cleaned input contains at least one of the defined keywords or the words in the waypoint name for that waypoint and clearly points to one single available waypoint.

4. Invalid Waypoint Response:  
   If you determine that none of the available waypoints meets the keyword match criteria, output the following error response:
{{
  "actions": [
    {{
      "action": "speak",
      "input": "This waypoint does not exist"
    }}
  ]
}}

# Handling Complex Commands
- Process commands sequentially in the order provided.
- For multi-step commands, list the actions in the exact order they should be executed.
- If multiple interpretations are possible, choose the interpretation that minimizes extra actions.

# Supported Edge Cases
- Unknown Waypoint:  
  If, after ignoring extra tokens, the input does not include at least one of the corresponding keywords for any available waypoint, output:
{{
  "actions": [
    {{
      "action": "speak",
      "input": "This waypoint does not exist"
    }}
  ]
}}
- Invalid or Ambiguous Commands:  
  Output a single "speak" action with a clear error message.
- Unsupported Actions:  
  If the request includes any function beyond "navigate", "speak", or "wait", output:
{{
  "actions": [
    {{
      "action": "speak",
      "input": "Unsupported action requested"
    }}
  ]
}}

# Examples
Example Prompt: Can you pick something up from the C and D areas and drop it off at the RoboHub?
Example Answer:
{{
    "actions": [
        {{
            "action": "navigate",
            "input": {{
                "name": "C&D - Coffee Area",
                "x": 100,
                "y": 100
            }}
        }},
        {{
            "action": "navigate",
            "input": {{
                "name": "RoboHub Entrance",
                "x": 25,
                "y": 50
            }}
        }}
    ]
}}

Example Prompt: Can you ask Zach for the keys? He is at the RoboHub. After receiving the keys, drop them off at the Ideas Clinic. Also, wait for 10 seconds when you meet Zach.
Example Answer:
{{
  "actions": [
    {{
      "action": "navigate",
      "input": {{
        "name": "RoboHub",
        "x": 100,
        "y": 100
      }}
    }},
    {{
      "action": "speak",
      "input": "Hey Zach, can you hand me the keys?"
    }},
    {{
      "action": "wait",
      "input": 10
    }},
    {{
      "action": "navigate",
      "input": {{
        "name": "Room 1427 - Ideas Clinic",
        "x": 25,
        "y": 75
      }}
    }}
  ]
}}

Example Prompt: Please go to the unknown zone and then to the RoboHub.
Example Answer:
{{
  "actions": [
    {{
      "action": "speak",
      "input": "Invalid request: 'unknown zone' is not a valid waypoint"
    }}
  ]
}}

Prompt: ${message}`;

  const result = await model.generateContent(prompt);
  console.log(result.response.text());
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
