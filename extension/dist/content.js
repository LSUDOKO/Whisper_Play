/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./content.js":
/*!********************!*\
  !*** ./content.js ***!
  \********************/
/***/ (() => {

eval("{// Audio context and nodes\r\nlet audioContext = null;\r\nlet gainNode = null;\r\nlet currentLanguage = 'en';\r\nlet volume = 100;\r\n\r\n// Initialize audio context\r\nfunction initAudioContext() {\r\n    audioContext = new AudioContext();\r\n    gainNode = audioContext.createGain();\r\n    gainNode.connect(audioContext.destination);\r\n    setVolume(volume);\r\n}\r\n\r\n// Set audio volume (0-100)\r\nfunction setVolume(value) {\r\n    if (gainNode) {\r\n        gainNode.gain.value = value / 100;\r\n    }\r\n}\r\n\r\n// Handle decrypted audio data\r\nasync function handleAudioData(encryptedData) {\r\n    if (!audioContext) {\r\n        initAudioContext();\r\n    }\r\n\r\n    try {\r\n        // Decrypt audio data (implementation depends on encryption method used)\r\n        const decryptedData = await decryptAudioData(encryptedData);\r\n        \r\n        // Convert decrypted data to AudioBuffer\r\n        const audioBuffer = await audioContext.decodeAudioData(decryptedData);\r\n        \r\n        if (currentLanguage === 'en') {\r\n            // Play original audio\r\n            playAudioBuffer(audioBuffer);\r\n        } else {\r\n            // Process through translation pipeline\r\n            const text = await transcribeAudio(audioBuffer);\r\n            const translatedText = await translateText(text, currentLanguage);\r\n            const translatedAudio = await synthesizeSpeech(translatedText, currentLanguage);\r\n            playAudioBuffer(translatedAudio);\r\n        }\r\n    } catch (error) {\r\n        console.error('Error processing audio:', error);\r\n    }\r\n}\r\n\r\n// Play audio buffer\r\nfunction playAudioBuffer(buffer) {\r\n    const source = audioContext.createBufferSource();\r\n    source.buffer = buffer;\r\n    source.connect(gainNode);\r\n    source.start();\r\n}\r\n\r\n// Audio transcription (using Whisper)\r\nasync function transcribeAudio(audioBuffer) {\r\n    // TODO: Implement Whisper transcription\r\n    // This is a placeholder\r\n    return \"Transcribed text\";\r\n}\r\n\r\n// Text translation\r\nasync function translateText(text, targetLang) {\r\n    // TODO: Implement translation service\r\n    // This is a placeholder\r\n    return \"Translated text\";\r\n}\r\n\r\n// Speech synthesis\r\nasync function synthesizeSpeech(text, language) {\r\n    // TODO: Implement TTS\r\n    // This is a placeholder\r\n    return audioContext.createBuffer(1, 1, 44100); // Empty buffer for now\r\n}\r\n\r\n// Decrypt audio data\r\nasync function decryptAudioData(encryptedData) {\r\n    // TODO: Implement decryption\r\n    // This is a placeholder\r\n    return new ArrayBuffer(0);\r\n}\r\n\r\n// Listen for messages from background script\r\nchrome.runtime.onMessage.addListener((message, sender, sendResponse) => {\r\n    switch (message.type) {\r\n        case 'audioData':\r\n            handleAudioData(message.data);\r\n            break;\r\n            \r\n        case 'languageChange':\r\n            currentLanguage = message.language;\r\n            break;\r\n            \r\n        case 'volumeChange':\r\n            volume = message.volume;\r\n            setVolume(volume);\r\n            break;\r\n    }\r\n});\r\n\n\n//# sourceURL=webpack://whisperplay-extension/./content.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./content.js"]();
/******/ 	
/******/ })()
;