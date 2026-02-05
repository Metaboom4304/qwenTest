// Input Handler System - Handles keyboard and touch input with 8ms buffering
export class InputHandler {
    constructor() {
        this.keys = {};
        this.touches = {};
        
        // Input buffer for 8ms buffer on jump presses
        this.inputBuffer = {
            jump: 0,
            dash: 0
        };
        
        // Previous frame state for detecting just pressed/released
        this.prevKeys = {};
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Touch events for mobile optimization
        window.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouch(e, true);
        });
        
        window.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleTouch(e, false);
        });
        
        // Prevent scrolling on touch
        window.addEventListener('touchmove', (e) => {
            if (e.target === document.body) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    handleTouch(e, isDown) {
        // For simplicity, we'll map touch areas to virtual buttons
        // In a real implementation, we'd have visible touch controls
        const rect = e.target.getBoundingClientRect();
        
        for (let touch of e.changedTouches) {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Map touch positions to game actions
            // Left side for movement, right side for actions
            if (x < rect.width / 2) {
                // Movement controls (virtual d-pad)
                this.touches['left'] = isDown && x < rect.width / 4;
                this.touches['right'] = isDown && x > rect.width / 4 && x < rect.width / 2;
                this.touches['up'] = isDown && y < rect.height / 2;
                this.touches['down'] = isDown && y > rect.height / 2;
            } else {
                // Action buttons (jump/dash on right side as specified)
                this.touches['jump'] = isDown && x > rect.width * 0.75;
                this.touches['dash'] = isDown && x > rect.width * 0.5 && x < rect.width * 0.75;
            }
        }
    }
    
    update(prevInputState) {
        // Store previous state
        this.prevKeys = {...this.keys};
        
        // Update input buffer timers
        if (this.inputBuffer.jump > 0) {
            this.inputBuffer.jump -= 16; // Assuming ~60fps, 16ms per frame
        }
        if (this.inputBuffer.dash > 0) {
            this.inputBuffer.dash -= 16;
        }
        
        // Check for jump press (with 8ms input buffering)
        if (this.isKeyPressed('Space') || this.touches['jump']) {
            this.inputBuffer.jump = 8; // 8ms buffer
        }
        
        // Check for dash press (with 8ms input buffering)
        if (this.isKeyPressed('ShiftLeft') || this.touches['dash']) {
            this.inputBuffer.dash = 8; // 8ms buffer
        }
    }
    
    // Getters for input state
    get left() {
        return this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touches['left'];
    }
    
    get right() {
        return this.keys['ArrowRight'] || this.keys['KeyD'] || this.touches['right'];
    }
    
    get jump() {
        return this.keys['Space'] || this.touches['jump'] || this.inputBuffer.jump > 0;
    }
    
    get dash() {
        return this.keys['ShiftLeft'] || this.keys['KeyX'] || this.touches['dash'] || this.inputBuffer.dash > 0;
    }
    
    get down() {
        return this.keys['ArrowDown'] || this.keys['KeyS'] || this.touches['down'];
    }
    
    // Check if key was just pressed (current frame only)
    get jumpJustPressed() {
        return (this.keys['Space'] && !this.prevKeys['Space']) || 
               (this.touches['jump'] && !this.prevInputState?.touches?.['jump']) ||
               this.inputBuffer.jump > 0 && !(this.prevInputState?.inputBuffer?.jump > 0);
    }
    
    get dashJustPressed() {
        return (this.keys['ShiftLeft'] && !this.prevKeys['ShiftLeft']) || 
               (this.touches['dash'] && !this.prevInputState?.touches?.['dash']) ||
               this.inputBuffer.dash > 0 && !(this.prevInputState?.inputBuffer?.dash > 0);
    }
    
    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }
    
    isKeyReleased(keyCode) {
        return this.keys[keyCode] === false;
    }
}