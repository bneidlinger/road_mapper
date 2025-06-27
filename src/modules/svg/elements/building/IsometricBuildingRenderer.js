import { isometricRenderer } from '../../../rendering/IsometricRenderer.js';
import { BuildingGradientsFactory } from '../../effects/BuildingGradientsFactory.js';
import { gradientPool } from '../../effects/GradientPool.js';
import { BuildingStyleManager } from './BuildingStyleManager.js';
import { windowLightingManager } from './WindowLightingManager.js';

/**
 * IsometricBuildingRenderer - Handles all isometric rendering for buildings
 */
export class IsometricBuildingRenderer {
    /**
     * Create isometric building elements
     */
    static createIsometricElements(building, svgManager) {
        if (!building) return null;
        
        const isometricGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        isometricGroup.setAttribute('class', 'building-isometric');
        
        const { faces } = isometricRenderer.createBuildingFaces(building);
        const baseColor = building.customColor || building.color || BuildingStyleManager.getBuildingColor(building.type);
        
        // Use gradient pool for face gradients
        const rightGradientUrl = gradientPool.getGradient('face', { faceType: 'right', color: baseColor });
        const frontGradientUrl = gradientPool.getGradient('face', { faceType: 'front', color: baseColor });
        const topGradientUrl = gradientPool.getGradient('face', { faceType: 'top', color: baseColor });
        
        // Create enhanced isometric shadow with gradient
        if (building.floors > 0) {
            const shadowGradientUrl = gradientPool.getGradient('shadow', { intensity: 'medium' });
            
            const isometricShadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            isometricShadow.setAttribute('d', isometricRenderer.createIsometricShadow(building));
            isometricShadow.setAttribute('fill', shadowGradientUrl);
            isometricShadow.setAttribute('stroke', 'none');
            isometricShadow.setAttribute('filter', 'blur(2px)');
            isometricGroup.appendChild(isometricShadow);
        }
        
        // Create faces in correct draw order (back to front)
        // Right face
        const isoRightFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        isoRightFace.setAttribute('d', faces.right);
        isoRightFace.setAttribute('fill', rightGradientUrl);
        isoRightFace.setAttribute('stroke', building.selected ? '#00ff88' : 'rgba(0, 0, 0, 0.1)');
        isoRightFace.setAttribute('stroke-width', building.selected ? 2 : 0.5);
        isoRightFace.setAttribute('stroke-linejoin', 'round');
        
        // Front face
        const isoFrontFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        isoFrontFace.setAttribute('d', faces.front);
        isoFrontFace.setAttribute('fill', frontGradientUrl);
        isoFrontFace.setAttribute('stroke', building.selected ? '#00ff88' : 'rgba(0, 0, 0, 0.1)');
        isoFrontFace.setAttribute('stroke-width', building.selected ? 2 : 0.5);
        isoFrontFace.setAttribute('stroke-linejoin', 'round');
        
        // Top face (roof)
        const isoTopFace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        isoTopFace.setAttribute('d', faces.top);
        isoTopFace.setAttribute('fill', topGradientUrl);
        isoTopFace.setAttribute('stroke', building.selected ? '#00ff88' : 'rgba(0, 0, 0, 0.05)');
        isoTopFace.setAttribute('stroke-width', building.selected ? 2 : 0.5);
        isoTopFace.setAttribute('stroke-linejoin', 'round');
        
        // Add glow effect when selected
        if (building.selected) {
            isoTopFace.setAttribute('filter', 'url(#building-selection-glow)');
        }
        
        // Add faces to group
        isometricGroup.appendChild(isoRightFace);
        isometricGroup.appendChild(isoFrontFace);
        isometricGroup.appendChild(isoTopFace);
        
        // Render additional roof faces if they exist
        if (faces.roofEast) {
            const roofEastGradientUrl = gradientPool.getGradient('face', { faceType: 'right', color: baseColor });
            
            const isoRoofEast = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            isoRoofEast.setAttribute('d', faces.roofEast);
            isoRoofEast.setAttribute('fill', roofEastGradientUrl);
            isoRoofEast.setAttribute('stroke', building.selected ? '#00ff88' : 'rgba(0, 0, 0, 0.1)');
            isoRoofEast.setAttribute('stroke-width', building.selected ? 2 : 0.5);
            isoRoofEast.setAttribute('stroke-linejoin', 'round');
            isometricGroup.appendChild(isoRoofEast);
        }
        
        if (faces.hipNorth) {
            const hipNorthGradient = BuildingGradientsFactory.createFaceGradient('top', baseColor, building.type);
            if (svgManager) {
                svgManager.addDef(hipNorthGradient);
            }
            
            const isoHipNorth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            isoHipNorth.setAttribute('d', faces.hipNorth);
            isoHipNorth.setAttribute('fill', `url(#${hipNorthGradient.getAttribute('id')})`);
            isoHipNorth.setAttribute('stroke', building.selected ? '#00ff88' : 'rgba(0, 0, 0, 0.05)');
            isoHipNorth.setAttribute('stroke-width', building.selected ? 2 : 0.5);
            isoHipNorth.setAttribute('stroke-linejoin', 'round');
            isometricGroup.appendChild(isoHipNorth);
        }
        
        if (faces.hipSouth) {
            const hipSouthGradient = BuildingGradientsFactory.createFaceGradient('front', baseColor, building.type);
            if (svgManager) {
                svgManager.addDef(hipSouthGradient);
            }
            
            const isoHipSouth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            isoHipSouth.setAttribute('d', faces.hipSouth);
            isoHipSouth.setAttribute('fill', `url(#${hipSouthGradient.getAttribute('id')})`);
            isoHipSouth.setAttribute('stroke', building.selected ? '#00ff88' : 'rgba(0, 0, 0, 0.1)');
            isoHipSouth.setAttribute('stroke-width', building.selected ? 2 : 0.5);
            isoHipSouth.setAttribute('stroke-linejoin', 'round');
            isometricGroup.appendChild(isoHipSouth);
        }
        
        // Store face references
        isometricGroup._rightFace = isoRightFace;
        isometricGroup._frontFace = isoFrontFace;
        isometricGroup._topFace = isoTopFace;
        
        // Add floor indicators on the front face
        this.addIsometricFloorLines(isometricGroup, building);
        
        // Add type-specific isometric details
        this.addIsometricTypeDetails(isometricGroup, building);
        
        // Add glass windows for office and commercial buildings
        if (building.type === 'office' || building.type === 'commercial') {
            this.addIsometricWindows(isometricGroup, building, svgManager);
        }
        
        return isometricGroup;
    }
    
    /**
     * Add realistic window patterns to isometric faces
     */
    static addIsometricWindows(isometricGroup, building, svgManager) {
        // Create glass gradient if not already created
        const glassGradient = BuildingGradientsFactory.createGlassGradient(0.7);
        if (svgManager) {
            svgManager.addDef(glassGradient);
        }
        
        // Create window patterns for front and right faces
        const frontWindowPattern = BuildingGradientsFactory.createWindowPattern(building.type, 'front');
        const rightWindowPattern = BuildingGradientsFactory.createWindowPattern(building.type, 'right');
        
        if (svgManager) {
            svgManager.addDef(glassGradient); // Add the glass gradient that windows reference
            svgManager.addDef(frontWindowPattern);
            svgManager.addDef(rightWindowPattern);
        }
        
        // Apply window patterns as overlays
        const frontWindows = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        frontWindows.setAttribute('d', isometricGroup._frontFace.getAttribute('d'));
        frontWindows.setAttribute('fill', `url(#${frontWindowPattern.getAttribute('id')})`);
        frontWindows.setAttribute('opacity', '0.8');
        
        const rightWindows = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        rightWindows.setAttribute('d', isometricGroup._rightFace.getAttribute('d'));
        rightWindows.setAttribute('fill', `url(#${rightWindowPattern.getAttribute('id')})`);
        rightWindows.setAttribute('opacity', '0.8');
        
        isometricGroup.appendChild(frontWindows);
        isometricGroup.appendChild(rightWindows);
    }
    
    /**
     * Add floor line indicators for isometric view
     */
    static addIsometricFloorLines(isometricGroup, building) {
        const floors = building.floors || 1;
        if (floors <= 1) return;
        
        const floorLinesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        floorLinesGroup.setAttribute('class', 'floor-lines');
        
        // Get the building dimensions in isometric space
        const { x, y, width, height } = building;
        const floorHeight = isometricRenderer.floorHeight;
        
        // Draw floor lines on the front face
        for (let i = 1; i < floors; i++) {
            const z = i * floorHeight;
            
            // Left edge of floor line
            const leftPoint = isometricRenderer.toIsometricWithOffset(x, y + height, z, building);
            // Right edge of floor line
            const rightPoint = isometricRenderer.toIsometricWithOffset(x + width, y + height, z, building);
            
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
            const frontPoint = isometricRenderer.toIsometricWithOffset(x + width, y + height, z, building);
            // Back edge of floor line
            const backPoint = isometricRenderer.toIsometricWithOffset(x + width, y, z, building);
            
            const floorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            floorLine.setAttribute('x1', frontPoint.x);
            floorLine.setAttribute('y1', frontPoint.y);
            floorLine.setAttribute('x2', backPoint.x);
            floorLine.setAttribute('y2', backPoint.y);
            floorLine.setAttribute('stroke', 'rgba(0, 0, 0, 0.15)');
            floorLine.setAttribute('stroke-width', '0.5');
            
            floorLinesGroup.appendChild(floorLine);
        }
        
        isometricGroup.appendChild(floorLinesGroup);
    }
    
    /**
     * Add type-specific details for isometric view
     */
    static addIsometricTypeDetails(isometricGroup, building) {
        const { x, y, width, height, type, floors = 1 } = building;
        const floorHeight = isometricRenderer.floorHeight;
        
        const detailsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        detailsGroup.setAttribute('class', 'isometric-type-details');
        
        switch (type) {
            case 'residential':
                this.addIsometricResidentialDetails(detailsGroup, x, y, width, height, floors, building);
                break;
            case 'commercial':
                this.addIsometricCommercialDetails(detailsGroup, x, y, width, height, floors, building);
                break;
            case 'office':
                this.addIsometricOfficeDetails(detailsGroup, x, y, width, height, floors, building);
                break;
            case 'industrial':
                this.addIsometricIndustrialDetails(detailsGroup, x, y, width, height, floors, building);
                break;
        }
        
        isometricGroup.appendChild(detailsGroup);
    }
    
    /**
     * Add residential details (windows, doors) for isometric view
     */
    static addIsometricResidentialDetails(group, x, y, width, height, floors, building) {
        
        // Add windows on front face
        const windowWidth = 8;
        const windowHeight = 10;
        const windowSpacing = 15;
        const windowsPerFloor = Math.floor((width - 20) / windowSpacing);
        const totalWindows = windowsPerFloor * floors;
        
        // Ensure building has an ID for lighting state
        const buildingId = building.id || `building_${x}_${y}`;
        
        let windowIndex = 0;
        for (let floor = 0; floor < floors; floor++) {
            for (let i = 0; i < windowsPerFloor; i++) {
                const winX = x + 10 + i * windowSpacing;
                const winY = y + height;
                const winZ = floor * isometricRenderer.floorHeight + 4;
                
                const topLeft = isometricRenderer.toIsometricWithOffset(winX, winY, winZ, building);
                const topRight = isometricRenderer.toIsometricWithOffset(winX + windowWidth, winY, winZ, building);
                const bottomRight = isometricRenderer.toIsometricWithOffset(winX + windowWidth, winY, winZ + windowHeight, building);
                const bottomLeft = isometricRenderer.toIsometricWithOffset(winX, winY, winZ + windowHeight, building);
                
                const windowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                windowPath.setAttribute('d', `M ${topLeft.x} ${topLeft.y} L ${topRight.x} ${topRight.y} L ${bottomRight.x} ${bottomRight.y} L ${bottomLeft.x} ${bottomLeft.y} Z`);
                
                // Use lighting manager to determine if window is lit
                const isLit = windowLightingManager.isWindowLit(buildingId, windowIndex, totalWindows);
                windowPath.setAttribute('fill', isLit ? '#FFFFCC' : '#333333');
                windowPath.setAttribute('stroke', '#444444');
                windowPath.setAttribute('stroke-width', '0.5');
                windowPath.setAttribute('class', 'building-window isometric-window');
                windowPath.setAttribute('data-window-index', windowIndex);
                
                group.appendChild(windowPath);
                windowIndex++;
            }
        }
        
        // Add door on ground floor
        if (floors > 0) {
            const doorWidth = 10;
            const doorHeight = 15;
            const doorX = x + width / 2 - doorWidth / 2;
            const doorY = y + height;
            
            const doorTopLeft = isometricRenderer.toIsometricWithOffset(doorX, doorY, 0, building);
            const doorTopRight = isometricRenderer.toIsometricWithOffset(doorX + doorWidth, doorY, 0, building);
            const doorBottomRight = isometricRenderer.toIsometricWithOffset(doorX + doorWidth, doorY, doorHeight, building);
            const doorBottomLeft = isometricRenderer.toIsometricWithOffset(doorX, doorY, doorHeight, building);
            
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
    static addIsometricCommercialDetails(group, x, y, width, height, floors, building) {
        // Large glass storefront on ground floor
        const storefrontHeight = Math.min(20, isometricRenderer.floorHeight - 2);
        const glassWidth = width - 10;
        
        const glassX = x + 5;
        const glassY = y + height;
        
        const topLeft = isometricRenderer.toIsometricWithOffset(glassX, glassY, 2, building);
        const topRight = isometricRenderer.toIsometricWithOffset(glassX + glassWidth, glassY, 2, building);
        const bottomRight = isometricRenderer.toIsometricWithOffset(glassX + glassWidth, glassY, storefrontHeight, building);
        const bottomLeft = isometricRenderer.toIsometricWithOffset(glassX, glassY, storefrontHeight, building);
        
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
            const divTop = isometricRenderer.toIsometricWithOffset(divX, glassY, 2, building);
            const divBottom = isometricRenderer.toIsometricWithOffset(divX, glassY, storefrontHeight, building);
            
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
    static addIsometricOfficeDetails(group, x, y, width, height, floors, building) {
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
                    
                    const topLeft = isometricRenderer.toIsometricWithOffset(winX, winY, winZ, building);
                    const topRight = isometricRenderer.toIsometricWithOffset(winX + windowSize, winY, winZ, building);
                    const bottomRight = isometricRenderer.toIsometricWithOffset(winX + windowSize, winY, winZ + windowSize, building);
                    const bottomLeft = isometricRenderer.toIsometricWithOffset(winX, winY, winZ + windowSize, building);
                    
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
    static addIsometricIndustrialDetails(group, x, y, width, height, floors, building) {
        // Add loading dock on ground floor
        const dockWidth = Math.min(width * 0.4, 30);
        const dockHeight = 8;
        const dockDepth = 10;
        const dockX = x + width - dockWidth - 5;
        const dockY = y + height;
        
        // Loading dock platform
        const platformPoints = [
            isometricRenderer.toIsometricWithOffset(dockX, dockY, 0, building),
            isometricRenderer.toIsometricWithOffset(dockX + dockWidth, dockY, 0, building),
            isometricRenderer.toIsometricWithOffset(dockX + dockWidth, dockY + dockDepth, 0, building),
            isometricRenderer.toIsometricWithOffset(dockX + dockWidth, dockY + dockDepth, dockHeight, building),
            isometricRenderer.toIsometricWithOffset(dockX, dockY + dockDepth, dockHeight, building),
            isometricRenderer.toIsometricWithOffset(dockX, dockY, dockHeight, building)
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
            
            const topLeft = isometricRenderer.toIsometricWithOffset(winX, windowY, windowZ, building);
            const topRight = isometricRenderer.toIsometricWithOffset(winX + winSize, windowY, windowZ, building);
            const bottomRight = isometricRenderer.toIsometricWithOffset(winX + winSize, windowY, windowZ + winSize, building);
            const bottomLeft = isometricRenderer.toIsometricWithOffset(winX, windowY, windowZ + winSize, building);
            
            const windowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            windowPath.setAttribute('d', `M ${topLeft.x} ${topLeft.y} L ${topRight.x} ${topRight.y} L ${bottomRight.x} ${bottomRight.y} L ${bottomLeft.x} ${bottomLeft.y} Z`);
            windowPath.setAttribute('fill', '#666666');
            windowPath.setAttribute('stroke', '#333333');
            windowPath.setAttribute('stroke-width', '0.3');
            
            group.appendChild(windowPath);
        }
    }
}