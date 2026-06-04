/* ============================================================================
   SAYSO - Unified Social Platform
   TikTok + Twitter + Facebook combined
   ============================================================================ */
const SAYSO = {
    render(container) {
        container.innerHTML = `
            <div class="sayso-app">
                <!-- Hero -->
                <section class="hero">
                    <div class="hero-content">
                        <h2>SAYSO</h2>
                        <p>The unified social platform for the DaisyOS ecosystem. Posts, stories, live streams, shorts, polls, threads — all in one place.</p>
                        <div class="hero-buttons">
                            <button class="btn" onclick="SAYSO.createPost()">Create Post</button>
                            <button class="btn btn-magenta" onclick="SAYSO.goLive()">Go Live</button>
                        </div>
                    </div>
                </section>

                <!-- Feed -->
                <section class="section">
                    <h3 style="font-family:var(--font-display);color:var(--accent-primary);margin-bottom:20px;">🔥 Trending Feed</h3>
                    <div class="sayso-feed" id="saysoFeed"></div>
                </section>
            </div>
        `;
        this.loadFeed();
    },
    
    createPost() {
        alert('📝 Create Post: Open full post composer (text, media, polls, threads)');
    },
    
    goLive() {
        alert('🔴 Go Live: Start streaming to SAYSO community');
    },
    
    loadFeed() {
        const feed = document.getElementById('saysoFeed');
        const posts = [
            { user: 'SpeedDemon', avatar: '🏎️', content: 'Just hit 187mph on the highway! DaisyGT tracked it all.', likes: 234, comments: 45, time: '2m ago' },
            { user: 'HunterPro99', avatar: '🦌', content: 'Tagged a 12-point buck this morning. DaisyObjects nailed the track analysis.', likes: 189, comments: 32, time: '15m ago' },
            { user: 'CryptoRacer', avatar: '⛓️', content: 'Just sold my first race NFT for 0.5 ETH on the marketplace! 🚀', likes: 567, comments: 89, time: '1h ago' },
            { user: 'NightRider', avatar: '🌙', content: 'DaisyAI guided me through the perfect launch. 0-60 in 2.3s!', likes: 412, comments: 67, time: '2h ago' }
        ];
        
        feed.innerHTML = posts.map(p => `
            <div style="background:var(--bg-surface);border:var(--border-subtle);border-radius:10px;padding:20px;margin-bottom:15px;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                    <span style="font-size:32px;">${p.avatar}</span>
                    <div>
                        <strong style="color:var(--accent-primary);font-family:var(--font-heading);">${p.user}</strong>
                        <span style="color:var(--text-muted);font-size:11px;display:block;">${p.time}</span>
                    </div>
                </div>
                <p style="color:var(--text-secondary);margin-bottom:15px;">${p.content}</p>
                <div style="display:flex;gap:20px;">
                    <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;">❤️ ${p.likes}</button>
                    <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;">💬 ${p.comments}</button>
                    <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;">🔄 Repost</button>
                    <button style="background:none;border:none;color:var(--text-muted);cursor:pointer;">📤 Share</button>
                </div>
            </div>
        `).join('');
    }
};