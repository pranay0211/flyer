import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/generate-background', upload.none(), async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    }

    const theme = req.body.theme || 'surprise premium wellness';
    const prompt = `Create an ultra premium A4 portrait flyer BACKGROUND ONLY for WENY NUTRITION Morning Wellness Club. Theme: ${theme}. No people, no faces, no portraits, no text except subtle abstract wellness graphics if needed. Include elegant empty areas for top header, hero, info card, three coach photo cards, benefits and footer. Premium Indian wellness brand, modern editorial design, clean, high-end, WhatsApp readable, rich gradients, glass cards, leaves/sunrise/fitness accents. IMPORTANT: leave central areas clean because HTML text and real uploaded photos will be overlaid later. Do not draw fake photo frames with names; only beautiful background panels and decorative accents.`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
    const result = await client.images.generate({
      model,
      prompt,
      size: '1024x1536',
      quality: 'medium'
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) return res.status(500).json({ error: 'No image returned from OpenAI.' });
    res.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Background generation failed.' });
  }
});

app.listen(port, () => console.log(`WENY flyer generator running on :${port}`));
