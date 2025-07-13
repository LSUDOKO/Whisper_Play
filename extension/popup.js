document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    const languageSelect = document.getElementById('languageSelect');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const themeToggle = document.getElementById('theme-toggle');

    // --- Theme Management ---
    const applyTheme = (isDarkMode) => {
        themeToggle.checked = isDarkMode;
        document.documentElement.classList.toggle('dark-mode', isDarkMode);
    };

    chrome.storage.sync.get('darkMode', ({ darkMode }) => {
        applyTheme(darkMode);
    });

    themeToggle.addEventListener('change', () => {
        const isDarkMode = themeToggle.checked;
        chrome.storage.sync.set({ darkMode: isDarkMode });
        applyTheme(isDarkMode);
    });

    // --- Get Initial State ---
    chrome.runtime.sendMessage({ type: 'getState' }, (response) => {
        if (!response) return;

        updateConnectionStatus(response.connected);

        const lang = response.language || 'en';
        const langRadioButton = document.querySelector(`.language-options input[value="${lang}"]`);
        if (langRadioButton) {
            langRadioButton.checked = true;
        }

        volumeSlider.value = response.volume || 100;
        volumeValue.textContent = `${volumeSlider.value}%`;
    });

    // --- Event Listeners ---
    connectButton.addEventListener('click', () => {
        const isConnecting = connectButton.textContent === 'Connect';
        const messageType = isConnecting ? 'connect' : 'disconnect';

        chrome.runtime.sendMessage({ type: messageType }, (response) => {
            if (response && response.success) {
                updateConnectionStatus(isConnecting);
            }
        });
    });

    languageSelect.addEventListener('change', (event) => {
        if (event.target.name === 'language') {
            chrome.runtime.sendMessage({
                type: 'setLanguage',
                language: event.target.value
            });
        }
    });

    volumeSlider.addEventListener('input', () => {
        volumeValue.textContent = `${volumeSlider.value}%`;
        chrome.runtime.sendMessage({
            type: 'setVolume',
            volume: parseInt(volumeSlider.value)
        });
    });

    // --- Helper Functions ---
    function updateConnectionStatus(connected) {
        statusIndicator.classList.toggle('connected', connected);
        statusText.textContent = connected ? 'Connected' : 'Disconnected';
        connectButton.textContent = connected ? 'Disconnect' : 'Connect';
    }
});
