/******/ (() => { // webpackBootstrap
/*!******************!*\
  !*** ./popup.js ***!
  \******************/
document.addEventListener('DOMContentLoaded', function () {
  var connectButton = document.getElementById('connectButton');
  var statusIndicator = document.getElementById('connectionStatus');
  var statusText = document.getElementById('statusText');
  var languageSelect = document.getElementById('languageSelect');
  var volumeSlider = document.getElementById('volumeSlider');
  var volumeValue = document.getElementById('volumeValue');

  // Get initial state
  chrome.runtime.sendMessage({
    type: 'getState'
  }, function (response) {
    if (response.connected) {
      updateConnectionStatus(true);
    }
    languageSelect.value = response.language || 'en';
    volumeSlider.value = response.volume || 100;
    volumeValue.textContent = "".concat(volumeSlider.value, "%");
  });

  // Connect/Disconnect button
  connectButton.addEventListener('click', function () {
    if (connectButton.textContent === 'Connect') {
      chrome.runtime.sendMessage({
        type: 'connect'
      }, function (response) {
        if (response.success) {
          updateConnectionStatus(true);
        }
      });
    } else {
      chrome.runtime.sendMessage({
        type: 'disconnect'
      }, function (response) {
        if (response.success) {
          updateConnectionStatus(false);
        }
      });
    }
  });

  // Language selection
  languageSelect.addEventListener('change', function () {
    chrome.runtime.sendMessage({
      type: 'setLanguage',
      language: languageSelect.value
    });
  });

  // Volume control
  volumeSlider.addEventListener('input', function () {
    volumeValue.textContent = "".concat(volumeSlider.value, "%");
    chrome.runtime.sendMessage({
      type: 'setVolume',
      volume: parseInt(volumeSlider.value)
    });
  });
  function updateConnectionStatus(connected) {
    statusIndicator.classList.toggle('connected', connected);
    statusText.textContent = connected ? 'Connected' : 'Disconnected';
    connectButton.textContent = connected ? 'Disconnect' : 'Connect';
  }
});
/******/ })()
;
//# sourceMappingURL=popup.js.map