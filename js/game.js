class AztecGame {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Cool down timers (in milliseconds)
        this.verificationCooldown = 3000; // 3 seconds
        this.proposalCooldown = 5000; // 5 seconds
        
        this.lastVerification = 0;
        this.lastProposal = 0;
    }
    
    async init() {
        console.log('🎮 Initializing Aztec Game...');
        
        // Check if user has existing token
        const token = localStorage.getItem('aztec-game-token');
        if (token) {
            try {
                await this.loadUserProfile();
                this.showGameSection();
            } catch (error) {
                console.log('🔄 Token expired, showing login');
                this.showLoginSection();
                gameAPI.clearToken();
            }
        } else {
            this.showLoginSection();
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Login button
        document.getElementById('join-btn').addEventListener('click', () => {
            this.handleLogin();
        });
        
        // Enter key on username input
        document.getElementById('twitter-username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
        
        // Game action buttons
        document.getElementById('verify-btn').addEventListener('click', () => {
            this.handleVerification();
        });
        
        document.getElementById('propose-btn').addEventListener('click', () => {
            this.handleProposal();
        });
        
        document.getElementById('leaderboard-btn').addEventListener('click', () => {
            this.showLeaderboard();
        });
    }
    
    async handleLogin() {
        const username = document.getElementById('twitter-username').value.trim();
        const joinBtn = document.getElementById('join-btn');
        const statusDiv = document.getElementById('login-status');
        
        if (!username) {
            this.showStatus('❌ Please enter your Twitter username!', 'error');
            return;
        }
        
        joinBtn.disabled = true;
        joinBtn.textContent = '🔄 Connecting to Temple...';
        
        try {
            // First test connection
            this.showStatus('🔗 Testing connection to game server...', 'info');
            await gameAPI.testConnection();
            
            this.showStatus('🐦 Verifying Twitter username...', 'info');
            const result = await gameAPI.verifyTwitterUsername(username);
            
            if (result.success) {
                gameAPI.setToken(result.token);
                this.currentUser = result.user;
                this.isLoggedIn = true;
                
                this.showStatus(`✅ ${result.message}`, 'success');
                
                setTimeout(() => {
                    this.showGameSection();
                    this.updateUserDisplay();
                    this.updateStatsDisplay();
                }, 1500);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showStatus(`❌ ${error.message}`, 'error');
        } finally {
            joinBtn.disabled = false;
            joinBtn.textContent = '🦅 Enter Temple';
        }
    }
    
    async handleVerification() {
        if (!this.canPerformAction('verification')) return;
        
        const btn = document.getElementById('verify-btn');
        btn.disabled = true;
        btn.textContent = '⚡ Verifying...';
        
        try {
            const result = await gameAPI.verifyAttestation();
            this.currentUser.gameStats = result.newStats;
            
            this.addGameMessage(
                `${result.message} ${result.honk}`,
                result.success ? 'success' : 'error'
            );
            
            this.updateStatsDisplay();
            this.lastVerification = Date.now();
            
        } catch (error) {
            this.addGameMessage(`❌ Verification failed: ${error.message}`, 'error');
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = '⚡ Verify Attestation';
            }, this.verificationCooldown);
        }
    }
    
    async handleProposal() {
        if (!this.canPerformAction('proposal')) return;
        
        const btn = document.getElementById('propose-btn');
        btn.disabled = true;
        btn.textContent = '📜 Submitting...';
        
        try {
            const result = await gameAPI.submitProposal();
            this.currentUser.gameStats = result.newStats;
            
            this.addGameMessage(
                `${result.message} ${result.honk}`,
                'success'
            );
            
            this.updateStatsDisplay();
            this.lastProposal = Date.now();
            
        } catch (error) {
            this.addGameMessage(`❌ Proposal failed: ${error.message}`, 'error');
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = '📜 Submit Proposal';
            }, this.proposalCooldown);
        }
    }
    
    async showLeaderboard() {
        const leaderboardSection = document.getElementById('leaderboard-section');
        
        try {
            const result = await gameAPI.getLeaderboard();
            
            let html = `
                <h2>🏆 Temple Leaderboard</h2>
                <p>Total Temple Members: ${result.totalPlayers}</p>
                <table class="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Warrior</th>
                            <th>Score</th>
                            <th>Honk Points</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            result.leaderboard.forEach((player, index) => {
                const rank = index + 1;
                const trophy = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                html += `
                    <tr>
                        <td>${trophy}</td>
                        <td>@${player.twitterUsername}</td>
                        <td>${player.gameStats.score}</td>
                        <td>${player.gameStats.honkPoints}</td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
                <button onclick="document.getElementById('leaderboard-section').classList.add('hidden')" 
                        class="aztec-button" style="margin-top: 20px;">Close</button>
            `;
            
            leaderboardSection.innerHTML = html;
            leaderboardSection.classList.remove('hidden');
            
        } catch (error) {
            this.addGameMessage(`❌ Failed to load leaderboard: ${error.message}`, 'error');
        }
    }
    
    canPerformAction(action) {
        const now = Date.now();
        
        if (action === 'verification') {
            const timeLeft = Math.ceil((this.lastVerification + this.verificationCooldown - now) / 1000);
            if (timeLeft > 0) {
                this.addGameMessage(`⏰ Wait ${timeLeft} seconds before next verification`, 'info');
                return false;
            }
        } else if (action === 'proposal') {
            const timeLeft = Math.ceil((this.lastProposal + this.proposalCooldown - now) / 1000);
            if (timeLeft > 0) {
                this.addGameMessage(`⏰ Wait ${timeLeft} seconds before next proposal`, 'info');
                return false;
            }
        }
        
        return true;
    }
    
    async loadUserProfile() {
        const result = await gameAPI.getProfile();
        this.currentUser = {
            username: result.username,
            gameStats: result.gameStats,
            joinedAt: result.joinedAt
        };
        this.isLoggedIn = true;
    }
    
    showLoginSection() {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('game-section').classList.add('hidden');
    }
    
    showGameSection() {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('game-section').classList.remove('hidden');
    }
    
    updateUserDisplay() {
        const userInfo = document.getElementById('user-info');
        userInfo.innerHTML = `
            <h3>🦅 Welcome, @${this.currentUser.username}!</h3>
            <p>Member since: ${new Date(this.currentUser.joinedAt).toLocaleDateString()}</p>
        `;
    }
    
    updateStatsDisplay() {
        const statsPanel = document.getElementById('stats-panel');
        const stats = this.currentUser.gameStats;
        
        statsPanel.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${stats.score}</div>
                <div class="stat-label">🏆 Total Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.honkPoints}</div>
                <div class="stat-label">🎺 Honk Points</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.verificationsCompleted}</div>
                <div class="stat-label">⚡ Verifications</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.proposalsSubmitted}</div>
                <div class="stat-label">📜 Proposals</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.slashingEvents}</div>
                <div class="stat-label">💀 Slashed</div>
            </div>
        `;
    }
    
    addGameMessage(message, type = 'info') {
        const messagesDiv = document.getElementById('game-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <strong>${new Date().toLocaleTimeString()}</strong><br>
            ${message}
        `;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Remove old messages if too many
        const messages = messagesDiv.querySelectorAll('.message');
        if (messages.length > 10) {
            messages[0].remove();
        }
    }
    
    showStatus(message, type) {
        const statusDiv = document.getElementById('login-status');
        statusDiv.className = `status-message ${type}`;
        statusDiv.textContent = message;
    }
}

// Initialize game when page loads
window.aztecGame = new AztecGame();
