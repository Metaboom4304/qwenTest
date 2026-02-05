// Level Manager System - Handles loading and managing the 5 distinct biomes
export class LevelManager {
    constructor() {
        this.levels = {};
        this.currentLevel = null;
        this.initializeLevels();
    }
    
    initializeLevels() {
        // Create the 5 specified levels
        this.levels[1] = new Level1SunDappledCanopy();
        this.levels[2] = new Level2CrystalCaverns();
        this.levels[3] = new Level3MistyMarshlands();
        this.levels[4] = new Level4StormTouchedPeaks();
        this.levels[5] = new Level5HeartOfCorruption();
    }
    
    loadLevel(levelNumber) {
        if (this.levels[levelNumber]) {
            this.currentLevel = this.levels[levelNumber];
            return this.currentLevel;
        } else {
            console.error(`Level ${levelNumber} does not exist!`);
            return this.levels[1]; // Default to level 1
        }
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    goToNextLevel() {
        const nextLevelNum = this.currentLevel.number + 1;
        if (nextLevelNum <= 5) {
            return this.loadLevel(nextLevelNum);
        }
        return null; // Game completed
    }
}

// Base Level class
class Level {
    constructor(number, name, width, height) {
        this.number = number;
        this.name = name;
        this.width = width;
        this.height = height;
        this.platforms = [];
        this.shards = [];
        this.enemies = [];
        this.checkpoints = [];
        this.backgroundLayers = [];
        this.hazards = [];
        this.collectibles = [];
        
        // Initialize common elements
        this.initializePlatforms();
        this.initializeShards();
        this.initializeEnemies();
        this.initializeCheckpoints();
    }
    
    initializePlatforms() {
        // Basic ground platform
        this.platforms.push({
            x: 0,
            y: 650,
            width: this.width,
            height: 50,
            type: 'ground'
        });
        
        // Add some basic platforms
        for (let i = 0; i < 10; i++) {
            this.platforms.push({
                x: 300 + i * 300,
                y: 550 - (i % 3) * 100,
                width: 100,
                height: 20,
                type: 'platform'
            });
        }
    }
    
    initializeShards() {
        // Place light shards according to specification
        for (let i = 0; i < this.getRequiredShardsCount(); i++) {
            this.shards.push({
                x: 400 + i * 200,
                y: 400 - (i % 4) * 80,
                collected: false,
                type: 'shard',
                id: i
            });
        }
    }
    
    initializeEnemies() {
        // Initialize enemies based on level
        const enemyCount = this.getEnemyCount();
        for (let i = 0; i < enemyCount; i++) {
            this.enemies.push({
                x: 500 + i * 400,
                y: 600,
                width: 30,
                height: 30,
                type: this.getEnemyType(),
                health: 1,
                patrolStart: 500 + i * 400,
                patrolEnd: 700 + i * 400,
                direction: 1
            });
        }
    }
    
    initializeCheckpoints() {
        // Add checkpoints as specified
        const checkpointCount = this.getCheckpointCount();
        for (let i = 0; i < checkpointCount; i++) {
            this.checkpoints.push({
                x: 1000 + i * 1000,
                y: 600,
                activated: false,
                type: 'checkpoint'
            });
        }
    }
    
    getRequiredShardsCount() { return 0; }
    getEnemyCount() { return 0; }
    getCheckpointCount() { return 0; }
    getEnemyType() { return 'basic'; }
    getBackgroundColor() { return '#FFFFFF'; }
    
    update(deltaTime) {
        // Update enemies' patrol behavior
        for (const enemy of this.enemies) {
            enemy.x += enemy.direction * 1.0; // Basic patrol speed
            
            if (enemy.x >= enemy.patrolEnd || enemy.x <= enemy.patrolStart) {
                enemy.direction *= -1;
            }
        }
    }
    
    render(ctx) {
        // Render background based on level theme
        ctx.fillStyle = this.getBackgroundColor();
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Render platforms
        ctx.fillStyle = '#8B4513'; // Brown for basic platforms
        for (const platform of this.platforms) {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
        
        // Render shards as golden particles
        for (const shard of this.shards) {
            if (!shard.collected) {
                ctx.fillStyle = '#FFD700'; // Gold color
                ctx.beginPath();
                ctx.arc(shard.x, shard.y, 8, 0, Math.PI * 2);
                ctx.fill();
                
                // Add a glow effect
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(shard.x, shard.y, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        
        // Render enemies
        ctx.fillStyle = '#FF0000'; // Red for enemies
        for (const enemy of this.enemies) {
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        
        // Render checkpoints
        ctx.fillStyle = '#00FF00'; // Green for checkpoints
        for (const checkpoint of this.checkpoints) {
            ctx.fillRect(checkpoint.x, checkpoint.y, 30, 50);
        }
    }
    
    checkCollisions(player) {
        // Check platform collisions
        for (const platform of this.platforms) {
            if (this.rectCollision(player, platform)) {
                // Simple collision response - stop downward movement if landing on top
                if (player.velocityY > 0 && player.y < platform.y) {
                    player.y = platform.y - 30; // Adjust for player height
                    player.velocityY = 0;
                    player.onGround = true;
                    player.jumpsRemaining = 2;
                }
            }
        }
        
        // Check shard collection
        for (const shard of this.shards) {
            if (!shard.collected) {
                const dist = Math.sqrt((player.x - shard.x)**2 + (player.y - shard.y)**2);
                if (dist < 20) {  // Collection radius
                    shard.collected = true;
                    player.collectShard();
                    
                    // Play collection sound effect simulation
                    console.log("Shard collected!");
                }
            }
        }
        
        // Check enemy collisions
        for (const enemy of this.enemies) {
            if (this.rectCollision(player, enemy)) {
                // For now, just log the collision
                console.log("Player hit enemy!");
            }
        }
        
        // Check checkpoint activation
        for (const checkpoint of this.checkpoints) {
            if (!checkpoint.activated) {
                const dist = Math.sqrt((player.x - checkpoint.x)**2 + (player.y - checkpoint.y)**2);
                if (dist < 30) {  // Activation radius
                    checkpoint.activated = true;
                    console.log("Checkpoint activated!");
                }
            }
        }
    }
    
    rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + 30 > rect2.x &&  // Assuming player width of 30
               rect1.y < rect2.y + rect2.height &&
               rect1.y + 30 < rect2.y;    // Assuming player height of 30
    }
}

// Level 1: Sun-Dappled Canopy (Daytime forest with vertical emphasis)
class Level1SunDappledCanopy extends Level {
    constructor() {
        super(1, "Sun-Dappled Canopy", 4500, 720);
    }
    
    getRequiredShardsCount() { return 15; }
    getEnemyCount() { return 2; }
    getCheckpointCount() { return 3; }
    getEnemyType() { return 'Glimmerbeetle'; }
    getBackgroundColor() { return '#88C9A1'; } // Warm greens/golds as specified
}

// Level 2: Crystal Caverns (Underground geode caves)
class Level2CrystalCaverns extends Level {
    constructor() {
        super(2, "Crystal Caverns", 4500, 720);
    }
    
    getRequiredShardsCount() { return 20; }
    getEnemyCount() { return 4; }
    getCheckpointCount() { return 4; }
    getEnemyType() { return 'Shard Sprite'; }
    getBackgroundColor() { return '#6B5CA5'; } // Cool purples/cyans as specified
    
    initializePlatforms() {
        // Different platform arrangement for caverns
        this.platforms.push({
            x: 0,
            y: 680,
            width: this.width,
            height: 20,
            type: 'ground'
        });
        
        // Add crystal platforms that appear when aligned with shards
        for (let i = 0; i < 8; i++) {
            this.platforms.push({
                x: 500 + i * 400,
                y: 500 - (i % 3) * 80,
                width: 80,
                height: 10,
                type: 'crystal-platform', // Special type for refraction mechanic
                visible: false
            });
        }
    }
}

// Level 3: Misty Marshlands (Foggy wetlands)
class Level3MistyMarshlands extends Level {
    constructor() {
        super(3, "Misty Marshlands", 4500, 720);
    }
    
    getRequiredShardsCount() { return 20; }
    getEnemyCount() { return 3; }
    getCheckpointCount() { return 3; }
    getEnemyType() { return 'Bog Hopper'; }
    getBackgroundColor() { return '#3A5F3A'; } // Dark green for misty atmosphere
    
    render(ctx) {
        super.render(ctx);
        
        // Add fog effect
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}

// Level 4: Storm-Touched Peaks (Mountain summit during thunderstorm)
class Level4StormTouchedPeaks extends Level {
    constructor() {
        super(4, "Storm-Touched Peaks", 4500, 720);
    }
    
    getRequiredShardsCount() { return 15; }
    getEnemyCount() { return 2; }
    getCheckpointCount() { return 2; }
    getEnemyType() { return 'Wind Phantom'; }
    getBackgroundColor() { return '#708090'; } // Gray for stormy atmosphere
    
    render(ctx) {
        super.render(ctx);
        
        // Add rain effect
        ctx.fillStyle = 'rgba(135, 206, 235, 0.4)';
        for (let i = 0; i < 100; i++) {
            const x = (Date.now() / 20 + i * 37) % ctx.canvas.width;
            const y = (Date.now() / 10 + i * 73) % ctx.canvas.height;
            ctx.fillRect(x, y, 1, 8);
        }
    }
}

// Level 5: Heart of the Corruption (Surreal corrupted core)
class Level5HeartOfCorruption extends Level {
    constructor() {
        super(5, "Heart of the Corruption", 4500, 720);
    }
    
    getRequiredShardsCount() { return 5; } // Final level, fewer but more important shards
    getEnemyCount() { return 1; } // Boss fight
    getCheckpointCount() { return 1; }
    getEnemyType() { return 'The Hollow Maw'; } // Boss
    getBackgroundColor() { return '#4A2525'; } // Desaturated reds/blacks as specified
}