import { IntersectionDiagramRenderer } from './IntersectionDiagramRenderer.js';

/**
 * StopSignConfigurator - Manages stop sign position selection and configuration
 */
export class StopSignConfigurator {
    constructor() {
        this.diagramRenderer = new IntersectionDiagramRenderer();
        this.stopPositions = [];
        this.onChangeCallback = null;
    }
    
    /**
     * Create the stop sign configuration UI
     */
    createUI(connections, initialPositions = []) {
        this.stopPositions = [...initialPositions];
        
        const container = document.createElement('div');
        container.className = 'property-group';
        container.id = 'stop-sign-config';
        
        const label = document.createElement('label');
        label.textContent = 'Stop Sign Placement';
        container.appendChild(label);
        
        const selectorDiv = document.createElement('div');
        selectorDiv.id = 'stop-position-selector';
        selectorDiv.className = 'stop-positions';
        
        const hint = document.createElement('p');
        hint.className = 'hint';
        hint.textContent = 'Click on approaches to toggle stop signs';
        selectorDiv.appendChild(hint);
        
        const diagramContainer = document.createElement('div');
        diagramContainer.className = 'intersection-diagram';
        
        // Create and append the SVG diagram
        const svg = this.diagramRenderer.createStopSignDiagram(connections, this.stopPositions);
        diagramContainer.appendChild(svg);
        
        // Add click handlers to stop positions
        this.attachClickHandlers(svg);
        
        selectorDiv.appendChild(diagramContainer);
        container.appendChild(selectorDiv);
        
        // Add "All-Way Stop" quick button
        const quickControls = this.createQuickControls(connections);
        container.appendChild(quickControls);
        
        return container;
    }
    
    /**
     * Create quick control buttons
     */
    createQuickControls(connections) {
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'stop-quick-controls';
        controlsDiv.style.cssText = `
            margin-top: 0.75rem;
            display: flex;
            gap: 0.5rem;
        `;
        
        // All-way stop button
        const allWayBtn = document.createElement('button');
        allWayBtn.className = 'quick-control-btn';
        allWayBtn.textContent = 'All-Way Stop';
        allWayBtn.style.cssText = `
            flex: 1;
            padding: 0.5rem;
            background: #2a2a3a;
            border: 1px solid #3a3a4a;
            color: #e8e8ec;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.2s ease;
        `;
        
        allWayBtn.addEventListener('mouseenter', () => {
            allWayBtn.style.background = '#3a3a4a';
            allWayBtn.style.borderColor = '#4a4a5a';
        });
        
        allWayBtn.addEventListener('mouseleave', () => {
            allWayBtn.style.background = '#2a2a3a';
            allWayBtn.style.borderColor = '#3a3a4a';
        });
        
        allWayBtn.addEventListener('click', () => {
            this.setAllWayStop(connections);
        });
        
        // Clear all button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'quick-control-btn';
        clearBtn.textContent = 'Clear All';
        clearBtn.style.cssText = allWayBtn.style.cssText;
        
        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.background = '#3a3a4a';
            clearBtn.style.borderColor = '#4a4a5a';
        });
        
        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.background = '#2a2a3a';
            clearBtn.style.borderColor = '#3a3a4a';
        });
        
        clearBtn.addEventListener('click', () => {
            this.clearAllStops();
        });
        
        controlsDiv.appendChild(allWayBtn);
        controlsDiv.appendChild(clearBtn);
        
        return controlsDiv;
    }
    
    /**
     * Attach click handlers to stop position indicators
     */
    attachClickHandlers(svg) {
        const stopGroups = svg.querySelectorAll('.stop-position');
        stopGroups.forEach(group => {
            group.addEventListener('click', () => {
                const index = parseInt(group.getAttribute('data-index'));
                this.toggleStopPosition(index);
                this.updateDiagram(svg);
            });
        });
    }
    
    /**
     * Toggle stop position
     */
    toggleStopPosition(index) {
        const pos = this.stopPositions.indexOf(index);
        if (pos === -1) {
            this.stopPositions.push(index);
        } else {
            this.stopPositions.splice(pos, 1);
        }
        
        if (this.onChangeCallback) {
            this.onChangeCallback(this.stopPositions);
        }
    }
    
    /**
     * Set all-way stop
     */
    setAllWayStop(connections) {
        this.stopPositions = connections.map((_, index) => index);
        this.updateAllDiagrams();
        
        if (this.onChangeCallback) {
            this.onChangeCallback(this.stopPositions);
        }
    }
    
    /**
     * Clear all stops
     */
    clearAllStops() {
        this.stopPositions = [];
        this.updateAllDiagrams();
        
        if (this.onChangeCallback) {
            this.onChangeCallback(this.stopPositions);
        }
    }
    
    /**
     * Update diagram display
     */
    updateDiagram(svg) {
        const stopGroups = svg.querySelectorAll('.stop-position');
        stopGroups.forEach(group => {
            const index = parseInt(group.getAttribute('data-index'));
            const polygon = group.querySelector('polygon');
            const hasStop = this.stopPositions.includes(index);
            
            if (polygon) {
                polygon.setAttribute('fill', hasStop ? '#ff0000' : '#4a4a5a');
                polygon.setAttribute('stroke', hasStop ? '#ff6666' : '#6a6a7a');
            }
        });
    }
    
    /**
     * Update all diagrams (for quick controls)
     */
    updateAllDiagrams() {
        const diagrams = document.querySelectorAll('.intersection-diagram svg');
        diagrams.forEach(svg => {
            this.updateDiagram(svg);
        });
    }
    
    /**
     * Set change callback
     */
    onChange(callback) {
        this.onChangeCallback = callback;
    }
    
    /**
     * Get current stop positions
     */
    getStopPositions() {
        return [...this.stopPositions];
    }
    
    /**
     * Set stop positions
     */
    setStopPositions(positions) {
        this.stopPositions = [...positions];
        this.updateAllDiagrams();
    }
}