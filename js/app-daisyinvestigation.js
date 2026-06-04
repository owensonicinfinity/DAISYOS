/* ============================================================================
   DaisyInvestigation - Law Enforcement Platform
   ============================================================================ */
const DaisyInvestigationApp = {
    render(container) {
        container.innerHTML = `
            <div class="daisyinvestigation-app">
                <section class="hero">
                    <div class="hero-content">
                        <h2>🕵️ DaisyInvestigation</h2>
                        <p>Professional forensic tools for law enforcement. Government licensed.</p>
                        <p style="color:var(--accent-secondary);font-size:14px;">$9,999/year • Government Authorization Required</p>
                    </div>
                </section>

                <section class="section">
                    <h3 style="font-family:var(--font-display);color:var(--accent-primary);margin-bottom:20px;">Investigation Tools</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
                        <div class="app-card">
                            <div class="app-header"><h3>👣 Footprint Analysis</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>Human/animal ID</li>
                                    <li>Gait pattern analysis</li>
                                    <li>Size estimation</li>
                                </ul>
                            </div>
                        </div>
                        <div class="app-card">
                            <div class="app-header"><h3>🚗 Tire Track ID</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>Vehicle type match</li>
                                    <li>Speed estimation</li>
                                    <li>Wear pattern analysis</li>
                                </ul>
                            </div>
                        </div>
                        <div class="app-card">
                            <div class="app-header"><h3>📋 Crime Scene</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>Scene documentation</li>
                                    <li>Evidence chain of custody</li>
                                    <li>Witness statements</li>
                                </ul>
                            </div>
                        </div>
                        <div class="app-card premium-tier">
                            <div class="app-header"><h3>🤖 AI Investigation Director</h3></div>
                            <div class="app-body">
                                <ul class="features">
                                    <li>Step-by-step guidance</li>
                                    <li>8 investigation phases</li>
                                    <li>Real-time voice guidance</li>
                                    <li>Safety considerations</li>
                                    <li>Forensic report generation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Investigation Types -->
                <section class="section">
                    <h3 style="font-family:var(--font-display);color:var(--accent-primary);margin-bottom:20px;">Active Investigation Types</h3>
                    <div style="display:flex;flex-wrap:wrap;gap:10px;">
                        ${['Homicide','Robbery','Assault','Theft','Fraud','Missing Person','Hit-and-Run','Drug Crime','Other'].map(t => `
                            <span class="badge enterprise">${t}</span>
                        `).join('')}
                    </div>
                </section>
            </div>
        `;
    }
};