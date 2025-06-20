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
        console.log('BuildingTool.onMouseDown:', {
            button: event.button,
            worldPos: worldPos,
            isDrawing: this.isDrawing
        });
        // Only start drawing on left mouse button
        if (event.button === 0) {
            this.isDrawing = true;
            this.startPoint = { ...worldPos };
            this.previewRect = null; // Reset preview rect on new draw
            this.hasDrawnPreview = false; // Track if we've actually drawn a preview
            console.log('BuildingTool: Started drawing at', this.startPoint);
        }
    }

    onMouseMove(event, worldPos) {
        // Reduced logging - only log important state changes
        
        // Only show preview if mouse button is still held down (button 0 = left mouse)
        if (this.isDrawing && this.startPoint) {
            // Check button state
            if (event.buttons !== 1) {
                console.log('BuildingTool: Mouse button not pressed, buttons:', event.buttons);
            }
            
            // Show preview rectangle regardless of button state for debugging
            const width = Math.abs(worldPos.x - this.startPoint.x);
            const height = Math.abs(worldPos.y - this.startPoint.y);
            
            this.previewRect = {
                x: Math.min(this.startPoint.x, worldPos.x),
                y: Math.min(this.startPoint.y, worldPos.y),
                width: width,
                height: height
            };
            
            // Only log significant changes
            if (!this.lastLoggedWidth || Math.abs(width - this.lastLoggedWidth) > 10 || 
                !this.lastLoggedHeight || Math.abs(height - this.lastLoggedHeight) > 10) {
                console.log('BuildingTool: Preview size:', {
                    width: Math.round(width),
                    height: Math.round(height)
                });
                this.lastLoggedWidth = width;
                this.lastLoggedHeight = height;
            }
            
            this.hasDrawnPreview = true;
            this.toolManager.emit('redraw');
        }
        
        if (this.isDrawing && event.buttons === 0) {
            // Mouse button was released outside of normal flow, cancel drawing
            console.log('BuildingTool: Mouse released during move, canceling');
            this.cancelAction();
        }
    }

    onMouseUp(event, worldPos) {
        console.log('BuildingTool.onMouseUp called:', {
            button: event.button,
            isDrawing: this.isDrawing,
            hasDrawnPreview: this.hasDrawnPreview,
            startPoint: this.startPoint,
            previewRect: this.previewRect,
            width: this.previewRect?.width,
            height: this.previewRect?.height,
            sizeCheck: this.previewRect ? `${this.previewRect.width} > 10 && ${this.previewRect.height} > 10 = ${this.previewRect.width > 10 && this.previewRect.height > 10}` : 'N/A'
        });
        
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
                console.log('Building added to ElementManager');
                
                // Force a render update
                this.toolManager.emit('redraw');
                console.log('redraw event emitted');
            } else {
                // Option 2: Generate multiple buildings in the area
                // Generating buildings in area
                const count = this.generator.generateBuildingsInArea(
                    this.previewRect.x,
                    this.previewRect.y,
                    this.previewRect.width,
                    this.previewRect.height
                );
                // Generated buildings in selected area
                
                // Force a render update
                if (count > 0) {
                    this.toolManager.emit('redraw');
                    console.log('redraw event emitted for multiple buildings');
                }
            }
        } else if (this.isDrawing && this.hasDrawnPreview) {
            // Rectangle too small or invalid (min 10x10)
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
            // Generated buildings in city blocks
            return true;
        } else if (key === 'c' || key === 'C') {
            // Clear all buildings
            this.generator.clearBuildings();
            // Cleared all buildings
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