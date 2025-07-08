import { BaseTool } from './BaseTool.js';
import { Building } from '../elements/Building.js';
import { BuildingGenerator } from '../BuildingGenerator.js';
import { DEBUG } from '../../core/constants.js';

export class BuildingTool extends BaseTool {
    constructor(toolManager) {
        super(toolManager);
        this.previewRect = null;
        this.startPoint = null;
        this.generator = new BuildingGenerator(this.toolManager.elementManager);
        this.isDrawing = false;
        this.hasDrawnPreview = false;
        this.mouseIsDown = false; // Track mouse state internally
        
        // Bind window mouse up handler
        this.handleWindowMouseUp = this.handleWindowMouseUp.bind(this);
    }

    onMouseDown(event, worldPos) {
        if (DEBUG) console.log('BuildingTool.onMouseDown:', {
            button: event.button,
            worldPos: worldPos,
            isDrawing: this.isDrawing
        });
        // Only start drawing on left mouse button
        if (event.button === 0) {
            this.mouseIsDown = true; // Track mouse state
            this.isDrawing = true;
            this.startPoint = { ...worldPos };
            this.previewRect = null; // Reset preview rect on new draw
            this.hasDrawnPreview = false; // Track if we've actually drawn a preview
            if (DEBUG) console.log('BuildingTool: Started drawing at', this.startPoint);
        }
    }

    onMouseMove(event, worldPos) {
        // Check for mouse button state issues (keeping for debugging)
        
        // Only show preview if we're drawing
        if (this.isDrawing && this.startPoint && this.mouseIsDown) {
            // Update preview rectangle
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
                if (DEBUG) console.log('BuildingTool: Preview size:', {
                    width: Math.round(width),
                    height: Math.round(height)
                });
                this.lastLoggedWidth = width;
                this.lastLoggedHeight = height;
            }
            
            this.hasDrawnPreview = true;
            this.toolManager.emit('redraw');
        }
    }

    onMouseUp(event, worldPos) {
        if (DEBUG) console.log('BuildingTool.onMouseUp - State check:');
        if (DEBUG) console.log('  - event.button:', event.button);
        if (DEBUG) console.log('  - mouseIsDown:', this.mouseIsDown);
        if (DEBUG) console.log('  - isDrawing:', this.isDrawing);
        if (DEBUG) console.log('  - hasDrawnPreview:', this.hasDrawnPreview);
        if (DEBUG) console.log('  - startPoint:', this.startPoint);
        if (DEBUG) console.log('  - previewRect:', this.previewRect);
        if (this.previewRect) {
            if (DEBUG) console.log('  - preview dimensions:', this.previewRect.width, 'x', this.previewRect.height);
            if (DEBUG) console.log('  - size check (>10):', this.previewRect.width > 10 && this.previewRect.height > 10);
        }
        
        // Prevent double processing
        if (!this.mouseIsDown || !this.isDrawing) {
            if (DEBUG) console.log('BuildingTool.onMouseUp - Already processed, skipping');
            return;
        }
        
        // Only process if we were actually drawing, had a preview, and it's the left mouse button
        if (event.button === 0 && this.mouseIsDown && this.isDrawing && this.hasDrawnPreview && 
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
                
                if (DEBUG) console.log('Creating single building:', building);
                this.toolManager.elementManager.addBuilding(building);
                if (DEBUG) console.log('Building added to ElementManager');
                
                // Force a render update
                this.toolManager.emit('redraw');
                if (DEBUG) console.log('redraw event emitted');
            } else {
                // Option 2: Generate multiple buildings in the area
                if (DEBUG) console.log('Generating buildings in area:', this.previewRect);
                const count = this.generator.generateBuildingsInArea(
                    this.previewRect.x,
                    this.previewRect.y,
                    this.previewRect.width,
                    this.previewRect.height
                );
                if (DEBUG) console.log(`Generated ${count} buildings in selected area`);
                
                // Force a render update
                if (count > 0) {
                    this.toolManager.emit('redraw');
                    if (DEBUG) console.log('redraw event emitted for multiple buildings');
                } else {
                    if (DEBUG) console.log('No buildings were generated - check placement constraints');
                }
            }
        } else if (this.isDrawing && this.hasDrawnPreview) {
            // Rectangle too small or invalid (min 10x10)
        }
        
        // Always reset state
        this.mouseIsDown = false; // Reset mouse state
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
        this.mouseIsDown = false; // Reset mouse state
        this.startPoint = null;
        this.previewRect = null;
        this.isDrawing = false;
        this.hasDrawnPreview = false;
        this.toolManager.emit('redraw');
    }
    
    activate() {
        super.activate();
        // Reset state on activation to ensure clean start
        this.mouseIsDown = false;
        this.isDrawing = false;
        this.startPoint = null;
        this.previewRect = null;
        this.hasDrawnPreview = false;
        // Add global mouse up listener to catch events that might be missed
        window.addEventListener('mouseup', this.handleWindowMouseUp);
        if (DEBUG) console.log('BuildingTool activated - state reset');
    }
    
    deactivate() {
        super.deactivate();
        // Remove global listener
        window.removeEventListener('mouseup', this.handleWindowMouseUp);
        // Clean up any in-progress drawing
        this.cancelAction();
        // Window mouseup listener removed
    }
    
    handleWindowMouseUp(event) {
        if (DEBUG) console.log('Window mouseup detected in BuildingTool - isDrawing:', this.isDrawing, 'mouseIsDown:', this.mouseIsDown);
        // Only handle if we haven't already processed this mouse up
        if (this.isDrawing && this.mouseIsDown && event.button === 0) {
            if (DEBUG) console.log('Processing window mouseup as backup');
            // Convert to world position
            const worldPos = this.toolManager.getWorldPosition(event);
            this.onMouseUp(event, worldPos);
        }
    }
}