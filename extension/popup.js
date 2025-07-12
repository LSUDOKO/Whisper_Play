document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    const languageSelect = document.getElementById('languageSelect');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');

    // Get initial state
    chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
        if (response.connected) {
            updateConnectionStatus(true);
        }
        languageSelect.value = response.language || 'en';
        volumeSlider.value = response.volume || 100;
        volumeValue.textContent = `${volumeSlider.value}%`;
    });

    // Connect/Disconnect button
    connectButton.addEventListener('click', () => {
        if (connectButton.textContent === 'Connect') {
            chrome.runtime.sendMessage({ type: 'connect' }, (response) => {
                if (response.success) {
                    updateConnectionStatus(true);
                }
            });
        } else {
            chrome.runtime.sendMessage({ type: 'disconnect' }, (response) => {
                if (response.success) {
                    updateConnectionStatus(false);
                }
            });
        }
    });

    // Language selection
    languageSelect.addEventListener('change', () => {
        chrome.runtime.sendMessage({
            type: 'setLanguage',
            language: languageSelect.value
        });
    });

    // Volume control
    volumeSlider.addEventListener('input', () => {
        volumeValue.textContent = `${volumeSlider.value}%`;
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
