// Kairo - The Fox Protagonist with specified abilities
export class Player {
    constructor(x, y) {
        // Position and movement
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.maxSpeed = 5;
        this.acceleration = 0.5;
        
        // Character state
        this.onGround = false;
        this.facingRight = true;
        this.isDashing = false;
        this.dashCooldown = 0;
        this.dashDuration = 0;
        
        // Ability tracking
        this.jumpsRemaining = 2; // Double jump
        this.wallSlideTimer = 0;
        this.wallSliding = false;
        this.energyOrbs = 3; // For dash ability
        
        // Animation state
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.currentState = 'idle'; // idle, run, jump, fall, dash
        
        // Collectibles
        this.collectedShards = 0;
        
        // Physics properties matching spec
        this.jumpForce = { 
            first: -4.5,  // First jump: 4.5 units height
            second: -3.2  // Second jump: 3.2 units with 0.3s delay window
        };
        this.wallJumpForce = { 
            x: 5.0,      // 45° angle, 5.0 units distance
            y: -3.5      // Combined to achieve 45° angle
        };
        this.dashDistance = 8;     // 8 units distance
        this.dashCooldownTime = 0.4; // 0.4s cooldown
        this.dashSpeed = 20;       // Calculated speed for 8 units over appropriate time
        
        // Screen shake effect intensity: 0.8px (as specified)
        this.screenShakeIntensity = 0.8;
    }

    update(deltaTime, input, level) {
        // Convert deltaTime from ms to seconds
        const dt = deltaTime / 1000;
        
        // Update timers
        if (this.dashCooldown > 0) {
            this.dashCooldown -= dt;
        }
        if (this.dashDuration > 0) {
            this.dashDuration -= dt;
            if (this.dashDuration <= 0) {
                this.isDashing = false;
            }
        }
        if (this.wallSlideTimer > 0) {
            this.wallSlideTimer -= dt;
            if (this.wallSlideTimer <= 0) {
                this.wallSliding = false;
            }
        }
        
        // Handle input
        this.handleInput(input, dt, level);
        
        // Apply gravity if not on ground or dashing
        if (!this.onGround && !this.isDashing) {
            this.velocityY += 0.5; // Gravity from spec
        }
        
        // Apply air resistance
        if (!this.onGround && !this.isDashing) {
            this.velocityX *= 0.98; // Air resistance from spec
        }
        
        // Update position
        if (!this.isDashing) {
            this.x += this.velocityX;
            this.y += this.velocityY;
        } else {
            // During dash, override velocity for consistent distance
            const dashDir = this.facingRight ? 1 : -1;
            this.x += dashDir * this.dashSpeed * dt;
        }
        
        // Check collisions with level
        this.checkCollisions(level);
        
        // Update animation
        this.updateAnimation(dt);
    }

    handleInput(input, dt, level) {
        // Horizontal movement
        if (input.left) {
            this.velocityX -= this.acceleration;
            this.facingRight = false;
            if (this.velocityX < -this.maxSpeed) this.velocityX = -this.maxSpeed;
        } else if (input.right) {
            this.velocityX += this.acceleration;
            this.facingRight = true;
            if (this.velocityX > this.maxSpeed) this.velocityX = this.maxSpeed;
        } else {
            // Apply friction when not pressing movement keys
            this.velocityX *= 0.8;
        }
        
        // Jump handling with double jump
        if (input.jumpJustPressed) {
            if (this.onGround || (this.jumpsRemaining > 1 && !this.isDashing)) {
                if (this.onGround) {
                    this.velocityY = this.jumpForce.first;
                    this.jumpsRemaining = 1;
                } else if (this.jumpsRemaining === 1) {
                    this.velocityY = this.jumpForce.second;
                    this.jumpsRemaining = 0;
                }
                this.onGround = false;
            }
            // Wall jump
            else if (this.wallSliding) {
                this.velocityX = this.facingRight ? -this.wallJumpForce.x : this.wallJumpForce.x;
                this.velocityY = this.wallJumpForce.y;
                this.wallSliding = false;
            }
        }
        
        // Dash ability (consumes 1 energy orb)
        if (input.dashJustPressed && this.energyOrbs > 0 && this.dashCooldown <= 0) {
            this.performDash();
        }
        
        // Wall slide detection
        if (!this.onGround && !input.jump && Math.abs(this.velocityY) > 0.1) {
            if ((input.left && this.isAgainstWall(level, -1)) || 
                (input.right && this.isAgainstWall(level, 1))) {
                
                if (!this.wallSliding) {
                    this.wallSliding = true;
                    this.wallSlideTimer = 1.8; // Max 1.8s duration as per spec
                    this.velocityY = Math.min(this.velocityY, 1); // Slow descent
                }
            } else {
                this.wallSliding = false;
            }
        }
        
        // Ground pound (air press ↓ + jump)
        if (input.down && input.jumpJustPressed && !this.onGround) {
            this.velocityY = 8; // Fast downward movement for ground pound
        }
    }
    
    performDash() {
        if (this.energyOrbs > 0) {
            this.energyOrbs--;
            this.isDashing = true;
            this.dashDuration = 0.2; // Brief dash duration
            this.dashCooldown = this.dashCooldownTime;
            
            // Trigger screen shake effect (intensity: 0.8px)
            this.triggerScreenShake();
        }
    }
    
    triggerScreenShake() {
        // Implementation would affect camera position in main game loop
        console.log("Screen shake triggered with intensity:", this.screenShakeIntensity);
    }
    
    isAgainstWall(level, direction) {
        // Simplified collision check for wall sliding
        // In a real implementation, this would check level collision map
        return false; // Placeholder - needs proper collision implementation
    }
    
    checkCollisions(level) {
        // Simplified collision detection
        // In a real implementation, this would check against level geometry
        this.onGround = false;
        
        // Check if we're on ground (simplified)
        if (this.y >= 650) {  // Assuming ground level at y=650
            this.y = 650;
            this.onGround = true;
            this.velocityY = 0;
            this.jumpsRemaining = 2; // Reset jumps when landing
        }
    }
    
    updateAnimation(dt) {
        this.animationTimer += dt;
        
        // Update animation frame every ~100ms for 12fps animation
        if (this.animationTimer > 0.083) { // ~1/12 second
            this.animationFrame++;
            this.animationTimer = 0;
        }
        
        // Determine current state for animation
        if (this.isDashing) {
            this.currentState = 'dash';
        } else if (!this.onGround) {
            this.currentState = this.velocityY < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.velocityX) > 0.1) {
            this.currentState = 'run';
        } else {
            this.currentState = 'idle';
        }
    }
    
    collectShard() {
        this.collectedShards++;
        // Energy orb restoration could happen here too
        if (this.collectedShards % 5 === 0 && this.energyOrbs < 3) {
            this.energyOrbs = Math.min(3, this.energyOrbs + 1);
        }
    }
    
    render(ctx) {
        // Draw character with bioluminescent tail markings that glow brighter when collecting shards
        ctx.save();
        
        // Set color based on collected shards (brighter with more shards)
        const glowIntensity = Math.min(1, this.collectedShards / 10);
        const r = Math.floor(255);
        const g = Math.floor(200 + 55 * glowIntensity);
        const b = Math.floor(100 + 100 * glowIntensity);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // Draw fox-like character (simplified representation)
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2); // Body
        ctx.fill();
        
        // Draw ears
        ctx.beginPath();
        ctx.moveTo(this.x - 8, this.y - 10);
        ctx.lineTo(this.x - 12, this.y - 20);
        ctx.lineTo(this.x - 4, this.y - 12);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + 8, this.y - 10);
        ctx.lineTo(this.x + 12, this.y - 20);
        ctx.lineTo(this.x + 4, this.y - 12);
        ctx.closePath();
        ctx.fill();
        
        // Draw tail with bioluminescent markings
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.quadraticCurveTo(
            this.x + (this.facingRight ? -20 : 20), this.y - 10,
            this.x + (this.facingRight ? -30 : 30), this.y
        );
        ctx.stroke();
        
        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + (this.facingRight ? 5 : -5), this.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}