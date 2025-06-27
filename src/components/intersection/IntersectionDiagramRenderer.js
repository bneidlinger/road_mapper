/**
 * IntersectionDiagramRenderer - Renders SVG diagrams for intersection preview
 */
export class IntersectionDiagramRenderer {
    constructor() {
        this.svgNS = 'http://www.w3.org/2000/svg';
        this.diagramSize = 120;
        this.center = { x: 60, y: 60 };
        this.roadLength = 40;
        this.roadWidth = 12;
    }
    
    /**
     * Create an intersection diagram for stop sign configuration
     */
    createStopSignDiagram(connections, stopPositions = []) {
        const svg = document.createElementNS(this.svgNS, 'svg');
        svg.setAttribute('width', this.diagramSize);
        svg.setAttribute('height', this.diagramSize);
        svg.setAttribute('viewBox', `0 0 ${this.diagramSize} ${this.diagramSize}`);
        
        // Background
        this.addBackground(svg);
        
        // Draw roads
        this.drawRoads(svg, connections);
        
        // Draw center
        this.drawIntersectionCenter(svg);
        
        // Draw stop positions
        connections.forEach((conn, index) => {
            const stopGroup = this.createStopPositionIndicator(conn, index, stopPositions.includes(index));
            svg.appendChild(stopGroup);
        });
        
        return svg;
    }
    
    /**
     * Create a traffic light timing diagram
     */
    createTrafficLightDiagram() {
        const svg = document.createElementNS(this.svgNS, 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '60');
        svg.setAttribute('viewBox', '0 0 300 60');
        
        // Background
        const bg = document.createElementNS(this.svgNS, 'rect');
        bg.setAttribute('width', '300');
        bg.setAttribute('height', '60');
        bg.setAttribute('fill', '#2a2a3a');
        bg.setAttribute('rx', '4');
        svg.appendChild(bg);
        
        // Create timing bars
        const phases = [
            { name: 'Green', color: '#00ff00', width: 50 },
            { name: 'Yellow', color: '#ffaa00', width: 10 },
            { name: 'Red', color: '#ff0000', width: 40 }
        ];
        
        let xOffset = 10;
        phases.forEach(phase => {
            const barWidth = phase.width * 2.8; // Scale to fit
            
            // Phase bar
            const bar = document.createElementNS(this.svgNS, 'rect');
            bar.setAttribute('x', xOffset);
            bar.setAttribute('y', '20');
            bar.setAttribute('width', barWidth);
            bar.setAttribute('height', '20');
            bar.setAttribute('fill', phase.color);
            bar.setAttribute('opacity', '0.8');
            bar.setAttribute('rx', '2');
            svg.appendChild(bar);
            
            // Phase label
            const label = document.createElementNS(this.svgNS, 'text');
            label.setAttribute('x', xOffset + barWidth / 2);
            label.setAttribute('y', '15');
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('fill', '#e8e8ec');
            label.setAttribute('font-size', '11');
            label.textContent = phase.name;
            svg.appendChild(label);
            
            // Duration label
            const duration = document.createElementNS(this.svgNS, 'text');
            duration.setAttribute('x', xOffset + barWidth / 2);
            duration.setAttribute('y', '52');
            duration.setAttribute('text-anchor', 'middle');
            duration.setAttribute('fill', '#a0a0b8');
            duration.setAttribute('font-size', '10');
            duration.textContent = `${phase.width / 10}s`;
            svg.appendChild(duration);
            
            xOffset += barWidth + 5;
        });
        
        return svg;
    }
    
    /**
     * Add background to diagram
     */
    addBackground(svg) {
        const bg = document.createElementNS(this.svgNS, 'rect');
        bg.setAttribute('width', this.diagramSize);
        bg.setAttribute('height', this.diagramSize);
        bg.setAttribute('fill', '#2a2a3a');
        bg.setAttribute('rx', '8');
        svg.appendChild(bg);
    }
    
    /**
     * Draw roads in the diagram
     */
    drawRoads(svg, connections) {
        connections.forEach(conn => {
            const angle = conn.angle;
            const startX = this.center.x + Math.cos(angle) * this.roadLength;
            const startY = this.center.y + Math.sin(angle) * this.roadLength;
            const endX = this.center.x + Math.cos(angle) * 15;
            const endY = this.center.y + Math.sin(angle) * 15;
            
            const roadPath = document.createElementNS(this.svgNS, 'path');
            roadPath.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
            roadPath.setAttribute('stroke', '#4a4a5a');
            roadPath.setAttribute('stroke-width', this.roadWidth);
            roadPath.setAttribute('stroke-linecap', 'round');
            svg.appendChild(roadPath);
            
            // Add center line
            const centerLine = document.createElementNS(this.svgNS, 'path');
            centerLine.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
            centerLine.setAttribute('stroke', '#6a6a7a');
            centerLine.setAttribute('stroke-width', '1');
            centerLine.setAttribute('stroke-dasharray', '4 4');
            svg.appendChild(centerLine);
        });
    }
    
    /**
     * Draw intersection center
     */
    drawIntersectionCenter(svg) {
        const centerCircle = document.createElementNS(this.svgNS, 'circle');
        centerCircle.setAttribute('cx', this.center.x);
        centerCircle.setAttribute('cy', this.center.y);
        centerCircle.setAttribute('r', '15');
        centerCircle.setAttribute('fill', '#3a3a4a');
        centerCircle.setAttribute('stroke', '#5a5a6a');
        centerCircle.setAttribute('stroke-width', '1');
        svg.appendChild(centerCircle);
    }
    
    /**
     * Create stop position indicator
     */
    createStopPositionIndicator(connection, index, hasStop) {
        const angle = connection.angle;
        const distance = 25;
        const x = this.center.x + Math.cos(angle) * distance;
        const y = this.center.y + Math.sin(angle) * distance;
        
        const stopGroup = document.createElementNS(this.svgNS, 'g');
        stopGroup.setAttribute('class', 'stop-position');
        stopGroup.setAttribute('data-index', index);
        stopGroup.style.cursor = 'pointer';
        
        // Stop sign indicator
        const stopSign = document.createElementNS(this.svgNS, 'polygon');
        const size = 6;
        const points = this.getOctagonPoints(x, y, size);
        stopSign.setAttribute('points', points);
        stopSign.setAttribute('fill', hasStop ? '#ff0000' : '#4a4a5a');
        stopSign.setAttribute('stroke', hasStop ? '#ff6666' : '#6a6a7a');
        stopSign.setAttribute('stroke-width', '1');
        stopGroup.appendChild(stopSign);
        
        // Hover effect
        const hoverCircle = document.createElementNS(this.svgNS, 'circle');
        hoverCircle.setAttribute('cx', x);
        hoverCircle.setAttribute('cy', y);
        hoverCircle.setAttribute('r', '10');
        hoverCircle.setAttribute('fill', 'transparent');
        hoverCircle.setAttribute('stroke', '#00ff88');
        hoverCircle.setAttribute('stroke-width', '2');
        hoverCircle.setAttribute('opacity', '0');
        hoverCircle.setAttribute('class', 'hover-indicator');
        stopGroup.appendChild(hoverCircle);
        
        // Add hover listeners
        stopGroup.addEventListener('mouseenter', () => {
            hoverCircle.setAttribute('opacity', '0.5');
        });
        
        stopGroup.addEventListener('mouseleave', () => {
            hoverCircle.setAttribute('opacity', '0');
        });
        
        return stopGroup;
    }
    
    /**
     * Get octagon points for stop sign shape
     */
    getOctagonPoints(cx, cy, size) {
        const points = [];
        const angleStep = Math.PI / 4;
        
        for (let i = 0; i < 8; i++) {
            const angle = i * angleStep - Math.PI / 8;
            const x = cx + Math.cos(angle) * size;
            const y = cy + Math.sin(angle) * size;
            points.push(`${x},${y}`);
        }
        
        return points.join(' ');
    }
    
    /**
     * Create yield position diagram
     */
    createYieldSignDiagram(connections, yieldPositions = []) {
        const svg = this.createStopSignDiagram(connections, []); // Base diagram
        
        // Replace stop indicators with yield indicators
        const stopGroups = svg.querySelectorAll('.stop-position');
        stopGroups.forEach((group, index) => {
            const polygon = group.querySelector('polygon');
            if (polygon) {
                // Convert to triangle for yield sign
                const x = parseFloat(polygon.getAttribute('points').split(',')[0]);
                const y = parseFloat(polygon.getAttribute('points').split(' ')[0].split(',')[1]);
                const size = 6;
                
                const trianglePoints = `${x},${y - size} ${x - size * 0.866},${y + size * 0.5} ${x + size * 0.866},${y + size * 0.5}`;
                polygon.setAttribute('points', trianglePoints);
                polygon.setAttribute('fill', yieldPositions.includes(index) ? '#ff0000' : '#4a4a5a');
                polygon.setAttribute('stroke', yieldPositions.includes(index) ? '#ff6666' : '#6a6a7a');
            }
        });
        
        return svg;
    }
}