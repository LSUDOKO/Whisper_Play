# WhisperPlay
**Real-time “Silent Disco” with Live Language Toggle for Any Stream**

---

## Inspiration
Late-night streamers often mute their mics to avoid waking family, making chat the only way to follow the action. Non-English viewers, meanwhile, rely on slow, post-stream captions. We wanted to give every viewer **instant, private audio**—in **any language**—without forcing creators to change their setup.

---

## What it does
WhisperPlay is a **browser extension + local server** combo that:

1.  Captures a creator’s mic audio (or any tab's audio) locally.
2.  Transmits it over an encrypted WebRTC data channel directly from an audio source to the viewer's browser.
3.  Lets each viewer **toggle** between live AI-translated dubs in different languages.

All processing happens with **< 1.5s latency**, and the architecture ensures privacy and performance.

---

## Getting Started

### Prerequisites
*   Google Chrome
*   Python 3.9+
*   An environment that can run PyTorch (for the Whisper model)

### API Keys
You will need API keys from the following services:
*   [**DeepL API**](https://www.deepl.com/pro-api) (for translation)
*   [**ElevenLabs API**](https://elevenlabs.io/) (for text-to-speech)

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd WhisperPlay/server
    ```

2.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Set Environment Variables:**
    Set your API keys in your terminal session before running the server. 
    *On Windows (PowerShell):*
    ```powershell
    $env:DEEPL_API_KEY="your_deepl_key_here"
    $env:ELEVEN_API_KEY="your_elevenlabs_key_here"
    ```
    *On macOS/Linux:*
    ```bash
    export DEEPL_API_KEY="your_deepl_key_here"
    export ELEVEN_API_KEY="your_elevenlabs_key_here"
    ```

### Frontend Setup

1.  Open Google Chrome and navigate to `chrome://extensions`.
2.  Enable **“Developer mode”** using the toggle in the top-right corner.
3.  Click **“Load unpacked”**.
4.  Select the `WhisperPlay/extension` folder from the project directory.

---

## Usage

1.  **Start the Signaling Server:**
    This server manages the initial WebRTC connection.
    ```bash
    # In the /server directory
    python signaling_server.py
    ```

2.  **Start the AI Server:**
    This server handles transcription, translation, and speech synthesis.
    ```bash
    # In a new terminal, in the /server directory
    python server.py
    ```

3.  **Use the Extension:**
    *   Open a browser tab with audio you want to translate (e.g., a YouTube video).
    *   Click the WhisperPlay icon in your browser's toolbar.
    *   Click **"Connect"**. The status should change to "Connected."
    *   Select your desired language.
    *   The translated audio will begin playing automatically.

---

## How We Built It

| Component | Tech Stack |
|-----------|------------|
| **Signaling** | Python `websockets` |
| **Backend** | Python, Flask, WebRTC |
| **Browser Extension** | Manifest V3, Web Audio API, WebRTC |
| **Speech-to-Text** | OpenAI Whisper `tiny` model |
| **Translation** | DeepL API |
| **Text-to-Speech** | ElevenLabs Streaming API |
| **UI** | HTML, CSS, JavaScript |

**Architecture Flow:**

`Audio Source Tab → WebRTC → Extension → AI Server (Transcribe/Translate/Synthesize) → Translated Audio → Headphones`

---

## Challenges We Ran Into
- **Sub-second TTS**: ElevenLabs streaming was key to reducing round-trip latency.
- **WebRTC in Extensions**: Service workers don’t natively support WebRTC, requiring a signaling server and careful state management between the popup, background, and content scripts.
- **API Rate-Limits**: The current implementation is for demo purposes; a production version would need caching and graceful fallbacks.

---

## What's Next for WhisperPlay
- **Client-Side Transcription**: Move Whisper transcription into the browser using `onnxruntime-web` to reduce server load.
- **Multi-speaker Separation**: Identify and separate game audio vs. creator voice.
- **Voice-Clone Consent Flow**: Let streamers upload an audio sample for personalized TTS.
- **Offline Mode**: Bundle a lightweight WASM-based TTS engine for when APIs are unreachable.


A real-time audio streaming and translation system with OBS plugin and browser extension.

## Components

1. OBS Plugin (`/obs-plugin`)
   - Audio capture and encryption
   - WebRTC streaming
   - Written in C++

2. Browser Extension (`/extension`)
   - Audio reception and decryption
   - Real-time translation
   - Language toggle
   - Written in JavaScript/TypeScript

3. Signaling Server (`/server`)
   - WebRTC signaling
   - Written in Node.js

## Requirements

### OBS Plugin
- CMake 3.x
- Visual Studio 2019+ (Windows)
- OBS Studio SDK
- libwebrtc
- OpenSSL

### Browser Extension
- Node.js 18.x+
- npm/yarn

### Server
- Node.js 18.x+
- npm/yarn

## Development Setup

Detailed setup instructions for each component coming soon.

## Features

- Real-time audio streaming via WebRTC
- End-to-end encryption
- Multi-language support with real-time translation
- Low latency (<200ms for audio, <1s for translation)
- Cross-platform compatibility
