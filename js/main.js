// Main application entry point
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏺 Aztec: Honk if You Phonk - Game Loading...');
    
    try {
        // Initialize the game
        await window.aztecGame.init();
        console.log('✅ Game initialized successfully!');
        
        // Add some fun console messages
        console.log('🦅 Welcome to the Aztec Temple!');
        console.log('🎺 Ready to HONK if you PHONK?');
        
        // Test connection periodically
        setInterval(async () => {
            try {
                await window.gameAPI.testConnection();
                console.log('💚 Connection to temple is strong');
            } catch (error) {
                console.warn('💔 Lost connection to temple:', error.message);
            }
        }, 30000); // Every 30 seconds
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        
        // Show error message to user
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px;">
                <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    <h1>🏺 Aztec Temple</h1>
                    <h2 style="color: red;">❌ Connection Error</h2>
                    <p>Cannot connect to the Aztec Temple servers.</p>
                    <p><strong>Backend IP:</strong> 162.250.191.81:3001</p>
                    <p><strong>Possible issues:</strong></p>
                    <ul style="text-align: left; margin: 20px 0;">
                        <li>Backend server is not running</li>
                        <li>Firewall blocking connections</li>
                        <li>CORS configuration issues</li>
                    </ul>
                    <button onclick="location.reload()" style="background: #8B4513; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 1.1em; cursor: pointer;">
                        🔄 Try Again
                    </button>
                </div>
            </div>
        `;
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Add some fun Easter eggs
console.log(`
🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺
🦅  WELCOME TO THE AZTEC TEMPLE  🦅
🎺  HONK IF YOU PHONK!  🎺
⚡  Privacy-focused attestation game  ⚡
📜  Submit proposals to the council  📜
💀  Beware of slashing events!  💀
🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺🏺

Backend Server: http://162.250.191.81:3001
Frontend URL: https://aabis5004.github.io/aztec-game-frontend
`);
