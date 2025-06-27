import { SVGBaseElement } from '../../SVGBaseElement.js';
import { isometricRenderer } from '../../../rendering/IsometricRenderer.js';
import { BuildingStyleManager } from './BuildingStyleManager.js';
import { BuildingEffectsManager } from './BuildingEffectsManager.js';
import { BuildingDetailsRenderer } from './BuildingDetailsRenderer.js';
import { IsometricBuildingRenderer } from './IsometricBuildingRenderer.js';
import { windowLightingManager } from './WindowLightingManager.js';

/**
 * SVG Building Element - Wrapper for building SVG rendering
 */
export class SVGBuildingElement extends SVGBaseElement {
    constructor(building, svgManager) {
        super();
        this.building = building;
        this.svgManager = svgManager;
        
        // Create the main group
        this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.group.setAttribute('class', 'building-element');
        this.group.setAttribute('data-building-id', building.id);
        this.group.setAttribute('data-element-type', 'building');
        
        // Create sub-groups for different rendering modes
        this.standardGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.standardGroup.setAttribute('class', 'building-standard');
        this.isometricGroup = null; // Will be created if needed
        
        this.group.appendChild(this.standardGroup);
        
        // Create building elements
        this.createBuildingElements();
        
        // Create isometric elements
        this.createIsometricElements();
        
        // Create city light elements for bird's eye view
        this.cityLightGroup = BuildingEffectsManager.createCityLightElements(this.building);
        this.group.appendChild(this.cityLightGroup);
        
        // Set initial state
        this.updatePosition();
        this.updateDetailLevel(1, false);
        this.updateRenderMode();
    }
    
    /**
     * Create the building SVG elements
     */
    createBuildingElements() {
        
        // Building base/footprint
        this.base = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const baseAttrs = BuildingStyleManager.getBuildingBaseAttributes(this.building);
        Object.entries(baseAttrs).forEach(([key, value]) => {
            this.base.setAttribute(key, value);
        });
        
        // Apply filter
        const filter = BuildingStyleManager.getBuildingFilter(this.building);
        if (filter) {
            this.base.setAttribute('filter', filter);
        }
        
        // Add subtle 3D edge highlight for depth
        this.highlight = BuildingEffectsManager.createHighlight(this.building);
        
        // Add elements to standard group
        this.standardGroup.appendChild(this.base);
        this.standardGroup.appendChild(this.highlight);
        
        // Add type-specific details
        this.detailsGroup = BuildingDetailsRenderer.createTypeSpecificDetails(this.building);
        this.standardGroup.appendChild(this.detailsGroup);
        
        // Initially hide details if zoom is low
        if (this.svgManager && this.svgManager.viewport && this.svgManager.viewport.zoom < 2) {
            this.detailsGroup.style.display = 'none';
        }
    }
    
    /**
     * Create isometric building elements
     */
    createIsometricElements() {
        if (!this.building) return;
        
        this.isometricGroup = IsometricBuildingRenderer.createIsometricElements(this.building, this.svgManager);
        if (this.isometricGroup) {
            this.group.appendChild(this.isometricGroup);
        }
    }
    
    /**
     * Update render mode based on isometric state
     */
    updateRenderMode() {
        const isIsometric = isometricRenderer.isEnabled();
        
        // Show/hide appropriate groups
        this.standardGroup.style.display = isIsometric ? 'none' : '';
        if (this.isometricGroup) {
            this.isometricGroup.style.display = isIsometric ? '' : 'none';
            
            // Setup hover effects for isometric mode
            if (isIsometric) {
                BuildingEffectsManager.setupIsometricHoverEffects(this.isometricGroup, this.building);
            }
        }
    }
    
    /**
     * Update building position
     */
    updatePosition() {
        if (this.building.rotation && this.building.rotation !== 0) {
            const centerX = this.building.x + this.building.width / 2;
            const centerY = this.building.y + this.building.height / 2;
            this.group.setAttribute('transform', 
                `rotate(${this.building.rotation} ${centerX} ${centerY})`
            );
        }
    }
    
    /**
     * Update detail level based on zoom
     */
    updateDetailLevel(zoom, isBirdsEye) {
        // Skip updates if visibility hasn't changed
        const newLevel = this.calculateDetailLevel(zoom, isBirdsEye);
        if (this._currentDetailLevel === newLevel) {
            return;
        }
        this._currentDetailLevel = newLevel;
        // First update render mode
        this.updateRenderMode();
        
        // Update city light visibility
        BuildingEffectsManager.updateCityLightVisibility(this.cityLightGroup, zoom, isBirdsEye);
        
        // Bird's eye view - show as city lights
        if (isBirdsEye || zoom < 0.3) {
            this.group.style.display = '';
            
            // Hide all building elements
            this.standardGroup.style.display = 'none';
            if (this.isometricGroup) {
                this.isometricGroup.style.display = 'none';
            }
        } else if (zoom < 0.5) {
            // Transition zone - fade from lights to buildings
            this.group.style.display = '';
            
            const buildingOpacity = (zoom - 0.3) * 5; // 0 at 0.3, 1 at 0.5
            
            // Show building with fading
            this.base.style.display = '';
            this.base.style.opacity = buildingOpacity * 0.6;
            if (this.highlight) this.highlight.style.display = 'none';
            if (this.detailsGroup) this.detailsGroup.style.display = 'none';
        } else if (zoom < 1) {
            // Medium zoom - show basic building without details
            this.group.style.display = '';
            this.group.style.opacity = '1';
            
            // Show building elements
            this.base.style.display = '';
            this.base.style.opacity = '1';
            
            // Hide all details at this zoom level
            if (this.detailsGroup) this.detailsGroup.style.display = 'none';
            if (this.highlight) this.highlight.style.display = 'none';
            
            // Hide isometric details if present
            if (this.isometricGroup) {
                const windows = this.isometricGroup.querySelectorAll('.building-window, .floor-line');
                windows.forEach(w => w.style.display = 'none');
            }
        } else if (zoom < 2) {
            // High zoom - show basic details but not windows
            this.group.style.display = '';
            this.group.style.opacity = '1';
            
            // Show all building elements
            this.base.style.display = '';
            this.base.style.opacity = '1';
            if (this.highlight) this.highlight.style.display = '';
            if (this.detailsGroup) this.detailsGroup.style.display = 'none';
            
            // Show basic isometric details but not windows
            if (this.isometricGroup) {
                const windows = this.isometricGroup.querySelectorAll('.building-window');
                windows.forEach(w => w.style.display = 'none');
                const floorLines = this.isometricGroup.querySelectorAll('.floor-line');
                floorLines.forEach(f => f.style.display = '');
            }
        } else {
            // Very high zoom - show all details including type-specific elements
            this.group.style.display = '';
            this.group.style.opacity = '1';
            
            // Show all building elements
            this.base.style.display = '';
            this.base.style.opacity = '1';
            if (this.highlight) this.highlight.style.display = '';
            if (this.detailsGroup) {
                this.detailsGroup.style.display = '';
            }
        }
    }
    
    /**
     * Calculate detail level based on zoom
     */
    calculateDetailLevel(zoom, isBirdsEye) {
        if (isBirdsEye || zoom < 0.3) return 'lights';
        if (zoom < 0.5) return 'transition';
        if (zoom < 1) return 'basic';
        if (zoom < 2) return 'medium';
        return 'full';
    }
    
    /**
     * Update building properties
     */
    update(building) {
        const typeChanged = this.building.type !== building.type;
        const sizeChanged = this.building.width !== building.width || this.building.height !== building.height;
        
        this.building = building;
        
        // Update base properties
        const baseAttrs = BuildingStyleManager.getBuildingBaseAttributes(building);
        Object.entries(baseAttrs).forEach(([key, value]) => {
            this.base.setAttribute(key, value);
        });
        
        // Update filter
        const filter = BuildingStyleManager.getBuildingFilter(building);
        if (filter) {
            this.base.setAttribute('filter', filter);
        } else {
            this.base.removeAttribute('filter');
        }
        
        // Update highlight
        BuildingEffectsManager.updateHighlight(this.highlight, building);
        
        // Update roof if exists
        if (this.detailsGroup && this.detailsGroup._roof) {
            BuildingDetailsRenderer.updateRoof(this.detailsGroup._roof, building);
        }
        
        // Recreate type-specific details if type or size changed significantly
        if (typeChanged || sizeChanged) {
            // Remove old details group
            if (this.detailsGroup) {
                this.detailsGroup.remove();
            }
            
            // Create new details for the new type
            this.detailsGroup = BuildingDetailsRenderer.createTypeSpecificDetails(building);
            this.standardGroup.appendChild(this.detailsGroup);
            
            // Recreate isometric elements as dimensions changed
            if (this.isometricGroup) {
                this.isometricGroup.remove();
                this.createIsometricElements();
            }
        }
        
        // Update city lights
        BuildingEffectsManager.updateCityLights(this.cityLightGroup, building, typeChanged);
        
        // Update position/rotation
        this.updatePosition();
    }
    
    /**
     * Update window lighting
     */
    updateWindowLighting() {
        const buildingId = this.building.id || `building_${this.building.x}_${this.building.y}`;
        
        // Update standard view windows
        if (this.detailsGroup) {
            const windows = this.detailsGroup.querySelectorAll('.building-window');
            if (windows.length > 0) {
                windows.forEach((window, index) => {
                    const isLit = windowLightingManager.isWindowLit(buildingId, index, windows.length);
                    window.setAttribute('fill', isLit ? '#FFFFCC' : '#444444');
                });
            }
        }
        
        // Update isometric view windows
        if (this.isometricGroup) {
            const isoWindows = this.isometricGroup.querySelectorAll('.building-window');
            if (isoWindows.length > 0) {
                isoWindows.forEach((window, index) => {
                    const isLit = windowLightingManager.isWindowLit(buildingId, index, isoWindows.length);
                    window.setAttribute('fill', isLit ? '#FFFFCC' : '#333333');
                });
            }
        }
    }
    
    /**
     * Get the main SVG element
     */
    getElement() {
        return this.group;
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.group && this.group.parentNode) {
            this.group.parentNode.removeChild(this.group);
        }
        
        // Clear lighting state for this building
        const buildingId = this.building.id || `building_${this.building.x}_${this.building.y}`;
        windowLightingManager.clearBuildingState(buildingId);
    }
}