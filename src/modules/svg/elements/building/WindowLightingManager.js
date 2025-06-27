/**
 * WindowLightingManager - Manages window lighting states for buildings
 * Provides stable, time-based lighting changes instead of random on each render
 */
export class WindowLightingManager {
    constructor() {
        // Store lighting states by building ID and window index
        this.lightingStates = new Map();
        
        // Animation settings
        this.updateInterval = 10000; // Update some windows every 10 seconds (reduced frequency)
        this.changePercentage = 0.02; // 2% of windows change state per update (reduced changes)
        
        // Start the animation loop
        this.startAnimation();
    }
    
    /**
     * Get or create lighting state for a building's windows
     */
    getWindowLightingState(buildingId, windowCount) {
        // Ensure we have a stable building ID
        if (!buildingId || buildingId === 'undefined') {
            console.warn('WindowLightingManager: Invalid building ID:', buildingId);
            return new Array(windowCount).fill(false);
        }
        
        if (!this.lightingStates.has(buildingId)) {
            // Initialize random lighting pattern for this building
            const states = [];
            for (let i = 0; i < windowCount; i++) {
                // 70% chance of being lit initially
                states.push(Math.random() > 0.3);
            }
            this.lightingStates.set(buildingId, states);
        }
        
        const states = this.lightingStates.get(buildingId);
        
        // If window count changed (building resized), adjust array
        if (states.length !== windowCount) {
            if (states.length < windowCount) {
                // Add new windows
                for (let i = states.length; i < windowCount; i++) {
                    states.push(Math.random() > 0.3);
                }
            } else {
                // Remove excess windows
                states.length = windowCount;
            }
        }
        
        return states;
    }
    
    /**
     * Get whether a specific window should be lit
     */
    isWindowLit(buildingId, windowIndex, totalWindows) {
        const states = this.getWindowLightingState(buildingId, totalWindows);
        return states[windowIndex] || false;
    }
    
    /**
     * Start the lighting animation loop
     */
    startAnimation() {
        this.animationInterval = setInterval(() => {
            this.updateLighting();
        }, this.updateInterval);
    }
    
    /**
     * Stop the lighting animation
     */
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }
    
    /**
     * Update lighting for a random selection of windows
     */
    updateLighting() {
        // Don't update if no buildings or document not visible
        if (this.lightingStates.size === 0) return;
        if (document.hidden) return; // Skip updates when tab is not visible
        
        // Get visible buildings only
        const visibleBuildingIds = new Set();
        const visibleElements = document.querySelectorAll('.building-element:not([style*="display: none"])');
        visibleElements.forEach(el => {
            const id = el.getAttribute('data-building-id');
            if (id) visibleBuildingIds.add(id);
        });
        
        // Only update visible buildings
        this.lightingStates.forEach((states, buildingId) => {
            if (!visibleBuildingIds.has(buildingId)) return;
            
            const numToChange = Math.max(1, Math.floor(states.length * this.changePercentage));
            
            for (let i = 0; i < numToChange; i++) {
                const windowIndex = Math.floor(Math.random() * states.length);
                // Toggle the window state
                states[windowIndex] = !states[windowIndex];
            }
        });
        
        // Trigger update for visible building elements
        if (typeof window !== 'undefined' && window.roadMapperApp) {
            this.triggerBuildingUpdates();
        }
    }
    
    /**
     * Trigger window updates for all buildings
     */
    triggerBuildingUpdates() {
        // Only update visible buildings
        const buildingElements = document.querySelectorAll('.building-element:not([style*="display: none"])');
        
        // Batch update visible buildings
        requestAnimationFrame(() => {
            buildingElements.forEach(element => {
                const buildingId = element.getAttribute('data-building-id');
                if (buildingId && window.roadMapperApp && window.roadMapperApp.renderer) {
                    const svgElement = window.roadMapperApp.renderer.svgElements.get(buildingId);
                    if (svgElement && svgElement.updateWindowLighting) {
                        // Only update if building has windows visible
                        const detailsGroup = element.querySelector('.building-standard');
                        if (detailsGroup && detailsGroup.style.display !== 'none') {
                            svgElement.updateWindowLighting();
                        }
                    }
                }
            });
        });
    }
    
    /**
     * Clear lighting state for a building
     */
    clearBuildingState(buildingId) {
        this.lightingStates.delete(buildingId);
    }
    
    /**
     * Clear all lighting states
     */
    clearAllStates() {
        this.lightingStates.clear();
    }
    
    /**
     * Set time of day factor (0-1, where 0 is night and 1 is day)
     * This affects the percentage of lit windows
     */
    setTimeOfDay(factor) {
        // At night (0), 80% windows lit
        // During day (1), 20% windows lit
        const litProbability = 0.8 - (factor * 0.6);
        
        // Update all existing states based on new time
        this.lightingStates.forEach((states, buildingId) => {
            states.forEach((state, index) => {
                // Randomly adjust based on time of day
                if (Math.random() < 0.1) { // 10% chance to change
                    states[index] = Math.random() < litProbability;
                }
            });
        });
    }
}

// Create singleton instance
export const windowLightingManager = new WindowLightingManager();