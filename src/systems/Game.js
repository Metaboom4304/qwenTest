// Game System - Core game logic and state management
import { InputHandler } from './InputHandler.js';

export class Game {
    constructor(ctx, canvas, player, levelManager) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.player = player;
        this.levelManager = levelManager;
        this.input = new InputHandler();
        this.running = true;
        this.fps = 60;
        this.lastTime = 0;
        
        // Physics constants matching spec
        this.gravity = 0.5;
        this.airResistance = 0.98;
        
        // Initialize current level
        this.currentLevel = this.levelManager.loadLevel(1);
    }

    update(deltaTime) {
        if (!this.running) return;
        
        // Update player with delta time for frame-independent physics
        this.player.update(deltaTime, this.input, this.currentLevel);
        
        // Update level elements
        this.currentLevel.update(deltaTime);
    }

    render() {
        if (!this.running) return;
        
        // Clear canvas with level-appropriate background
        this.ctx.fillStyle = this.currentLevel.getBackgroundColor();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render level elements
        this.currentLevel.render(this.ctx);
        
        // Render player
        this.player.render(this.ctx);
        
        // Render UI elements
        this.renderUI();
    }

    renderUI() {
        // Minimalist HUD as specified
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#FFF';
        
        // Shards counter
        this.ctx.fillText(`Shards: ${this.player.collectedShards}`, this.canvas.width - 150, 30);
        
        // Energy orbs display
        this.renderEnergyOrbs();
    }

    renderEnergyOrbs() {
        // Draw 3 circular radial fill meters for energy orbs
        const orbSize = 20;
        for (let i = 0; i < 3; i++) {
            const x = this.canvas.width - 150 + (i * 30);
            const y = 60;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, orbSize/2, 0, 2 * Math.PI);
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            if (i < this.player.energyOrbs) {
                this.ctx.fillStyle = '#00FFFF';
                this.ctx.fill();
            }
        }
    }

    pause() {
        this.running = false;
    }

    resume() {
        this.running = true;
    }
}