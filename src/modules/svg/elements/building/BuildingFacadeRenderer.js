// BuildingFacadeRenderer - Renders detailed building facades

/**
 * BuildingFacadeRenderer - Renders detailed building facades with realistic features
 */
export class BuildingFacadeRenderer {
    /**
     * Render facade based on building style and features
     */
    static renderFacade(detailsGroup, building) {
        const { style, facadeFeatures = [] } = building;
        
        // Render based on architectural style
        switch (style) {
            // Residential styles
            case 'single-family':
            case 'victorian':
                this.renderVictorianFacade(detailsGroup, building);
                break;
            case 'townhouse':
            case 'colonial':
                this.renderColonialFacade(detailsGroup, building);
                break;
            case 'modern':
                this.renderModernFacade(detailsGroup, building);
                break;
            case 'craftsman':
                this.renderCraftsmanFacade(detailsGroup, building);
                break;
            
            // Commercial styles
            case 'retail':
            case 'restaurant':
            case 'grocery':
            case 'bank':
            case 'boutique':
                this.renderRetailFacade(detailsGroup, building);
                break;
            
            // Office styles
            case 'corporate':
            case 'professional':
            case 'medical':
            case 'tech':
            case 'office':
            case 'tower':
                this.renderOfficeFacade(detailsGroup, building);
                break;
            
            // Residential multi-family
            case 'apartment':
            case 'apartment-complex':
            case 'condo':
                this.renderApartmentFacade(detailsGroup, building);
                break;
            
            // Industrial styles
            case 'warehouse':
            case 'factory':
            case 'distribution':
            case 'storage':
                this.renderIndustrialFacade(detailsGroup, building);
                break;
            
            // Hotel style (commercial)
            case 'hotel':
                this.renderModernFacade(detailsGroup, building);
                break;
                
            default:
                this.renderGenericFacade(detailsGroup, building);
        }
        
        // Add specific features
        facadeFeatures.forEach(feature => {
            this.addFacadeFeature(detailsGroup, building, feature);
        });
    }
    
    /**
     * Render Victorian style facade
     */
    static renderVictorianFacade(group, building) {
        const { x, y, width, height } = building;
        
        // Ornate trim at roofline
        const trimPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const trimY = y + 5;
        trimPath.setAttribute('d', `
            M ${x} ${trimY}
            Q ${x + width * 0.25} ${trimY - 3} ${x + width * 0.5} ${trimY}
            Q ${x + width * 0.75} ${trimY - 3} ${x + width} ${trimY}
        `);
        trimPath.setAttribute('stroke', '#8B7355');
        trimPath.setAttribute('stroke-width', '1');
        trimPath.setAttribute('fill', 'none');
        group.appendChild(trimPath);
        
        // Victorian windows with decorative tops
        const windowRows = Math.floor(height / 25);
        const windowCols = Math.floor(width / 20);
        
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const winX = x + 10 + col * 20;
                const winY = y + 15 + row * 25;
                
                // Window with arched top
                const window = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                window.setAttribute('d', `
                    M ${winX} ${winY + 8}
                    L ${winX} ${winY}
                    A 4 4 0 0 1 ${winX + 8} ${winY}
                    L ${winX + 8} ${winY + 8}
                    Z
                `);
                window.setAttribute('fill', '#4A5A6A');
                window.setAttribute('stroke', '#2A3A4A');
                window.setAttribute('stroke-width', '0.5');
                group.appendChild(window);
                
                // Window panes
                const pane1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                pane1.setAttribute('x1', winX + 4);
                pane1.setAttribute('y1', winY);
                pane1.setAttribute('x2', winX + 4);
                pane1.setAttribute('y2', winY + 8);
                pane1.setAttribute('stroke', '#2A3A4A');
                pane1.setAttribute('stroke-width', '0.3');
                group.appendChild(pane1);
            }
        }
    }
    
    /**
     * Render modern style facade
     */
    static renderModernFacade(group, building) {
        const { x, y, width, height, floors = 1 } = building;
        
        // Large horizontal windows
        const floorHeight = height / floors;
        
        for (let floor = 0; floor < floors; floor++) {
            const floorY = y + floor * floorHeight;
            
            // Continuous window band
            const windowBand = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            windowBand.setAttribute('x', x + 5);
            windowBand.setAttribute('y', floorY + floorHeight * 0.3);
            windowBand.setAttribute('width', width - 10);
            windowBand.setAttribute('height', floorHeight * 0.5);
            windowBand.setAttribute('fill', 'rgba(100, 150, 200, 0.3)');
            windowBand.setAttribute('stroke', '#607080');
            windowBand.setAttribute('stroke-width', '1');
            group.appendChild(windowBand);
            
            // Vertical mullions
            const numMullions = Math.floor(width / 30);
            for (let i = 1; i < numMullions; i++) {
                const mullionX = x + 5 + (width - 10) * (i / numMullions);
                const mullion = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                mullion.setAttribute('x1', mullionX);
                mullion.setAttribute('y1', floorY + floorHeight * 0.3);
                mullion.setAttribute('x2', mullionX);
                mullion.setAttribute('y2', floorY + floorHeight * 0.8);
                mullion.setAttribute('stroke', '#607080');
                mullion.setAttribute('stroke-width', '0.5');
                group.appendChild(mullion);
            }
        }
        
        // Balconies for residential
        if (building.type === 'residential' && floors > 1) {
            for (let floor = 1; floor < floors; floor++) {
                const balconyY = y + floor * floorHeight - 2;
                const balcony = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                balcony.setAttribute('x', x + width * 0.2);
                balcony.setAttribute('y', balconyY);
                balcony.setAttribute('width', width * 0.6);
                balcony.setAttribute('height', 4);
                balcony.setAttribute('fill', '#808080');
                balcony.setAttribute('stroke', '#606060');
                balcony.setAttribute('stroke-width', '0.5');
                group.appendChild(balcony);
            }
        }
    }
    
    /**
     * Render office/corporate facade
     */
    static renderOfficeFacade(group, building) {
        const { x, y, width, height, floors = 5 } = building;
        
        // Glass curtain wall effect
        const floorHeight = height / floors;
        
        for (let floor = 0; floor < floors; floor++) {
            const floorY = y + floor * floorHeight;
            
            // Floor spandrel
            const spandrel = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            spandrel.setAttribute('x', x);
            spandrel.setAttribute('y', floorY);
            spandrel.setAttribute('width', width);
            spandrel.setAttribute('height', floorHeight * 0.2);
            spandrel.setAttribute('fill', '#506070');
            spandrel.setAttribute('opacity', '0.8');
            group.appendChild(spandrel);
            
            // Window grid
            const windowY = floorY + floorHeight * 0.2;
            const windowHeight = floorHeight * 0.8;
            const gridCols = Math.floor(width / 8);
            
            for (let col = 0; col < gridCols; col++) {
                const winX = x + col * (width / gridCols);
                const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                window.setAttribute('x', winX + 0.5);
                window.setAttribute('y', windowY);
                window.setAttribute('width', (width / gridCols) - 1);
                window.setAttribute('height', windowHeight - 1);
                window.setAttribute('fill', 'rgba(150, 180, 210, 0.4)');
                window.setAttribute('stroke', '#708090');
                window.setAttribute('stroke-width', '0.5');
                
                // Add reflection effect
                const reflection = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                reflection.setAttribute('x', winX + 0.5);
                reflection.setAttribute('y', windowY);
                reflection.setAttribute('width', ((width / gridCols) - 1) * 0.3);
                reflection.setAttribute('height', windowHeight - 1);
                reflection.setAttribute('fill', 'rgba(255, 255, 255, 0.1)');
                
                group.appendChild(window);
                group.appendChild(reflection);
            }
        }
    }
    
    /**
     * Render retail storefront facade
     */
    static renderRetailFacade(group, building) {
        const { x, y, width, height } = building;
        
        // Storefront windows
        const storefrontHeight = Math.min(height * 0.4, 25);
        const storefront = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        storefront.setAttribute('x', x + 3);
        storefront.setAttribute('y', y + height - storefrontHeight - 3);
        storefront.setAttribute('width', width - 6);
        storefront.setAttribute('height', storefrontHeight);
        storefront.setAttribute('fill', 'rgba(180, 200, 220, 0.5)');
        storefront.setAttribute('stroke', '#404040');
        storefront.setAttribute('stroke-width', '1.5');
        group.appendChild(storefront);
        
        // Door
        const doorWidth = Math.min(width * 0.2, 12);
        const door = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        door.setAttribute('x', x + width / 2 - doorWidth / 2);
        door.setAttribute('y', y + height - storefrontHeight);
        door.setAttribute('width', doorWidth);
        door.setAttribute('height', storefrontHeight);
        door.setAttribute('fill', '#654321');
        door.setAttribute('stroke', '#404040');
        door.setAttribute('stroke-width', '1');
        group.appendChild(door);
        
        // Awning
        const awning = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const awningY = y + height - storefrontHeight - 5;
        awning.setAttribute('d', `
            M ${x} ${awningY}
            L ${x + width} ${awningY}
            L ${x + width - 5} ${awningY + 8}
            L ${x + 5} ${awningY + 8}
            Z
        `);
        awning.setAttribute('fill', '#8B4513');
        awning.setAttribute('stroke', '#654321');
        awning.setAttribute('stroke-width', '0.5');
        awning.setAttribute('opacity', '0.9');
        group.appendChild(awning);
        
        // Signage area
        const signArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        signArea.setAttribute('x', x + width * 0.1);
        signArea.setAttribute('y', y + height * 0.3);
        signArea.setAttribute('width', width * 0.8);
        signArea.setAttribute('height', height * 0.15);
        signArea.setAttribute('fill', '#F0F0F0');
        signArea.setAttribute('stroke', '#808080');
        signArea.setAttribute('stroke-width', '0.5');
        signArea.setAttribute('opacity', '0.3');
        group.appendChild(signArea);
    }
    
    /**
     * Add specific facade features
     */
    static addFacadeFeature(group, building, feature) {
        
        switch (feature) {
            case 'bay-windows':
                this.addBayWindows(group, building);
                break;
            case 'balconies':
                this.addBalconies(group, building);
                break;
            case 'columns':
                this.addColumns(group, building);
                break;
            case 'loading-docks':
                this.addLoadingDocks(group, building);
                break;
            case 'skylights':
                this.addSkylights(group, building);
                break;
        }
    }
    
    /**
     * Add bay windows
     */
    static addBayWindows(group, building) {
        const { x, y, width, height, floors = 2 } = building;
        const bayWidth = Math.min(width * 0.3, 20);
        const bayDepth = 3;
        
        for (let floor = 0; floor < floors - 1; floor++) {
            const bayY = y + (floor + 0.3) * (height / floors);
            const bayX = x + width / 2 - bayWidth / 2;
            
            // Bay window projection
            const bay = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bay.setAttribute('d', `
                M ${bayX} ${bayY}
                L ${bayX - bayDepth} ${bayY + 5}
                L ${bayX - bayDepth} ${bayY + 15}
                L ${bayX} ${bayY + 20}
                L ${bayX + bayWidth} ${bayY + 20}
                L ${bayX + bayWidth + bayDepth} ${bayY + 15}
                L ${bayX + bayWidth + bayDepth} ${bayY + 5}
                L ${bayX + bayWidth} ${bayY}
                Z
            `);
            bay.setAttribute('fill', building.customColor || building.color);
            bay.setAttribute('stroke', '#404040');
            bay.setAttribute('stroke-width', '0.5');
            bay.setAttribute('opacity', '0.9');
            group.appendChild(bay);
        }
    }
    
    /**
     * Add columns
     */
    static addColumns(group, building) {
        const { x, y, width, height } = building;
        const numColumns = Math.floor(width / 15);
        const columnWidth = 3;
        
        for (let i = 0; i <= numColumns; i++) {
            const colX = x + (width / numColumns) * i - columnWidth / 2;
            const column = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            column.setAttribute('x', colX);
            column.setAttribute('y', y + height * 0.7);
            column.setAttribute('width', columnWidth);
            column.setAttribute('height', height * 0.3);
            column.setAttribute('fill', '#D0D0D0');
            column.setAttribute('stroke', '#A0A0A0');
            column.setAttribute('stroke-width', '0.5');
            group.appendChild(column);
            
            // Column capital
            const capital = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            capital.setAttribute('x', colX - 1);
            capital.setAttribute('y', y + height * 0.7 - 2);
            capital.setAttribute('width', columnWidth + 2);
            capital.setAttribute('height', 3);
            capital.setAttribute('fill', '#C0C0C0');
            group.appendChild(capital);
        }
    }
    
    /**
     * Render Craftsman style facade
     */
    static renderCraftsmanFacade(group, building) {
        const { x, y, width, height } = building;
        
        // Exposed beams
        const beamY = y + height * 0.2;
        const beam = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        beam.setAttribute('x', x);
        beam.setAttribute('y', beamY);
        beam.setAttribute('width', width);
        beam.setAttribute('height', 4);
        beam.setAttribute('fill', '#8B6F47');
        beam.setAttribute('opacity', '0.8');
        group.appendChild(beam);
        
        // Wide windows with grids
        const winWidth = width * 0.3;
        const winHeight = height * 0.25;
        const winX = x + width * 0.35;
        const winY = y + height * 0.4;
        
        // Window frame
        const frame = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        frame.setAttribute('x', winX);
        frame.setAttribute('y', winY);
        frame.setAttribute('width', winWidth);
        frame.setAttribute('height', winHeight);
        frame.setAttribute('fill', 'none');
        frame.setAttribute('stroke', '#654321');
        frame.setAttribute('stroke-width', '2');
        group.appendChild(frame);
        
        // Window panes
        const paneGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        paneGroup.setAttribute('class', 'building-window');
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                const pane = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                pane.setAttribute('x', winX + 2 + i * (winWidth / 3));
                pane.setAttribute('y', winY + 2 + j * (winHeight / 2));
                pane.setAttribute('width', winWidth / 3 - 2);
                pane.setAttribute('height', winHeight / 2 - 2);
                pane.setAttribute('fill', 'rgba(100, 120, 140, 0.6)');
                paneGroup.appendChild(pane);
            }
        }
        group.appendChild(paneGroup);
    }
    
    /**
     * Render Colonial style facade
     */
    static renderColonialFacade(group, building) {
        const { x, y, width, height } = building;
        
        // Symmetrical window layout
        const windowSize = Math.min(width * 0.15, 12);
        const spacing = windowSize * 1.5;
        const numWindows = Math.floor(width / spacing);
        const startX = x + (width - (numWindows * spacing)) / 2;
        
        // Multiple floors of windows
        const floors = Math.floor(height / 25);
        for (let floor = 0; floor < floors; floor++) {
            const floorY = y + 10 + floor * 25;
            
            for (let i = 0; i < numWindows; i++) {
                const winX = startX + i * spacing;
                
                // Window with shutters
                const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                window.setAttribute('x', winX);
                window.setAttribute('y', floorY);
                window.setAttribute('width', windowSize);
                window.setAttribute('height', windowSize * 1.2);
                window.setAttribute('fill', 'rgba(100, 120, 140, 0.6)');
                window.setAttribute('stroke', '#404040');
                window.setAttribute('class', 'building-window');
                group.appendChild(window);
                
                // Shutters
                if (Math.random() > 0.3) {
                    // Left shutter
                    const shutterL = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    shutterL.setAttribute('x', winX - windowSize * 0.3);
                    shutterL.setAttribute('y', floorY);
                    shutterL.setAttribute('width', windowSize * 0.25);
                    shutterL.setAttribute('height', windowSize * 1.2);
                    shutterL.setAttribute('fill', '#2F4F2F');
                    shutterL.setAttribute('opacity', '0.8');
                    group.appendChild(shutterL);
                    
                    // Right shutter
                    const shutterR = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    shutterR.setAttribute('x', winX + windowSize + windowSize * 0.05);
                    shutterR.setAttribute('y', floorY);
                    shutterR.setAttribute('width', windowSize * 0.25);
                    shutterR.setAttribute('height', windowSize * 1.2);
                    shutterR.setAttribute('fill', '#2F4F2F');
                    shutterR.setAttribute('opacity', '0.8');
                    group.appendChild(shutterR);
                }
            }
        }
    }
    
    /**
     * Render Modern style facade
     */
    static renderModernFacade(group, building) {
        const { x, y, width, height } = building;
        
        // Large glass panels
        const panelWidth = width * 0.9;
        const panelHeight = height * 0.8;
        const panelX = x + width * 0.05;
        const panelY = y + height * 0.1;
        
        // Glass curtain wall
        const glass = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        glass.setAttribute('x', panelX);
        glass.setAttribute('y', panelY);
        glass.setAttribute('width', panelWidth);
        glass.setAttribute('height', panelHeight);
        glass.setAttribute('fill', 'rgba(150, 180, 200, 0.4)');
        glass.setAttribute('stroke', '#606060');
        glass.setAttribute('stroke-width', '1');
        group.appendChild(glass);
        
        // Horizontal divisions
        const divisions = 4;
        for (let i = 1; i < divisions; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', panelX);
            line.setAttribute('y1', panelY + (panelHeight / divisions) * i);
            line.setAttribute('x2', panelX + panelWidth);
            line.setAttribute('y2', panelY + (panelHeight / divisions) * i);
            line.setAttribute('stroke', '#808080');
            line.setAttribute('stroke-width', '0.5');
            group.appendChild(line);
        }
    }
    
    /**
     * Render Office/Corporate facade
     */
    static renderOfficeFacade(group, building) {
        const { x, y, width, height } = building;
        
        // Grid of office windows
        const windowWidth = 8;
        const windowHeight = 10;
        const hSpacing = 12;
        const vSpacing = 15;
        
        const cols = Math.floor((width - 10) / hSpacing);
        const rows = Math.floor((height - 10) / vSpacing);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const winX = x + 5 + col * hSpacing;
                const winY = y + 5 + row * vSpacing;
                
                const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                window.setAttribute('x', winX);
                window.setAttribute('y', winY);
                window.setAttribute('width', windowWidth);
                window.setAttribute('height', windowHeight);
                window.setAttribute('fill', 'rgba(120, 140, 160, 0.6)');
                window.setAttribute('stroke', '#505050');
                window.setAttribute('stroke-width', '0.5');
                window.setAttribute('class', 'building-window');
                group.appendChild(window);
            }
        }
    }
    
    /**
     * Render Apartment/Condo facade
     */
    static renderApartmentFacade(group, building) {
        const { x, y, width, height } = building;
        
        // Balconies and windows
        const unitWidth = width / Math.max(2, Math.floor(width / 30));
        const floorHeight = 20;
        const floors = Math.floor(height / floorHeight);
        
        for (let floor = 0; floor < floors; floor++) {
            const floorY = y + floor * floorHeight;
            const units = Math.floor(width / unitWidth);
            
            for (let unit = 0; unit < units; unit++) {
                const unitX = x + unit * unitWidth;
                
                // Window
                const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                window.setAttribute('x', unitX + unitWidth * 0.2);
                window.setAttribute('y', floorY + 5);
                window.setAttribute('width', unitWidth * 0.6);
                window.setAttribute('height', 10);
                window.setAttribute('fill', 'rgba(100, 120, 140, 0.6)');
                window.setAttribute('stroke', '#404040');
                window.setAttribute('class', 'building-window');
                group.appendChild(window);
                
                // Balcony rail (every other floor)
                if (floor % 2 === 0 && floor > 0) {
                    const rail = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    rail.setAttribute('x1', unitX);
                    rail.setAttribute('y1', floorY + 16);
                    rail.setAttribute('x2', unitX + unitWidth);
                    rail.setAttribute('y2', floorY + 16);
                    rail.setAttribute('stroke', '#606060');
                    rail.setAttribute('stroke-width', '1');
                    group.appendChild(rail);
                }
            }
        }
    }
    
    /**
     * Render Industrial/Warehouse facade
     */
    static renderIndustrialFacade(group, building) {
        const { x, y, width, height } = building;
        
        // Large industrial windows
        const windowBankWidth = width * 0.8;
        const windowBankHeight = height * 0.3;
        const windowBankX = x + width * 0.1;
        const windowBankY = y + height * 0.2;
        
        // Window bank frame
        const frame = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        frame.setAttribute('x', windowBankX);
        frame.setAttribute('y', windowBankY);
        frame.setAttribute('width', windowBankWidth);
        frame.setAttribute('height', windowBankHeight);
        frame.setAttribute('fill', 'none');
        frame.setAttribute('stroke', '#404040');
        frame.setAttribute('stroke-width', '2');
        group.appendChild(frame);
        
        // Individual panes
        const panes = 6;
        const paneWidth = windowBankWidth / panes;
        for (let i = 0; i < panes; i++) {
            const pane = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            pane.setAttribute('x', windowBankX + i * paneWidth + 1);
            pane.setAttribute('y', windowBankY + 1);
            pane.setAttribute('width', paneWidth - 2);
            pane.setAttribute('height', windowBankHeight - 2);
            pane.setAttribute('fill', 'rgba(80, 90, 100, 0.5)');
            pane.setAttribute('stroke', '#303030');
            pane.setAttribute('stroke-width', '0.5');
            group.appendChild(pane);
        }
        
        // Loading dock door
        if (width > 40 && height > 30) {
            const doorWidth = Math.min(width * 0.3, 20);
            const doorHeight = height * 0.4;
            const doorX = x + width * 0.7;
            const doorY = y + height * 0.6;
            
            const door = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            door.setAttribute('x', doorX);
            door.setAttribute('y', doorY);
            door.setAttribute('width', doorWidth);
            door.setAttribute('height', doorHeight);
            door.setAttribute('fill', '#505050');
            door.setAttribute('stroke', '#303030');
            door.setAttribute('stroke-width', '1');
            group.appendChild(door);
            
            // Door segments
            const segments = 4;
            for (let i = 1; i < segments; i++) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', doorX);
                line.setAttribute('y1', doorY + (doorHeight / segments) * i);
                line.setAttribute('x2', doorX + doorWidth);
                line.setAttribute('y2', doorY + (doorHeight / segments) * i);
                line.setAttribute('stroke', '#303030');
                line.setAttribute('stroke-width', '0.5');
                group.appendChild(line);
            }
        }
    }
    
    /**
     * Add loading docks feature
     */
    static addLoadingDocks(group, building) {
        const { x, y, width, height } = building;
        
        // Add loading platform
        const platformY = y + height * 0.8;
        const platform = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        platform.setAttribute('x', x);
        platform.setAttribute('y', platformY);
        platform.setAttribute('width', width);
        platform.setAttribute('height', height * 0.2);
        platform.setAttribute('fill', '#606060');
        platform.setAttribute('stroke', '#404040');
        platform.setAttribute('stroke-width', '1');
        platform.setAttribute('opacity', '0.8');
        group.appendChild(platform);
    }
    
    /**
     * Add skylights feature
     */
    static addSkylights(group, building) {
        // Skylights would be visible in top-down view, not facade
        // This is a placeholder for future implementation
    }
    
    /**
     * Add bay windows feature
     */
    static addBayWindows(group, building) {
        const { x, y, width, height } = building;
        
        // Add protruding bay window effect
        const bayWidth = Math.min(width * 0.3, 20);
        const bayHeight = height * 0.4;
        const bayX = x + (width - bayWidth) / 2;
        const bayY = y + height * 0.3;
        
        // Bay window shadow
        const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shadow.setAttribute('x', bayX + 2);
        shadow.setAttribute('y', bayY + 2);
        shadow.setAttribute('width', bayWidth);
        shadow.setAttribute('height', bayHeight);
        shadow.setAttribute('fill', 'rgba(0, 0, 0, 0.2)');
        group.appendChild(shadow);
        
        // Bay window
        const bay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bay.setAttribute('x', bayX);
        bay.setAttribute('y', bayY);
        bay.setAttribute('width', bayWidth);
        bay.setAttribute('height', bayHeight);
        bay.setAttribute('fill', building.color || '#888888');
        bay.setAttribute('stroke', '#606060');
        bay.setAttribute('stroke-width', '1');
        group.appendChild(bay);
    }
    
    /**
     * Add balconies feature
     */
    static addBalconies(group, building) {
        const { x, y, width, height } = building;
        
        // Add balcony railings
        const floors = Math.floor(height / 20);
        for (let i = 1; i < floors; i++) {
            const balconyY = y + i * 20;
            const balcony = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            balcony.setAttribute('x1', x + width * 0.1);
            balcony.setAttribute('y1', balconyY);
            balcony.setAttribute('x2', x + width * 0.9);
            balcony.setAttribute('y2', balconyY);
            balcony.setAttribute('stroke', '#606060');
            balcony.setAttribute('stroke-width', '2');
            balcony.setAttribute('opacity', '0.8');
            group.appendChild(balcony);
        }
    }
    
    /**
     * Render generic facade as fallback
     */
    static renderGenericFacade(group, building) {
        // Basic window grid
        const { x, y, width, height } = building;
        const windowRows = Math.floor(height / 20);
        const windowCols = Math.floor(width / 15);
        
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const winX = x + 7.5 + col * 15;
                const winY = y + 10 + row * 20;
                
                const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                window.setAttribute('x', winX);
                window.setAttribute('y', winY);
                window.setAttribute('width', 8);
                window.setAttribute('height', 10);
                window.setAttribute('fill', 'rgba(100, 120, 140, 0.5)');
                window.setAttribute('stroke', '#404040');
                window.setAttribute('stroke-width', '0.5');
                window.setAttribute('class', 'building-window');
                group.appendChild(window);
            }
        }
    }
}