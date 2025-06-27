import { Building } from './elements/Building.js';
import { BUILDING_TYPES } from '../core/constants.js';
import { CityBlockDetector } from './CityBlockDetector.js';
import { BuildingVarietyGenerator } from './generation/BuildingVarietyGenerator.js';

export class BuildingGenerator {
    constructor(elementManager) {
        this.elementManager = elementManager;
        this.minBuildingSize = 20;
        this.maxBuildingSize = 100;
        this.minSetback = 5; // Minimum distance from roads (reduced for better placement)
        this.blockPadding = 10; // Padding inside blocks (reduced)
        this.varietyGenerator = new BuildingVarietyGenerator();
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
        const p1InRect = this.pointInRect(p1, rect);
        const p2InRect = this.pointInRect(p2, rect);
        
        if (p1InRect || p2InRect) {
            console.log(`Line endpoint inside rect: p1=${p1InRect}, p2=${p2InRect}`);
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
                console.log(`Line intersects rectangle edge`);
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
        const minLotSize = 20; // Reduced from 30
        const maxLotSize = 60;
        
        // For small areas, just create a single lot with minimal padding
        if (block.width < 50 || block.height < 50) {
            const padding = 5; // Minimal padding for small areas
            if (block.width - 2 * padding >= minLotSize && block.height - 2 * padding >= minLotSize) {
                lots.push({
                    x: block.x + padding,
                    y: block.y + padding,
                    width: block.width - 2 * padding,
                    height: block.height - 2 * padding
                });
            }
            return lots;
        }
        
        // Use recursive subdivision for larger areas
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
    generateBuildingForLot(lot, context = {}) {
        // Use the variety generator for more realistic buildings
        return this.varietyGenerator.generateVariedBuilding(lot, context);
    }

    /**
     * Check if a building overlaps with roads or intersections
     */
    checkBuildingPlacement(building) {
        const bounds = building.getBounds();
        const buffer = this.minSetback;
        
        console.log(`Checking building placement at (${bounds.minX}, ${bounds.minY}) to (${bounds.maxX}, ${bounds.maxY})`);
        console.log(`Buffer: ${buffer}`);
        
        // Check against roads - use proper distance calculation
        const roads = this.elementManager.getRoads();
        console.log(`Number of roads to check: ${roads.length}`);
        
        for (const road of roads) {
            // Quick check: if road is very far away, skip it
            const roadBounds = road.getBounds();
            const maxDistance = 100; // Skip roads more than 100 pixels away
            if (!this.boundsOverlap(bounds, roadBounds, maxDistance)) {
                console.log(`Skipping road ${road.id} - too far away`);
                continue;
            }
            
            // Check if building rectangle intersects with road path (with buffer)
            for (let i = 0; i < road.points.length - 1; i++) {
                const p1 = road.points[i];
                const p2 = road.points[i + 1];
                
                // Create an expanded building bounds with buffer
                const expandedBounds = {
                    minX: bounds.minX - buffer,
                    minY: bounds.minY - buffer,
                    maxX: bounds.maxX + buffer,
                    maxY: bounds.maxY + buffer
                };
                
                const expandedRect = {
                    x: expandedBounds.minX,
                    y: expandedBounds.minY,
                    width: expandedBounds.maxX - expandedBounds.minX,
                    height: expandedBounds.maxY - expandedBounds.minY
                };
                
                // Check if the road segment intersects the expanded building bounds
                const intersects = this.lineIntersectsRect(p1, p2, expandedRect);
                console.log(`Road segment (${p1.x},${p1.y}) to (${p2.x},${p2.y}) intersects expanded bounds: ${intersects}`);
                
                if (intersects) {
                    // Also need to consider road width
                    const roadWidth = road.properties?.width || 20;
                    const roadBuffer = roadWidth / 2 + buffer;
                    console.log(`Road width: ${roadWidth}, Road buffer: ${roadBuffer}`);
                    
                    // Get closest point on line to each corner of the building
                    const corners = [
                        { x: bounds.minX, y: bounds.minY },
                        { x: bounds.maxX, y: bounds.minY },
                        { x: bounds.maxX, y: bounds.maxY },
                        { x: bounds.minX, y: bounds.maxY }
                    ];
                    
                    for (const corner of corners) {
                        const closestPoint = this.getClosestPointOnSegment(corner, p1, p2);
                        const distance = Math.sqrt(
                            Math.pow(closestPoint.x - corner.x, 2) + 
                            Math.pow(closestPoint.y - corner.y, 2)
                        );
                        
                        console.log(`Corner (${corner.x},${corner.y}) distance to road: ${distance}, required: ${roadBuffer}`);
                        
                        if (distance < roadBuffer) {
                            console.log(`Building too close to road! Distance ${distance} < ${roadBuffer}`);
                            return false;
                        }
                    }
                }
            }
        }
        
        console.log('Finished checking roads, no conflicts found');
        
        // Check against intersections
        const intersections = this.elementManager.getIntersections();
        console.log(`Number of intersections to check: ${intersections.length}`);
        for (const intersection of intersections) {
            const intBounds = intersection.getBounds();
            const intersectionBuffer = buffer * 1.5; // 7.5 pixels
            console.log(`Intersection bounds:`, intBounds);
            console.log(`Building bounds: [${bounds.minX.toFixed(1)}, ${bounds.minY.toFixed(1)}] to [${bounds.maxX.toFixed(1)}, ${bounds.maxY.toFixed(1)}]`);
            console.log(`Checking with buffer: ${intersectionBuffer}`);
            
            const overlaps = this.boundsOverlap(bounds, intBounds, intersectionBuffer);
            if (overlaps) {
                console.log(`FAILED: Building overlaps with intersection at (${intersection.x}, ${intersection.y})`);
                return false;
            }
        }
        
        // Check against other buildings
        const buildings = this.elementManager.getBuildings();
        for (const existingBuilding of buildings) {
            if (existingBuilding.id === building.id) continue;
            const existingBounds = existingBuilding.getBounds();
            if (this.boundsOverlap(bounds, existingBounds, 5)) { // 5px minimum spacing
                console.log(`Building overlaps with existing building ${existingBuilding.id}`);
                return false;
            }
        }
        
        console.log('Building placement check PASSED!');
        return true;
    }

    /**
     * Get closest point on a line segment to a given point
     */
    getClosestPointOnSegment(point, segStart, segEnd) {
        const dx = segEnd.x - segStart.x;
        const dy = segEnd.y - segStart.y;
        const lengthSquared = dx * dx + dy * dy;
        
        if (lengthSquared === 0) {
            return segStart; // Segment is a point
        }
        
        const t = Math.max(0, Math.min(1, 
            ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSquared
        ));
        
        return {
            x: segStart.x + t * dx,
            y: segStart.y + t * dy
        };
    }

    /**
     * Check if two bounds overlap with a buffer
     */
    boundsOverlap(bounds1, bounds2, buffer = 0) {
        // Expand bounds1 by buffer on all sides
        const expanded1 = {
            minX: bounds1.minX - buffer,
            minY: bounds1.minY - buffer,
            maxX: bounds1.maxX + buffer,
            maxY: bounds1.maxY + buffer
        };
        
        // Check if expanded bounds1 overlaps with bounds2
        return !(expanded1.maxX < bounds2.minX || 
                 bounds2.maxX < expanded1.minX ||
                 expanded1.maxY < bounds2.minY || 
                 bounds2.maxY < expanded1.minY);
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
        console.log(`generateBuildingsInArea called with: x=${x}, y=${y}, width=${width}, height=${height}`);
        const block = { x, y, width, height, valid: true };
        
        // Remove the road intersection check - let individual building placement handle conflicts
        
        const lots = this.subdivideBlock(block);
        console.log(`Subdivision created ${lots.length} lots`);
        let generatedCount = 0;
        
        for (const lot of lots) {
            const building = this.generateBuildingForLot(lot);
            console.log(`Checking placement for building at (${building.x}, ${building.y})`);
            
            if (this.checkBuildingPlacement(building)) {
                this.elementManager.addBuilding(building);
                generatedCount++;
                console.log(`Building placed successfully`);
            } else {
                console.log(`Building placement failed`);
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