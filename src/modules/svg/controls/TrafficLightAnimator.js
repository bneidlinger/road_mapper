/**
 * TrafficLightAnimator - Manages traffic light animations and state transitions
 */
export class TrafficLightAnimator {
    constructor() {
        // Default timing configuration (in seconds)
        this.defaultTiming = {
            cycleTime: 30,
            greenTime: 15,
            yellowTime: 3,
            redTime: 12
        };
        
        // Track active animations
        this.activeAnimations = new Map();
    }
    
    /**
     * Start traffic light animation cycle
     */
    startAnimation(lightGroup, uniqueId, config = {}) {
        // Stop any existing animation for this light
        this.stopAnimation(uniqueId);
        
        // Merge config with defaults
        const timing = {
            ...this.defaultTiming,
            ...config.timing
        };
        
        // Determine initial state based on config or default
        let currentState = config.initialState || 'green';
        
        // Set initial light state
        this.setLightState(lightGroup, currentState, uniqueId);
        
        // Calculate phase durations in milliseconds
        const redDuration = timing.redTime * 1000;
        
        // If starting with red, wait before transitioning
        if (currentState === 'red') {
            setTimeout(() => {
                this.startCycle(lightGroup, uniqueId, timing);
            }, redDuration);
        } else {
            this.startCycle(lightGroup, uniqueId, timing);
        }
        
        // Store animation info
        this.activeAnimations.set(uniqueId, {
            lightGroup,
            timing,
            active: true
        });
    }
    
    /**
     * Start the main animation cycle
     */
    startCycle(lightGroup, uniqueId, timing) {
        const animationInfo = this.activeAnimations.get(uniqueId);
        if (!animationInfo || !animationInfo.active) return;
        
        const greenDuration = timing.greenTime * 1000;
        const yellowDuration = timing.yellowTime * 1000;
        const redDuration = timing.redTime * 1000;
        
        const animateLights = () => {
            if (!this.activeAnimations.has(uniqueId) || !this.activeAnimations.get(uniqueId).active) {
                return;
            }
            
            // Green phase
            this.setLightState(lightGroup, 'green', uniqueId);
            
            setTimeout(() => {
                if (!this.isAnimationActive(uniqueId)) return;
                
                // Yellow phase
                this.setLightState(lightGroup, 'yellow', uniqueId);
                
                setTimeout(() => {
                    if (!this.isAnimationActive(uniqueId)) return;
                    
                    // Red phase
                    this.setLightState(lightGroup, 'red', uniqueId);
                    
                    setTimeout(() => {
                        if (!this.isAnimationActive(uniqueId)) return;
                        // Restart cycle
                        animateLights();
                    }, redDuration);
                }, yellowDuration);
            }, greenDuration);
        };
        
        // Start the animation loop
        animateLights();
    }
    
    /**
     * Stop traffic light animation
     */
    stopAnimation(uniqueId) {
        const animationInfo = this.activeAnimations.get(uniqueId);
        if (animationInfo) {
            animationInfo.active = false;
            this.activeAnimations.delete(uniqueId);
        }
    }
    
    /**
     * Check if animation is still active
     */
    isAnimationActive(uniqueId) {
        const animationInfo = this.activeAnimations.get(uniqueId);
        return animationInfo && animationInfo.active;
    }
    
    /**
     * Set the state of traffic lights
     */
    setLightState(lightGroup, state, uniqueId) {
        const lights = lightGroup.querySelectorAll('.light-bulb');
        lights.forEach(light => {
            const color = light.classList.contains('light-red') ? 'red' :
                         light.classList.contains('light-yellow') ? 'yellow' : 'green';
            
            const isActive = color === state;
            light.setAttribute('fill', isActive ? this.getLightColor(color) : '#222222');
            
            if (isActive) {
                light.setAttribute('filter', `url(#${uniqueId}-${color}-glow)`);
            } else {
                light.removeAttribute('filter');
            }
            
            // Update highlight for active light
            const highlight = light.nextElementSibling;
            if (highlight && highlight.classList.contains('light-highlight')) {
                highlight.setAttribute('opacity', isActive ? '0.6' : '0');
            }
        });
    }
    
    /**
     * Get light color for a given state
     */
    getLightColor(color) {
        const colors = {
            red: '#ff0000',
            yellow: '#ffaa00',
            green: '#00ff00'
        };
        return colors[color] || '#222222';
    }
    
    /**
     * Cleanup all animations
     */
    cleanup() {
        // Stop all active animations
        this.activeAnimations.forEach((info, uniqueId) => {
            this.stopAnimation(uniqueId);
        });
        this.activeAnimations.clear();
    }
    
    /**
     * Get animation status for debugging
     */
    getAnimationStatus() {
        const status = {};
        this.activeAnimations.forEach((info, id) => {
            status[id] = {
                active: info.active,
                timing: info.timing
            };
        });
        return status;
    }
}