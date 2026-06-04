/* ============================================================================
   Legal Footer - Persistent across all screens
   ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // TOS Link
    document.getElementById('tosLink').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Terms of Service\n\nDaisyOS acts as a neutral peer-to-peer platform. All competitions are skill-based. Users are responsible for compliance with local laws. Disputes resolved through binding arbitration.');
    });
    
    // Privacy Link
    document.getElementById('privacyLink').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Privacy Policy\n\nWe collect minimal data for app functionality. Race data is hashed and shared only between connected users. No data is sold to third parties.');
    });
    
    // Disclaimer Link
    document.getElementById('disclaimerLink').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('disclaimerModal').classList.remove('hidden');
    });
});