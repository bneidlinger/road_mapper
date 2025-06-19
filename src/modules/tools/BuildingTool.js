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
        this.hasDrawnPreview = false;
    }

    onMouseDown(event, worldPos) {
        console.log('BuildingTool.onMouseDown:', worldPos);
        // Only start drawing on left mouse button
        if (event.button === 0) {
            this.isDrawing = true;
            this.startPoint = { ...worldPos };
            this.previewRect = null; // Reset preview rect on new draw
            this.hasDrawnPreview = false; // Track if we've actually drawn a preview
        }
    }

    onMouseMove(event, worldPos) {
        // Only show preview if mouse button is still held down (button 0 = left mouse)
        if (this.isDrawing && this.startPoint && event.buttons === 1) {
            // Show preview rectangle
            this.previewRect = {
                x: Math.min(this.startPoint.x, worldPos.x),
                y: Math.min(this.startPoint.y, worldPos.y),
                width: Math.abs(worldPos.x - this.startPoint.x),
                height: Math.abs(worldPos.y - this.startPoint.y)
            };
            this.hasDrawnPreview = true;
            console.log('BuildingTool preview rect:', this.previewRect);
            this.toolManager.emit('redraw');
        } else if (this.isDrawing && event.buttons === 0) {
            // Mouse button was released outside of normal flow, cancel drawing
            console.log('BuildingTool: Mouse released during move, canceling');
            this.cancelAction();
        }
    }

    onMouseUp(event, worldPos) {
        console.log('BuildingTool.onMouseUp:', worldPos, 'isDrawing:', this.isDrawing, 'previewRect:', this.previewRect, 'hasDrawnPreview:', this.hasDrawnPreview);
        
        // Only process if we were actually drawing, had a preview, and it's the left mouse button
        if (event.button === 0 && this.isDrawing && this.hasDrawnPreview && 
            this.startPoint && this.previewRect && 
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
        } else if (this.isDrawing && this.hasDrawnPreview) {
            console.log('BuildingTool: Rectangle too small or invalid (min 10x10)');
        }
        
        // Always reset state
        this.startPoint = null;
        this.previewRect = null;
        this.isDrawing = false;
        this.hasDrawnPreview = false;
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
        this.hasDrawnPreview = false;
        this.toolManager.emit('redraw');
    }
}