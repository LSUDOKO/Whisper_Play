const express = require('express');
const cors = require('cors');
const { execFile } = require('child_process');
const multer = require('multer');
const { Translate } = require('@google-cloud/translate').v2;
const path = require('path');
const fs = require('fs').promises;

const app = express();
const upload = multer({ dest: 'uploads/' });
const translate = new Translate();

app.use(cors());
app.use(express.json());

// Whisper transcription endpoint
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        const inputPath = req.file.path;
        const outputPath = `${inputPath}.txt`;

        // Using faster-whisper for real-time transcription
        await new Promise((resolve, reject) => {
            execFile('faster-whisper', [
                '--model', 'small',
                '--device', 'cuda',
                '--output_format', 'txt',
                '--output_dir', path.dirname(outputPath),
                inputPath
            ], (error, stdout, stderr) => {
                if (error) reject(error);
                else resolve(stdout);
            });
        });

        const text = await fs.readFile(outputPath, 'utf8');
        
        // Cleanup
        await Promise.all([
            fs.unlink(inputPath),
            fs.unlink(outputPath)
        ]);

        res.json({ text });
    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ error: 'Transcription failed' });
    }
});

// Translation endpoint
app.post('/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        const [translation] = await translate.translate(text, targetLang);
        res.json({ translatedText: translation });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
