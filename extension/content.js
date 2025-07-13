// Audio context and nodes
let audioContext = null;
let gainNode = null;
let currentLanguage = 'en';
let volume = 100;

// Initialize audio context
function initAudioContext() {
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    setVolume(volume);
}

// Set audio volume (0-100)
function setVolume(value) {
    if (gainNode) {
        gainNode.gain.value = value / 100;
    }
}

// Handle decrypted audio data
async function handleAudioData(encryptedData) {
    if (!audioContext) {
        initAudioContext();
    }

    try {
        // Decrypt audio data (implementation depends on encryption method used)
        const decryptedData = await decryptAudioData(encryptedData);
        
        // Convert decrypted data to AudioBuffer
        const audioBuffer = await audioContext.decodeAudioData(decryptedData);
        
        if (currentLanguage === 'en') {
            // Play original audio
            playAudioBuffer(audioBuffer);
        } else {
            // Process through translation pipeline
            const text = await transcribeAudio(audioBuffer);
            const translatedText = await translateText(text, currentLanguage);
            const translatedAudio = await synthesizeSpeech(translatedText, currentLanguage);
            playAudioBuffer(translatedAudio);
        }
    } catch (error) {
        console.error('Error processing audio:', error);
    }
}

// Play audio buffer
function playAudioBuffer(buffer) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    source.start();
}

// Audio transcription (using Whisper)
async function transcribeAudio(audioBuffer) {
    try {
        // Convert AudioBuffer to WAV format
        const wavData = await audioBufferToWav(audioBuffer);
        
        // Send to Whisper API
        const response = await fetch('http://localhost:8000/transcribe', {
            method: 'POST',
            body: wavData,
            headers: {
                'Content-Type': 'audio/wav'
            }
        });

        const result = await response.json();
        return result.text;
    } catch (error) {
        console.error('Transcription error:', error);
        return '';
    }
}

// Text translation using Google Cloud Translation API
async function translateText(text, targetLang) {
    try {
        const response = await fetch('http://localhost:8000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                targetLang
            })
        });

        const result = await response.json();
        return result.translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}

// Speech synthesis using a server-side endpoint
async function synthesizeSpeech(text, language) {
    try {
        const response = await fetch('http://localhost:8000/synthesize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                language
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    } catch (error) {
        console.error('Speech synthesis error:', error);
        // Return a silent AudioBuffer on error to prevent breaking the chain
        return audioContext.createBuffer(1, 1, audioContext.sampleRate);
    }
}

// Utility function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2;
    const newBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(newBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, buffer.sampleRate, true);
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
