// Audio Manager System - Implements dynamic adaptive soundtrack and SFX
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 1.0;
        this.musicVolume = 0.7;
        this.sfxVolume = 1.0;
        
        // Audio assets mapping
        this.audioAssets = {};
        
        // Music tracks for each level
        this.musicTracks = {
            1: { name: 'sun-dappled-canopy', description: 'Acoustic guitar + forest ambience' },
            2: { name: 'crystal-caverns', description: 'Reverb-heavy tones with crystal echoes' },
            3: { name: 'misty-marshlands', description: 'Ambient fog with water droplet rhythms' },
            4: { name: 'storm-touched-peaks', description: 'Intense orchestral with thunder percussion' },
            5: { name: 'heart-corruption', description: 'Dissonant strings building to orchestral climax' }
        };
        
        // SFX library matching specifications
        this.sfxLibrary = {
            jump: {
                description: 'Layered whoosh + subtle footstep',
                variations: ['grass', 'stone', 'ice']
            },
            collect_shard: {
                description: 'Glass chime + ascending pitch sweep (C4→G5)'
            },
            damage: {
                description: 'Low-frequency thud with screen flash'
            },
            dash: {
                description: 'Doppler effect sweep + wind rush'
            },
            wall_slide: {
                description: 'Scraping texture with decreasing pitch'
            },
            ground_pound: {
                description: 'Heavy impact with ground vibration'
            },
            checkpoint: {
                description: 'Magical chime indicating safe rest'
            },
            enemy_hit: {
                description: 'Stun effect sound'
            }
        };
        
        this.currentTrack = null;
        this.activeSounds = new Map();
        
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("Audio system initialized");
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
        }
    }
    
    // Play a music track for a specific level
    playMusicForLevel(levelNumber) {
        if (!this.audioContext) return;
        
        const trackInfo = this.musicTracks[levelNumber];
        if (!trackInfo) {
            console.warn(`No music track found for level ${levelNumber}`);
            return;
        }
        
        // Stop current track if playing
        if (this.currentTrack) {
            this.stopCurrentTrack();
        }
        
        // In a real implementation, we would load and play the actual audio file
        // For now, we'll simulate the adaptive nature with console logs
        console.log(`Playing music for Level ${levelNumber}: ${trackInfo.description}`);
        
        // Simulate dynamic adaptation based on game state
        this.currentTrack = levelNumber;
        this.adaptMusicToGameState('exploration');
    }
    
    // Adapt music dynamically based on game state
    adaptMusicToGameState(state) {
        if (!this.currentTrack) return;
        
        switch (state) {
            case 'exploration':
                console.log("Music: Calm exploration theme playing");
                break;
            case 'hazard_approach':
                console.log("Music: Tension building as hazard approaches");
                break;
            case 'action':
                console.log("Music: Intense action theme activated");
                break;
            case 'boss_fight':
                console.log("Music: Orchestral climax during boss fight");
                break;
            case 'calm_after_hazard':
                console.log("Music: Returning to calm exploration theme");
                break;
        }
    }
    
    // Play a sound effect
    playSFX(sfxName, params = {}) {
        if (!this.audioContext) return;
        
        const sfxInfo = this.sfxLibrary[sfxName];
        if (!sfxInfo) {
            console.warn(`SFX '${sfxName}' not found`);
            return;
        }
        
        // Simulate playing the sound effect
        console.log(`Playing SFX: ${sfxName} - ${sfxInfo.description}`);
        
        // In a real implementation, we would create and play audio buffers
        // Generate simple tones for demonstration purposes
        this.generateSimpleTone(sfxName, params);
    }
    
    // Generate simple tones for SFX demonstration
    generateSimpleTone(type, params = {}) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Configure based on sound type
        switch (type) {
            case 'collect_shard':
                // Glass chime + ascending pitch sweep (C4→G5)
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime); // C4
                oscillator.frequency.exponentialRampToValueAtTime(392.00, this.audioContext.currentTime + 0.3); // G5
                gainNode.gain.setValueAtTime(0.3 * this.sfxVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                break;
                
            case 'jump':
                // Whoosh sound
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2 * this.sfxVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                break;
                
            case 'dash':
                // Doppler effect sweep
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.4 * this.sfxVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                break;
                
            case 'damage':
                // Low-frequency thud
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.5 * this.sfxVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                break;
                
            default:
                // Default beep
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.3 * this.sfxVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        }
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + (params.duration || 0.5));
    }
    
    stopCurrentTrack() {
        if (this.currentTrack) {
            console.log(`Stopping music track for Level ${this.currentTrack}`);
            this.currentTrack = null;
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    muteAll() {
        this.setMasterVolume(0);
    }
    
    unmuteAll() {
        this.setMasterVolume(1.0);
    }
    
    // Method to be called when the game detects user interaction
    // (needed to unlock Web Audio in some browsers)
    enableAudioOnInteraction() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Global audio manager instance
export const audioManager = new AudioManager();

// Add event listener to enable audio on first user interaction
document.addEventListener('click', () => {
    audioManager.enableAudioOnInteraction();
}, { once: true });

document.addEventListener('keydown', () => {
    audioManager.enableAudioOnInteraction();
}, { once: true });