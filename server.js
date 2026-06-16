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

function clean(value) {
  return String(value || "").trim();
}

function buildPrompt(body) {
  const theme = clean(body.theme) || "Surprise premium wellness";
  const date = clean(body.date);
  const day = clean(body.day);
  const joining = clean(body.joining);
  const happy = clean(body.happy);
  const emceeName = clean(body.emceeName);
  const workoutName = clean(body.workoutName);
  const workoutType = clean(body.workoutType);
  const knowledgeName = clean(body.knowledgeName);
  const topic = clean(body.topic);

  return `
You are one of the world's best creative directors, editorial designers, advertising designers, branding experts and marketing visual designers.

Create a complete PREMIUM, HIGH-END, WHATSAPP READY A4 PORTRAIT FLYER for WENY NUTRITION.

BRAND:
WENY NUTRITION
Mind • Body • Soul
Morning Wellness Club
Start Your Day. Transform Your Life.

EVENT DETAILS:
Date: ${date}
Day: ${day}
Joining Time: ${joining}
Happy Hours Time: ${happy}

TEAM DETAILS:
EMCEE: ${emceeName}
Workout Trainer: ${workoutName}
Workout Type: ${workoutType}
Knowledge Session By: ${knowledgeName}
Knowledge Session Topic: ${topic}

SELECTED CREATIVE THEME:
${theme}

REFERENCE IMAGE INSTRUCTIONS:
If a reference flyer image is uploaded, use it ONLY for creative inspiration: boldness, premium feel, energy, composition style, visual excitement.
Do NOT copy the exact design.
Create a fresh original flyer for WENY Nutrition.

PHOTO INSTRUCTIONS - EXTREMELY IMPORTANT:
The uploaded coach photos are real people.
Use the exact uploaded people.
Do NOT recreate faces.
Do NOT beautify faces.
Do NOT change facial structure.
Do NOT change hairstyle.
Do NOT change clothing.
Do NOT change body shape.
Do NOT change skin tone.
Do NOT change age.
Do NOT change expression.
Do NOT make AI-looking faces.
Only remove background if needed, improve lighting/sharpness/contrast, add soft shadow/rim light, and blend them naturally into the flyer.
The people must remain clearly recognizable.

CREATIVE DIRECTION:
Make the flyer stylish, exciting, premium, customer-attracting, and professional.
The flyer should make people stop scrolling on WhatsApp and feel like joining immediately.
Avoid boring corporate design.
Avoid PowerPoint look.
Avoid generic Canva template.
Avoid clutter.
Use strong visual hierarchy.
Use modern typography.
Use premium gradients.
Use beautiful lighting.
Use wellness, fitness, nutrition and community energy.
Use premium cards, ribbons, depth, shadows, icons and creative shapes.

AUTO-ADAPTATION:
Creatively adapt the complete design to the workout type and knowledge topic.
For workout type "${workoutType}", show movement, fitness, energy, body activation, strength and healthy morning energy.
For topic "${topic}", create matching premium illustrations and visual cues related to the topic.
For Essential Minerals, use elegant mineral/nutrition visuals such as calcium, magnesium, zinc, iron, healthy foods, bones, energy and nourishment.

LAYOUT REQUIREMENTS:
A4 portrait poster composition.
Top: WENY NUTRITION brand + Morning Wellness Club.
Hero: powerful motivational headline.
Middle: premium event info card showing date, day, joining time and happy hours.
Coach section: three premium coach cards with real uploaded photos.
Card 1: EMCEE - ${emceeName}
Card 2: WORKOUT TRAINER - ${workoutName} - Workout Type: ${workoutType}
Card 3: KNOWLEDGE SESSION - ${knowledgeName} - Topic: ${topic}
Add a highlighted knowledge/topic section.
Add benefit icons such as Fitness, Energy, Learning, Positive Mindset, Healthy Community.
Footer: strong call to action.

TEXT RULES:
Use only supplied names and supplied event data.
Do not invent names.
Do not duplicate names.
Do not swap coach names.
Keep spelling exactly:
${emceeName}
${workoutName}
${knowledgeName}
${topic}

QUALITY TARGET:
Looks like a ₹50,000 professional graphic designer flyer.
Premium advertising agency quality.
Ultra sharp.
A4 portrait.
High resolution.
Social media ready.
WhatsApp readable.
Modern, stylish, attractive and unforgettable.
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

      async function addFile(field, filename) {
        const file = req.files?.[field]?.[0];
        if (!file) return;
        files.push(
          await toFile(file.buffer, filename, {
            type: file.mimetype || "image/png"
          })
        );
      }

      await addFile("reference", "reference-style.png");
      await addFile("emceePhoto", "emcee-photo.png");
      await addFile("workoutPhoto", "workout-trainer-photo.png");
      await addFile("knowledgePhoto", "knowledge-speaker-photo.png");

      const hasAllCoachPhotos =
        req.files?.emceePhoto?.[0] &&
        req.files?.workoutPhoto?.[0] &&
        req.files?.knowledgePhoto?.[0];

      if (!hasAllCoachPhotos) {
        return res.status(400).json({ error: "Please upload all 3 coach photos." });
      }

      const prompt = buildPrompt(req.body);
      const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

      const result = await client.images.edit({
        model,
        image: files,
        prompt,
        size: "1024x1536",
        quality: "high"
      });

      const b64 = result.data?.[0]?.b64_json;
      if (!b64) {
        return res.status(500).json({ error: "No flyer returned from OpenAI." });
      }

      res.json({ image: `data:image/png;base64,${b64}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err?.message || "Flyer generation failed." });
    }
  }
);

app.listen(port, () => console.log(`WENY AI flyer app running on port ${port}`));
