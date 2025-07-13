// --- State Management ---
let audioContext;
let gainNode;
let audioQueue = [];
let isPlaying = false;
let currentLanguage = 'ES'; // Default to Spanish
let volume = 1.0;

// --- Audio Processing ---

function initAudio() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            gainNode.gain.value = volume;
            gainNode.connect(audioContext.destination);
            console.log('Audio context initialized.');
        } catch (e) {
            console.error('Web Audio API is not supported.', e);
        }
    }
}

function setVolume(vol) {
    volume = vol;
    if (gainNode) {
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    }
}

// Placeholder for client-side transcription using ONNX
async function transcribeClientSide(wavAudio) {
    // In a real implementation, you would use onnxruntime-web here.
    // For now, we'll continue to use the server for transcription.
    console.log("Using server for transcription as client-side is a placeholder.");
    const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'audio/wav' },
        body: wavAudio
    });
    if (!response.ok) throw new Error('Transcription failed');
    const result = await response.json();
    return result.text;
}

// Main handler for incoming audio data from the WebRTC data channel
async function handleAudioData(rawAudioData) {
    if (!audioContext) initAudio();

    try {
        // The data is raw PCM, so we wrap it in a WAV header
        const wavAudio = audioBufferToWav(rawAudioData, 48000);

        // 1. Transcribe (using placeholder which calls the server)
        const transcribedText = await transcribeClientSide(wavAudio);
        if (!transcribedText || transcribedText.trim().length < 2) return;

        // 2. Translate Text via Server
        const translationResponse = await fetch('http://localhost:8000/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: transcribedText, targetLang: currentLanguage })
        });
        if (!translationResponse.ok) throw new Error('Translation failed');
        const { translatedText } = await translationResponse.json();

        // 3. Synthesize Speech via Server (receives a stream)
        const synthesisResponse = await fetch('http://localhost:8000/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: translatedText })
        });
        if (!synthesisResponse.ok) throw new Error('Speech synthesis failed');
        
        // The response is a stream. We read it chunk by chunk.
        const audioStream = synthesisResponse.body;
        audioQueue.push(audioStream);
        if (!isPlaying) {
            playNextInQueue();
        }

    } catch (error) {
        console.error('Error in audio processing pipeline:', error);
    }
}

// Plays the next audio stream from the queue
async function playNextInQueue() {
    if (audioQueue.length === 0) {
        isPlaying = false;
        return;
    }

    isPlaying = true;
    const stream = audioQueue.shift();
    const reader = stream.getReader();
    let audioChunks = [];

    // Read the stream into memory
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        audioChunks.push(value);
    }

    // Once the stream is fully read, decode and play it
    const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
    const audioData = await audioBlob.arrayBuffer();

    audioContext.decodeAudioData(audioData, (buffer) => {
        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.connect(gainNode);
        sourceNode.onended = playNextInQueue; // Play next when this one finishes
        sourceNode.start();
    }, (error) => {
        console.error('Error decoding audio data:', error);
        playNextInQueue(); // Try next item
    });
}

// --- Utility Functions ---

function audioBufferToWav(buffer, sampleRate) {
    const numOfChan = 1, bytesPerSample = 2, blockAlign = numOfChan * bytesPerSample;
    const byteRate = sampleRate * blockAlign, dataSize = buffer.byteLength;
    const wavBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(wavBuffer);
    view.setUint32(0, 0x52494646, false); // 'RIFF'
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false); // 'WAVE'
    view.setUint32(12, 0x666d7420, false); // 'fmt '
    view.setUint32(16, 16, true); // Sub-chunk size
    view.setUint16(20, 1, true); // Audio format (PCM)
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true); // Bits per sample
    view.setUint32(36, 0x64617461, false); // 'data'
    view.setUint32(40, dataSize, true);
    new Uint8Array(wavBuffer, 44).set(new Uint8Array(buffer));
    return wavBuffer;
    view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return newBuffer;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Placeholder for audio data decryption
// This function should be replaced with the actual decryption logic.
// It currently returns the data unmodified.
async function decryptAudioData(encryptedData) {
    // TODO: Implement the actual decryption logic here.
    // For now, we'll just return the data as is.
    console.warn('Audio decryption is not implemented. Returning raw data.');
    return encryptedData;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'audioData':
            handleAudioData(message.data);
            break;
            
        case 'languageChange':
            currentLanguage = message.language;
            break;
            
        case 'volumeChange':
            volume = message.volume;
            setVolume(volume);
            break;
    }
});
