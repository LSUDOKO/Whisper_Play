from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import tempfile
import whisper
from google.cloud import translate_v2 as translate
from gtts import gTTS

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- Initialization ---
print("Loading Whisper model (tiny)... This may take a moment.")
model = whisper.load_model("tiny")
print("Whisper model loaded.")

print("Initializing Google Translate client...")
try:
    translate_client = translate.Client()
    print("Google Translate client initialized.")
except Exception as e:
    print("*****************************************************************")
    print("ERROR: Failed to initialize Google Translate client.")
    print("Please ensure you have authenticated with Google Cloud by setting")
    print("the GOOGLE_APPLICATION_CREDENTIALS environment variable.")
    print(f"Details: {e}")
    print("*****************************************************************")
    translate_client = None

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
            transcribed_text = result['text']
            print(f"Transcription: {transcribed_text}")
            return jsonify({'text': transcribed_text})
        except Exception as e:
            print(f"Error during transcription: {e}")
            return jsonify({'error': 'Transcription failed'}), 500

@app.route('/translate', methods=['POST'])
def translate_text_route():
    if not translate_client:
        return jsonify({'error': 'Translate client not initialized. Check server logs.'}), 500

    data = request.get_json()
    text = data.get('text')
    target_lang = data.get('targetLang')

    if not text or not target_lang:
        return jsonify({'error': 'Missing text or targetLang'}), 400

    try:
        result = translate_client.translate(text, target_language=target_lang)
        translated_text = result['translatedText']
        print(f"Translation to {target_lang}: {translated_text}")
        return jsonify({'translatedText': translated_text})
    except Exception as e:
        print(f"Error during translation: {e}")
        return jsonify({'error': 'Translation failed'}), 500

@app.route('/synthesize', methods=['POST'])
def synthesize_speech():
    data = request.get_json()
    text = data.get('text')
    language = data.get('language')

    if not text or not language:
        return jsonify({'error': 'Missing text or language'}), 400

    try:
        mp3_fp = io.BytesIO()
        tts = gTTS(text=text, lang=language)
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        print(f"Speech synthesis for '{text}' successful.")
        return send_file(mp3_fp, mimetype='audio/mpeg')
    except Exception as e:
        print(f"Error during speech synthesis: {e}")
        return jsonify({'error': 'Speech synthesis failed'}), 500

if __name__ == '__main__':
    print("Starting Flask server with full functionality...")
    app.run(host='0.0.0.0', port=8000, debug=False) # Debug mode can cause issues with model loading
