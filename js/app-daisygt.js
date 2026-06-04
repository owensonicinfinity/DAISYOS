/* ============================================================================
   DaisyGT - Multi-Vehicle Racing Platform
   ============================================================================ */
const DaisyGTApp = {
    render(container) {
        container.innerHTML = `
            <div class="daisygt-app">
                <section class="hero">
                    <div class="hero-content">
                        <h2>🏁 DaisyGT</h2>
                        <p>Global Multi-Vehicle Racing • Telemetry • Ghost Vehicles • NFTs</p>
                        <div class="hero-buttons">
                            <button class="btn" onclick="DaisyGTApp.startRace()">Start Race</button>
                            <button class="btn btn-magenta" onclick="DaisyGTApp.joinSpectate()">Spectate Live</button>
                        </div>
                    </div>
                    <div class="hero-stats">
                        <div class="stat"><h3>1,247</h3><p>Active Racers</p></div>
                        <div class="stat"><h3>89</h3><p>Live Races</p></div>
                        <div class="stat"><h3>312mph</h3><p>Top Speed</p></div>
                        <div class="stat"><h3>₿ 245</h3><p>NFT Volume</p></div>
                    </div>
                </section>

                <!-- Racing Dashboard -->
                <section class="section">
                    <h3 style="font-family:var(--font-display);color:var(--accent-primary);margin-bottom:20px;">Your Racing Dashboard</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
                        <div class="app-card">
                            <div class="app-header"><h3>🏎️ Your Garage</h3></div>
                            <div class="app-body">
                                <p>Manage your vehicles and setups</p>
                                <button class="btn btn-small" onclick="DaisyGTApp.openGarage()">Open Garage</button>
                            </div>
                        </div>
                        <div class="app-card">
                            <div class="app-header"><h3>📊 Daisy Dashboard Dyno</h3></div>
                            <div class="app-body">
                                <p>Full telemetry recording • 0-60 • G-force • $0.99</p>
                                <button class="btn btn-small" onclick="DaisyGTApp.openDyno()">Launch Dyno</button>
                            </div>
                        </div>
                        <div class="app-card premium-tier">
                            <div class="app-header"><h3>👻 Ghost Racing</h3></div>
                            <div class="app-body">
                                <p>Race opponents as ghost overlays in real-time</p>
                                <button class="btn btn-small btn-magenta" onclick="DaisyGTApp.startGhostRace()">Ghost Race</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Live Races -->
                <section class="section">
                    <h3 style="font-family:var(--font-display);color:var(--accent-primary);margin-bottom:20px;">🔴 Live Races</h3>
                    <div id="liveRacesList" style="display:grid;gap:15px;"></div>
                </section>

                <!-- Boxing, Weightlifting, Balance Stats -->
                <section class="section">
                    <h3 style="font-family:var(--font-display);color:var(--accent-primary);margin-bottom:20px;">💪 Physical Profile</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
                        <div class="app-card">
                            <div class="app-header"><h3>🥊 Boxing</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>Punch Speed: 32 mph</li>
                                    <li>Heavy Bag Power: 87/100</li>
                                    <li>Combos: 245</li>
                                    <li>Round Duration: 3:00</li>
                                </ul>
                            </div>
                        </div>
                        <div class="app-card">
                            <div class="app-header"><h3>🏋️ Weightlifting</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>Bench: 315 lbs</li>
                                    <li>Squat: 495 lbs</li>
                                    <li>Deadlift: 585 lbs</li>
                                    <li>Total Volume: 12,450 lbs</li>
                                </ul>
                            </div>
                        </div>
                        <div class="app-card">
                            <div class="app-header"><h3>⚖️ Balance</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>Balance Board: 4:32</li>
                                    <li>Shuttle Run: 8.2s</li>
                                    <li>Jump Rope: 340 reps</li>
                                    <li>Agility Ladder: 12.4s</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Portfolio / NFT Ads -->
                <section class="section">
                    <div class="portfolio-banner" onclick="DaisyOS.showNFTPopup({title:'Race Winner NFT - 1/4 Mile King', price:'0.25 ETH'})">
                        <h3>🏆 Featured NFT: Race Winner Collectible</h3>
                        <p>Own the winning moment. Trade race history on the blockchain.</p>
                        <span class="badge">Hot</span>
                    </div>
                </section>
            </div>
        `;
        this.loadLiveRaces();
    },
    
    startRace() {
        alert('🏁 Starting race setup: Select vehicle, mode, and invite opponents.');
    },
    
    joinSpectate() {
        alert('👁️ Joining spectator mode with live chat.');
    },
    
    openGarage() {
        alert('🏎️ Opening vehicle garage.');
    },
    
    openDyno() {
        alert('📊 Daisy Dashboard Dyno: $0.99 to unlock full telemetry.');
    },
    
    startGhostRace() {
        alert('👻 Ghost Race: Race against recorded ghosts of opponents.');
    },
    
    loadLiveRaces() {
        const list = document.getElementById('liveRacesList');
        const races = [
            { title: 'Highway Showdown', racers: 8, type: 'Drag', pot: '0.5 ETH', spectators: 234 },
            { title: 'Mountain Pass', racers: 4, type: 'Circuit', pot: '1.2 ETH', spectators: 567 },
            { title: 'City Streets', racers: 12, type: 'Street', pot: '2.0 ETH', spectators: 1023 }
        ];
        list.innerHTML = races.map(r => `
            <div style="background:var(--bg-surface);border:var(--border-subtle);border-radius:10px;padding:20px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <strong style="color:var(--accent-primary);font-family:var(--font-heading);">${r.title}</strong>
                    <p style="color:var(--text-muted);font-size:12px;">${r.racers} racers • ${r.type} • ${r.spectators} watching</p>
                </div>
                <div style="text-align:right;">
                    <p style="color:var(--accent-tertiary);font-family:var(--font-mono);font-size:18px;font-weight:700;">${r.pot}</p>
                    <button class="btn btn-small" onclick="DaisyGTApp.joinSpectate()">Watch</button>
                </div>
            </div>
        `).join('');
    }
};