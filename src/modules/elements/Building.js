import { BUILDING_TYPES } from '../../core/constants.js';

export class Building {
    constructor(id, x, y, width, height, type = 'residential') {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.rotation = 0;
        this.selected = false;
        
        // Building properties
        this.floors = this.generateFloors();
        this.color = this.getColorForType();
        this.customColor = null; // Allow custom color override
        this.footprint = this.generateFootprint();
        this.roofType = this.generateRoofType();
        
        // Type-specific properties
        this.properties = this.generateDefaultProperties();
    }

    generateFloors() {
        const floorRanges = {
            residential: { min: 1, max: 3 },
            commercial: { min: 2, max: 5 },
            industrial: { min: 1, max: 2 },
            office: { min: 5, max: 20 }
        };
        
        const range = floorRanges[this.type] || floorRanges.residential;
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    getColorForType() {
        const colors = {
            residential: '#4CAF50',
            commercial: '#2196F3', 
            industrial: '#FF9800',
            office: '#9C27B0'
        };
        return colors[this.type] || colors.residential;
    }
    
    generateRoofType() {
        // Different building types have different roof type preferences
        const roofPreferences = {
            residential: {
                gabled: 0.4,
                hipped: 0.3,
                flat: 0.15,
                shed: 0.1,
                mansard: 0.05
            },
            commercial: {
                flat: 0.6,
                shed: 0.25,
                gabled: 0.1,
                hipped: 0.05,
                mansard: 0
            },
            industrial: {
                flat: 0.7,
                shed: 0.25,
                gabled: 0.05,
                hipped: 0,
                mansard: 0
            },
            office: {
                flat: 0.8,
                mansard: 0.1,
                shed: 0.05,
                gabled: 0.025,
                hipped: 0.025
            }
        };
        
        const preferences = roofPreferences[this.type] || roofPreferences.residential;
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [roofType, probability] of Object.entries(preferences)) {
            cumulative += probability;
            if (rand <= cumulative) {
                return roofType;
            }
        }
        
        return 'flat'; // fallback
    }

    generateDefaultProperties() {
        const defaults = {
            residential: {
                style: 'single-family',
                units: 1
            },
            commercial: {
                businessType: 'retail',
                parkingSpaces: 10
            },
            industrial: {
                facilityType: 'warehouse',
                loadingDocks: 2
            },
            office: {
                officeType: 'professional',
                occupancy: 100
            }
        };
        return defaults[this.type] || defaults.residential;
    }

    generateFootprint() {
        // Generate different footprint types based on building type and size
        const area = this.width * this.height;
        
        // Larger buildings have more complex footprints
        if (area > 3000 && Math.random() > 0.5) {
            return this.generateLShapeFootprint();
        } else if (area > 4000 && Math.random() > 0.7) {
            return this.generateUShapeFootprint();
        }
        
        // Default rectangle
        return {
            type: 'rectangle',
            points: [
                { x: this.x, y: this.y },
                { x: this.x + this.width, y: this.y },
                { x: this.x + this.width, y: this.y + this.height },
                { x: this.x, y: this.y + this.height }
            ]
        };
    }

    generateLShapeFootprint() {
        const cutWidth = this.width * (0.3 + Math.random() * 0.2);
        const cutHeight = this.height * (0.3 + Math.random() * 0.2);
        
        return {
            type: 'L-shape',
            points: [
                { x: this.x, y: this.y },
                { x: this.x + this.width, y: this.y },
                { x: this.x + this.width, y: this.y + this.height - cutHeight },
                { x: this.x + this.width - cutWidth, y: this.y + this.height - cutHeight },
                { x: this.x + this.width - cutWidth, y: this.y + this.height },
                { x: this.x, y: this.y + this.height }
            ]
        };
    }

    generateUShapeFootprint() {
        const courtyardWidth = this.width * 0.4;
        const courtyardDepth = this.height * 0.6;
        const x1 = this.x + (this.width - courtyardWidth) / 2;
        const x2 = x1 + courtyardWidth;
        
        return {
            type: 'U-shape',
            points: [
                { x: this.x, y: this.y },
                { x: this.x + this.width, y: this.y },
                { x: this.x + this.width, y: this.y + this.height },
                { x: x2, y: this.y + this.height },
                { x: x2, y: this.y + courtyardDepth },
                { x: x1, y: this.y + courtyardDepth },
                { x: x1, y: this.y + this.height },
                { x: this.x, y: this.y + this.height }
            ]
        };
    }

    updateProperties(changes) {
        const typeChanged = changes.type !== undefined && changes.type !== this.type;

        if (changes.type !== undefined) {
            this.type = changes.type;
            this.color = this.getColorForType();

            if (typeChanged) {
                this.properties = this.generateDefaultProperties();
                this.footprint = this.generateFootprint();
            }
        }

        if (changes.floors !== undefined) this.floors = changes.floors;
        if (changes.roofType !== undefined) this.roofType = changes.roofType;
        if (changes.rotation !== undefined) this.rotation = changes.rotation;
        if (changes.customColor !== undefined) this.customColor = changes.customColor;

        if (changes.properties) {
            this.properties = { ...this.properties, ...changes.properties };
        }
    }

    draw() {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', this.id);
        g.setAttribute('class', 'building');
        g.setAttribute('data-type', this.type);

        // Create building shape based on footprint
        let shape, shadow;
        
        if (this.footprint.type === 'rectangle') {
            // Simple rectangle
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shape.setAttribute('x', this.x);
            shape.setAttribute('y', this.y);
            shape.setAttribute('width', this.width);
            shape.setAttribute('height', this.height);
            
            // Shadow
            shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shadow.setAttribute('x', this.x + 2);
            shadow.setAttribute('y', this.y + 2);
            shadow.setAttribute('width', this.width);
            shadow.setAttribute('height', this.height);
        } else {
            // Complex polygon shape
            shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const pointsStr = this.footprint.points.map(p => `${p.x},${p.y}`).join(' ');
            shape.setAttribute('points', pointsStr);
            
            // Shadow (offset polygon)
            shadow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const shadowPoints = this.footprint.points.map(p => `${p.x + 2},${p.y + 2}`).join(' ');
            shadow.setAttribute('points', shadowPoints);
        }

        // Apply common attributes
        shape.setAttribute('fill', this.customColor || this.color);
        shape.setAttribute('stroke', '#333');
        shape.setAttribute('stroke-width', this.selected ? '2' : '1');
        shape.setAttribute('opacity', '0.8');
        
        shadow.setAttribute('fill', '#000');
        shadow.setAttribute('opacity', '0.2');
        
        // Apply rotation if needed
        if (this.rotation !== 0) {
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            shape.setAttribute('transform', `rotate(${this.rotation} ${cx} ${cy})`);
            shadow.setAttribute('transform', `rotate(${this.rotation} ${cx} ${cy})`);
        }

        g.appendChild(shadow);
        g.appendChild(shape);

        return g;
    }

    hitTest(point) {
        // Simple point-in-rectangle test, will need to handle rotation later
        if (this.rotation === 0) {
            return point.x >= this.x && 
                   point.x <= this.x + this.width &&
                   point.y >= this.y && 
                   point.y <= this.y + this.height;
        } else {
            // Handle rotated rectangle hit test
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            const cos = Math.cos(-this.rotation * Math.PI / 180);
            const sin = Math.sin(-this.rotation * Math.PI / 180);
            
            // Transform point to local coordinates
            const localX = cos * (point.x - cx) - sin * (point.y - cy) + cx;
            const localY = sin * (point.x - cx) + cos * (point.y - cy) + cy;
            
            return localX >= this.x && 
                   localX <= this.x + this.width &&
                   localY >= this.y && 
                   localY <= this.y + this.height;
        }
    }

    getBounds() {
        if (this.rotation === 0) {
            return {
                minX: this.x,
                minY: this.y,
                maxX: this.x + this.width,
                maxY: this.y + this.height
            };
        } else {
            // Calculate bounds for rotated rectangle
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            const cos = Math.cos(this.rotation * Math.PI / 180);
            const sin = Math.sin(this.rotation * Math.PI / 180);
            
            const corners = [
                { x: this.x, y: this.y },
                { x: this.x + this.width, y: this.y },
                { x: this.x + this.width, y: this.y + this.height },
                { x: this.x, y: this.y + this.height }
            ];
            
            const rotatedCorners = corners.map(corner => ({
                x: cos * (corner.x - cx) - sin * (corner.y - cy) + cx,
                y: sin * (corner.x - cx) + cos * (corner.y - cy) + cy
            }));
            
            const xs = rotatedCorners.map(c => c.x);
            const ys = rotatedCorners.map(c => c.y);
            
            return {
                minX: Math.min(...xs),
                minY: Math.min(...ys),
                maxX: Math.max(...xs),
                maxY: Math.max(...ys)
            };
        }
    }

    setSelected(selected) {
        this.selected = selected;
    }

    updateDetailLevel(zoom, isBirdsEye) {
        // Buildings don't need detail level updates for now
        // But this method is required for the visibility system
    }


    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            type: this.type,
            rotation: this.rotation,
            floors: this.floors,
            roofType: this.roofType,
            customColor: this.customColor,
            properties: this.properties
        };
    }

    static fromJSON(data) {
        const building = new Building(data.id, data.x, data.y, data.width, data.height, data.type);
        building.rotation = data.rotation || 0;
        building.floors = data.floors || building.generateFloors();
        building.roofType = data.roofType || building.roofType;
        building.customColor = data.customColor || null;
        building.properties = data.properties || building.generateDefaultProperties();
        return building;
    }
}