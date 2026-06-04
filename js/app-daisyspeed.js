/* ============================================================================
   DaisySpeed - Speed Tracking App
   ============================================================================ */
const DaisySpeedApp = {
    render(container) {
        container.innerHTML = `
            <div class="daisyspeed-app">
                <section class="hero">
                    <div class="hero-content">
                        <h2>📡 DaisySpeed</h2>
                        <p>Track the speed of ANY moving object. Vehicles, animals, bugs, aircraft.</p>
                        <div class="hero-buttons">
                            <button class="btn" onclick="DaisySpeedApp.startTracking()">Start Tracking</button>
                            <button class="btn btn-magenta" onclick="DaisySpeedApp.openHunting()">🦌 Hunting Addon</button>
                        </div>
                    </div>
                </section>

                <section class="section">
                    <h3 style="font-family:var(--font-display);color:var(--accent-primary);margin-bottom:20px;">Features</h3>
                    <div class="features-showcase" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">
                        <div class="feature-box">
                            <h3>🎯 Object Detection</h3>
                            <p>AI-powered object identification with AR overlay. Crosshair targeting system.</p>
                        </div>
                        <div class="feature-box">
                            <h3>📷 7 Camera Profiles</h3>
                            <p>Night vision, high-speed, telephoto, wide-angle, selfie, aircraft tracking.</p>
                        </div>
                        <div class="feature-box">
                            <h3>🎤 Audio Analysis</h3>
                            <p>Microphone-based wind noise detection for airspeed estimation.</p>
                        </div>
                        <div class="feature-box">
                            <h3>🦌 Wildlife Database</h3>
                            <p>10+ game animals with scat analysis, track identification, and marking detection.</p>
                        </div>
                        <div class="feature-box">
                            <h3>🗣️ DaisyAI Voice</h3>
                            <p>Hands-free operation with STT/TTS. "Daisy, track that car!"</p>
                        </div>
                        <div class="feature-box">
                            <h3>🏆 Leaderboards</h3>
                            <p>Speed records, wildlife sightings, and tracking achievements.</p>
                        </div>
                    </div>
                </section>

                <!-- Hunters Edition Promo -->
                <section class="section">
                    <div class="portfolio-banner" onclick="DaisySpeedApp.openHunting()">
                        <h3>🦌 Hunters Edition Available</h3>
                        <p>Laser tag tracking • Predictive movement • DaisyAI Hunting Guide</p>
                        <span class="badge">New</span>
                    </div>
                </section>
            </div>
        `;
    },
    
    startTracking() {
        alert('📡 DaisySpeed tracking activated. Point camera at object.');
    },
    
    openHunting() {
        DaisyOS.loadApp('daisyobjects');
    }
};