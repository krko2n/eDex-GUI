// AI Chat Module
class AIPanel {
    constructor() {
        this.panel = document.getElementById('ai-panel');
        this.chatHistory = document.getElementById('chat-history');
        this.aiInput = document.getElementById('ai-input');
        this.sendBtn = document.getElementById('ai-send');
        this.closeBtn = document.getElementById('close-ai');
        
        this.visible = true;
        this.apiEndpoint = 'http://localhost:3001/api/ai/chat';
        this.messages = [];
        
        this.init();
    }
    
    init() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Send on Enter key
        this.aiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Close button
        this.closeBtn.addEventListener('click', () => this.toggle());
        
        // F2 to toggle AI panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // Load chat history
        this.loadChatHistory();
    }
    
    toggle() {
        this.visible = !this.visible;
        if (this.panel) {
            this.panel.classList.toggle('hidden');
        }
    }
    
    async sendMessage() {
        const message = this.aiInput.value.trim();
        if (!message) return;
        
        // Clear input
        this.aiInput.value = '';
        
        // Add user message to chat
        this.addMessage('user', message);
        
        // Show typing indicator
        this.addMessage('ai', '...');
        
        try {
            // Send to API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: this.messages.slice(0, -1) })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            if (this.chatHistory) {
                const lastMsg = this.chatHistory.lastElementChild;
                if (lastMsg && lastMsg.textContent === '...') {
                    lastMsg.remove();
                }
            }
            
            // Add AI response
            if (data.response) {
                this.addMessage('ai', data.response);
            } else {
                this.addMessage('ai', 'Sorry, I could not process that request.');
            }
        } catch (error) {
            console.error('AI API error:', error);
            
            // Remove typing indicator
            if (this.chatHistory) {
                const lastMsg = this.chatHistory.lastElementChild;
                if (lastMsg && lastMsg.textContent === '...') {
                    lastMsg.remove();
                }
            }
            
            this.addMessage('ai', 'Error: Could not connect to AI service. Make sure the backend is running.');
        }
    }
    
    addMessage(sender, text) {
        const message = { sender, text, timestamp: new Date() };
        this.messages.push(message);
        
        const msgEl = document.createElement('div');
        msgEl.className = `chat-message ${sender}`;
        msgEl.innerHTML = `<span class="sender">${sender === 'user' ? 'YOU' : 'AI'}:</span> <span class="text">${this.escapeHtml(text)}</span>`;
        
        if (this.chatHistory) {
            this.chatHistory.appendChild(msgEl);
            this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
        }
        
        this.saveChatHistory();
    }
    
    loadChatHistory() {
        // Load from localStorage if available
        try {
            const savedHistory = localStorage.getItem('cyberOS-chatHistory');
            if (savedHistory) {
                this.messages = JSON.parse(savedHistory);
                this.messages.forEach(msg => {
                    const msgEl = document.createElement('div');
                    msgEl.className = `chat-message ${msg.sender}`;
                    msgEl.innerHTML = `<span class="sender">${msg.sender === 'user' ? 'YOU' : 'AI'}:</span> <span class="text">${this.escapeHtml(msg.text)}</span>`;
                    
                    if (this.chatHistory) {
                        this.chatHistory.appendChild(msgEl);
                    }
                });
            }
        } catch (e) {
            console.log('Chat history not available');
        }
    }
    
    saveChatHistory() {
        try {
            localStorage.setItem('cyberOS-chatHistory', JSON.stringify(this.messages));
        } catch (e) {
            console.log('Could not save chat history');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const aiPanel = new AIPanel();
