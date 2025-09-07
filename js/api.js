class GameAPI {
    constructor() {
        // Your VPS IP is configured here!
        this.baseURL = 'https://echo-remind-united-sent.trycloudflare.com/api';
        this.token = localStorage.getItem('aztec-game-token');
        console.log('🔧 API initialized with baseURL:', this.baseURL);
    }
    
    async request(endpoint, method = 'GET', data = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        const config = {
            method,
            headers,
            mode: 'cors'
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        try {
            console.log(`📡 Making ${method} request to: ${this.baseURL}${endpoint}`);
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Request failed');
            }
            
            return result;
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }
    
    async testConnection() {
        try {
            return await this.request('/health');
        } catch (error) {
            throw new Error('Cannot connect to game server. Check if backend is running.');
        }
    }
    
    async verifyTwitterUsername(username) {
        return this.request('/twitter/verify-username', 'POST', { username });
    }
    
    async getProfile() {
        return this.request('/game/profile');
    }
    
    async verifyAttestation() {
        return this.request('/game/verify-attestation', 'POST', { 
            attestationData: 'aztec-temple-verification-' + Date.now()
        });
    }
    
    async submitProposal(content = 'Aztec Temple Proposal') {
        return this.request('/game/submit-proposal', 'POST', { 
            proposalContent: content + ' - ' + new Date().toISOString()
        });
    }
    
    async getLeaderboard() {
        return this.request('/game/leaderboard');
    }
    
    setToken(token) {
        this.token = token;
        localStorage.setItem('aztec-game-token', token);
        console.log('🔑 Token saved');
    }
    
    clearToken() {
        this.token = null;
        localStorage.removeItem('aztec-game-token');
        console.log('🗑️ Token cleared');
    }
}

// Create global API instance
window.gameAPI = new GameAPI();
