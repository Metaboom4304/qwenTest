// Effects Manager - Handles visual effects like particles, screen shake, and animations
export class EffectsManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.particles = [];
        this.screenShake = {
            intensity: 0,
            duration: 0,
            elapsed: 0
        };
        this.cameraOffset = { x: 0, y: 0 };
    }
    
    // Create particle effect for various situations
    createParticles(x, y, count, color, lifetime = 0.5, velocityRange = { min: -50, max: 50 }) {
        for (let i = 0; i < count; i++) {
            const particle = {
                x: x,
                y: y,
                size: Math.random() * 4 + 2, // Size between 2-6
                color: color,
                velocityX: Math.random() * (velocityRange.max - velocityRange.min) + velocityRange.min,
                velocityY: Math.random() * (velocityRange.max - velocityRange.min) + velocityRange.min,
                life: lifetime,
                maxLife: lifetime,
                type: 'particle'
            };
            
            this.particles.push(particle);
        }
    }
    
    // Create dash effect with motion blur trail and particle emission
    createDashEffect(x, y, facingRight) {
        // Motion blur trail
        const trailLength = 5;
        for (let i = 0; i < trailLength; i++) {
            const offset = facingRight ? -i * 5 : i * 5;
            this.createParticles(x + offset, y, 2, 'rgba(0, 255, 255, 0.5)', 0.3);
        }
        
        // Particle emission (30 particles as specified)
        this.createParticles(x, y, 30, 'rgba(0, 255, 255, 0.8)', 0.3);
    }
    
    // Create collection effect for shards
    createShardCollectionEffect(x, y) {
        // Glass chime particle burst
        this.createParticles(x, y, 15, '#FFD700', 0.4, { min: -80, max: 80 });
        
        // Additional sparkle effects
        this.createParticles(x, y, 5, '#FFFFFF', 0.6, { min: -30, max: 30 });
    }
    
    // Trigger screen shake effect with specified intensity
    triggerScreenShake(intensity, duration) {
        this.screenShake.intensity = intensity; // 0.8px as specified in requirements
        this.screenShake.duration = duration;
        this.screenShake.elapsed = 0;
    }
    
    // Update all effects
    update(deltaTime) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.velocityX * deltaTime;
            p.y += p.velocityY * deltaTime;
            p.life -= deltaTime;
            
            // Apply gravity to particles
            p.velocityY += 200 * deltaTime;
            
            // Fade out as life decreases
            const lifeRatio = p.life / p.maxLife;
            p.size = (p.size * lifeRatio) + 1;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update screen shake
        if (this.screenShake.duration > 0) {
            this.screenShake.elapsed += deltaTime;
            
            if (this.screenShake.elapsed >= this.screenShake.duration) {
                this.screenShake.intensity = 0;
                this.screenShake.duration = 0;
                this.screenShake.elapsed = 0;
                this.cameraOffset.x = 0;
                this.cameraOffset.y = 0;
            } else {
                // Apply random shake offset based on remaining intensity
                const remainingIntensity = this.screenShake.intensity * 
                                         (1 - (this.screenShake.elapsed / this.screenShake.duration));
                
                this.cameraOffset.x = (Math.random() - 0.5) * 2 * remainingIntensity;
                this.cameraOffset.y = (Math.random() - 0.5) * 2 * remainingIntensity;
            }
        }
    }
    
    // Render all effects
    render(ctx) {
        // Save the original context state
        ctx.save();
        
        // Apply camera offset for screen shake
        ctx.translate(this.cameraOffset.x, this.cameraOffset.y);
        
        // Draw particles
        for (const particle of this.particles) {
            ctx.save();
            ctx.globalAlpha = particle.life / particle.maxLife; // Fade out as life decreases
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Restore original state
        ctx.restore();
    }
    
    // Clean up particles periodically
    cleanup() {
        // Remove all particles
        this.particles = [];
        
        // Reset screen shake
        this.screenShake = {
            intensity: 0,
            duration: 0,
            elapsed: 0
        };
        this.cameraOffset = { x: 0, y: 0 };
    }
    
    // Create landing effect when player lands after a jump
    createLandingEffect(x, y, force) {
        // More particles based on landing force
        const particleCount = Math.min(20, Math.floor(force * 3));
        this.createParticles(x, y, particleCount, 'rgba(139, 69, 19, 0.7)', 0.3, { min: -60, max: 60 });
    }
    
    // Create wall slide effect
    createWallSlideEffect(x, y, direction) {
        // Fewer particles that appear at intervals while sliding
        if (Math.random() > 0.7) { // Only create particles occasionally
            const offsetX = direction > 0 ? -5 : 5; // Offset from wall
            this.createParticles(x + offsetX, y, 3, 'rgba(100, 100, 100, 0.5)', 0.2, { min: -20, max: 20 });
        }
    }
    
    // Create ground pound effect
    createGroundPoundEffect(x, y) {
        // Strong downward particles to indicate impact
        this.createParticles(x, y, 25, 'rgba(139, 69, 19, 0.8)', 0.4, { min: -100, max: 100 });
        
        // Radial shockwave particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const vx = Math.cos(angle) * 100;
            const vy = Math.sin(angle) * 100;
            this.createParticles(x, y, 1, 'rgba(255, 200, 0, 0.7)', 0.3, { min: vx-10, max: vx+10 });
        }
    }
    
    // Get current camera offset for rendering
    getCameraOffset() {
        return this.cameraOffset;
    }
    
    // Get active particle count
    getActiveParticleCount() {
        return this.particles.length;
    }
}