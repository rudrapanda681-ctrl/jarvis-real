import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Parse incoming SDP as raw text
app.use(
  express.text({
    type: ["application/sdp", "text/plain"],
    limit: "2mb",
  })
);

// Realtime WebRTC connection
app.post("/api/realtime", async (req, res) => {
  try {
    // Check API key
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes("PASTE_")
    ) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured on the server.",
      });
    }

    // Check SDP
    if (!req.body || typeof req.body !== "string" || !req.body.trim()) {
      return res.status(400).json({
        error: "SDP offer is missing from the request.",
      });
    }

    // Realtime session configuration
    const session = {
      type: "realtime",
      model: "gpt-realtime",

      audio: {
        output: {
          voice: "marin",
        },

        input: {
          turn_detection: {
            type: "semantic_vad",
            create_response: true,
            interrupt_response: true,
          },

          transcription: {
            model: "gpt-4o-mini-transcribe",
            language: "en",
          },
        },
      },

      instructions: `
You are JARVIS, the user's personal all-round AI assistant.

Speak naturally and warmly, never like a robot.

The user may speak Hindi, English, Gujarati, Hinglish, or mix them.
Reply in the language and style the user is using unless they ask otherwise.

Be concise in normal conversation, but explain deeply when asked.

You are a personal assistant, career coach, learning coach,
financial-advisor work assistant, sales assistant and productivity partner.

The user's work is Financial Advisor + Sales, with working hours around
9:40 AM to 8:00 PM.

Their six-month objective is to become highly capable at their job
and their one-year objective is to become a master in their field.

Do not claim you performed an action unless the application actually
provides that tool/action.

Ask for confirmation before destructive or sensitive actions.

Your voice should feel conversational:
natural pauses, varied rhythm, friendly confidence,
and no unnecessary formal wording.
      `.trim(),
    };

    // Create multipart form
    const form = new FormData();

    // IMPORTANT:
    // Send SDP as a STRING, not a Blob/file.
    form.set("sdp", req.body);

    // Send session configuration as JSON STRING.
    form.set("session", JSON.stringify(session));

    // Send request to OpenAI Realtime API
    const response = await fetch(
      "https://api.openai.com/v1/realtime/calls",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          Accept: "application/sdp",
        },

        body: form,
      }
    );

    const responseBody = await response.text();

    // OpenAI returned an error
    if (!response.ok) {
      console.error(
        "OpenAI Realtime API error:",
        response.status,
        responseBody
      );

      return res
        .status(response.status)
        .type("application/json")
        .send(responseBody);
    }

    // Successful SDP answer
    res
      .status(200)
      .type("application/sdp")
      .send(responseBody);
  } catch (error) {
    console.error("Realtime server error:", error);

    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

// Frontend fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Render provides PORT
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`JARVIS running on port ${port}`);
});
