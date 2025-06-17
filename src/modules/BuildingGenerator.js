import { Building } from './elements/Building.js';
import { BUILDING_TYPES } from '../core/constants.js';
import { CityBlockDetector } from './CityBlockDetector.js';

export class BuildingGenerator {
    constructor(elementManager) {
        this.elementManager = elementManager;
        this.minBuildingSize = 20;
        this.maxBuildingSize = 100;
        this.minSetback = 10; // Minimum distance from roads
        this.blockPadding = 15; // Padding inside blocks
    }

    /**
     * Detect city blocks (areas bounded by roads)
     */
    detectCityBlocks() {
        const roads = this.elementManager.getRoads();
        const blocks = [];
        
        console.log('Detecting city blocks...');
        console.log('Number of roads:', roads.length);
        
        // For now, we'll use a simple grid-based approach
        // In a full implementation, this would use polygon intersection
        // and computational geometry to find actual enclosed areas
        
        const bounds = this.elementManager.getBounds();
        console.log('Bounds:', bounds);
        
        const blockSize = 200; // Size of each potential block
        
        for (let x = bounds.x; x < bounds.x + bounds.width; x += blockSize) {
            for (let y = bounds.y; y < bounds.y + bounds.height; y += blockSize) {
                const block = {
                    x: x,
                    y: y,
                    width: blockSize,
                    height: blockSize,
                    valid: true
                };
                
                // Check if block intersects with any roads
                for (const road of roads) {
                    if (this.blockIntersectsRoad(block, road)) {
                        block.valid = false;
                        break;
                    }
                }
                
                if (block.valid) {
                    blocks.push(block);
                }
            }
        }
        
        console.log('Detected blocks:', blocks.length);
        return blocks;
    }

    /**
     * Check if a block intersects with a road
     */
    blockIntersectsRoad(block, road) {
        // Check if any road segment passes through the block
        for (let i = 0; i < road.points.length - 1; i++) {
            const p1 = road.points[i];
            const p2 = road.points[i + 1];
            
            // Check if line segment intersects rectangle
            if (this.lineIntersectsRect(p1, p2, block)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if a line segment intersects a rectangle
     */
    lineIntersectsRect(p1, p2, rect) {
        // Check if either endpoint is inside the rectangle
        if (this.pointInRect(p1, rect) || this.pointInRect(p2, rect)) {
            return true;
        }
        
        // Check if line crosses any edge of the rectangle
        const edges = [
            { p1: { x: rect.x, y: rect.y }, p2: { x: rect.x + rect.width, y: rect.y } },
            { p1: { x: rect.x + rect.width, y: rect.y }, p2: { x: rect.x + rect.width, y: rect.y + rect.height } },
            { p1: { x: rect.x + rect.width, y: rect.y + rect.height }, p2: { x: rect.x, y: rect.y + rect.height } },
            { p1: { x: rect.x, y: rect.y + rect.height }, p2: { x: rect.x, y: rect.y } }
        ];
        
        for (const edge of edges) {
            if (this.linesIntersect(p1, p2, edge.p1, edge.p2)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if a point is inside a rectangle
     */
    pointInRect(point, rect) {
        return point.x >= rect.x && point.x <= rect.x + rect.width &&
               point.y >= rect.y && point.y <= rect.y + rect.height;
    }
    
    /**
     * Check if two line segments intersect
     */
    linesIntersect(p1, p2, p3, p4) {
        const ccw = (A, B, C) => {
            return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
        };
        
        return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
    }

    /**
     * Subdivide a block into building lots using recursive subdivision
     */
    subdivideBlock(block) {
        // For polygon blocks from CityBlockDetector
        if (block.points) {
            return this.subdividePolygonBlock(block);
        }
        
        // For rectangular blocks (fallback)
        return this.subdivideRectangularBlock(block);
    }

    /**
     * Subdivide a rectangular block
     */
    subdivideRectangularBlock(block) {
        const lots = [];
        const minLotSize = 30;
        const maxLotSize = 60;
        
        // Use recursive subdivision for more interesting patterns
        this.recursiveSubdivide(
            block.x + this.blockPadding,
            block.y + this.blockPadding,
            block.width - 2 * this.blockPadding,
            block.height - 2 * this.blockPadding,
            lots,
            minLotSize,
            maxLotSize
        );
        
        return lots;
    }

    /**
     * Recursive subdivision algorithm
     */
    recursiveSubdivide(x, y, width, height, lots, minSize, maxSize) {
        // Base case: if area is small enough, create a lot
        if (width < maxSize * 1.5 && height < maxSize * 1.5) {
            if (width >= minSize && height >= minSize) {
                lots.push({ x, y, width, height });
            }
            return;
        }

        // Decide whether to split horizontally or vertically
        const splitHorizontal = width > height;
        
        if (splitHorizontal) {
            // Split vertically at a random point
            const splitRatio = 0.4 + Math.random() * 0.2; // 40-60% split
            const splitX = x + width * splitRatio;
            
            this.recursiveSubdivide(x, y, splitX - x - 2, height, lots, minSize, maxSize);
            this.recursiveSubdivide(splitX + 2, y, x + width - splitX - 2, height, lots, minSize, maxSize);
        } else {
            // Split horizontally at a random point
            const splitRatio = 0.4 + Math.random() * 0.2; // 40-60% split
            const splitY = y + height * splitRatio;
            
            this.recursiveSubdivide(x, y, width, splitY - y - 2, lots, minSize, maxSize);
            this.recursiveSubdivide(x, splitY + 2, width, y + height - splitY - 2, lots, minSize, maxSize);
        }
    }

    /**
     * Subdivide a polygon block (from city block detection)
     */
    subdividePolygonBlock(block) {
        // For now, use bounding box subdivision
        // TODO: Implement proper polygon subdivision
        const bounds = block.bounds;
        return this.subdivideRectangularBlock({
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
        });
    }

    /**
     * Generate a building for a lot
     */
    generateBuildingForLot(lot) {
        const setback = 5; // Building setback from lot boundaries
        
        // Determine building type based on lot size
        let type = 'residential';
        const area = lot.width * lot.height;
        if (area > 3000) {
            type = Math.random() > 0.5 ? 'commercial' : 'office';
        } else if (area > 2000) {
            type = Math.random() > 0.7 ? 'commercial' : 'residential';
        }
        
        // Calculate building dimensions with setback
        const buildingWidth = lot.width - (setback * 2);
        const buildingHeight = lot.height - (setback * 2);
        
        // Create building
        const buildingId = `building_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const building = new Building(
            buildingId,
            lot.x + setback,
            lot.y + setback,
            buildingWidth,
            buildingHeight,
            type
        );
        
        // Add some rotation for variety (-5 to 5 degrees)
        building.rotation = (Math.random() - 0.5) * 10;
        
        return building;
    }

    /**
     * Check if a building overlaps with roads or intersections
     */
    checkBuildingPlacement(building) {
        const bounds = building.getBounds();
        const buffer = this.minSetback;
        
        // Check against roads
        const roads = this.elementManager.getRoads();
        for (const road of roads) {
            // Simplified check - would need proper polygon-line intersection
            for (const point of road.points) {
                if (point.x >= bounds.minX - buffer && 
                    point.x <= bounds.maxX + buffer &&
                    point.y >= bounds.minY - buffer && 
                    point.y <= bounds.maxY + buffer) {
                    return false;
                }
            }
        }
        
        // Check against intersections
        const intersections = this.elementManager.getIntersections();
        for (const intersection of intersections) {
            const intBounds = intersection.getBounds();
            if (this.boundsOverlap(bounds, intBounds, buffer)) {
                return false;
            }
        }
        
        // Check against other buildings
        const buildings = this.elementManager.getBuildings();
        for (const existingBuilding of buildings) {
            if (existingBuilding.id === building.id) continue;
            const existingBounds = existingBuilding.getBounds();
            if (this.boundsOverlap(bounds, existingBounds, 5)) { // 5px minimum spacing
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if two bounds overlap with a buffer
     */
    boundsOverlap(bounds1, bounds2, buffer = 0) {
        return !(bounds1.maxX + buffer < bounds2.minX - buffer || 
                 bounds2.maxX + buffer < bounds1.minX - buffer ||
                 bounds1.maxY + buffer < bounds2.minY - buffer || 
                 bounds2.maxY + buffer < bounds1.minY - buffer);
    }

    /**
     * Generate buildings for all detected city blocks
     */
    generateBuildings() {
        // Try to use advanced block detection first
        let blocks = [];
        
        try {
            const detector = new CityBlockDetector(this.elementManager);
            blocks = detector.detectBlocks();
            console.log(`Detected ${blocks.length} city blocks using graph analysis`);
        } catch (error) {
            console.warn('Advanced block detection failed, falling back to grid method:', error);
            blocks = this.detectCityBlocks();
        }
        
        // If no blocks found with either method, use simple grid
        if (blocks.length === 0) {
            blocks = this.detectCityBlocks();
        }
        
        let generatedCount = 0;
        
        for (const block of blocks) {
            const lots = this.subdivideBlock(block);
            
            for (const lot of lots) {
                const building = this.generateBuildingForLot(lot);
                
                if (this.checkBuildingPlacement(building)) {
                    console.log('Adding building:', building.id, 'at', building.x, building.y);
                    this.elementManager.addBuilding(building);
                    generatedCount++;
                } else {
                    console.log('Building placement failed for:', building.id);
                }
            }
        }
        
        return generatedCount;
    }

    /**
     * Generate buildings in a specific area
     */
    generateBuildingsInArea(x, y, width, height) {
        const block = { x, y, width, height, valid: true };
        
        // Check if area intersects roads
        const roads = this.elementManager.getRoads();
        for (const road of roads) {
            if (this.blockIntersectsRoad(block, road)) {
                return 0; // Don't generate in areas with roads
            }
        }
        
        const lots = this.subdivideBlock(block);
        let generatedCount = 0;
        
        for (const lot of lots) {
            const building = this.generateBuildingForLot(lot);
            
            if (this.checkBuildingPlacement(building)) {
                this.elementManager.addBuilding(building);
                generatedCount++;
            }
        }
        
        return generatedCount;
    }

    /**
     * Clear all buildings
     */
    clearBuildings() {
        const buildings = this.elementManager.getBuildings();
        buildings.forEach(building => {
            this.elementManager.removeBuilding(building.id);
        });
    }
}