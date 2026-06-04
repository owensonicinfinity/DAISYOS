/* ============================================================================
   DaisyAI - Gemini-powered assistant
   ============================================================================ */
const DaisyAI = {
    apiKey: '',
    settings: {},
    
    init(apiKey, settings) {
        this.apiKey = apiKey;
        this.settings = settings;
        console.log('🤖 DaisyAI initialized');
        this.addIndicator();
        if (settings.daisyAutonomous) {
            this.startListening();
        }
    },
    
    addIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'daisy-ai-indicator';
        indicator.innerHTML = '<span class="pulse-dot"></span> DaisyAI Online';
        indicator.id = 'daisyIndicator';
        document.body.appendChild(indicator);
    },
    
    startListening() {
        // Voice recognition for wake word
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
                if (transcript.includes(this.settings.daisyWakeWord.toLowerCase())) {
                    this.respond(transcript);
                }
            };
            recognition.start();
        }
    },
    
    async respond(query) {
        if (!this.apiKey) {
            console.log('DaisyAI: No API key configured');
            return;
        }
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are DaisyAI, the assistant for DaisyOS ecosystem. User query: ${query}`
                        }]
                    }]
                })
            });
            const data = await response.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I heard you.';
            this.speak(reply);
        } catch(e) {
            console.log('DaisyAI: Offline mode');
        }
    },
    
    speak(text) {
        if (this.settings.daisyVoice && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            speechSynthesis.speak(utterance);
        }
    }
};
window.DaisyAI = DaisyAI;