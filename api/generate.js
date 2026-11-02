// Vercel serverless function: sends the prompt (and optional images) to Google Gemini (free tier) and returns the JSON letter.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const need = process.env.APP_PASSWORD;
  if (need && req.headers['x-app-password'] !== need) return res.status(401).json({ error: 'Password galat hai.' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY Vercel me set nahi hai.' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const prompt = String(body.prompt || '');
  const images = Array.isArray(body.images) ? body.images.slice(0, 5) : [];
  if (!prompt) return res.status(400).json({ error: 'Prompt khali hai.' });

  const parts = images.map((data) => ({ inline_data: { mime_type: 'image/jpeg', data: String(data) } }));
  parts.push({ text: prompt });

  const models = [process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-flash-latest'].filter(Boolean);
  let lastErr = 'Draft nahi ban paya. Dobara try karo.';

  for (const model of models) {
    try {
      const r = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
          }),
        }
      );
      const j = await r.json();
      if (!r.ok) {
        lastErr = (j.error && j.error.message) || lastErr;
        if (r.status === 404 || r.status === 400) continue; // try the next model name
        if (r.status === 429) return res.status(429).json({ error: 'Free limit khatam. Thodi der baad try karo.' });
        break;
      }
      const text = ((j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [])
        .map((p) => p.text || '').join('');
      const a = text.indexOf('{'), b = text.lastIndexOf('}');
      if (a < 0 || b < a) { lastErr = 'Draft samajh nahi aaya. Dobara try karo.'; break; }
      return res.status(200).json(JSON.parse(text.slice(a, b + 1)));
    } catch (e) {
      lastErr = 'Draft nahi ban paya. Dobara try karo.';
      break;
    }
  }
  return res.status(502).json({ error: lastErr });
};
