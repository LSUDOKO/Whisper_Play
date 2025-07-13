from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import io
import os
import tempfile
import whisper
import deepl
from elevenlabs import generate, stream, set_api_key

# --- Initialization ---

# Load API keys from environment variables
DEEPL_API_KEY = os.environ.get("DEEPL_API_KEY")
ELEVEN_API_KEY = os.environ.get("ELEVEN_API_KEY")

if not DEEPL_API_KEY:
    print("ERROR: DEEPL_API_KEY environment variable not set.")
if not ELEVEN_API_KEY:
    print("ERROR: ELEVEN_API_KEY environment variable not set.")
else:
    set_api_key(ELEVEN_API_KEY)

# Initialize DeepL Translator
try:
    translator = deepl.Translator(DEEPL_API_KEY)
    print("DeepL Translator initialized.")
except Exception as e:
    translator = None
    print(f"Error initializing DeepL: {e}")

# Load Whisper Model
print("Loading Whisper model (tiny)... This may take a moment.")
model = whisper.load_model("tiny")
print("Whisper model loaded.")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# --- API Endpoints ---

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    audio_data = request.get_data()
    if not audio_data:
        return jsonify({'error': 'No audio data received'}), 400
    
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as temp_audio_file:
        temp_audio_file.write(audio_data)
        temp_audio_file.flush()

        try:
            result = model.transcribe(temp_audio_file.name, fp16=False)
            print(f"Transcription: {result['text']}")
            return jsonify(result)
        except Exception as e:
            print(f"Error during transcription: {e}")
            return jsonify({'error': 'Transcription failed'}), 500

@app.route('/translate', methods=['POST'])
def translate_text_route():
    if not translator:
        return jsonify({'error': 'DeepL translator not initialized.'}), 500

    data = request.get_json()
    text = data.get('text')
    target_lang = data.get('targetLang', 'ES') # Default to Spanish as per DeepL's format

    if not text:
        return jsonify({'error': 'Missing text'}), 400

    try:
        # Note: DeepL uses 'EN-US' for English, 'ES' for Spanish etc.
        result = translator.translate_text(text, target_lang=target_lang)
        print(f"Translation to {target_lang}: {result.text}")
        return jsonify({'translatedText': result.text})
    except Exception as e:
        print(f"Error during translation: {e}")
        return jsonify({'error': 'Translation failed'}), 500

@app.route('/synthesize', methods=['POST'])
def synthesize_speech():
    if not ELEVEN_API_KEY:
        return jsonify({'error': 'ElevenLabs API key not set.'}), 500

    data = request.get_json()
    text = data.get('text')

    if not text:
        return jsonify({'error': 'Missing text'}), 400

    def generate_audio_stream():
        # This streams the audio directly from ElevenLabs to the client
        audio_stream = generate(
            text=text,
            voice="Rachel", # A good default voice
            model="eleven_multilingual_v2",
            stream=True
        )
        yield from audio_stream

    print(f"Starting speech synthesis stream for: '{text}'")
    return Response(generate_audio_stream(), mimetype='audio/mpeg')

if __name__ == '__main__':
    print("Starting Flask server with DeepL and ElevenLabs...")
    app.run(host='0.0.0.0', port=8000, debug=False)
