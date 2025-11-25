import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI as GoogleGenerativeAI} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server ready on http://localhost:${PORT}`);
});

app.post('/api/chat', async (req, res) => {
    const { history, message } = req.body;
    try {
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({ result: text });
    } catch (e) {
        res.status(500).json({ error: `Something went wrong: ${e.message}` });
    }
});
