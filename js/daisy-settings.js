/* ============================================================================
   DAISY SETTINGS - Gear Panel Logic
   Color themes, accessibility, voice, account
   ============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('globalSettingsBtn');
    const settingsPanel = document.getElementById('globalSettingsPanel');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const helpBtn = document.getElementById('globalHelpBtn');
    const helpPanel = document.getElementById('globalHelpPanel');
    const closeHelpBtn = document.getElementById('closeHelpBtn');

    // Toggle settings panel
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            const isHidden = settingsPanel.classList.contains('hidden');
            settingsPanel.classList.toggle('hidden');
            if (!isHidden) {
                // Closing
            } else {
                // Opening - sync UI with current settings
                syncSettingsUI();
            }
        });
    }

    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsPanel.classList.add('hidden');
        });
    }

    // Toggle help panel
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            helpPanel.classList.toggle('hidden');
        });
    }

    if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', () => {
            helpPanel.classList.add('hidden');
        });
    }

    // Color presets
    document.querySelectorAll('.color-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            const colorMap = {
                cyan: '#00f0ff', magenta: '#ff006e', lime: '#39ff14',
                purple: '#b537f2', orange: '#ff6600', pink: '#ff10f0',
                blue: '#0088ff', green: '#00ff41'
            };
            if (colorMap[color]) {
                DaisyOS.updateSetting('accentColor', colorMap[color]);
                document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('customColorInput').value = colorMap[color];
            }
        });
    });

    // Custom color
    const customColorInput = document.getElementById('customColorInput');
    if (customColorInput) {
        customColorInput.addEventListener('input', () => {
            DaisyOS.updateSetting('accentColor', customColorInput.value);
            document.querySelectorAll('.color-preset').forEach(b => b.classList.remove('active'));
        });
    }

    // Theme mode
    const themeSelect = document.getElementById('themeModeSelect');
    if (themeSelect) {
        themeSelect.value = DaisyOS.state.settings.themeMode;
        themeSelect.addEventListener('change', () => {
            DaisyOS.updateSetting('themeMode', themeSelect.value);
        });
    }

    // Font size
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeValue = document.getElementById('fontSizeValue');
    if (fontSizeSlider) {
        fontSizeSlider.value = DaisyOS.state.settings.fontSize;
        if (fontSizeValue) fontSizeValue.textContent = DaisyOS.state.settings.fontSize + 'px';
        fontSizeSlider.addEventListener('input', () => {
            const val = parseInt(fontSizeSlider.value);
            DaisyOS.updateSetting('fontSize', val);
            if (fontSizeValue) fontSizeValue.textContent = val + 'px';
        });
    }

    // Toggles
    setupToggle('highContrastToggle', 'highContrast');
    setupToggle('largeTextToggle', 'largeText');
    setupToggle('colorBlindToggle', 'colorBlind');
    setupToggle('daisyVoiceToggle', 'daisyVoice');
    setupToggle('daisyAutonomousToggle', 'daisyAutonomous');

    // Wake word
    const wakeWordInput = document.getElementById('daisyWakeWord');
    if (wakeWordInput) {
        wakeWordInput.value = DaisyOS.state.settings.daisyWakeWord;
        wakeWordInput.addEventListener('change', () => {
            DaisyOS.updateSetting('daisyWakeWord', wakeWordInput.value);
        });
    }

    // Help submit
    const submitHelpBtn = document.getElementById('submitHelpBtn');
    if (submitHelpBtn) {
        submitHelpBtn.addEventListener('click', () => {
            const message = document.getElementById('helpMessageInput').value;
            if (message.trim()) {
                alert('✅ Message sent! The Daisy team will review your feedback.');
                document.getElementById('helpMessageInput').value = '';
            }
        });
    }

    function setupToggle(elementId, settingKey) {
        const el = document.getElementById(elementId);
        if (el) {
            el.checked = DaisyOS.state.settings[settingKey];
            el.addEventListener('change', () => {
                DaisyOS.updateSetting(settingKey, el.checked);
            });
        }
    }

    function syncSettingsUI() {
        const s = DaisyOS.state.settings;
        if (themeSelect) themeSelect.value = s.themeMode;
        if (fontSizeSlider) {
            fontSizeSlider.value = s.fontSize;
            if (fontSizeValue) fontSizeValue