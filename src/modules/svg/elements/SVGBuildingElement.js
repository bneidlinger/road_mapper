import { SVGBaseElement } from '../SVGBaseElement.js';
import { isometricRenderer } from '../../rendering/IsometricRenderer.js';
import { BuildingGradientsFactory } from '../effects/BuildingGradientsFactory.js';

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
        this.isometricGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.isometricGroup.setAttribute('class', 'building-isometric');
        
        this.group.appendChild(this.standardGroup);
        this.group.appendChild(this.isometricGroup);
        
        // Create building elements
        this.createBuildingElements();
        
        // Create isometric elements
        this.createIsometricElements();
        
        // Create city light elements for bird's eye view
        this.createCityLightElements();
        
        // Set initial state
        this.updatePosition();
        this.updateDetailLevel(1, false);
        this.updateRenderMode();
    }
    
    /**
     * Create the building SVG elements
     */
    createBuildingElements() {
        const { x, y, width, height, type } = this.building;
        
        // Building base/footprint
        this.base = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.base.setAttribute('x', x);
        this.base.setAttribute('y', y);
        this.base.setAttribute('width', width);
        this.base.setAttribute('height', height);
        this.base.setAttribute('class', `building-base building-${type}`);
        this.base.setAttribute('fill', this.building.customColor || this.building.color || this.getBuildingColor(type));
        this.base.setAttribute('stroke', this.building.selected ? '#00ff88' : this.getBuildingStrokeColor(type));
        this.base.setAttribute('stroke-width', this.building.selected ? 2 : 1);
        this.base.setAttribute('rx', 2);
        this.base.setAttribute('ry', 2);
        
        // Apply dynamic shadow based on building size/floors
        const shadowFilter = this.getShadowFilter();
        if (!this.building.selected && shadowFilter) {
            this.base.setAttribute('filter', `url(#${shadowFilter})`);
        }
        
        // Add glow effect when selected (overrides shadow)
        if (this.building.selected) {
            this.base.setAttribute('filter', 'url(#building-selection-glow)');
        }
        
        // Add subtle 3D edge highlight for depth
        this.highlight = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const highlightPath = `M ${x} ${y + 2} L ${x + width - 2} ${y + 2} L ${x + width - 2} ${y + height * 0.3} L ${x} ${y + height * 0.3} Z`;
        this.highlight.setAttribute('d', highlightPath);
        this.highlight.setAttribute('fill', 'rgba(255, 255, 255, 0.1)');
        this.highlight.setAttribute('stroke', 'none');
        
        // Add elements to standard group
        this.standardGroup.appendChild(this.base);
        this.standardGroup.appendChild(this.highlight);
        
        // Add type-specific details
        this.addTypeSpecificDetails();
    }
    
    /**
     * Add type-specific visual details
     */
    addTypeSpecificDetails() {
        const { type } = this.building;
        
        // Create details group
        this.detailsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.detailsGroup.setAttribute('class', 'building-details');
        
        switch (type) {
            case 'industrial':
                this.addIndustrialDetails();
                break;
            case 'office':
                this.addOfficeDetails();
                break;
            case 'commercial':
                this.addCommercialDetails();
                break;
            case 'residential':
                this.addResidentialDetails();
                break;
            default:
                this.addBasicRoof();
        }
        
        this.standardGroup.appendChild(this.detailsGroup);
    }
    
    /**
     * Add basic roof for buildings
     */
    addBasicRoof() {
        const { x, y, width, height, type } = this.building;
        const inset = Math.min(width, height) * 0.1;
        
        this.roof = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.roof.setAttribute('x', x + inset);
        this.roof.setAttribute('y', y + inset);
        this.roof.setAttribute('width', width - inset * 2);
        this.roof.setAttribute('height', height - inset * 2);
        this.roof.setAttribute('class', 'building-roof');
        this.roof.setAttribute('fill', this.getRoofColor(type));
        this.roof.setAttribute('stroke', 'none');
        this.roof.setAttribute('opacity', 0.3);
        this.roof.setAttribute('rx', 1);
        this.roof.setAttribute('ry', 1);
        
        this.detailsGroup.appendChild(this.roof);
    }
    
    /**
     * Add industrial building details (smoke stacks, vents)
     */
    addIndustrialDetails() {
        const { x, y, width, height } = this.building;
        
        // Add basic roof first
        this.addBasicRoof();
        
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
            
            this.detailsGroup.appendChild(stack);
            this.detailsGroup.appendChild(stackTop);
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
            
            this.detailsGroup.appendChild(vent);
        }
    }
    
    /**
     * Add office building details (HVAC units, antennas)
     */
    addOfficeDetails() {
        const { x, y, width, height } = this.building;
        
        // Add basic roof
        this.addBasicRoof();
        
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
        
        this.detailsGroup.appendChild(hvac);
        this.detailsGroup.appendChild(fan);
        
        // Add antenna if building is tall enough
        if (this.building.floors && this.building.floors > 5) {
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
            
            this.detailsGroup.appendChild(pole);
            this.detailsGroup.appendChild(dish);
        }
    }
    
    /**
     * Add commercial building details (storefronts, signage area)
     */
    addCommercialDetails() {
        const { x, y, width, height } = this.building;
        
        // Add basic roof
        this.addBasicRoof();
        
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
            
            this.detailsGroup.appendChild(divider);
        }
        
        this.detailsGroup.appendChild(storefront);
        
        // Add awning
        const awning = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        awning.setAttribute('x', x);
        awning.setAttribute('y', y + height - storefrontHeight - 4);
        awning.setAttribute('width', width);
        awning.setAttribute('height', 3);
        awning.setAttribute('fill', '#888888');
        awning.setAttribute('opacity', '0.7');
        
        this.detailsGroup.appendChild(awning);
    }
    
    /**
     * Add residential building details (chimneys, windows)
     */
    addResidentialDetails() {
        const { x, y, width, height } = this.building;
        
        // Add basic roof
        this.addBasicRoof();
        
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
            
            this.detailsGroup.appendChild(chimney);
        }
        
        // Add window pattern for apartments
        if (width > 40 || height > 40) {
            const windowRows = Math.floor(height / 15);
            const windowCols = Math.floor(width / 12);
            const windowWidth = 4;
            const windowHeight = 6;
            const spacingX = (width - windowCols * windowWidth) / (windowCols + 1);
            const spacingY = (height - windowRows * windowHeight) / (windowRows + 1);
            
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    const winX = x + spacingX + col * (windowWidth + spacingX);
                    const winY = y + spacingY + row * (windowHeight + spacingY);
                    
                    const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    window.setAttribute('x', winX);
                    window.setAttribute('y', winY);
                    window.setAttribute('width', windowWidth);
                    window.setAttribute('height', windowHeight);
                    window.setAttribute('fill', Math.random() > 0.3 ? '#FFFFCC' : '#444444'); // Some lit, some dark
                    window.setAttribute('opacity', '0.6');
                    
                    this.detailsGroup.appendChild(window);
                }
            }
        }
    }
    
    /**
     * Create city light elements for bird's eye view
     */
    createCityLightElements() {
        const { x, y, width, height, type } = this.building;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Create a group for city lights
        this.cityLightGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.cityLightGroup.setAttribute('class', 'city-lights');
        this.cityLightGroup.style.display = 'none'; // Hidden by default
        
        // Determine light color and intensity based on building type
        const lightColors = {
            residential: '#ffeb99', // Warm yellow
            commercial: '#99ccff', // Cool blue-white
            office: '#ffffff', // Bright white
            industrial: '#ffaa66' // Orange
        };
        
        const lightColor = lightColors[type] || '#ffeb99';
        
        // Calculate light radius based on building size
        const buildingArea = width * height;
        const baseRadius = Math.sqrt(buildingArea) / 8;
        const lightRadius = Math.max(3, Math.min(baseRadius, 15));
        
        // Create the main light point
        this.lightPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.lightPoint.setAttribute('cx', centerX);
        this.lightPoint.setAttribute('cy', centerY);
        this.lightPoint.setAttribute('r', lightRadius);
        this.lightPoint.setAttribute('fill', lightColor);
        this.lightPoint.setAttribute('opacity', '0.9');
        
        // Create glow effect
        this.lightGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.lightGlow.setAttribute('cx', centerX);
        this.lightGlow.setAttribute('cy', centerY);
        this.lightGlow.setAttribute('r', lightRadius * 2.5);
        this.lightGlow.setAttribute('fill', lightColor);
        this.lightGlow.setAttribute('opacity', '0.3');
        this.lightGlow.setAttribute('filter', 'url(#city-light-blur)');
        
        // Add elements to group
        this.cityLightGroup.appendChild(this.lightGlow);
        this.cityLightGroup.appendChild(this.lightPoint);
        
        // For larger buildings, add multiple light points
        if (buildingArea > 3000) {
            this.addAdditionalLights(x, y, width, height, lightColor);
        }
        
        this.group.appendChild(this.cityLightGroup);
    }
    
    /**
     * Create isometric building elements
     */
    createIsometricElements() {
        if (!this.building) return;
        
        const { faces, corners, height } = isometricRenderer.createBuildingFaces(this.building);
        const brightness = isometricRenderer.getFaceBrightness();
        const baseColor = this.building.customColor || this.building.color || this.getBuildingColor(this.building.type);
        
        // Create gradients for each face
        const rightGradient = BuildingGradientsFactory.createFaceGradient('right', baseColor, this.building.type);
        const frontGradient = BuildingGradientsFactory.createFaceGradient('front', baseColor, this.building.type);
        const topGradient = BuildingGradientsFactory.createFaceGradient('top', baseColor, this.building.type);
        
        // Add gradients to defs
        if (this.svgManager) {
            this.svgManager.addDef(rightGradient);
            this.svgManager.addDef(frontGradient);
            this.svgManager.addDef(topGradient);
        }
        
        // Create enhanced isometric shadow with gradient
        if (this.building.floors > 0) {
            const shadowGradient = BuildingGradientsFactory.createShadowGradient();
            if (this.svgManager) {
                this.svgManager.addDef(shadowGradient);
            }
            
            this.isometricShadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            this.isometricShadow.setAttribute('d', isometricRenderer.createIsometricShadow(this.building));
            this.isometricShadow.setAttribute('fill', `url(#${shadowGradient.getAttribute('id')})`);
            this.isometricShadow.setAttribute('stroke', 'none');
            this.isometricShadow.setAttribute('filter', 'blur(2px)');
            this.isometricGroup.appendChild(this.isometricShadow);
        }
        
        // Create faces in correct draw order (back to front)
        // Right face
        this.isoRightFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.isoRightFace.setAttribute('d', faces.right);
        this.isoRightFace.setAttribute('fill', `url(#${rightGradient.getAttribute('id')})`);
        this.isoRightFace.setAttribute('stroke', this.building.selected ? '#00ff88' : 'rgba(0, 0, 0, 0.1)');
        this.isoRightFace.setAttribute('stroke-width', this.building.selected ? 2 : 0.5);
        this.isoRightFace.setAttribute('stroke-linejoin', 'round');
        
        // Front face
        this.isoFrontFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.isoFrontFace.setAttribute('d', faces.front);
        this.isoFrontFace.setAttribute('fill', `url(#${frontGradient.getAttribute('id')})`);
        this.isoFrontFace.setAttribute('stroke', this.building.selected ? '#00ff88' : 'rgba(0, 0, 0, 0.1)');
        this.isoFrontFace.setAttribute('stroke-width', this.building.selected ? 2 : 0.5);
        this.isoFrontFace.setAttribute('stroke-linejoin', 'round');
        
        // Top face (roof)
        this.isoTopFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.isoTopFace.setAttribute('d', faces.top);
        this.isoTopFace.setAttribute('fill', `url(#${topGradient.getAttribute('id')})`);
        this.isoTopFace.setAttribute('stroke', this.building.selected ? '#00ff88' : 'rgba(0, 0, 0, 0.05)');
        this.isoTopFace.setAttribute('stroke-width', this.building.selected ? 2 : 0.5);
        this.isoTopFace.setAttribute('stroke-linejoin', 'round');
        
        // Add glow effect when selected
        if (this.building.selected) {
            this.isoTopFace.setAttribute('filter', 'url(#building-selection-glow)');
        }
        
        // Add faces to group
        this.isometricGroup.appendChild(this.isoRightFace);
        this.isometricGroup.appendChild(this.isoFrontFace);
        this.isometricGroup.appendChild(this.isoTopFace);
        
        // Add floor indicators on the front face
        this.addIsometricFloorLines();
        
        // Add type-specific isometric details
        this.addIsometricTypeDetails();
        
        // Add glass windows for office and commercial buildings
        if (this.building.type === 'office' || this.building.type === 'commercial') {
            this.addIsometricWindows();
        }
    }
    
    /**
     * Add realistic window patterns to isometric faces
     */
    addIsometricWindows() {
        // Create glass gradient if not already created
        const glassGradient = BuildingGradientsFactory.createGlassGradient(0.7);
        if (this.svgManager) {
            this.svgManager.addDef(glassGradient);
        }
        
        // Create window patterns for front and right faces
        const frontWindowPattern = BuildingGradientsFactory.createWindowPattern(this.building.type, 'front');
        const rightWindowPattern = BuildingGradientsFactory.createWindowPattern(this.building.type, 'right');
        
        if (this.svgManager) {
            this.svgManager.addDef(glassGradient); // Add the glass gradient that windows reference
            this.svgManager.addDef(frontWindowPattern);
            this.svgManager.addDef(rightWindowPattern);
        }
        
        // Apply window patterns as overlays
        const frontWindows = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        frontWindows.setAttribute('d', this.isoFrontFace.getAttribute('d'));
        frontWindows.setAttribute('fill', `url(#${frontWindowPattern.getAttribute('id')})`);
        frontWindows.setAttribute('opacity', '0.8');
        
        const rightWindows = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        rightWindows.setAttribute('d', this.isoRightFace.getAttribute('d'));
        rightWindows.setAttribute('fill', `url(#${rightWindowPattern.getAttribute('id')})`);
        rightWindows.setAttribute('opacity', '0.8');
        
        this.isometricGroup.appendChild(frontWindows);
        this.isometricGroup.appendChild(rightWindows);
    }
    
    /**
     * Add floor line indicators for isometric view
     */
    addIsometricFloorLines() {
        const floors = this.building.floors || 1;
        if (floors <= 1) return;
        
        const floorLinesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        floorLinesGroup.setAttribute('class', 'floor-lines');
        
        // Get the building dimensions in isometric space
        const { x, y, width, height } = this.building;
        const floorHeight = isometricRenderer.floorHeight;
        
        // Draw floor lines on the front face
        for (let i = 1; i < floors; i++) {
            const z = i * floorHeight;
            
            // Left edge of floor line
            const leftPoint = isometricRenderer.toIsometricWithOffset(x, y + height, z, this.building);
            // Right edge of floor line
            const rightPoint = isometricRenderer.toIsometricWithOffset(x + width, y + height, z, this.building);
            
            const floorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            floorLine.setAttribute('x1', leftPoint.x);
            floorLine.setAttribute('y1', leftPoint.y);
            floorLine.setAttribute('x2', rightPoint.x);
            floorLine.setAttribute('y2', rightPoint.y);
            floorLine.setAttribute('stroke', 'rgba(0, 0, 0, 0.2)');
            floorLine.setAttribute('stroke-width', '0.5');
            
            floorLinesGroup.appendChild(floorLine);
        }
        
        // Add floor lines on the right face
        for (let i = 1; i < floors; i++) {
            const z = i * floorHeight;
            
            // Front edge of floor line
            const frontPoint = isometricRenderer.toIsometricWithOffset(x + width, y + height, z, this.building);
            // Back edge of floor line
            const backPoint = isometricRenderer.toIsometricWithOffset(x + width, y, z, this.building);
            
            const floorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            floorLine.setAttribute('x1', frontPoint.x);
            floorLine.setAttribute('y1', frontPoint.y);
            floorLine.setAttribute('x2', backPoint.x);
            floorLine.setAttribute('y2', backPoint.y);
            floorLine.setAttribute('stroke', 'rgba(0, 0, 0, 0.15)');
            floorLine.setAttribute('stroke-width', '0.5');
            
            floorLinesGroup.appendChild(floorLine);
        }
        
        this.isometricGroup.appendChild(floorLinesGroup);
    }
    
    /**
     * Adjust color brightness for isometric faces
     */
    adjustBrightness(color, factor) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Adjust brightness
        const newR = Math.round(r * factor);
        const newG = Math.round(g * factor);
        const newB = Math.round(b * factor);
        
        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Add type-specific details for isometric view
     */
    addIsometricTypeDetails() {
        const { x, y, width, height, type, floors = 1 } = this.building;
        const floorHeight = isometricRenderer.floorHeight;
        
        const detailsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        detailsGroup.setAttribute('class', 'isometric-type-details');
        
        switch (type) {
            case 'residential':
                this.addIsometricResidentialDetails(detailsGroup, x, y, width, height, floors);
                break;
            case 'commercial':
                this.addIsometricCommercialDetails(detailsGroup, x, y, width, height, floors);
                break;
            case 'office':
                this.addIsometricOfficeDetails(detailsGroup, x, y, width, height, floors);
                break;
            case 'industrial':
                this.addIsometricIndustrialDetails(detailsGroup, x, y, width, height, floors);
                break;
        }
        
        this.isometricGroup.appendChild(detailsGroup);
    }
    
    /**
     * Add residential details (windows, doors) for isometric view
     */
    addIsometricResidentialDetails(group, x, y, width, height, floors) {
        const floorHeight = isometricRenderer.floorHeight;
        
        // Add windows on front face
        const windowWidth = 8;
        const windowHeight = 10;
        const windowSpacing = 15;
        const windowsPerFloor = Math.floor((width - 20) / windowSpacing);
        
        for (let floor = 0; floor < floors; floor++) {
            for (let i = 0; i < windowsPerFloor; i++) {
                const winX = x + 10 + i * windowSpacing;
                const winY = y + height;
                const winZ = floor * floorHeight + 4;
                
                const topLeft = isometricRenderer.toIsometricWithOffset(winX, winY, winZ, this.building);
                const topRight = isometricRenderer.toIsometricWithOffset(winX + windowWidth, winY, winZ, this.building);
                const bottomRight = isometricRenderer.toIsometricWithOffset(winX + windowWidth, winY, winZ + windowHeight, this.building);
                const bottomLeft = isometricRenderer.toIsometricWithOffset(winX, winY, winZ + windowHeight, this.building);
                
                const windowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                windowPath.setAttribute('d', `M ${topLeft.x} ${topLeft.y} L ${topRight.x} ${topRight.y} L ${bottomRight.x} ${bottomRight.y} L ${bottomLeft.x} ${bottomLeft.y} Z`);
                windowPath.setAttribute('fill', Math.random() > 0.3 ? '#FFFFCC' : '#333333');
                windowPath.setAttribute('stroke', '#444444');
                windowPath.setAttribute('stroke-width', '0.5');
                
                group.appendChild(windowPath);
            }
        }
        
        // Add door on ground floor
        if (floors > 0) {
            const doorWidth = 10;
            const doorHeight = 15;
            const doorX = x + width / 2 - doorWidth / 2;
            const doorY = y + height;
            
            const doorTopLeft = isometricRenderer.toIsometricWithOffset(doorX, doorY, 0, this.building);
            const doorTopRight = isometricRenderer.toIsometricWithOffset(doorX + doorWidth, doorY, 0, this.building);
            const doorBottomRight = isometricRenderer.toIsometricWithOffset(doorX + doorWidth, doorY, doorHeight, this.building);
            const doorBottomLeft = isometricRenderer.toIsometricWithOffset(doorX, doorY, doorHeight, this.building);
            
            const doorPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            doorPath.setAttribute('d', `M ${doorTopLeft.x} ${doorTopLeft.y} L ${doorTopRight.x} ${doorTopRight.y} L ${doorBottomRight.x} ${doorBottomRight.y} L ${doorBottomLeft.x} ${doorBottomLeft.y} Z`);
            doorPath.setAttribute('fill', '#654321');
            doorPath.setAttribute('stroke', '#444444');
            doorPath.setAttribute('stroke-width', '0.5');
            
            group.appendChild(doorPath);
        }
    }
    
    /**
     * Add commercial details (storefront) for isometric view
     */
    addIsometricCommercialDetails(group, x, y, width, height, floors) {
        // Large glass storefront on ground floor
        const storefrontHeight = Math.min(20, isometricRenderer.floorHeight - 2);
        const glassWidth = width - 10;
        
        const glassX = x + 5;
        const glassY = y + height;
        
        const topLeft = isometricRenderer.toIsometricWithOffset(glassX, glassY, 2, this.building);
        const topRight = isometricRenderer.toIsometricWithOffset(glassX + glassWidth, glassY, 2, this.building);
        const bottomRight = isometricRenderer.toIsometricWithOffset(glassX + glassWidth, glassY, storefrontHeight, this.building);
        const bottomLeft = isometricRenderer.toIsometricWithOffset(glassX, glassY, storefrontHeight, this.building);
        
        const storefrontPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        storefrontPath.setAttribute('d', `M ${topLeft.x} ${topLeft.y} L ${topRight.x} ${topRight.y} L ${bottomRight.x} ${bottomRight.y} L ${bottomLeft.x} ${bottomLeft.y} Z`);
        storefrontPath.setAttribute('fill', 'rgba(153, 204, 255, 0.4)');
        storefrontPath.setAttribute('stroke', '#666666');
        storefrontPath.setAttribute('stroke-width', '0.5');
        
        group.appendChild(storefrontPath);
        
        // Add window dividers
        const numPanes = Math.floor(glassWidth / 20);
        for (let i = 1; i < numPanes; i++) {
            const divX = glassX + (glassWidth / numPanes) * i;
            const divTop = isometricRenderer.toIsometricWithOffset(divX, glassY, 2, this.building);
            const divBottom = isometricRenderer.toIsometricWithOffset(divX, glassY, storefrontHeight, this.building);
            
            const divider = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            divider.setAttribute('x1', divTop.x);
            divider.setAttribute('y1', divTop.y);
            divider.setAttribute('x2', divBottom.x);
            divider.setAttribute('y2', divBottom.y);
            divider.setAttribute('stroke', '#666666');
            divider.setAttribute('stroke-width', '0.5');
            
            group.appendChild(divider);
        }
    }
    
    /**
     * Add office details (grid windows) for isometric view
     */
    addIsometricOfficeDetails(group, x, y, width, height, floors) {
        // Grid of windows on all floors
        const windowSize = 6;
        const windowSpacing = 10;
        const windowsPerRow = Math.floor((width - 10) / windowSpacing);
        const windowsPerColumn = Math.floor((isometricRenderer.floorHeight - 4) / windowSpacing);
        
        for (let floor = 0; floor < floors; floor++) {
            for (let row = 0; row < windowsPerColumn; row++) {
                for (let col = 0; col < windowsPerRow; col++) {
                    const winX = x + 5 + col * windowSpacing;
                    const winY = y + height;
                    const winZ = floor * isometricRenderer.floorHeight + 3 + row * windowSpacing;
                    
                    const topLeft = isometricRenderer.toIsometricWithOffset(winX, winY, winZ, this.building);
                    const topRight = isometricRenderer.toIsometricWithOffset(winX + windowSize, winY, winZ, this.building);
                    const bottomRight = isometricRenderer.toIsometricWithOffset(winX + windowSize, winY, winZ + windowSize, this.building);
                    const bottomLeft = isometricRenderer.toIsometricWithOffset(winX, winY, winZ + windowSize, this.building);
                    
                    const windowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    windowPath.setAttribute('d', `M ${topLeft.x} ${topLeft.y} L ${topRight.x} ${topRight.y} L ${bottomRight.x} ${bottomRight.y} L ${bottomLeft.x} ${bottomLeft.y} Z`);
                    windowPath.setAttribute('fill', '#99CCFF');
                    windowPath.setAttribute('opacity', '0.6');
                    windowPath.setAttribute('stroke', '#666666');
                    windowPath.setAttribute('stroke-width', '0.3');
                    
                    group.appendChild(windowPath);
                }
            }
        }
    }
    
    /**
     * Add industrial details (loading docks, vents) for isometric view
     */
    addIsometricIndustrialDetails(group, x, y, width, height, floors) {
        // Add loading dock on ground floor
        const dockWidth = Math.min(width * 0.4, 30);
        const dockHeight = 8;
        const dockDepth = 10;
        const dockX = x + width - dockWidth - 5;
        const dockY = y + height;
        
        // Loading dock platform
        const platformPoints = [
            isometricRenderer.toIsometricWithOffset(dockX, dockY, 0, this.building),
            isometricRenderer.toIsometricWithOffset(dockX + dockWidth, dockY, 0, this.building),
            isometricRenderer.toIsometricWithOffset(dockX + dockWidth, dockY + dockDepth, 0, this.building),
            isometricRenderer.toIsometricWithOffset(dockX + dockWidth, dockY + dockDepth, dockHeight, this.building),
            isometricRenderer.toIsometricWithOffset(dockX, dockY + dockDepth, dockHeight, this.building),
            isometricRenderer.toIsometricWithOffset(dockX, dockY, dockHeight, this.building)
        ];
        
        const dockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        dockPath.setAttribute('d', `M ${platformPoints[0].x} ${platformPoints[0].y} 
                                    L ${platformPoints[1].x} ${platformPoints[1].y}
                                    L ${platformPoints[2].x} ${platformPoints[2].y}
                                    L ${platformPoints[3].x} ${platformPoints[3].y}
                                    L ${platformPoints[4].x} ${platformPoints[4].y}
                                    L ${platformPoints[5].x} ${platformPoints[5].y} Z`);
        dockPath.setAttribute('fill', '#888888');
        dockPath.setAttribute('stroke', '#444444');
        dockPath.setAttribute('stroke-width', '0.5');
        
        group.appendChild(dockPath);
        
        // Add some small windows high up
        const windowY = y + height;
        const windowZ = (floors - 1) * isometricRenderer.floorHeight + 5;
        for (let i = 0; i < 3; i++) {
            const winX = x + 10 + i * 20;
            const winSize = 5;
            
            const topLeft = isometricRenderer.toIsometricWithOffset(winX, windowY, windowZ, this.building);
            const topRight = isometricRenderer.toIsometricWithOffset(winX + winSize, windowY, windowZ, this.building);
            const bottomRight = isometricRenderer.toIsometricWithOffset(winX + winSize, windowY, windowZ + winSize, this.building);
            const bottomLeft = isometricRenderer.toIsometricWithOffset(winX, windowY, windowZ + winSize, this.building);
            
            const windowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            windowPath.setAttribute('d', `M ${topLeft.x} ${topLeft.y} L ${topRight.x} ${topRight.y} L ${bottomRight.x} ${bottomRight.y} L ${bottomLeft.x} ${bottomLeft.y} Z`);
            windowPath.setAttribute('fill', '#666666');
            windowPath.setAttribute('stroke', '#333333');
            windowPath.setAttribute('stroke-width', '0.3');
            
            group.appendChild(windowPath);
        }
    }
    
    /**
     * Update render mode based on isometric state
     */
    updateRenderMode() {
        const isIsometric = isometricRenderer.isEnabled();
        
        // Show/hide appropriate groups
        this.standardGroup.style.display = isIsometric ? 'none' : '';
        this.isometricGroup.style.display = isIsometric ? '' : 'none';
        
        // Setup hover effects for isometric mode
        if (isIsometric && this.isometricGroup) {
            this.setupIsometricHoverEffects();
        }
    }
    
    /**
     * Setup hover effects for isometric buildings
     */
    setupIsometricHoverEffects() {
        if (this.hoverEffectsSetup || !this.isometricGroup) return;
        
        this.isometricGroup.style.cursor = 'pointer';
        this.isometricGroup.style.transition = 'transform 0.2s ease, filter 0.2s ease';
        
        const handleMouseEnter = () => {
            if (!this.building.selected) {
                this.isometricGroup.style.transform = 'translateY(-2px)';
                this.isometricGroup.style.filter = 'brightness(1.1) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
            }
        };
        
        const handleMouseLeave = () => {
            if (!this.building.selected) {
                this.isometricGroup.style.transform = '';
                this.isometricGroup.style.filter = '';
            }
        };
        
        this.isometricGroup.addEventListener('mouseenter', handleMouseEnter);
        this.isometricGroup.addEventListener('mouseleave', handleMouseLeave);
        
        this.hoverEffectsSetup = true;
    }
    
    /**
     * Add additional lights for larger buildings
     */
    addAdditionalLights(x, y, width, height, color) {
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
            
            this.cityLightGroup.appendChild(extraLight);
        }
    }
    
    /**
     * Get building color based on type
     */
    getBuildingColor(type) {
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
    getBuildingStrokeColor(type) {
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
    getRoofColor(type) {
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
    getShadowFilter() {
        const floors = this.building.floors || 1;
        const area = this.building.width * this.building.height;
        
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
        // First update render mode
        this.updateRenderMode();
        
        // Bird's eye view - show as city lights
        if (isBirdsEye || zoom < 0.3) {
            this.group.style.display = '';
            
            // Hide all building elements
            this.standardGroup.style.display = 'none';
            this.isometricGroup.style.display = 'none';
            
            // Show city lights
            if (this.cityLightGroup) {
                this.cityLightGroup.style.display = '';
                
                // Fade in effect
                const opacity = Math.min(1, (0.4 - zoom) * 5);
                this.cityLightGroup.style.opacity = opacity;
            }
        } else if (zoom < 0.5) {
            // Transition zone - fade from lights to buildings
            this.group.style.display = '';
            
            const buildingOpacity = (zoom - 0.3) * 5; // 0 at 0.3, 1 at 0.5
            const lightOpacity = 1 - buildingOpacity;
            
            // Show building with fading
            this.base.style.display = '';
            this.base.style.opacity = buildingOpacity * 0.6;
            if (this.roof) this.roof.style.display = 'none';
            if (this.highlight) this.highlight.style.display = 'none';
            if (this.detailsGroup) this.detailsGroup.style.display = 'none';
            
            // Fade out city lights
            if (this.cityLightGroup) {
                this.cityLightGroup.style.display = lightOpacity > 0 ? '' : 'none';
                this.cityLightGroup.style.opacity = lightOpacity * 0.5;
            }
        } else if (zoom < 1) {
            // Medium zoom - show basic building details
            this.group.style.display = '';
            this.group.style.opacity = '1';
            
            // Show building elements
            this.base.style.display = '';
            this.base.style.opacity = '1';
            if (this.roof) this.roof.style.display = '';
            if (this.highlight) this.highlight.style.display = 'none';
            if (this.detailsGroup) this.detailsGroup.style.display = 'none';
            
            // Hide city lights
            if (this.cityLightGroup) {
                this.cityLightGroup.style.display = 'none';
            }
        } else if (zoom < 2) {
            // High zoom - show all basic details
            this.group.style.display = '';
            this.group.style.opacity = '1';
            
            // Show all building elements
            this.base.style.display = '';
            this.base.style.opacity = '1';
            if (this.roof) this.roof.style.display = '';
            if (this.highlight) this.highlight.style.display = '';
            if (this.detailsGroup) this.detailsGroup.style.display = 'none';
            
            // Hide city lights
            if (this.cityLightGroup) {
                this.cityLightGroup.style.display = 'none';
            }
        } else {
            // Very high zoom - show all details including type-specific elements
            this.group.style.display = '';
            this.group.style.opacity = '1';
            
            // Show all building elements
            this.base.style.display = '';
            this.base.style.opacity = '1';
            if (this.roof) this.roof.style.display = '';
            if (this.highlight) this.highlight.style.display = '';
            if (this.detailsGroup) this.detailsGroup.style.display = '';
            
            // Hide city lights
            if (this.cityLightGroup) {
                this.cityLightGroup.style.display = 'none';
            }
        }
    }
    
    /**
     * Update building properties
     */
    update(building) {
        const typeChanged = this.building.type !== building.type;
        const sizeChanged = this.building.width !== building.width || this.building.height !== building.height;
        
        this.building = building;
        
        // Update base properties
        this.base.setAttribute('x', building.x);
        this.base.setAttribute('y', building.y);
        this.base.setAttribute('width', building.width);
        this.base.setAttribute('height', building.height);
        this.base.setAttribute('fill', building.customColor || building.color || this.getBuildingColor(building.type));
        this.base.setAttribute('stroke', building.selected ? '#00ff88' : this.getBuildingStrokeColor(building.type));
        this.base.setAttribute('stroke-width', building.selected ? 2 : 1);
        
        // Update selection glow or shadow filter
        if (building.selected) {
            this.base.setAttribute('filter', 'url(#building-selection-glow)');
        } else {
            const shadowFilter = this.getShadowFilter();
            if (shadowFilter) {
                this.base.setAttribute('filter', `url(#${shadowFilter})`);
            } else {
                this.base.removeAttribute('filter');
            }
        }
        
        // Update highlight
        if (this.highlight) {
            const highlightPath = `M ${building.x} ${building.y + 2} L ${building.x + building.width - 2} ${building.y + 2} L ${building.x + building.width - 2} ${building.y + building.height * 0.3} L ${building.x} ${building.y + building.height * 0.3} Z`;
            this.highlight.setAttribute('d', highlightPath);
        }
        
        // Update roof color if type changed
        if (this.roof) {
            const inset = Math.min(building.width, building.height) * 0.1;
            this.roof.setAttribute('x', building.x + inset);
            this.roof.setAttribute('y', building.y + inset);
            this.roof.setAttribute('width', building.width - inset * 2);
            this.roof.setAttribute('height', building.height - inset * 2);
            
            if (typeChanged) {
                this.roof.setAttribute('fill', this.getRoofColor(building.type));
            }
        }
        
        // Recreate type-specific details if type or size changed significantly
        if (typeChanged || sizeChanged) {
            // Remove old details group
            if (this.detailsGroup) {
                this.detailsGroup.remove();
            }
            
            // Create new details for the new type
            this.addTypeSpecificDetails();
            
            // Recreate isometric elements as dimensions changed
            if (this.isometricGroup) {
                // Clear existing isometric elements
                while (this.isometricGroup.firstChild) {
                    this.isometricGroup.removeChild(this.isometricGroup.firstChild);
                }
                // Recreate
                this.createIsometricElements();
            }
        }
        
        // Update city lights position and color if type changed
        if (this.cityLightGroup) {
            const centerX = building.x + building.width / 2;
            const centerY = building.y + building.height / 2;
            
            if (this.lightPoint) {
                this.lightPoint.setAttribute('cx', centerX);
                this.lightPoint.setAttribute('cy', centerY);
                
                // Update light color if type changed
                if (typeChanged) {
                    const lightColors = {
                        residential: '#ffeb99',
                        commercial: '#99ccff',
                        office: '#ffffff',
                        industrial: '#ffaa66'
                    };
                    const newColor = lightColors[building.type] || '#ffeb99';
                    this.lightPoint.setAttribute('fill', newColor);
                    if (this.lightGlow) {
                        this.lightGlow.setAttribute('fill', newColor);
                    }
                }
            }
            if (this.lightGlow) {
                this.lightGlow.setAttribute('cx', centerX);
                this.lightGlow.setAttribute('cy', centerY);
            }
        }
        
        // Update position/rotation
        this.updatePosition();
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
    }
}