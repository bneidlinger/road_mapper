import { BaseTool } from './BaseTool.js';
import { Building } from '../elements/Building.js';
import { BuildingGenerator } from '../BuildingGenerator.js';

export class BuildingTool extends BaseTool {
    constructor(toolManager) {
        super(toolManager);
        this.previewRect = null;
        this.startPoint = null;
        this.generator = new BuildingGenerator(this.toolManager.elementManager);
        this.isDrawing = false;
    }

    onMouseDown(event, worldPos) {
        console.log('BuildingTool.onMouseDown:', worldPos);
        this.startPoint = { ...worldPos };
        this.isDrawing = true;
        this.previewRect = null; // Reset preview rect on new draw
    }

    onMouseMove(event, worldPos) {
        if (this.startPoint) {
            // Show preview rectangle
            this.previewRect = {
                x: Math.min(this.startPoint.x, worldPos.x),
                y: Math.min(this.startPoint.y, worldPos.y),
                width: Math.abs(worldPos.x - this.startPoint.x),
                height: Math.abs(worldPos.y - this.startPoint.y)
            };
            console.log('BuildingTool preview rect:', this.previewRect);
            this.toolManager.emit('redraw');
        }
    }

    onMouseUp(event, worldPos) {
        console.log('BuildingTool.onMouseUp:', worldPos, 'previewRect:', this.previewRect);
        if (this.startPoint && this.previewRect && 
            this.previewRect.width > 10 && this.previewRect.height > 10) {
            
            // Option 1: Create a single building
            if (this.previewRect.width < 100 && this.previewRect.height < 100) {
                const buildingId = `building_${Date.now()}`;
                const building = new Building(
                    buildingId,
                    this.previewRect.x,
                    this.previewRect.y,
                    this.previewRect.width,
                    this.previewRect.height,
                    'commercial'
                );
                
                console.log('Creating single building:', building);
                this.toolManager.elementManager.addBuilding(building);
                
                // Force a render update
                this.toolManager.emit('elementsChanged');
            } else {
                // Option 2: Generate multiple buildings in the area
                console.log('Generating buildings in area:', this.previewRect);
                const count = this.generator.generateBuildingsInArea(
                    this.previewRect.x,
                    this.previewRect.y,
                    this.previewRect.width,
                    this.previewRect.height
                );
                console.log(`Generated ${count} buildings in selected area`);
                
                // Force a render update
                if (count > 0) {
                    this.toolManager.emit('elementsChanged');
                }
            }
        } else {
            console.log('BuildingTool: Rectangle too small or invalid (min 10x10)');
        }
        
        this.startPoint = null;
        this.previewRect = null;
        this.isDrawing = false;
        this.toolManager.emit('redraw');
    }

    onKeyDown(key) {
        if (key === 'g' || key === 'G') {
            // Generate buildings in all detected city blocks
            const count = this.generator.generateBuildings();
            console.log(`Generated ${count} buildings in city blocks`);
            return true;
        } else if (key === 'c' || key === 'C') {
            // Clear all buildings
            this.generator.clearBuildings();
            console.log('Cleared all buildings');
            return true;
        }
        return false;
    }

    renderSVG(svgManager) {
        if (this.previewRect) {
            // Draw preview rectangle directly in world coordinates
            // The SVG system will handle the transformation
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', this.previewRect.x);
            rect.setAttribute('y', this.previewRect.y);
            rect.setAttribute('width', this.previewRect.width);
            rect.setAttribute('height', this.previewRect.height);
            rect.setAttribute('fill', 'rgba(0, 255, 136, 0.2)');
            rect.setAttribute('stroke', '#00ff88');
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('stroke-dasharray', '5,5');
            rect.setAttribute('opacity', '0.8');
            
            svgManager.addToLayer('overlay', rect);
        }
    }

    getCursor() {
        return 'crosshair';
    }

    isUsingMouse() {
        return this.isDrawing;
    }

    cancelAction() {
        this.startPoint = null;
        this.previewRect = null;
        this.isDrawing = false;
        this.toolManager.emit('redraw');
    }
}