import { BuildingStyleManager } from './BuildingStyleManager.js';
import { BuildingFacadeRenderer } from './BuildingFacadeRenderer.js';
import { windowLightingManager } from './WindowLightingManager.js';

/**
 * BuildingDetailsRenderer - Renders type-specific details for buildings
 */
export class BuildingDetailsRenderer {
    /**
     * Add type-specific visual details
     */
    static createTypeSpecificDetails(building) {
        const { type } = building;
        // Get style from properties object
        const style = building.properties?.style || building.properties?.businessType || 
                     building.properties?.facilityType || building.properties?.officeType;
        
        // Create details group
        const detailsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        detailsGroup.setAttribute('class', 'building-details');
        
        // First add basic roof
        this.addBasicRoof(detailsGroup, building);
        
        // If building has a style, use facade renderer for detailed rendering
        if (style) {
            // Pass building with style property for facade renderer
            const buildingWithStyle = { ...building, style };
            BuildingFacadeRenderer.renderFacade(detailsGroup, buildingWithStyle);
        } else {
            // Fallback to basic type-specific details
            switch (type) {
                case 'industrial':
                    this.addIndustrialDetails(detailsGroup, building);
                    break;
                case 'office':
                    this.addOfficeDetails(detailsGroup, building);
                    break;
                case 'commercial':
                    this.addCommercialDetails(detailsGroup, building);
                    break;
                case 'residential':
                    this.addResidentialDetails(detailsGroup, building);
                    break;
            }
        }
        
        return detailsGroup;
    }
    
    /**
     * Add basic roof for buildings
     */
    static addBasicRoof(detailsGroup, building) {
        const { x, y, width, height, type, roofType = 'flat' } = building;
        
        switch (roofType) {
            case 'gabled':
                this.addGabledRoof(detailsGroup, building);
                break;
            case 'hipped':
                this.addHippedRoof(detailsGroup, building);
                break;
            case 'mansard':
                this.addMansardRoof(detailsGroup, building);
                break;
            case 'shed':
                this.addShedRoof(detailsGroup, building);
                break;
            case 'flat':
            default:
                this.addFlatRoof(detailsGroup, building);
                break;
        }
    }
    
    static addFlatRoof(detailsGroup, building) {
        const { x, y, width, height, type } = building;
        const inset = Math.min(width, height) * 0.1;
        
        const roof = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        roof.setAttribute('x', x + inset);
        roof.setAttribute('y', y + inset);
        roof.setAttribute('width', width - inset * 2);
        roof.setAttribute('height', height - inset * 2);
        roof.setAttribute('class', 'building-roof');
        roof.setAttribute('fill', BuildingStyleManager.getRoofColor(type));
        roof.setAttribute('stroke', 'none');
        roof.setAttribute('opacity', 0.3);
        roof.setAttribute('rx', 1);
        roof.setAttribute('ry', 1);
        
        detailsGroup.appendChild(roof);
        detailsGroup._roof = roof; // Store reference for updates
    }
    
    static addGabledRoof(detailsGroup, building) {
        const { x, y, width, height, type } = building;
        const inset = Math.min(width, height) * 0.05;
        const peakHeight = Math.min(width, height) * 0.15;
        
        const roof = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        roof.setAttribute('d', `
            M ${x + inset} ${y + inset + peakHeight}
            L ${x + width / 2} ${y + inset}
            L ${x + width - inset} ${y + inset + peakHeight}
            L ${x + width - inset} ${y + height - inset}
            L ${x + inset} ${y + height - inset}
            Z
        `);
        roof.setAttribute('class', 'building-roof');
        roof.setAttribute('fill', BuildingStyleManager.getRoofColor(type));
        roof.setAttribute('stroke', '#444444');
        roof.setAttribute('stroke-width', '0.5');
        roof.setAttribute('opacity', 0.4);
        
        detailsGroup.appendChild(roof);
        detailsGroup._roof = roof;
    }
    
    static addHippedRoof(detailsGroup, building) {
        const { x, y, width, height, type } = building;
        const inset = Math.min(width, height) * 0.15;
        
        const roof = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        roof.setAttribute('d', `
            M ${x + inset} ${y + inset}
            L ${x + width - inset} ${y + inset}
            L ${x + width - inset * 0.5} ${y + inset * 0.5}
            L ${x + width - inset * 0.5} ${y + height - inset * 0.5}
            L ${x + width - inset} ${y + height - inset}
            L ${x + inset} ${y + height - inset}
            L ${x + inset * 0.5} ${y + height - inset * 0.5}
            L ${x + inset * 0.5} ${y + inset * 0.5}
            Z
        `);
        roof.setAttribute('class', 'building-roof');
        roof.setAttribute('fill', BuildingStyleManager.getRoofColor(type));
        roof.setAttribute('stroke', '#444444');
        roof.setAttribute('stroke-width', '0.5');
        roof.setAttribute('opacity', 0.4);
        
        detailsGroup.appendChild(roof);
        detailsGroup._roof = roof;
    }
    
    static addShedRoof(detailsGroup, building) {
        const { x, y, width, height, type } = building;
        const inset = Math.min(width, height) * 0.05;
        const slopeHeight = Math.min(width, height) * 0.1;
        
        const roof = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        roof.setAttribute('d', `
            M ${x + inset} ${y + inset}
            L ${x + width - inset} ${y + inset + slopeHeight}
            L ${x + width - inset} ${y + height - inset}
            L ${x + inset} ${y + height - inset}
            Z
        `);
        roof.setAttribute('class', 'building-roof');
        roof.setAttribute('fill', BuildingStyleManager.getRoofColor(type));
        roof.setAttribute('stroke', '#444444');
        roof.setAttribute('stroke-width', '0.5');
        roof.setAttribute('opacity', 0.4);
        
        detailsGroup.appendChild(roof);
        detailsGroup._roof = roof;
    }
    
    static addMansardRoof(detailsGroup, building) {
        const { x, y, width, height, type } = building;
        const inset = Math.min(width, height) * 0.1;
        const topInset = Math.min(width, height) * 0.2;
        const roofHeight = Math.min(width, height) * 0.15;
        
        const roof = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        roof.setAttribute('d', `
            M ${x + inset} ${y + inset + roofHeight}
            L ${x + topInset} ${y + inset}
            L ${x + width - topInset} ${y + inset}
            L ${x + width - inset} ${y + inset + roofHeight}
            L ${x + width - inset} ${y + height - inset}
            L ${x + inset} ${y + height - inset}
            Z
        `);
        roof.setAttribute('class', 'building-roof');
        roof.setAttribute('fill', BuildingStyleManager.getRoofColor(type));
        roof.setAttribute('stroke', '#444444');
        roof.setAttribute('stroke-width', '0.5');
        roof.setAttribute('opacity', 0.4);
        
        detailsGroup.appendChild(roof);
        detailsGroup._roof = roof;
    }
    
    /**
     * Add industrial building details (smoke stacks, vents)
     */
    static addIndustrialDetails(detailsGroup, building) {
        const { x, y, width, height } = building;
        
        // Add basic roof first
        this.addBasicRoof(detailsGroup, building);
        
        // Add smoke stacks
        const numStacks = Math.min(3, Math.floor(width / 20));
        for (let i = 0; i < numStacks; i++) {
            const stackX = x + (width / (numStacks + 1)) * (i + 1);
            const stackY = y + height * 0.2;
            const stackWidth = 8;
            const stackHeight = height * 0.15;
            
            // Stack base
            const stack = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            stack.setAttribute('x', stackX - stackWidth/2);
            stack.setAttribute('y', stackY);
            stack.setAttribute('width', stackWidth);
            stack.setAttribute('height', stackHeight);
            stack.setAttribute('fill', '#666666');
            stack.setAttribute('stroke', '#444444');
            stack.setAttribute('stroke-width', '1');
            
            // Stack top
            const stackTop = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            stackTop.setAttribute('x', stackX - stackWidth/2 - 2);
            stackTop.setAttribute('y', stackY - 3);
            stackTop.setAttribute('width', stackWidth + 4);
            stackTop.setAttribute('height', 4);
            stackTop.setAttribute('fill', '#555555');
            stackTop.setAttribute('rx', '1');
            
            detailsGroup.appendChild(stack);
            detailsGroup.appendChild(stackTop);
        }
        
        // Add ventilation units
        const ventY = y + height * 0.6;
        for (let i = 0; i < 2; i++) {
            const ventX = x + width * (0.3 + i * 0.4);
            const vent = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            vent.setAttribute('x', ventX - 6);
            vent.setAttribute('y', ventY);
            vent.setAttribute('width', 12);
            vent.setAttribute('height', 8);
            vent.setAttribute('fill', '#888888');
            vent.setAttribute('stroke', '#666666');
            vent.setAttribute('stroke-width', '0.5');
            vent.setAttribute('rx', '1');
            
            detailsGroup.appendChild(vent);
        }
    }
    
    /**
     * Add office building details (HVAC units, antennas)
     */
    static addOfficeDetails(detailsGroup, building) {
        const { x, y, width, height } = building;
        
        // Add basic roof
        this.addBasicRoof(detailsGroup, building);
        
        // Add rooftop HVAC units
        const hvacSize = Math.min(width, height) * 0.15;
        const hvacX = x + width * 0.3;
        const hvacY = y + height * 0.3;
        
        // HVAC unit
        const hvac = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        hvac.setAttribute('x', hvacX);
        hvac.setAttribute('y', hvacY);
        hvac.setAttribute('width', hvacSize);
        hvac.setAttribute('height', hvacSize);
        hvac.setAttribute('fill', '#cccccc');
        hvac.setAttribute('stroke', '#999999');
        hvac.setAttribute('stroke-width', '1');
        hvac.setAttribute('rx', '2');
        
        // HVAC fan grille
        const fanSize = hvacSize * 0.7;
        const fan = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        fan.setAttribute('cx', hvacX + hvacSize/2);
        fan.setAttribute('cy', hvacY + hvacSize/2);
        fan.setAttribute('r', fanSize/2);
        fan.setAttribute('fill', 'none');
        fan.setAttribute('stroke', '#888888');
        fan.setAttribute('stroke-width', '1');
        
        detailsGroup.appendChild(hvac);
        detailsGroup.appendChild(fan);
        
        // Add antenna if building is tall enough
        if (building.floors && building.floors > 5) {
            const antennaX = x + width * 0.7;
            const antennaY = y + height * 0.2;
            
            // Antenna pole
            const pole = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pole.setAttribute('x', antennaX - 1);
            pole.setAttribute('y', antennaY);
            pole.setAttribute('width', 2);
            pole.setAttribute('height', 15);
            pole.setAttribute('fill', '#999999');
            
            // Antenna dish
            const dish = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            dish.setAttribute('cx', antennaX);
            dish.setAttribute('cy', antennaY + 5);
            dish.setAttribute('rx', 5);
            dish.setAttribute('ry', 3);
            dish.setAttribute('fill', '#cccccc');
            dish.setAttribute('stroke', '#999999');
            dish.setAttribute('stroke-width', '0.5');
            
            detailsGroup.appendChild(pole);
            detailsGroup.appendChild(dish);
        }
    }
    
    /**
     * Add commercial building details (storefronts, signage area)
     */
    static addCommercialDetails(detailsGroup, building) {
        const { x, y, width, height } = building;
        
        // Add basic roof
        this.addBasicRoof(detailsGroup, building);
        
        // Add storefront at ground level
        const storefrontHeight = Math.min(height * 0.25, 15);
        const storefront = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        storefront.setAttribute('x', x + 2);
        storefront.setAttribute('y', y + height - storefrontHeight - 2);
        storefront.setAttribute('width', width - 4);
        storefront.setAttribute('height', storefrontHeight);
        storefront.setAttribute('fill', 'rgba(153, 204, 255, 0.3)'); // Glass blue
        storefront.setAttribute('stroke', '#666666');
        storefront.setAttribute('stroke-width', '1');
        
        // Add window divisions
        const numWindows = Math.floor(width / 15);
        for (let i = 1; i < numWindows; i++) {
            const divX = x + (width / numWindows) * i;
            const divider = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            divider.setAttribute('x1', divX);
            divider.setAttribute('y1', y + height - storefrontHeight - 2);
            divider.setAttribute('x2', divX);
            divider.setAttribute('y2', y + height - 2);
            divider.setAttribute('stroke', '#666666');
            divider.setAttribute('stroke-width', '0.5');
            
            detailsGroup.appendChild(divider);
        }
        
        detailsGroup.appendChild(storefront);
        
        // Add awning
        const awning = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        awning.setAttribute('x', x);
        awning.setAttribute('y', y + height - storefrontHeight - 4);
        awning.setAttribute('width', width);
        awning.setAttribute('height', 3);
        awning.setAttribute('fill', '#888888');
        awning.setAttribute('opacity', '0.7');
        
        detailsGroup.appendChild(awning);
    }
    
    /**
     * Add residential building details (chimneys, windows)
     */
    static addResidentialDetails(detailsGroup, building) {
        const { x, y, width, height } = building;
        
        // Add basic roof
        this.addBasicRoof(detailsGroup, building);
        
        // Add chimney for houses
        if (width < 50 && height < 50) { // Small residential = house
            const chimneyWidth = 6;
            const chimneyHeight = 8;
            const chimneyX = x + width * 0.75;
            const chimneyY = y + height * 0.2;
            
            const chimney = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            chimney.setAttribute('x', chimneyX);
            chimney.setAttribute('y', chimneyY);
            chimney.setAttribute('width', chimneyWidth);
            chimney.setAttribute('height', chimneyHeight);
            chimney.setAttribute('fill', '#8B6F47'); // Brown brick
            chimney.setAttribute('stroke', '#6B5637');
            chimney.setAttribute('stroke-width', '0.5');
            
            detailsGroup.appendChild(chimney);
        }
        
        // Add window pattern for apartments
        if (width > 40 || height > 40) {
            const windowRows = Math.floor(height / 15);
            const windowCols = Math.floor(width / 12);
            const windowWidth = 4;
            const windowHeight = 6;
            const spacingX = (width - windowCols * windowWidth) / (windowCols + 1);
            const spacingY = (height - windowRows * windowHeight) / (windowRows + 1);
            const totalWindows = windowRows * windowCols;
            
            // Ensure building has an ID for lighting state
            const buildingId = building.id || `building_${building.x}_${building.y}`;
            
            let windowIndex = 0;
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    const winX = x + spacingX + col * (windowWidth + spacingX);
                    const winY = y + spacingY + row * (windowHeight + spacingY);
                    
                    const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    window.setAttribute('x', winX);
                    window.setAttribute('y', winY);
                    window.setAttribute('width', windowWidth);
                    window.setAttribute('height', windowHeight);
                    
                    // Use lighting manager to determine if window is lit
                    const isLit = windowLightingManager.isWindowLit(buildingId, windowIndex, totalWindows);
                    window.setAttribute('fill', isLit ? '#FFFFCC' : '#444444');
                    window.setAttribute('opacity', '0.6');
                    window.setAttribute('class', 'building-window');
                    window.setAttribute('data-window-index', windowIndex);
                    window.setAttribute('data-building-id', buildingId);
                    window.setAttribute('data-is-lit', isLit ? 'true' : 'false');
                    
                    detailsGroup.appendChild(window);
                    windowIndex++;
                }
            }
        }
    }
    
    /**
     * Update roof when building properties change
     */
    static updateRoof(roof, building) {
        if (!roof) return;
        
        const { x, y, width, height, type } = building;
        const inset = Math.min(width, height) * 0.1;
        
        roof.setAttribute('x', x + inset);
        roof.setAttribute('y', y + inset);
        roof.setAttribute('width', width - inset * 2);
        roof.setAttribute('height', height - inset * 2);
        roof.setAttribute('fill', BuildingStyleManager.getRoofColor(type));
    }
}