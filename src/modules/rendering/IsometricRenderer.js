/**
 * Isometric Renderer - Transforms 2D building coordinates to isometric 3D view
 */
export class IsometricRenderer {
    constructor() {
        // Standard isometric projection angles
        // 30-degree rotation for classic isometric view
        this.angle = Math.PI / 6; // 30 degrees
        
        // Scale factors for isometric transformation
        this.scaleX = Math.cos(this.angle);
        this.scaleY = Math.sin(this.angle);
        
        // Height scale factor (how much height per floor)
        this.floorHeight = 12; // pixels per floor
        
        // Enable/disable isometric view
        this.enabled = false;
    }
    
    /**
     * Toggle isometric view
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    /**
     * Set isometric view state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    /**
     * Check if isometric view is enabled
     */
    isEnabled() {
        return this.enabled;
    }
    
    /**
     * Transform 2D point to isometric coordinates
     * @param {number} x - Original X coordinate
     * @param {number} y - Original Y coordinate
     * @param {number} z - Height (0 for ground level)
     * @returns {Object} Transformed {x, y} coordinates
     */
    toIsometric(x, y, z = 0) {
        if (!this.enabled) {
            return { x, y };
        }
        
        // Isometric transformation
        const isoX = (x - y) * this.scaleX;
        const isoY = (x + y) * this.scaleY - z;
        
        return {
            x: isoX,
            y: isoY
        };
    }
    
    /**
     * Transform 2D point to isometric with building offset correction
     * @param {number} x - Original X coordinate
     * @param {number} y - Original Y coordinate
     * @param {number} z - Height (0 for ground level)
     * @param {Object} building - Building object for offset calculation
     * @returns {Object} Transformed {x, y} coordinates with offset
     */
    toIsometricWithOffset(x, y, z = 0, building) {
        const point = this.toIsometric(x, y, z);
        
        if (!building) return point;
        
        // Calculate the center offset
        const centerX = building.x + building.width / 2;
        const centerY = building.y + building.height / 2;
        const centerOriginal = { x: centerX, y: centerY };
        const centerTransformed = this.toIsometric(centerX, centerY, 0);
        const offsetX = centerOriginal.x - centerTransformed.x;
        const offsetY = centerOriginal.y - centerTransformed.y;
        
        return {
            x: point.x + offsetX,
            y: point.y + offsetY
        };
    }
    
    /**
     * Create isometric building faces for a rectangular building
     * @param {Object} building - Building object with x, y, width, height, floors
     * @returns {Object} SVG path data for each face
     */
    createBuildingFaces(building) {
        const { x, y, width, height, floors = 1 } = building;
        const z = floors * this.floorHeight;
        
        // Calculate the center of the building in 2D
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Get the offset caused by isometric transformation
        const centerOriginal = { x: centerX, y: centerY };
        const centerTransformed = this.toIsometric(centerX, centerY, 0);
        const offsetX = centerOriginal.x - centerTransformed.x;
        const offsetY = centerOriginal.y - centerTransformed.y;
        
        // Get all 8 corners of the building box
        const corners = {
            // Bottom face (ground level)
            bottomNW: this.toIsometric(x, y, 0),
            bottomNE: this.toIsometric(x + width, y, 0),
            bottomSE: this.toIsometric(x + width, y + height, 0),
            bottomSW: this.toIsometric(x, y + height, 0),
            
            // Top face (roof level)
            topNW: this.toIsometric(x, y, z),
            topNE: this.toIsometric(x + width, y, z),
            topSE: this.toIsometric(x + width, y + height, z),
            topSW: this.toIsometric(x, y + height, z)
        };
        
        // Apply offset to keep building centered on its tile
        Object.keys(corners).forEach(key => {
            corners[key].x += offsetX;
            corners[key].y += offsetY;
        });
        
        // Create roof based on type
        const roofType = building.roofType || 'flat';
        let topPath = '';
        let additionalFaces = {};
        
        switch (roofType) {
            case 'gabled':
                // Create peaked roof
                const peakHeight = Math.min(width, height) * 0.3;
                const ridgeNorth = this.toIsometric(x + width / 2, y, z + peakHeight);
                const ridgeSouth = this.toIsometric(x + width / 2, y + height, z + peakHeight);
                
                ridgeNorth.x += offsetX;
                ridgeNorth.y += offsetY;
                ridgeSouth.x += offsetX;
                ridgeSouth.y += offsetY;
                
                // West slope
                topPath = `M ${corners.topNW.x} ${corners.topNW.y} 
                          L ${ridgeNorth.x} ${ridgeNorth.y} 
                          L ${ridgeSouth.x} ${ridgeSouth.y} 
                          L ${corners.topSW.x} ${corners.topSW.y} Z`;
                
                // East slope (additional face)
                additionalFaces.roofEast = `M ${ridgeNorth.x} ${ridgeNorth.y} 
                                           L ${corners.topNE.x} ${corners.topNE.y} 
                                           L ${corners.topSE.x} ${corners.topSE.y} 
                                           L ${ridgeSouth.x} ${ridgeSouth.y} Z`;
                break;
                
            case 'hipped':
                // Create hipped roof with slopes on all sides
                const hipInset = Math.min(width, height) * 0.25;
                const hipHeight = Math.min(width, height) * 0.25;
                const hipNW = this.toIsometric(x + hipInset, y + hipInset, z + hipHeight);
                const hipNE = this.toIsometric(x + width - hipInset, y + hipInset, z + hipHeight);
                const hipSE = this.toIsometric(x + width - hipInset, y + height - hipInset, z + hipHeight);
                const hipSW = this.toIsometric(x + hipInset, y + height - hipInset, z + hipHeight);
                
                [hipNW, hipNE, hipSE, hipSW].forEach(point => {
                    point.x += offsetX;
                    point.y += offsetY;
                });
                
                // Main top face
                topPath = `M ${hipNW.x} ${hipNW.y} 
                          L ${hipNE.x} ${hipNE.y} 
                          L ${hipSE.x} ${hipSE.y} 
                          L ${hipSW.x} ${hipSW.y} Z`;
                          
                // Hip slopes
                additionalFaces.hipNorth = `M ${corners.topNW.x} ${corners.topNW.y} 
                                           L ${corners.topNE.x} ${corners.topNE.y} 
                                           L ${hipNE.x} ${hipNE.y} 
                                           L ${hipNW.x} ${hipNW.y} Z`;
                additionalFaces.hipSouth = `M ${hipSW.x} ${hipSW.y} 
                                           L ${hipSE.x} ${hipSE.y} 
                                           L ${corners.topSE.x} ${corners.topSE.y} 
                                           L ${corners.topSW.x} ${corners.topSW.y} Z`;
                break;
                
            case 'shed':
                // Create sloped roof
                const shedHeight = Math.min(width, height) * 0.2;
                const shedNE = this.toIsometric(x + width, y, z + shedHeight);
                const shedSE = this.toIsometric(x + width, y + height, z + shedHeight);
                
                shedNE.x += offsetX;
                shedNE.y += offsetY;
                shedSE.x += offsetX;
                shedSE.y += offsetY;
                
                topPath = `M ${corners.topNW.x} ${corners.topNW.y} 
                          L ${shedNE.x} ${shedNE.y} 
                          L ${shedSE.x} ${shedSE.y} 
                          L ${corners.topSW.x} ${corners.topSW.y} Z`;
                break;
                
            case 'flat':
            default:
                // Flat roof
                topPath = `M ${corners.topNW.x} ${corners.topNW.y} 
                          L ${corners.topNE.x} ${corners.topNE.y} 
                          L ${corners.topSE.x} ${corners.topSE.y} 
                          L ${corners.topSW.x} ${corners.topSW.y} Z`;
                break;
        }
        
        // Create paths for each visible face
        const faces = {
            // Top face (roof)
            top: topPath,
            
            // Right face (if visible)
            right: `M ${corners.topNE.x} ${corners.topNE.y} 
                    L ${corners.bottomNE.x} ${corners.bottomNE.y} 
                    L ${corners.bottomSE.x} ${corners.bottomSE.y} 
                    L ${corners.topSE.x} ${corners.topSE.y} Z`,
            
            // Front face (if visible)
            front: `M ${corners.topSE.x} ${corners.topSE.y} 
                    L ${corners.bottomSE.x} ${corners.bottomSE.y} 
                    L ${corners.bottomSW.x} ${corners.bottomSW.y} 
                    L ${corners.topSW.x} ${corners.topSW.y} Z`,
                    
            // Additional roof faces
            ...additionalFaces
        };
        
        return { faces, corners, height: z, offset: { x: offsetX, y: offsetY } };
    }
    
    /**
     * Get brightness factor for each face (for shading)
     */
    getFaceBrightness() {
        return {
            top: 1.0,    // Full brightness
            right: 0.85, // Slightly darker
            front: 0.7   // Darkest
        };
    }
    
    /**
     * Calculate shadow path for isometric building
     */
    createIsometricShadow(building) {
        const { x, y, width, height, floors = 1 } = building;
        const z = floors * this.floorHeight;
        
        // Calculate the center offset (same as in createBuildingFaces)
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const centerOriginal = { x: centerX, y: centerY };
        const centerTransformed = this.toIsometric(centerX, centerY, 0);
        const offsetX = centerOriginal.x - centerTransformed.x;
        const offsetY = centerOriginal.y - centerTransformed.y;
        
        // Shadow offset based on height
        const shadowOffset = z * 0.5;
        const shadowX = x + shadowOffset;
        const shadowY = y + shadowOffset;
        
        // Create shadow polygon
        const shadowCorners = {
            sw: this.toIsometric(shadowX, shadowY + height, 0),
            se: this.toIsometric(shadowX + width, shadowY + height, 0),
            ne: this.toIsometric(shadowX + width, shadowY, 0),
            buildingSE: this.toIsometric(x + width, y + height, 0),
            buildingNE: this.toIsometric(x + width, y, 0)
        };
        
        // Apply offset to all corners
        Object.keys(shadowCorners).forEach(key => {
            shadowCorners[key].x += offsetX;
            shadowCorners[key].y += offsetY;
        });
        
        return `M ${shadowCorners.buildingSE.x} ${shadowCorners.buildingSE.y}
                L ${shadowCorners.sw.x} ${shadowCorners.sw.y}
                L ${shadowCorners.se.x} ${shadowCorners.se.y}
                L ${shadowCorners.ne.x} ${shadowCorners.ne.y}
                L ${shadowCorners.buildingNE.x} ${shadowCorners.buildingNE.y} Z`;
    }
    
    /**
     * Get transform string for isometric viewport
     */
    getViewportTransform() {
        if (!this.enabled) {
            return '';
        }
        
        // Offset to center the isometric view
        // This may need adjustment based on viewport center
        return 'translate(0, -50)';
    }
    
    /**
     * Adjust zoom level for isometric view
     * Isometric view typically needs slight zoom adjustment
     */
    getZoomAdjustment() {
        return this.enabled ? 0.8 : 1.0;
    }
}

// Singleton instance
export const isometricRenderer = new IsometricRenderer();