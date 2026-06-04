/* ============================================================================
   DaisyObjects - AR Detection + Hunting Addon
   ============================================================================ */
const DaisyObjectsApp = {
    render(container) {
        container.innerHTML = `
            <div class="daisyobjects-app">
                <section class="hero">
                    <div class="hero-content">
                        <h2>🔍 DaisyObjects</h2>
                        <p>AR Object Detection • Vehicle ID • Wildlife • Forensics</p>
                        <div class="hero-buttons">
                            <button class="btn" onclick="DaisyObjectsApp.scan()">Scan Now</button>
                            <button class="btn btn-magenta" onclick="DaisyObjectsApp.openHuntingPortal()">🦌 Hunting Portal</button>
                        </div>
                    </div>
                </section>

                <section class="section">
                    <h3 style="font-family:var(--font-display);color:var(--accent-primary);margin-bottom:20px;">Detection Modes</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
                        <div class="app-card">
                            <div class="app-header"><h3>🚗 Vehicles</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>License plate OCR</li>
                                    <li>Make/model/year ID</li>
                                    <li>OEM specs lookup</li>
                                    <li>Predictive movement</li>
                                </ul>
                                <button class="btn btn-small">Scan Vehicle</button>
                            </div>
                        </div>
                        <div class="app-card">
                            <div class="app-header"><h3>🦌 Wildlife</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>10+ game species</li>
                                    <li>Scat analysis</li>
                                    <li>Track identification</li>
                                    <li>Marking detection</li>
                                    <li>Territorial mapping</li>
                                </ul>
                                <button class="btn btn-small">Track Wildlife</button>
                            </div>
                        </div>
                        <div class="app-card">
                            <div class="app-header"><h3>🐛 Insects</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>Lightning bugs</li>
                                    <li>Bumblebees</li>
                                    <li>Dragonflies</li>
                                    <li>Custom species DB</li>
                                </ul>
                                <button class="btn btn-small">ID Insect</button>
                            </div>
                        </div>
                        <div class="app-card premium-tier">
                            <div class="app-header"><h3>🕵️ Forensics</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>Footprint analysis</li>
                                    <li>Tire track ID</li>
                                    <li>Crime scene docs</li>
                                    <li>Chain of custody</li>
                                    <li>AI Investigation Director</li>
                                </ul>
                                <button class="btn btn-small btn-magenta">Investigate</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Hunting Portal -->
                <section class="section">
                    <div class="portfolio-banner">
                        <h3>🦌 Hunting Portal</h3>
                        <p>Log kills • Hunter profiles • 8 badges • Competitions • Leaderboards</p>
                        <button class="btn btn-small" onclick="DaisyObjectsApp.openHuntingPortal()">Enter Portal</button>
                    </div>
                </section>
            </div>
        `;
    },
    
    scan() {
        alert('🔍 DaisyObjects scanning. Point camera.');
    },
    
    openHuntingPortal() {
        alert('🦌 Hunting Portal: Log kills, compete, earn badges.');
    }
};