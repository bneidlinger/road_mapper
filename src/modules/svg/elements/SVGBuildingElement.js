import { SVGBaseElement } from '../SVGBaseElement.js';

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
        
        // Create building elements
        this.createBuildingElements();
        
        // Set initial state
        this.updatePosition();
        this.updateDetailLevel(1);
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
        
        // Add glow effect when selected
        if (this.building.selected) {
            this.base.setAttribute('filter', 'url(#building-selection-glow)');
        }
        
        // Building shadow/3D effect
        this.shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.shadow.setAttribute('x', x + 2);
        this.shadow.setAttribute('y', y + 2);
        this.shadow.setAttribute('width', width);
        this.shadow.setAttribute('height', height);
        this.shadow.setAttribute('class', 'building-shadow');
        this.shadow.setAttribute('fill', 'rgba(0, 0, 0, 0.2)');
        this.shadow.setAttribute('stroke', 'none');
        this.shadow.setAttribute('rx', 2);
        this.shadow.setAttribute('ry', 2);
        
        // Add elements to group (shadow first, then base)
        this.group.appendChild(this.shadow);
        this.group.appendChild(this.base);
        
        // Add roof detail for certain types
        if (type === 'residential' || type === 'commercial') {
            this.addRoofDetail();
        }
    }
    
    /**
     * Add roof detail based on building type
     */
    addRoofDetail() {
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
        
        this.group.appendChild(this.roof);
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
    updateDetailLevel(zoom) {
        // Adjust visibility based on zoom
        if (zoom < 0.3) {
            // Very low zoom - hide small buildings
            if (this.building.width < 40 || this.building.height < 40) {
                this.group.style.display = 'none';
            } else {
                this.group.style.display = '';
                this.group.style.opacity = '0.6';
            }
        } else if (zoom < 0.5) {
            // Low zoom - show all buildings but simplified
            this.group.style.display = '';
            this.group.style.opacity = '0.8';
            if (this.roof) this.roof.style.display = 'none';
            if (this.shadow) this.shadow.style.display = 'none';
        } else if (zoom < 1) {
            // Medium zoom - show basic details
            this.group.style.display = '';
            this.group.style.opacity = '1';
            if (this.roof) this.roof.style.display = '';
            if (this.shadow) this.shadow.style.display = 'none';
        } else {
            // High zoom - show all details
            this.group.style.display = '';
            this.group.style.opacity = '1';
            if (this.roof) this.roof.style.display = '';
            if (this.shadow) this.shadow.style.display = '';
        }
    }
    
    /**
     * Update building properties
     */
    update(building) {
        this.building = building;
        
        // Update base properties
        this.base.setAttribute('x', building.x);
        this.base.setAttribute('y', building.y);
        this.base.setAttribute('width', building.width);
        this.base.setAttribute('height', building.height);
        this.base.setAttribute('fill', building.customColor || building.color || this.getBuildingColor(building.type));
        this.base.setAttribute('stroke', building.selected ? '#00ff88' : this.getBuildingStrokeColor(building.type));
        this.base.setAttribute('stroke-width', building.selected ? 2 : 1);
        
        // Update selection glow
        if (building.selected) {
            this.base.setAttribute('filter', 'url(#building-selection-glow)');
        } else {
            this.base.removeAttribute('filter');
        }
        
        // Update shadow
        if (this.shadow) {
            this.shadow.setAttribute('x', building.x + 2);
            this.shadow.setAttribute('y', building.y + 2);
            this.shadow.setAttribute('width', building.width);
            this.shadow.setAttribute('height', building.height);
        }
        
        // Update roof
        if (this.roof) {
            const inset = Math.min(building.width, building.height) * 0.1;
            this.roof.setAttribute('x', building.x + inset);
            this.roof.setAttribute('y', building.y + inset);
            this.roof.setAttribute('width', building.width - inset * 2);
            this.roof.setAttribute('height', building.height - inset * 2);
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