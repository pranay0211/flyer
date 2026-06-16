# WENY AI Flyer Generator

A Render-ready flyer generator for WENY Nutrition Morning Wellness Club.

## Key idea
GPT generates only the premium background/template. Uploaded coach photos are placed by the web app on top, so faces remain real and are not redrawn by AI.

## Local run
```bash
npm install
npm start
```
Open http://localhost:3000

## Render deployment
1. Push this folder to GitHub.
2. In Render, create a new Web Service.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variable:
   - `OPENAI_API_KEY=your_key`
   - Optional: `OPENAI_IMAGE_MODEL=gpt-image-1`

Without API key, the CSS flyer still works and can be downloaded.

## Daily use
1. Enter date, time, trainer names and topic.
2. Upload EMCEE, workout trainer, and knowledge speaker photos.
3. Optional: Generate AI background.
4. Download PNG.
