import express from "express";
import multer from "multer";
import OpenAI, { toFile } from "openai";

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

app.get("/api/health", (req, res) => res.json({ ok: true }));

function buildPrompt(body) {
  return `
Create a premium A4 portrait promotional flyer for WENY NUTRITION.

Brand:
WENY NUTRITION
Mind • Body • Soul
Morning Wellness Club
Start Your Day. Transform Your Life.

Event Details:
Date: ${body.date}
Day: ${body.day}
Joining Time: ${body.joining}
Happy Hours: ${body.happy}

EMCEE:
${body.emceeName}

Workout Trainer:
${body.workoutName}
Workout Type: ${body.workoutType}

Knowledge Session By:
${body.knowledgeName}
Knowledge Topic:
${body.topic}

Design Style:
Create a stylish flyer like a premium wellness brand.
It should be attractive for customers to join.
Use strong modern typography, sunrise energy, botanical wellness elements, beautiful cards, icons, premium shadows, and clear readable layout.
Use the workout type and knowledge topic to decide the creative theme automatically.

Important Photo Instructions:
Use the uploaded coach photos as exact real people.
Do not change face, skin tone, age, hairstyle, body, clothing, pose, or expression.
Do not create AI-looking faces.
Only clean/remove background if needed and blend into premium flyer cards.
The people must remain clearly recognizable.

Layout:
A4 portrait.
Top: WENY Nutrition branding and Morning Wellness Club.
Hero: powerful motivational headline.
Middle: date, time, happy hours, emcee.
Coach cards: EMCEE, WORKOUT TRAINER, KNOWLEDGE SESSION.
Topic highlight section for ${body.topic}.
Benefits section.
Footer call to action.

Text must be spelled exactly.
No fake names.
No duplicated coach names.
No clutter.
No PowerPoint look.
No generic Canva template.
Make it look like a professional ₹50,000 designer flyer.
`;
}

app.post(
  "/api/generate-flyer",
  upload.fields([
    { name: "reference", maxCount: 1 },
    { name: "emceePhoto", maxCount: 1 },
    { name: "workoutPhoto", maxCount: 1 },
    { name: "knowledgePhoto", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ error: "OPENAI_API_KEY is missing on Render." });
      }

      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const files = [];

      const addFile = async (field, label) => {
        const file = req.files?.[field]?.[0];
        if (!file) return;
        files.push(
          await toFile(file.buffer, `${label}.png`, {
            type: file.mimetype || "image/png"
          })
        );
      };

      await addFile("reference", "reference-style");
      await addFile("emceePhoto", "emcee-dipa-kansara");
      await addFile("workoutPhoto", "workout-trainer");
      await addFile("knowledgePhoto", "knowledge-speaker");

      if (files.length < 3) {
        return res.status(400).json({
          error: "Please upload at least 3 coach photos."
        });
      }

      const prompt = buildPrompt(req.body);

      const result = await client.images.edit({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
        image: files,
        prompt,
        size: "1024x1536",
        quality: "high"
      });

      const b64 = result.data?.[0]?.b64_json;
      if (!b64) {
        return res.status(500).json({ error: "No flyer returned from OpenAI." });
      }

      res.json({
        image: `data:image/png;base64,${b64}`
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: err?.message || "Flyer generation failed."
      });
    }
  }
);

app.listen(port, () => {
  console.log(`WENY AI flyer app running on port ${port}`);
});
