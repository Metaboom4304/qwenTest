// Save System - Implements auto-save at checkpoints and manual save slots
export class SaveSystem {
    constructor() {
        this.autoSaveEnabled = true;
        this.manualSaveSlots = 3;
        this.saveData = {
            currentLevel: 1,
            shardsCollected: 0,
            totalShards: 75, // Total across all levels
            playerProgress: {
                level: 1,
                x: 100,
                y: 600,
                collectedShards: 0,
                energyOrbs: 3,
                unlockedCosmetics: [],
                completionTime: 0
            },
            levelProgress: {
                1: { unlocked: true, completed: false, shards: 0, bestTime: null },
                2: { unlocked: false, completed: false, shards: 0, bestTime: null },
                3: { unlocked: false, completed: false, shards: 0, bestTime: null },
                4: { unlocked: false, completed: false, shards: 0, bestTime: null },
                5: { unlocked: false, completed: false, shards: 0, bestTime: null }
            },
            settings: {
                volume: 0.7,
                musicVolume: 0.7,
                sfxVolume: 0.8,
                colorblindMode: false,
                timingAssist: false,
                motionReduction: false,
                touchControls: true
            },
            checkpoints: [],
            timestamps: {
                firstPlayed: null,
                lastPlayed: null,
                totalTimePlayed: 0
            }
        };
        
        this.loadSaveData();
    }
    
    // Auto-save at checkpoints
    autoSaveAtCheckpoint(level, checkpointPosition) {
        if (!this.autoSaveEnabled) return;
        
        this.saveData.currentLevel = level;
        this.saveData.checkpoints.push({
            level: level,
            position: checkpointPosition,
            timestamp: Date.now()
        });
        
        // Update level progress
        if (level in this.saveData.levelProgress) {
            this.saveData.levelProgress[level].unlocked = true;
        }
        
        this.saveData.timestamps.lastPlayed = Date.now();
        
        this.writeSaveData();
        console.log(`Auto-saved at checkpoint in level ${level}`);
    }
    
    // Manual save to specific slot
    manualSave(slotIndex, slotName = null) {
        if (slotIndex < 0 || slotIndex >= this.manualSaveSlots) {
            console.error(`Invalid save slot index: ${slotIndex}`);
            return false;
        }
        
        const saveSlotKey = `lumina_save_slot_${slotIndex}`;
        const slotData = {
            ...this.saveData,
            slotName: slotName || `Slot ${slotIndex + 1}`,
            savedAt: Date.now()
        };
        
        try {
            localStorage.setItem(saveSlotKey, JSON.stringify(slotData));
            console.log(`Saved game to slot ${slotIndex + 1}`);
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }
    
    // Load from specific slot
    loadFromSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.manualSaveSlots) {
            console.error(`Invalid save slot index: ${slotIndex}`);
            return false;
        }
        
        const saveSlotKey = `lumina_save_slot_${slotIndex}`;
        const savedData = localStorage.getItem(saveSlotKey);
        
        if (savedData) {
            try {
                this.saveData = JSON.parse(savedData);
                console.log(`Loaded game from slot ${slotIndex + 1}`);
                return true;
            } catch (e) {
                console.error('Failed to load save data:', e);
                return false;
            }
        } else {
            console.log(`No save data found in slot ${slotIndex + 1}`);
            return false;
        }
    }
    
    // Get information about save slots
    getSaveSlotInfo() {
        const slotsInfo = [];
        
        for (let i = 0; i < this.manualSaveSlots; i++) {
            const saveSlotKey = `lumina_save_slot_${i}`;
            const savedData = localStorage.getItem(saveSlotKey);
            
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    slotsInfo.push({
                        slot: i + 1,
                        name: data.slotName || `Slot ${i + 1}`,
                        savedAt: data.savedAt ? new Date(data.savedAt).toLocaleString() : 'Unknown',
                        level: data.playerProgress.level,
                        shards: data.playerProgress.collectedShards
                    });
                } catch (e) {
                    slotsInfo.push({
                        slot: i + 1,
                        name: `Slot ${i + 1} (Corrupted)`,
                        savedAt: 'Error',
                        level: 0,
                        shards: 0
                    });
                }
            } else {
                slotsInfo.push({
                    slot: i + 1,
                    name: `Empty Slot`,
                    savedAt: 'Never',
                    level: 0,
                    shards: 0
                });
            }
        }
        
        return slotsInfo;
    }
    
    // Write save data to local storage
    writeSaveData() {
        try {
            localStorage.setItem('lumina_save_data', JSON.stringify(this.saveData));
        } catch (e) {
            console.error('Failed to write save data:', e);
        }
    }
    
    // Load save data from local storage
    loadSaveData() {
        const savedData = localStorage.getItem('lumina_save_data');
        
        if (savedData) {
            try {
                this.saveData = JSON.parse(savedData);
                console.log('Save data loaded successfully');
            } catch (e) {
                console.error('Failed to parse save data:', e);
                // Reset to default if parsing fails
                this.resetSaveData();
            }
        } else {
            // No save data found, initialize first play
            this.initializeNewGame();
        }
    }
    
    // Initialize a new game
    initializeNewGame() {
        this.saveData.timestamps.firstPlayed = Date.now();
        this.saveData.timestamps.lastPlayed = Date.now();
        console.log('New game initialized');
    }
    
    // Reset save data (for debugging or new game+)
    resetSaveData() {
        this.saveData = {
            currentLevel: 1,
            shardsCollected: 0,
            totalShards: 75,
            playerProgress: {
                level: 1,
                x: 100,
                y: 600,
                collectedShards: 0,
                energyOrbs: 3,
                unlockedCosmetics: [],
                completionTime: 0
            },
            levelProgress: {
                1: { unlocked: true, completed: false, shards: 0, bestTime: null },
                2: { unlocked: false, completed: false, shards: 0, bestTime: null },
                3: { unlocked: false, completed: false, shards: 0, bestTime: null },
                4: { unlocked: false, completed: false, shards: 0, bestTime: null },
                5: { unlocked: false, completed: false, shards: 0, bestTime: null }
            },
            settings: {
                volume: 0.7,
                musicVolume: 0.7,
                sfxVolume: 0.8,
                colorblindMode: false,
                timingAssist: false,
                motionReduction: false,
                touchControls: true
            },
            checkpoints: [],
            timestamps: {
                firstPlayed: Date.now(),
                lastPlayed: Date.now(),
                totalTimePlayed: 0
            }
        };
        
        this.writeSaveData();
    }
    
    // Update level completion status
    markLevelCompleted(levelNumber, shardsCollected, completionTime) {
        if (levelNumber in this.saveData.levelProgress) {
            this.saveData.levelProgress[levelNumber].completed = true;
            this.saveData.levelProgress[levelNumber].shards = shardsCollected;
            
            // Update best time if this is better
            if (!this.saveData.levelProgress[levelNumber].bestTime || 
                completionTime < this.saveData.levelProgress[levelNumber].bestTime) {
                this.saveData.levelProgress[levelNumber].bestTime = completionTime;
            }
            
            // Unlock next level
            if (levelNumber < 5) {
                this.saveData.levelProgress[levelNumber + 1].unlocked = true;
            }
            
            // Update overall progress
            this.saveData.playerProgress.collectedShards += shardsCollected;
            
            this.writeSaveData();
        }
    }
    
    // Unlock cosmetic item
    unlockCosmetic(cosmeticId) {
        if (!this.saveData.playerProgress.unlockedCosmetics.includes(cosmeticId)) {
            this.saveData.playerProgress.unlockedCosmetics.push(cosmeticId);
            this.writeSaveData();
            console.log(`Unlocked cosmetic: ${cosmeticId}`);
        }
    }
    
    // Update settings
    updateSettings(newSettings) {
        this.saveData.settings = { ...this.saveData.settings, ...newSettings };
        this.writeSaveData();
    }
    
    // Get current settings
    getSettings() {
        return this.saveData.settings;
    }
    
    // Check if secret level is unlocked (all 75 shards collected)
    isSecretLevelUnlocked() {
        return this.saveData.playerProgress.collectedShards >= 75;
    }
}