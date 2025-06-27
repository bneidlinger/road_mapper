import { BuildingStyleManager } from './BuildingStyleManager.js';

/**
 * BuildingEffectsManager - Manages city lights, shadows, hover effects, and animations
 */
export class BuildingEffectsManager {
    /**
     * Create city light elements for bird's eye view
     */
    static createCityLightElements(building) {
        const { x, y, width, height, type } = building;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Create a group for city lights
        const cityLightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        cityLightGroup.setAttribute('class', 'city-lights');
        cityLightGroup.style.display = 'none'; // Hidden by default
        
        const lightColor = BuildingStyleManager.getCityLightColor(type);
        const lightRadius = BuildingStyleManager.calculateLightRadius(width, height);
        
        // Create the main light point
        const lightPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        lightPoint.setAttribute('cx', centerX);
        lightPoint.setAttribute('cy', centerY);
        lightPoint.setAttribute('r', lightRadius);
        lightPoint.setAttribute('fill', lightColor);
        lightPoint.setAttribute('opacity', '0.9');
        
        // Create glow effect
        const lightGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        lightGlow.setAttribute('cx', centerX);
        lightGlow.setAttribute('cy', centerY);
        lightGlow.setAttribute('r', lightRadius * 2.5);
        lightGlow.setAttribute('fill', lightColor);
        lightGlow.setAttribute('opacity', '0.3');
        lightGlow.setAttribute('filter', 'url(#city-light-blur)');
        
        // Add elements to group
        cityLightGroup.appendChild(lightGlow);
        cityLightGroup.appendChild(lightPoint);
        
        // For larger buildings, add multiple light points
        const buildingArea = width * height;
        if (buildingArea > 3000) {
            this.addAdditionalLights(cityLightGroup, x, y, width, height, lightColor);
        }
        
        // Store references for updates
        cityLightGroup._lightPoint = lightPoint;
        cityLightGroup._lightGlow = lightGlow;
        
        return cityLightGroup;
    }
    
    /**
     * Add additional lights for larger buildings
     */
    static addAdditionalLights(group, x, y, width, height, color) {
        const numLights = Math.floor(Math.random() * 3) + 2; // 2-4 extra lights
        
        for (let i = 0; i < numLights; i++) {
            const offsetX = (Math.random() - 0.5) * width * 0.6;
            const offsetY = (Math.random() - 0.5) * height * 0.6;
            const centerX = x + width / 2 + offsetX;
            const centerY = y + height / 2 + offsetY;
            const radius = Math.random() * 3 + 2;
            
            const extraLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            extraLight.setAttribute('cx', centerX);
            extraLight.setAttribute('cy', centerY);
            extraLight.setAttribute('r', radius);
            extraLight.setAttribute('fill', color);
            extraLight.setAttribute('opacity', Math.random() * 0.4 + 0.5);
            
            group.appendChild(extraLight);
        }
    }
    
    /**
     * Update city lights position and color
     */
    static updateCityLights(cityLightGroup, building, typeChanged) {
        if (!cityLightGroup) return;
        
        const centerX = building.x + building.width / 2;
        const centerY = building.y + building.height / 2;
        
        const lightPoint = cityLightGroup._lightPoint;
        const lightGlow = cityLightGroup._lightGlow;
        
        if (lightPoint) {
            lightPoint.setAttribute('cx', centerX);
            lightPoint.setAttribute('cy', centerY);
            
            // Update light color if type changed
            if (typeChanged) {
                const newColor = BuildingStyleManager.getCityLightColor(building.type);
                lightPoint.setAttribute('fill', newColor);
                if (lightGlow) {
                    lightGlow.setAttribute('fill', newColor);
                }
            }
        }
        
        if (lightGlow) {
            lightGlow.setAttribute('cx', centerX);
            lightGlow.setAttribute('cy', centerY);
        }
    }
    
    /**
     * Setup hover effects for isometric buildings
     */
    static setupIsometricHoverEffects(isometricGroup, building) {
        if (!isometricGroup || isometricGroup._hoverEffectsSetup) return;
        
        isometricGroup.style.cursor = 'pointer';
        isometricGroup.style.transition = 'transform 0.2s ease, filter 0.2s ease';
        
        const handleMouseEnter = () => {
            if (!building.selected) {
                isometricGroup.style.transform = 'translateY(-2px)';
                isometricGroup.style.filter = 'brightness(1.1) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
            }
        };
        
        const handleMouseLeave = () => {
            if (!building.selected) {
                isometricGroup.style.transform = '';
                isometricGroup.style.filter = '';
            }
        };
        
        isometricGroup.addEventListener('mouseenter', handleMouseEnter);
        isometricGroup.addEventListener('mouseleave', handleMouseLeave);
        
        isometricGroup._hoverEffectsSetup = true;
    }
    
    /**
     * Create subtle 3D edge highlight for depth
     */
    static createHighlight(building) {
        const { x, y, width, height } = building;
        const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const highlightPath = `M ${x} ${y + 2} L ${x + width - 2} ${y + 2} L ${x + width - 2} ${y + height * 0.3} L ${x} ${y + height * 0.3} Z`;
        highlight.setAttribute('d', highlightPath);
        highlight.setAttribute('fill', 'rgba(255, 255, 255, 0.1)');
        highlight.setAttribute('stroke', 'none');
        return highlight;
    }
    
    /**
     * Update highlight path
     */
    static updateHighlight(highlight, building) {
        if (!highlight) return;
        
        const { x, y, width, height } = building;
        const highlightPath = `M ${x} ${y + 2} L ${x + width - 2} ${y + 2} L ${x + width - 2} ${y + height * 0.3} L ${x} ${y + height * 0.3} Z`;
        highlight.setAttribute('d', highlightPath);
    }
    
    /**
     * Update detail level based on zoom for city lights effect
     */
    static updateCityLightVisibility(cityLightGroup, zoom, isBirdsEye) {
        if (!cityLightGroup) return;
        
        if (isBirdsEye || zoom < 0.3) {
            // Show city lights
            cityLightGroup.style.display = '';
            // Fade in effect
            const opacity = Math.min(1, (0.4 - zoom) * 5);
            cityLightGroup.style.opacity = opacity;
        } else if (zoom < 0.5) {
            // Transition zone - fade out city lights
            const lightOpacity = 1 - ((zoom - 0.3) * 5);
            cityLightGroup.style.display = lightOpacity > 0 ? '' : 'none';
            cityLightGroup.style.opacity = lightOpacity * 0.5;
        } else {
            // Hide city lights at higher zoom
            cityLightGroup.style.display = 'none';
        }
    }
}