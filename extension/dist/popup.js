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

/***/ "./popup.js":
/*!******************!*\
  !*** ./popup.js ***!
  \******************/
/***/ (() => {

eval("{document.addEventListener('DOMContentLoaded', () => {\r\n    const connectButton = document.getElementById('connectButton');\r\n    const statusIndicator = document.getElementById('connectionStatus');\r\n    const statusText = document.getElementById('statusText');\r\n    const languageSelect = document.getElementById('languageSelect');\r\n    const volumeSlider = document.getElementById('volumeSlider');\r\n    const volumeValue = document.getElementById('volumeValue');\r\n\r\n    // Get initial state\r\n    chrome.runtime.sendMessage({ type: 'getState' }, (response) => {\r\n        if (response.connected) {\r\n            updateConnectionStatus(true);\r\n        }\r\n        languageSelect.value = response.language || 'en';\r\n        volumeSlider.value = response.volume || 100;\r\n        volumeValue.textContent = `${volumeSlider.value}%`;\r\n    });\r\n\r\n    // Connect/Disconnect button\r\n    connectButton.addEventListener('click', () => {\r\n        if (connectButton.textContent === 'Connect') {\r\n            chrome.runtime.sendMessage({ type: 'connect' }, (response) => {\r\n                if (response.success) {\r\n                    updateConnectionStatus(true);\r\n                }\r\n            });\r\n        } else {\r\n            chrome.runtime.sendMessage({ type: 'disconnect' }, (response) => {\r\n                if (response.success) {\r\n                    updateConnectionStatus(false);\r\n                }\r\n            });\r\n        }\r\n    });\r\n\r\n    // Language selection\r\n    languageSelect.addEventListener('change', () => {\r\n        chrome.runtime.sendMessage({\r\n            type: 'setLanguage',\r\n            language: languageSelect.value\r\n        });\r\n    });\r\n\r\n    // Volume control\r\n    volumeSlider.addEventListener('input', () => {\r\n        volumeValue.textContent = `${volumeSlider.value}%`;\r\n        chrome.runtime.sendMessage({\r\n            type: 'setVolume',\r\n            volume: parseInt(volumeSlider.value)\r\n        });\r\n    });\r\n\r\n    function updateConnectionStatus(connected) {\r\n        statusIndicator.classList.toggle('connected', connected);\r\n        statusText.textContent = connected ? 'Connected' : 'Disconnected';\r\n        connectButton.textContent = connected ? 'Disconnect' : 'Connect';\r\n    }\r\n});\r\n\n\n//# sourceURL=webpack://whisperplay-extension/./popup.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./popup.js"]();
/******/ 	
/******/ })()
;