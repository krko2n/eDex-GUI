// Web Browser Module (Terminal-based)
class WebBrowser {
    constructor() {
        this.currentUrl = '';
        this.urlInput = document.getElementById('web-url');
        this.goBtn = document.getElementById('web-go');
        this.webContent = document.getElementById('web-content');
        
        this.init();
    }
    
    init() {
        // Handle go button click
        this.goBtn.addEventListener('click', () => this.navigate());
        
        // Handle Enter in URL bar
        this.urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.navigate();
            }
        });
    }
    
    async navigate() {
        const url = this.urlInput.value.trim();
        if (!url) return;
        
        // Add protocol if missing
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = 'http://' + url;
        }
        
        this.currentUrl = fullUrl;
        this.displayLoading();
        
        try {
            const response = await fetch(`http://localhost:3001/api/web/render?url=${encodeURIComponent(fullUrl)}`);
            const data = await response.json();
            
            if (data.html) {
                this.webContent.innerHTML = `<pre>${this.escapeHtml(data.html)}</pre>`;
            } else if (data.text) {
                this.webContent.innerHTML = `<pre>${this.escapeHtml(data.text)}</pre>`;
            } else {
                this.webContent.innerHTML = '<pre>ERROR: Could not render page</pre>';
            }
        } catch (error) {
            console.error('Web navigation error:', error);
            this.webContent.innerHTML = `<pre>ERROR: ${error.message}</pre>`;
        }
    }
    
    displayLoading() {
        this.webContent.innerHTML = '<pre>LOADING...</pre>';
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

const webBrowser = new WebBrowser();
