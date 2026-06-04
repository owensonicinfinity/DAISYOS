/* ============================================================================
   FLOATING CHROMATIC FLAGS - Animated Background
   Checkered flags, chromatic flags, moving diagonally
   ============================================================================ */

class FloatingFlags {
    constructor() {
        this.canvas = document.getElementById('flagsCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.flags = [];
        this.animationId = null;
        this.resize();
        this.createFlags();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createFlags() {
        this.flags = [];
        const count = 25;
        for (let i = 0; i < count; i++) {
            this.flags.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 20 + Math.random() * 35,
                speed: 0.3 + Math.random() * 1.2,
                angle: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                color: this.randomNeonColor(),
                type: Math.random() > 0.5 ? 'flag' : 'checker',
                opacity: 0.15 + Math.random() * 0.25
            });
        }
    }

    randomNeonColor() {
        const colors = [
            '#00f0ff', '#ff006e', '#39ff14', '#b537f2', 
            '#ff6600', '#ff10f0', '#0088ff', '#00ff41'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    drawFlag(flag) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(flag.x, flag.y);
        ctx.rotate(flag.angle);
        ctx.globalAlpha = flag.opacity;

        if (flag.type === 'checker') {
            this.drawCheckerFlag(ctx, flag.size);
        } else {
            this.drawChromaticFlag(ctx, flag.size, flag.color);
        }

        ctx.restore();
    }

    drawCheckerFlag(ctx, size) {
        const squares = 4;
        const sqSize = size / squares;
        for (let row = 0; row < squares; row++) {
            for (let col = 0; col < squares; col++) {
                ctx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#000000';
                ctx.fillRect(col * sqSize - size/2, row * sqSize - size/2, sqSize, sqSize);
            }
        }
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-size/2, -size/2, size, size);
    }

    drawChromaticFlag(ctx, size, color) {
        // Flag pole
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-size/2, -size/2);
        ctx.lineTo(-size/2, size/2);
        ctx.stroke();

        // Flag fabric
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-size/2, -size/2);
        ctx.lineTo(size/2, -size/6);
        ctx.lineTo(size/2, size/6);
        ctx.lineTo(-size/2, size/2);
        ctx.closePath();
        ctx.fill();

        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.flags.forEach(flag => {
            // Move diagonally
            flag.x += Math.cos(flag.angle) * flag.speed;
            flag.y += Math.sin(flag.angle) * flag.speed;
            flag.angle += flag.rotationSpeed;

            // Wrap around
            if (flag.x < -50) flag.x = this.canvas.width + 50;
            if (flag.x > this.canvas.width + 50) flag.x = -50;
            if (flag.y < -50) flag.y = this.canvas.height + 50;
            if (flag.y > this.canvas.height + 50) flag.y = -50;

            this.drawFlag(flag);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new FloatingFlags();
});