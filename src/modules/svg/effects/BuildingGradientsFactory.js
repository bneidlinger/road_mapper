/**
 * Factory for creating high-quality building gradients and effects
 */
export class BuildingGradientsFactory {
    /**
     * Create gradient for building face with realistic lighting
     */
    static createFaceGradient(faceType, baseColor, buildingType) {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        const id = `building-face-${faceType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        gradient.setAttribute('id', id);
        
        // Different gradient directions for each face
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
        
        // Create gradient stops with ambient occlusion effect
        const stops = this.createGradientStops(faceType, baseColor, buildingType);
        stops.forEach(stop => gradient.appendChild(stop));
        
        return gradient;
    }
    
    /**
     * Create gradient stops based on face type and building type
     */
    static createGradientStops(faceType, baseColor, buildingType) {
        const stops = [];
        
        // Convert hex to RGB for manipulation
        const rgb = this.hexToRgb(baseColor);
        
        switch (faceType) {
            case 'top':
                // Roof gradient - lighter in center, darker at edges (ambient occlusion)
                stops.push(this.createStop('0%', this.adjustColor(rgb, 1.2)));
                stops.push(this.createStop('50%', this.adjustColor(rgb, 1.1)));
                stops.push(this.createStop('100%', this.adjustColor(rgb, 0.95)));
                break;
                
            case 'right':
                // Right face - vertical gradient with subtle lighting
                stops.push(this.createStop('0%', this.adjustColor(rgb, 0.95)));
                stops.push(this.createStop('30%', this.adjustColor(rgb, 0.85)));
                stops.push(this.createStop('100%', this.adjustColor(rgb, 0.75)));
                break;
                
            case 'front':
                // Front face - horizontal gradient with edge darkening
                stops.push(this.createStop('0%', this.adjustColor(rgb, 0.65)));
                stops.push(this.createStop('10%', this.adjustColor(rgb, 0.7)));
                stops.push(this.createStop('90%', this.adjustColor(rgb, 0.7)));
                stops.push(this.createStop('100%', this.adjustColor(rgb, 0.6)));
                break;
        }
        
        return stops;
    }
    
    /**
     * Create glass/window gradient for modern buildings
     */
    static createGlassGradient(opacity = 0.6) {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        const id = `glass-gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        gradient.setAttribute('id', id);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');
        
        // Glass effect with reflection
        const stops = [
            this.createStop('0%', `rgba(200, 230, 255, ${opacity})`),
            this.createStop('20%', `rgba(180, 220, 255, ${opacity * 0.8})`),
            this.createStop('40%', `rgba(160, 210, 250, ${opacity * 0.6})`),
            this.createStop('60%', `rgba(140, 200, 245, ${opacity * 0.7})`),
            this.createStop('100%', `rgba(120, 180, 230, ${opacity * 0.9})`)
        ];
        
        stops.forEach(stop => gradient.appendChild(stop));
        return gradient;
    }
    
    /**
     * Create metallic gradient for industrial buildings
     */
    static createMetallicGradient(baseColor) {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        const id = `metallic-gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        gradient.setAttribute('id', id);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const rgb = this.hexToRgb(baseColor);
        
        // Metallic sheen effect
        const stops = [
            this.createStop('0%', this.adjustColor(rgb, 1.3)),
            this.createStop('25%', this.adjustColor(rgb, 0.9)),
            this.createStop('50%', this.adjustColor(rgb, 1.1)),
            this.createStop('75%', this.adjustColor(rgb, 0.85)),
            this.createStop('100%', this.adjustColor(rgb, 1.0))
        ];
        
        stops.forEach(stop => gradient.appendChild(stop));
        return gradient;
    }
    
    /**
     * Create shadow gradient for depth
     */
    static createShadowGradient() {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        const id = `shadow-gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        gradient.setAttribute('id', id);
        gradient.setAttribute('cx', '50%');
        gradient.setAttribute('cy', '50%');
        gradient.setAttribute('r', '50%');
        
        const stops = [
            this.createStop('0%', 'rgba(0, 0, 0, 0.3)'),
            this.createStop('70%', 'rgba(0, 0, 0, 0.15)'),
            this.createStop('100%', 'rgba(0, 0, 0, 0.05)')
        ];
        
        stops.forEach(stop => gradient.appendChild(stop));
        return gradient;
    }
    
    /**
     * Create window pattern for building faces
     */
    static createWindowPattern(buildingType, faceType) {
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        const id = `window-pattern-${faceType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        pattern.setAttribute('id', id);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        
        // Different window sizes based on building type
        let windowWidth, windowHeight, spacing;
        switch (buildingType) {
            case 'office':
                windowWidth = 8;
                windowHeight = 10;
                spacing = 4;
                break;
            case 'commercial':
                windowWidth = 12;
                windowHeight = 14;
                spacing = 3;
                break;
            case 'residential':
                windowWidth = 6;
                windowHeight = 8;
                spacing = 5;
                break;
            default:
                windowWidth = 8;
                windowHeight = 10;
                spacing = 4;
        }
        
        pattern.setAttribute('width', windowWidth + spacing);
        pattern.setAttribute('height', windowHeight + spacing);
        
        // Window pane with reflection
        const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        window.setAttribute('x', '0');
        window.setAttribute('y', '0');
        window.setAttribute('width', windowWidth);
        window.setAttribute('height', windowHeight);
        window.setAttribute('fill', 'url(#glass-gradient)');
        window.setAttribute('stroke', 'rgba(100, 100, 100, 0.5)');
        window.setAttribute('stroke-width', '0.5');
        
        // Add subtle reflection line
        const reflection = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        reflection.setAttribute('x1', '1');
        reflection.setAttribute('y1', '1');
        reflection.setAttribute('x2', windowWidth - 1);
        reflection.setAttribute('y2', '3');
        reflection.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
        reflection.setAttribute('stroke-width', '0.5');
        
        pattern.appendChild(window);
        pattern.appendChild(reflection);
        
        return pattern;
    }
    
    /**
     * Helper function to create gradient stops
     */
    static createStop(offset, color) {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', offset);
        stop.setAttribute('stop-color', color);
        return stop;
    }
    
    /**
     * Convert hex color to RGB
     */
    static hexToRgb(hex) {
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
    static adjustColor(rgb, factor) {
        const r = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
        const g = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
        const b = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));
        return `rgb(${r}, ${g}, ${b})`;
    }
}