/* ============================================================================
   NFT Marketplace - Cross-app NFT trading
   ============================================================================ */
const NFTMarketplace = {
    render(container) {
        container.innerHTML = `
            <div class="marketplace-app">
                <section class="hero">
                    <div class="hero-content">
                        <h2>🛒 NFT Marketplace</h2>
                        <p>Trade race records, hunting trophies, and digital collectibles across all DaisyOS apps.</p>
                    </div>
                </section>

                <section class="section">
                    <div class="marketplace-filters">
                        <select><option>All Categories</option><option>Racing</option><option>Hunting</option><option>Speed Records</option></select>
                        <select><option>All Chains</option><option>Ethereum</option><option>Polygon</option><option>Solana</option></select>
                        <input type="text" placeholder="Search NFTs...">
                        <button class="btn btn-small">Filter</button>
                    </div>
                    <div class="marketplace-grid" id="nftGrid"></div>
                </section>

                <!-- Wallet Connection -->
                <section class="section">
                    <div class="portfolio-banner">
                        <h3>⛓️ Connect Your Wallet</h3>
                        <p>MetaMask • Coinbase • WalletConnect • Phantom • Ledger</p>
                        <button class="btn btn-small" onclick="NFTMarketplace.connectWallet()">Connect Wallet</button>
                    </div>
                </section>
            </div>
        `;
        this.loadNFTs();
    },
    
    connectWallet() {
        alert('⛓️ Wallet connection: Supports Ethereum, Polygon, Solana, Arbitrum, Optimism, Base, Avalanche');
    },
    
    loadNFTs() {
        const grid = document.getElementById('nftGrid');
        const nfts = [
            { title: '1/4 Mile King', type: 'Racing', chain: 'Ethereum', price: '0.5 ETH', icon: '🏁' },
            { title: '12-Point Buck Trophy', type: 'Hunting', chain: 'Polygon', price: '200 MATIC', icon: '🦌' },
            { title: 'Speed Record - 215mph', type: 'Speed', chain: 'Solana', price: '5 SOL', icon: '⚡' },
            { title: 'Ghost Race Victory', type: 'Racing', chain: 'Ethereum', price: '0.3 ETH', icon: '👻' },
            { title: 'Mountain Pass Circuit', type: 'Racing', chain: 'Arbitrum', price: '0.15 ETH', icon: '🏔️' },
            { title: 'Elk Hunt Master', type: 'Hunting', chain: 'Polygon', price: '350 MATIC', icon: '🫎' }
        ];
        grid.innerHTML = nfts.map(n => `
            <div class="nft-card" onclick="DaisyOS.showNFTPopup({title:'${n.title}',price:'${n.price}'})">
                <div class="nft-card-image">
                    <span style="font-size:48px;">${n.icon}</span>
                    <span class="nft-card-badge">${n.chain}</span>
                </div>
                <div class="nft-card-body">
                    <h4>${n.title}</h4>
                    <p>${n.type}</p>
                    <p class="nft-card-price">${n.price}</p>
                    <button class="btn btn-small" style="width:100%;margin-top:10px;">Buy Now</button>
                </div>
            </div>
        `).join('');
    }
};