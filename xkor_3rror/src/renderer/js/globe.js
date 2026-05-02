// Globe Visualization Module
class GlobeVisualizer {
    constructor() {
        this.canvas = document.getElementById('globe-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.rotation = 0;
        this.scale = this.canvas.width / 2 - 10;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Threat zones: [latitude, longitude]
        this.threatZones = [
            { name: 'Ukraine', lat: 49, lon: 32, radius: 8 },
            { name: 'Middle East', lat: 30, lon: 45, radius: 12 },
            { name: 'Taiwan', lat: 25, lon: 121, radius: 6 }
        ];
        
        this.init();
    }
    
    init() {
        // Start animation loop
        this.animate();
    }
    
    animate() {
        this.rotation += 0.5; // Rotate at speed
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    draw() {
        const ctx = this.ctx;
        const cx = this.centerX;
        const cy = this.centerY;
        
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw globe
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((this.rotation * Math.PI) / 180);
        
        // Draw oceans (circles representing depth)
        ctx.fillStyle = 'rgba(0, 100, 150, 0.1)';
        ctx.beginPath();
        ctx.arc(0, 0, this.scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw continents (simplified)
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 1;
        this.drawContinents();
        
        // Draw grid
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.lineWidth = 0.5;
        this.drawGrid();
        
        // Draw threat zones
        this.drawThreatZones();
        
        ctx.restore();
        
        // Draw border
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, this.scale, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    drawContinents() {
        // Simplified continent shapes as arcs
        const continents = [
            { x: 0, y: -30, w: 25, h: 20 }, // North America
            { x: 20, y: -10, w: 20, h: 15 }, // Europe
            { x: 35, y: 5, w: 20, h: 25 }, // Asia
            { x: -25, y: 10, w: 15, h: 15 }, // South America
            { x: 15, y: 35, w: 20, h: 20 } // Africa
        ];
        
        continents.forEach(c => {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
            this.ctx.fillRect(c.x, c.y, c.w, c.h);
            this.ctx.strokeRect(c.x, c.y, c.w, c.h);
        });
    }
    
    drawGrid() {
        // Latitude lines
        for (let lat = -90; lat <= 90; lat += 30) {
            const y = (lat / 90) * this.scale;
            this.ctx.beginPath();
            this.ctx.moveTo(-this.scale, y);
            this.ctx.lineTo(this.scale, y);
            this.ctx.stroke();
        }
        
        // Longitude lines
        for (let lon = -180; lon <= 180; lon += 30) {
            const x = (lon / 180) * this.scale;
            this.ctx.beginPath();
            this.ctx.moveTo(x, -this.scale);
            this.ctx.lineTo(x, this.scale);
            this.ctx.stroke();
        }
    }
    
    drawThreatZones() {
        this.threatZones.forEach(zone => {
            const x = (zone.lon / 180) * this.scale;
            const y = (zone.lat / 90) * this.scale * -1;
            
            // Pulsing red circle
            const pulse = Math.sin(Date.now() / 500) * 0.5 + 0.5;
            const radius = zone.radius + pulse * 3;
            
            const ctx = this.ctx;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${0.8 * pulse})`);
            gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw zone marker
            ctx.fillStyle = '#f00';
            ctx.font = '8px monospace';
            ctx.fillText(zone.name.substring(0, 3), x - 10, y - radius - 5);
        });
    }
    
    latLonToXY(lat, lon) {
        const x = (lon / 180) * this.scale;
        const y = (lat / 90) * this.scale * -1;
        return { x, y };
    }
}

const globe = new GlobeVisualizer();
