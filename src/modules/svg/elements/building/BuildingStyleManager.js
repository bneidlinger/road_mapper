/**
 * BuildingStyleManager - Manages colors, gradients, and style utilities for buildings
 */
export class BuildingStyleManager {
    /**
     * Get building fill color based on type
     */
    static getBuildingColor(type) {
        const colors = {
            residential: '#E8D4B0',
            commercial: '#C5B8A5',
            office: '#A0B5C8',
            industrial: '#B0B0B0',
            civic: '#C8B0D4',
            park: '#A5D4A5'
        };
        return colors[type] || '#D0D0D0';
    }
    
    /**
     * Get building stroke color based on type
     */
    static getBuildingStrokeColor(type) {
        const colors = {
            residential: '#B8A480',
            commercial: '#958875',
            office: '#708598',
            industrial: '#808080',
            civic: '#9880A4',
            park: '#75A475'
        };
        return colors[type] || '#A0A0A0';
    }
    
    /**
     * Get roof color based on type
     */
    static getRoofColor(type) {
        const colors = {
            residential: '#8B7355',
            commercial: '#6B5D4F',
            office: '#4A5A6A',
            industrial: '#5A5A5A',
            civic: '#6A5A7A',
            park: '#4F7A4F'
        };
        return colors[type] || '#606060';
    }
    
    /**
     * Get appropriate shadow filter based on building size/floors
     */
    static getShadowFilter(building) {
        const floors = building.floors || 1;
        const area = building.width * building.height;
        
        // Determine shadow based on floors and area
        if (floors >= 10 || area > 10000) {
            return 'building-shadow-tall';
        } else if (floors >= 5 || area > 5000) {
            return 'building-shadow-large';
        } else if (floors >= 3 || area > 2500) {
            return 'building-shadow-medium';
        } else {
            return 'building-shadow-small';
        }
    }
    
    /**
     * Get city light color based on building type
     */
    static getCityLightColor(type) {
        const lightColors = {
            residential: '#ffeb99', // Warm yellow
            commercial: '#99ccff', // Cool blue-white
            office: '#ffffff', // Bright white
            industrial: '#ffaa66' // Orange
        };
        return lightColors[type] || '#ffeb99';
    }
    
    /**
     * Calculate light radius based on building size
     */
    static calculateLightRadius(width, height) {
        const buildingArea = width * height;
        const baseRadius = Math.sqrt(buildingArea) / 8;
        return Math.max(3, Math.min(baseRadius, 15));
    }
    
    /**
     * Adjust color brightness for isometric faces
     */
    static adjustBrightness(color, factor) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Adjust brightness
        const newR = Math.round(Math.min(255, Math.max(0, r * factor)));
        const newG = Math.round(Math.min(255, Math.max(0, g * factor)));
        const newB = Math.round(Math.min(255, Math.max(0, b * factor)));
        
        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Get building base attributes
     */
    static getBuildingBaseAttributes(building) {
        const { x, y, width, height, type, selected, customColor, color } = building;
        
        return {
            x,
            y,
            width,
            height,
            fill: customColor || color || this.getBuildingColor(type),
            stroke: selected ? '#00ff88' : this.getBuildingStrokeColor(type),
            'stroke-width': selected ? 2 : 1,
            rx: 2,
            ry: 2,
            class: `building-base building-${type}`
        };
    }
    
    /**
     * Get filter for building based on selection state
     */
    static getBuildingFilter(building) {
        if (building.selected) {
            return 'url(#building-selection-glow)';
        }
        
        const shadowFilter = this.getShadowFilter(building);
        return shadowFilter ? `url(#${shadowFilter})` : null;
    }
}