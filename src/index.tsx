import { serve } from "bun";
import index from "./index.html";
import { XRIF_EXAMPLES } from "./examples/xrif";
import { CohereClient } from "cohere-ai"

const cohere = new CohereClient({
    token: "ilzS5TMrkTzpk4wkyo7AEwHyWmbEDKepsGRFzFkT",
});

const SYNAPSE_URL = "http://127.0.0.1:8080/v1/text_prompt";

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
        const chat = await cohere.chat({
            model: "command",
            message: `
    You control a robot that can navigate through a building based on a json instruction format,
    you understand several waypoints that have been given to you before (you can use RAG to retrieve
    what room numbers or waypoints correspond to which people or semantics).

    Here are all the waypoints you have access to:
    [
    {
        "name": "E7 1st floor Elevators",
        "x": 50,
        "y": 50,
        "floor": 1,
        "keywords": ["elevator"],
    },
    {
        "name": "E7 North Entrance",
        "x": 50,
        "y": 0,
        "floor": 1,
        "keywords": ["entrance"],
    },
    {
        "name": "E7 East Entrance",
        "x": 0,
        "y": 50,
        "floor": 1,
        "keywords": ["entrance"],
    },
    {
        "name": "E7 South Entrance",
        "x": 50,
        "y": 100,
        "floor": 1,
        "keywords": ["entrance"],
    },
    {
        "name": "E7 Coffee and Donuts",
        "x": 75,
        "y": 75,
        "floor": 1,
        "keywords": ["food and drink", "coffee", "breakfast", "snacks"],
        "aliases": ["CnD", "C and D"]
    },
    {
        "name": "Room 1427 - Ideas Clinic",
        "x": 25,
        "y": 75,
        "floor": 1,
        "keywords": ["classroom", "workshop", "lab"],
    },
    {
        "name": "Outreach Classroom",
        "x": 25,
        "y": 25,
        "floor": 1,
        "keywords": ["classroom", "lecture hall"],
    },
    {
        "name": "RoboHub Entrance",
        "x": 25,
        "y": 50,
        "floor": 1,
        "keywords": ["robots", "workshop", "lab"],
    },
    {
        "name": "Vending Machine",
        "x": 75,
        "y": 50,
        "floor": 1,
        "keywords": ["food and drink", "snacks"],
    },
    {
        "name": "Room 2241",
        "x": 100,
        "y": 100,
        "floor": 2,
        "keywords": ["office", "Zach"],
    }
    ]

    Here are all the Functions you have access to:
    {"navigate": {waypoint [json]}}
    {"wait": seconds [int]}
    {"speak": speech [string]}

    Example Prompt: Can you pick something up from Zach's office and drop it off at the RoboHub?

    Example Answer:
    {
        "actions": [
            {
              "navigate": {
                "name": "Room 2106",
                "keywords": ["office", "zach", "WEEF"],
                "floor": 1
              }
            },
            {
              "navigate": {
                "name": "RoboHub Entrance",
                "keywords": ["workshop", "robots"]
                "floor": 1
              }
            }
        ]
    }

    Example Prompt: Can you ask Zach for a coffee and drop it off at the RoboHub? Wait for 10 seconds after Zach gives you the coffee.

    Example Answer:
    {
        "actions": [
            {
              "navigate": {
                "name": "Room 2106",
                "keywords": ["office", "zach", "WEEF"],
                "floor": 1
              }
            },
            {
              "speak": "Can I have a coffee?"
            },
            {
              "wait": 10
            },
            {
              "navigate": {
                "name": "RoboHub Entrance",
                "keywords": ["workshop", "robots"],
                "floor": 1
              }
            }
        ]
    }

    Prompt: ${message}`,
        });
        
        console.log(chat.text);

        // const result = await fetch(SYNAPSE_URL, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ prompt_format: message }),
        // }).then((res) => res.json());
        // const codeBlock = chat.text.match("")

        try {
            const jsonathan = JSON.parse(chat.text);
            return Response.json(jsonathan);
        } catch {
            return Response.json(chat.text)
        }


      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
