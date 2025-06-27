import { TrafficSignRenderer } from './TrafficSignRenderer.js';
import { TrafficLightRenderer } from './TrafficLightRenderer.js';
import { TrafficLightAnimator } from './TrafficLightAnimator.js';

/**
 * RealisticControlsRenderer - Main orchestrator for traffic control rendering
 */
export class RealisticControlsRenderer {
    constructor() {
        // Initialize sub-renderers
        this.signRenderer = new TrafficSignRenderer();
        this.lightRenderer = new TrafficLightRenderer();
        this.animator = new TrafficLightAnimator();
    }
    
    /**
     * Create a stop sign
     */
    createStopSign(center, angle, roadWidth) {
        return this.signRenderer.createStopSign(center, angle, roadWidth);
    }
    
    /**
     * Create a traffic light
     */
    createTrafficLight(center, angle, roadWidth, state = 'green', config = null) {
        const lightGroup = this.lightRenderer.createTrafficLight(center, angle, roadWidth, state, config);
        
        // Get the unique ID from the light group
        const uniqueId = lightGroup.getAttribute('data-unique-id');
        
        // Start animation if config is provided
        if (config && config.animate !== false) {
            // Find the housing group within the light group
            const housingGroup = lightGroup.querySelector('.traffic-light-housing');
            if (housingGroup) {
                this.startTrafficLightAnimation(housingGroup, uniqueId, config);
            }
        }
        
        return lightGroup;
    }
    
    /**
     * Create a yield sign
     */
    createYieldSign(center, angle, roadWidth) {
        return this.signRenderer.createYieldSign(center, angle, roadWidth);
    }
    
    /**
     * Start traffic light animation
     */
    startTrafficLightAnimation(lightGroup, uniqueId, config = {}) {
        this.animator.startAnimation(lightGroup, uniqueId, config);
    }
    
    /**
     * Stop traffic light animation
     */
    stopTrafficLightAnimation(uniqueId) {
        this.animator.stopAnimation(uniqueId);
    }
    
    /**
     * Set traffic light state manually
     */
    setLightState(lightGroup, state, uniqueId) {
        this.animator.setLightState(lightGroup, state, uniqueId);
    }
    
    /**
     * Cleanup all animations
     */
    cleanup() {
        this.animator.cleanup();
    }
    
    /**
     * Get configuration for traffic lights (for compatibility)
     */
    get trafficLight() {
        return this.lightRenderer.getConfig();
    }
    
    /**
     * Get configuration for stop signs (for compatibility)
     */
    get stopSign() {
        return this.signRenderer.stopSign;
    }
    
    /**
     * Get configuration for yield signs (for compatibility)
     */
    get yieldSign() {
        return this.signRenderer.yieldSign;
    }
}