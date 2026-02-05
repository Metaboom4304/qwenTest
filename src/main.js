// Lumina: Shards of the Ancient Forest - Main Game Entry Point
import { Game } from './systems/Game.js';
import { Player } from './systems/Player.js';
import { LevelManager } from './systems/LevelManager.js';

/**
 * Main game initialization
 */
class LuminaGame {
    constructor() {
        this.game = null;
        this.canvas = null;
        this.ctx = null;
        this.init();
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.ctx = this.canvas.getContext('2d');
        
        // Append to body
        document.body.appendChild(this.canvas);
        
        // Initialize game systems
        this.levelManager = new LevelManager();
        this.player = new Player(100, 600);
        this.game = new Game(this.ctx, this.canvas, this.player, this.levelManager);
        
        // Start game loop
        this.gameLoop();
    }

    gameLoop() {
        const loop = () => {
            this.update();
            this.render();
            requestAnimationFrame(loop);
        };
        loop();
    }

    update() {
        this.game.update();
    }

    render() {
        this.game.render();
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new LuminaGame();
});