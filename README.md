# Draft Shelf (Vercel)

Drafts + "Patra banao" (Hinglish/image se Mohla format ka .docx). AI: Google Gemini (free).

## Deploy
1. Free key lo: aistudio.google.com > Get API key.
2. Folder ko GitHub repo me daalo, ya terminal me: `npm i -g vercel` phir `vercel`.
3. Vercel > Project > Settings > Environment Variables:
   - `GEMINI_API_KEY`  (zaroori)
   - `APP_PASSWORD`    (koi bhi password, taaki doosre aapki key use na kar sakein)
   - `GEMINI_MODEL`    (optional)
4. Redeploy karo.

## Dhyan do
- Drafts usi browser me save hote hain (localStorage).
- Free tier ki limit Google tay karta hai.
