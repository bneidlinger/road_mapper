import { TrafficControlEffects } from './TrafficControlEffects.js';

/**
 * TrafficLightRenderer - Renders traffic lights with poles, housings, and lights
 */
export class TrafficLightRenderer {
    constructor() {
        // Traffic light configuration - scaled down to match stop/yield signs
        this.config = {
            poleColor: '#606060',
            housingColor: '#1a1a1a',
            visorColor: '#0a0a0a',
            redLight: '#ff0000',
            yellowLight: '#ffaa00',
            greenLight: '#00ff00',
            offLight: '#222222',
            poleWidth: 2,
            poleHeight: 20,
            housingWidth: 8,
            housingHeight: 20,
            lightRadius: 2.5
        };
    }
    
    /**
     * Create a realistic traffic light
     */
    createTrafficLight(center, angle, roadWidth, state = 'green') {
        // Create unique ID for this light's gradients and filters
        const uniqueId = `traffic-light-${Math.random().toString(36).substr(2, 9)}`;
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'traffic-light-group');
        
        // Create defs for gradients and filters
        const defs = TrafficControlEffects.createTrafficLightEffects(uniqueId);
        group.appendChild(defs);
        
        // Use approach angle to position light on the correct side
        const approachAngle = angle + Math.PI;
        
        // Position the light offset from the road edge, on a pole arm
        const poleDistance = roadWidth * 0.8;
        const armLength = roadWidth * 0.7;
        const offsetAngle = approachAngle - Math.PI / 2;
        
        // Calculate pole base position
        const poleBase = {
            x: center.x + Math.cos(approachAngle) * poleDistance + Math.cos(offsetAngle) * (roadWidth * 0.6),
            y: center.y + Math.sin(approachAngle) * poleDistance + Math.sin(offsetAngle) * (roadWidth * 0.6)
        };
        
        // Calculate light position (at end of arm extending over road)
        const lightPos = {
            x: poleBase.x - Math.cos(offsetAngle) * armLength,
            y: poleBase.y - Math.sin(offsetAngle) * armLength
        };
        
        // Create vertical pole
        const pole = this.createPole(poleBase, uniqueId);
        group.appendChild(pole);
        
        // Create horizontal arm
        const arm = this.createArm(poleBase, lightPos, uniqueId);
        group.appendChild(arm);
        
        // Create shadow
        const shadow = this.createPoleShadow(poleBase, this.config.poleHeight);
        group.insertBefore(shadow, pole);
        
        // Create traffic light housing with lights
        const housing = this.createEnhancedTrafficLightHousing(lightPos, state, uniqueId);
        group.appendChild(housing);
        
        // Store the unique ID for animation purposes
        group.setAttribute('data-unique-id', uniqueId);
        
        return group;
    }
    
    /**
     * Create vertical pole
     */
    createPole(pos, uniqueId) {
        const pole = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        pole.setAttribute('x', pos.x - this.config.poleWidth / 2);
        pole.setAttribute('y', pos.y - this.config.poleHeight);
        pole.setAttribute('width', this.config.poleWidth);
        pole.setAttribute('height', this.config.poleHeight);
        pole.setAttribute('fill', `url(#${uniqueId}-metal-gradient)`);
        pole.setAttribute('stroke', '#404040');
        pole.setAttribute('stroke-width', '0.2');
        
        return pole;
    }
    
    /**
     * Create horizontal arm
     */
    createArm(polePos, lightPos, uniqueId) {
        const arm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        arm.setAttribute('x1', polePos.x);
        arm.setAttribute('y1', polePos.y - this.config.poleHeight + 2);
        arm.setAttribute('x2', lightPos.x);
        arm.setAttribute('y2', lightPos.y - this.config.poleHeight + 2);
        arm.setAttribute('stroke', `url(#${uniqueId}-metal-gradient)`);
        arm.setAttribute('stroke-width', this.config.poleWidth);
        arm.setAttribute('stroke-linecap', 'round');
        
        return arm;
    }
    
    /**
     * Create enhanced traffic light housing with realistic details
     */
    createEnhancedTrafficLightHousing(pos, state, uniqueId) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'traffic-light-housing');
        
        const housingY = pos.y - this.config.poleHeight;
        const housingPos = {
            x: pos.x - this.config.housingWidth / 2,
            y: housingY
        };
        
        // Housing back panel with gradient
        const housing = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        housing.setAttribute('x', housingPos.x);
        housing.setAttribute('y', housingPos.y);
        housing.setAttribute('width', this.config.housingWidth);
        housing.setAttribute('height', this.config.housingHeight);
        housing.setAttribute('rx', '1');
        housing.setAttribute('ry', '1');
        housing.setAttribute('fill', `url(#${uniqueId}-housing-gradient)`);
        housing.setAttribute('stroke', '#0a0a0a');
        housing.setAttribute('stroke-width', '0.3');
        
        group.appendChild(housing);
        
        // Add visors for each light
        const visorDepth = 2;
        const lightSpacing = this.config.housingHeight / 3;
        
        ['red', 'yellow', 'green'].forEach((color, index) => {
            const yOffset = housingPos.y + lightSpacing * (index + 0.5);
            
            // Visor (hood over light)
            const visor = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const visorPath = `
                M ${housingPos.x} ${yOffset - this.config.lightRadius}
                L ${housingPos.x - visorDepth} ${yOffset - this.config.lightRadius - visorDepth * 0.5}
                L ${housingPos.x - visorDepth} ${yOffset + this.config.lightRadius - visorDepth * 0.3}
                L ${housingPos.x} ${yOffset + this.config.lightRadius}
                L ${housingPos.x + this.config.housingWidth} ${yOffset + this.config.lightRadius}
                L ${housingPos.x + this.config.housingWidth + visorDepth} ${yOffset + this.config.lightRadius - visorDepth * 0.3}
                L ${housingPos.x + this.config.housingWidth + visorDepth} ${yOffset - this.config.lightRadius - visorDepth * 0.5}
                L ${housingPos.x + this.config.housingWidth} ${yOffset - this.config.lightRadius}
                Z
            `;
            visor.setAttribute('d', visorPath);
            visor.setAttribute('fill', this.config.visorColor);
            visor.setAttribute('stroke', '#000000');
            visor.setAttribute('stroke-width', '0.2');
            visor.setAttribute('opacity', '0.8');
            
            group.appendChild(visor);
        });
        
        // Create light groups
        const lights = ['red', 'yellow', 'green'];
        lights.forEach((color, index) => {
            const lightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            lightGroup.setAttribute('class', `traffic-light-${color}`);
            
            const yOffset = housingPos.y + lightSpacing * (index + 0.5);
            const centerX = pos.x;
            
            // Light background (dark circle)
            const lightBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            lightBg.setAttribute('cx', centerX);
            lightBg.setAttribute('cy', yOffset);
            lightBg.setAttribute('r', this.config.lightRadius + 0.5);
            lightBg.setAttribute('fill', '#111111');
            
            // Light lens border
            const lightBorder = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            lightBorder.setAttribute('cx', centerX);
            lightBorder.setAttribute('cy', yOffset);
            lightBorder.setAttribute('r', this.config.lightRadius + 0.3);
            lightBorder.setAttribute('fill', 'none');
            lightBorder.setAttribute('stroke', '#333333');
            lightBorder.setAttribute('stroke-width', '0.3');
            
            // Main light bulb
            const light = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            light.setAttribute('cx', centerX);
            light.setAttribute('cy', yOffset);
            light.setAttribute('r', this.config.lightRadius);
            light.setAttribute('class', `light-bulb light-${color}`);
            
            // Set initial state
            const isActive = color === state;
            const fillColor = isActive ? this.config[`${color}Light`] : this.config.offLight;
            light.setAttribute('fill', fillColor);
            
            if (isActive) {
                light.setAttribute('filter', `url(#${uniqueId}-${color}-glow)`);
            }
            
            // Light highlight (glass effect)
            const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            highlight.setAttribute('cx', centerX - this.config.lightRadius * 0.3);
            highlight.setAttribute('cy', yOffset - this.config.lightRadius * 0.3);
            highlight.setAttribute('rx', this.config.lightRadius * 0.5);
            highlight.setAttribute('ry', this.config.lightRadius * 0.3);
            highlight.setAttribute('fill', '#ffffff');
            highlight.setAttribute('opacity', isActive ? '0.6' : '0.2');
            highlight.setAttribute('class', 'light-highlight');
            
            lightGroup.appendChild(lightBg);
            lightGroup.appendChild(lightBorder);
            lightGroup.appendChild(light);
            lightGroup.appendChild(highlight);
            
            group.appendChild(lightGroup);
        });
        
        return group;
    }
    
    /**
     * Create pole shadow
     */
    createPoleShadow(pos, height) {
        const shadowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        shadowGroup.setAttribute('opacity', '0.3');
        
        // Pole shadow
        const poleShadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        poleShadow.setAttribute('x', pos.x - this.config.poleWidth / 2 + 2);
        poleShadow.setAttribute('y', pos.y - height + 2);
        poleShadow.setAttribute('width', this.config.poleWidth);
        poleShadow.setAttribute('height', height);
        poleShadow.setAttribute('fill', '#000000');
        poleShadow.setAttribute('opacity', '0.2');
        poleShadow.setAttribute('filter', 'blur(2px)');
        
        shadowGroup.appendChild(poleShadow);
        
        return shadowGroup;
    }
    
    /**
     * Get light configuration
     */
    getConfig() {
        return { ...this.config };
    }
}