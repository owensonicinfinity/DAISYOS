/* ============================================================================
   DAISY AUTH - Google Sign-In + Profile System
   Facebook + MySpace hybrid profiles
   ============================================================================ */

class DaisyAuth {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        // Load Google Identity Services
        this.loadGoogleScript();
        this.setupLoginButton();
        this.setupLogoutButton();
        this.loadSavedUser();
    }

    loadGoogleScript() {
        if (document.getElementById('google-identity-script')) return;
        const script = document.createElement('script');
        script.id = 'google-identity-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => this.initializeGoogle();
        document.head.appendChild(script);
    }

    initializeGoogle() {
        // This would use your actual Google Client ID
        // For the build, we initialize with a mock that's ready for real ID
        window.google = window.google || {};
        console.log('🔐 Google Identity Services ready');
    }

    setupLoginButton() {
        const loginBtn = document.getElementById('googleLoginBtn');
        if (!loginBtn) return;

        loginBtn.addEventListener('click', () => {
            this.mockLogin();
        });
    }

    setupLogoutButton() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (!logoutBtn) return;

        logoutBtn.addEventListener('click', () => {
            this.logout();
        });
    }

    mockLogin() {
        // Mock login for demo - replace with real Google OAuth
        this.user = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: 'Racer ' + Math.floor(Math.random() * 1000),
            email: 'racer@daisyos.com',
            avatar: null,
            initials: 'DR',
            joinDate: new Date().toISOString(),
            stats: {
                races: 0,
                wins: 0,
                topSpeed: 0,
                nftsOwned: 0,
                reputation: 100
            }
        };
        this.onLoginSuccess();
    }

    onLoginSuccess() {
        DaisyOS.state.user = this.user;
        localStorage.setItem('daisyos_user', JSON.stringify(this.user));
        this.updateUI();
        console.log('✅ User logged in:', this.user.name);
    }

    logout() {
        this.user = null;
        DaisyOS.state.user = null;
        localStorage.removeItem('daisyos_user');
        this.updateUI();
        console.log('👋 User logged out');
    }

    loadSavedUser() {
        const saved = localStorage.getItem('daisyos_user');
        if (saved) {
            try {
                this.user = JSON.parse(saved);
                DaisyOS.state.user = this.user;
                this.updateUI();
            } catch(e) {
                console.warn('Failed to load saved user');
            }
        }
    }

    updateUI() {
        const preview = document.getElementById('userProfilePreview');
        const loginBtn = document.getElementById('googleLoginBtn');
        const avatar = document.getElementById('userAvatar');
        const nameDisplay = document.getElementById('userNameDisplay');

        if (this.user) {
            if (preview) preview.classList.remove('hidden');
            if (loginBtn) loginBtn.classList.add('hidden');
            if (nameDisplay) nameDisplay.textContent = this.user.name;
            if (avatar) {
                if (this.user.avatar) {
                    avatar.src = this.user.avatar;
                } else {
                    avatar.style.display = 'none';
                }
            }
        } else {
            if (preview) preview.classList.add('hidden');
            if (loginBtn) loginBtn.classList.remove('hidden');
        }
    }

    getUser() {
        return this.user;
    }

    isLoggedIn() {
        return !!this.user;
    }
}

// Initialize
const daisyAuth = new DaisyAuth();
window.daisyAuth = daisyAuth;