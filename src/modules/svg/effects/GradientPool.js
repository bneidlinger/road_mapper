/**
 * Gradient pool manager to reuse gradients and reduce DOM bloat
 */
export class GradientPool {
    constructor() {
        this.gradients = new Map();
        this.defsElement = null;
        this.maxPoolSize = 50; // Maximum number of unique gradients
    }
    
    /**
     * Initialize gradient pool with SVG defs element
     */
    init(svgElement) {
        this.defsElement = svgElement.querySelector('defs');
        if (!this.defsElement) {
            this.defsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svgElement.insertBefore(this.defsElement, svgElement.firstChild);
        }
        
        // Pre-create common gradients
        this.createCommonGradients();
    }
    
    /**
     * Get or create a gradient based on parameters
     */
    getGradient(type, params) {
        const key = this.generateKey(type, params);
        
        if (this.gradients.has(key)) {
            return `url(#${this.gradients.get(key)})`;
        }
        
        // Check pool size limit
        if (this.gradients.size >= this.maxPoolSize) {
            // Return a default gradient instead of creating new ones
            return this.getDefaultGradient(type);
        }
        
        const id = this.createGradient(type, params);
        this.gradients.set(key, id);
        return `url(#${id})`;
    }
    
    /**
     * Generate unique key for gradient parameters
     */
    generateKey(type, params) {
        return `${type}-${JSON.stringify(params)}`;
    }
    
    /**
     * Create common gradients that will be reused
     */
    createCommonGradients() {
        // Building face gradients for common colors
        const commonColors = ['#888888', '#999999', '#aaaaaa', '#bbbbbb', '#cccccc'];
        const faceTypes = ['top', 'right', 'front'];
        
        commonColors.forEach(color => {
            faceTypes.forEach(face => {
                this.createBuildingFaceGradient(face, color);
            });
        });
        
        // Glass gradients with different opacity levels
        [0.4, 0.6, 0.8].forEach(opacity => {
            this.createGlassGradient(opacity);
        });
        
        // Shadow gradients
        this.createShadowGradient('light');
        this.createShadowGradient('medium');
        this.createShadowGradient('dark');
    }
    
    /**
     * Create building face gradient
     */
    createBuildingFaceGradient(faceType, baseColor) {
        const id = `pooled-face-${faceType}-${baseColor.substring(1)}`;
        
        if (this.gradients.has(`face-${faceType}-${baseColor}`)) {
            return id;
        }
        
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', id);
        
        // Set gradient direction based on face
        switch (faceType) {
            case 'top':
                gradient.setAttribute('x1', '0%');
                gradient.setAttribute('y1', '0%');
                gradient.setAttribute('x2', '100%');
                gradient.setAttribute('y2', '100%');
                break;
            case 'right':
                gradient.setAttribute('x1', '0%');
                gradient.setAttribute('y1', '0%');
                gradient.setAttribute('x2', '0%');
                gradient.setAttribute('y2', '100%');
                break;
            case 'front':
                gradient.setAttribute('x1', '0%');
                gradient.setAttribute('y1', '0%');
                gradient.setAttribute('x2', '100%');
                gradient.setAttribute('y2', '0%');
                break;
        }
        
        // Create stops
        const rgb = this.hexToRgb(baseColor);
        const stops = this.createFaceStops(faceType, rgb);
        stops.forEach(stop => gradient.appendChild(stop));
        
        this.defsElement.appendChild(gradient);
        this.gradients.set(`face-${faceType}-${baseColor}`, id);
        
        return id;
    }
    
    /**
     * Create face gradient stops
     */
    createFaceStops(faceType, rgb) {
        const stops = [];
        
        switch (faceType) {
            case 'top':
                stops.push(this.createStop('0%', this.adjustColor(rgb, 1.2)));
                stops.push(this.createStop('50%', this.adjustColor(rgb, 1.1)));
                stops.push(this.createStop('100%', this.adjustColor(rgb, 0.95)));
                break;
            case 'right':
                stops.push(this.createStop('0%', this.adjustColor(rgb, 0.95)));
                stops.push(this.createStop('30%', this.adjustColor(rgb, 0.85)));
                stops.push(this.createStop('100%', this.adjustColor(rgb, 0.75)));
                break;
            case 'front':
                stops.push(this.createStop('0%', this.adjustColor(rgb, 0.65)));
                stops.push(this.createStop('50%', this.adjustColor(rgb, 0.7)));
                stops.push(this.createStop('100%', this.adjustColor(rgb, 0.6)));
                break;
        }
        
        return stops;
    }
    
    /**
     * Create glass gradient
     */
    createGlassGradient(opacity) {
        const id = `pooled-glass-${Math.round(opacity * 10)}`;
        
        if (this.gradients.has(`glass-${opacity}`)) {
            return id;
        }
        
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', id);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');
        
        const stops = [
            this.createStop('0%', `rgba(200, 230, 255, ${opacity})`),
            this.createStop('50%', `rgba(160, 210, 250, ${opacity * 0.7})`),
            this.createStop('100%', `rgba(120, 180, 230, ${opacity * 0.9})`)
        ];
        
        stops.forEach(stop => gradient.appendChild(stop));
        this.defsElement.appendChild(gradient);
        this.gradients.set(`glass-${opacity}`, id);
        
        return id;
    }
    
    /**
     * Create shadow gradient
     */
    createShadowGradient(intensity) {
        const opacities = {
            light: 0.15,
            medium: 0.25,
            dark: 0.35
        };
        
        const id = `pooled-shadow-${intensity}`;
        
        if (this.gradients.has(`shadow-${intensity}`)) {
            return id;
        }
        
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', id);
        gradient.setAttribute('cx', '50%');
        gradient.setAttribute('cy', '50%');
        gradient.setAttribute('r', '50%');
        
        const opacity = opacities[intensity] || 0.25;
        const stops = [
            this.createStop('0%', `rgba(0, 0, 0, ${opacity})`),
            this.createStop('100%', `rgba(0, 0, 0, ${opacity * 0.2})`)
        ];
        
        stops.forEach(stop => gradient.appendChild(stop));
        this.defsElement.appendChild(gradient);
        this.gradients.set(`shadow-${intensity}`, id);
        
        return id;
    }
    
    /**
     * Create a new gradient based on type and parameters
     */
    createGradient(type, params) {
        switch (type) {
            case 'face':
                return this.createBuildingFaceGradient(params.faceType, params.color);
            case 'glass':
                return this.createGlassGradient(params.opacity || 0.6);
            case 'shadow':
                return this.createShadowGradient(params.intensity || 'medium');
            default:
                return this.getDefaultGradient(type);
        }
    }
    
    /**
     * Get default gradient when pool is full
     */
    getDefaultGradient(type) {
        const defaults = {
            face: 'url(#pooled-face-front-888888)',
            glass: 'url(#pooled-glass-6)',
            shadow: 'url(#pooled-shadow-medium)'
        };
        return defaults[type] || 'rgba(128, 128, 128, 0.5)';
    }
    
    /**
     * Helper function to create gradient stops
     */
    createStop(offset, color) {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', offset);
        stop.setAttribute('stop-color', color);
        return stop;
    }
    
    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 128, g: 128, b: 128 };
    }
    
    /**
     * Adjust color brightness
     */
    adjustColor(rgb, factor) {
        const r = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
        const g = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
        const b = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    /**
     * Clear gradient pool
     */
    clear() {
        this.gradients.clear();
        if (this.defsElement) {
            while (this.defsElement.firstChild) {
                this.defsElement.removeChild(this.defsElement.firstChild);
            }
        }
    }
}

// Export singleton instance
export const gradientPool = new GradientPool();