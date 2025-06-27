import { IntersectionControlsUI } from './IntersectionControlsUI.js';
import { StopSignConfigurator } from './StopSignConfigurator.js';
import { TrafficLightConfigurator } from './TrafficLightConfigurator.js';
import { IntersectionDiagramRenderer } from './IntersectionDiagramRenderer.js';

/**
 * IntersectionPropertiesPanel - Main panel orchestrator for intersection properties
 */
export class IntersectionPropertiesPanel {
    constructor(elementManager) {
        this.elementManager = elementManager;
        this.container = null;
        this.currentIntersection = null;
        this.isVisible = false;
        this.pendingChanges = null;
        
        // Initialize sub-components
        this.controlsUI = new IntersectionControlsUI();
        this.stopSignConfig = new StopSignConfigurator();
        this.trafficLightConfig = new TrafficLightConfigurator();
        this.diagramRenderer = new IntersectionDiagramRenderer();
        
        // Set up component callbacks
        this.setupComponentCallbacks();
    }
    
    mount(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        
        this.render();
        this.bindEvents();
        this.setupElementManagerListeners();
        this.container.style.display = 'none'; // Hidden initially
    }
    
    render() {
        // Create main panel structure
        const panel = document.createElement('div');
        panel.className = 'properties-panel intersection-properties';
        panel.id = 'intersection-properties-panel';
        panel.style.cssText = `
            width: 320px;
            background: #1a1a23;
            border: 1px solid #2a2a3a;
            border-radius: 8px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
            color: #e8e8ec;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Add header
        const header = this.controlsUI.createPanelHeader();
        panel.appendChild(header);
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'properties-content';
        content.style.cssText = `
            padding: 1.25rem;
            max-height: 70vh;
            overflow-y: auto;
        `;
        
        // Add control type selection
        const controlTypeUI = this.controlsUI.createControlTypeUI();
        content.appendChild(controlTypeUI);
        
        // Create configuration containers (initially hidden)
        const stopConfigContainer = document.createElement('div');
        stopConfigContainer.id = 'stop-config-container';
        stopConfigContainer.style.display = 'block'; // Default to stop signs
        content.appendChild(stopConfigContainer);
        
        const trafficConfigContainer = document.createElement('div');
        trafficConfigContainer.id = 'traffic-config-container';
        trafficConfigContainer.style.display = 'none';
        content.appendChild(trafficConfigContainer);
        
        const yieldConfigContainer = document.createElement('div');
        yieldConfigContainer.id = 'yield-config-container';
        yieldConfigContainer.style.display = 'none';
        content.appendChild(yieldConfigContainer);
        
        panel.appendChild(content);
        
        // Add action buttons
        const actions = this.controlsUI.createActionButtons();
        panel.appendChild(actions);
        
        this.container.innerHTML = '';
        this.container.appendChild(panel);
    }
    
    bindEvents() {
        // Close button
        const closeBtn = this.container.querySelector('#close-properties');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
        
        // Apply/Cancel buttons
        const applyBtn = this.container.querySelector('.apply-btn');
        const cancelBtn = this.container.querySelector('.cancel-btn');
        
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyChanges());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelChanges());
        }
    }
    
    setupComponentCallbacks() {
        // Control type change
        this.controlsUI.onControlTypeChange = (type) => {
            this.setPendingControlType(type);
        };
        
        // Stop sign config change
        this.stopSignConfig.onChange = (positions) => {
            if (this.pendingChanges) {
                this.pendingChanges.stopPositions = positions;
            }
        };
        
        // Traffic light config change
        this.trafficLightConfig.onChange = (timing) => {
            if (this.pendingChanges) {
                this.pendingChanges.trafficLightConfig = { timing };
            }
        };
    }
    
    setupElementManagerListeners() {
        // Listen for intersection selection
        this.elementManager.on('elementSelected', (element) => {
            // Check if it's an intersection
            if (element && element.connectedRoads !== undefined) {
                this.show(element);
            }
        });
        
        // Listen for deselection
        this.elementManager.on('elementDeselected', () => {
            this.hide();
        });
    }
    
    show(intersection) {
        this.currentIntersection = intersection;
        this.isVisible = true;
        
        // Initialize pending changes
        this.pendingChanges = {
            controlType: intersection.controlType || 'stop_sign',
            stopPositions: [...(intersection.stopSignConfig?.positions || [])],
            yieldPositions: [...(intersection.yieldSignConfig?.positions || [])],
            trafficLightConfig: {
                timing: { ...(intersection.trafficLightConfig?.timing || {}) }
            }
        };
        
        // Update UI components
        this.controlsUI.setActiveControlType(this.pendingChanges.controlType);
        this.updateControlConfigurations();
        
        // Show panel
        this.container.style.display = 'block';
    }
    
    hide() {
        this.isVisible = false;
        this.currentIntersection = null;
        this.pendingChanges = null;
        this.container.style.display = 'none';
    }
    
    setPendingControlType(type) {
        if (!this.pendingChanges) return;
        
        this.pendingChanges.controlType = type;
        this.updateControlConfigurations();
    }
    
    updateControlConfigurations() {
        if (!this.currentIntersection || !this.pendingChanges) return;
        
        const connections = this.currentIntersection.connections || [];
        
        // Get config containers
        const stopContainer = this.container.querySelector('#stop-config-container');
        const trafficContainer = this.container.querySelector('#traffic-config-container');
        const yieldContainer = this.container.querySelector('#yield-config-container');
        
        // Clear containers
        if (stopContainer) stopContainer.innerHTML = '';
        if (trafficContainer) trafficContainer.innerHTML = '';
        if (yieldContainer) yieldContainer.innerHTML = '';
        
        // Hide all
        if (stopContainer) stopContainer.style.display = 'none';
        if (trafficContainer) trafficContainer.style.display = 'none';
        if (yieldContainer) yieldContainer.style.display = 'none';
        
        // Show relevant configuration
        switch (this.pendingChanges.controlType) {
            case 'stop_sign':
                if (stopContainer) {
                    stopContainer.style.display = 'block';
                    const stopUI = this.stopSignConfig.createUI(connections, this.pendingChanges.stopPositions);
                    stopContainer.appendChild(stopUI);
                }
                break;
                
            case 'traffic_light':
                if (trafficContainer) {
                    trafficContainer.style.display = 'block';
                    const trafficUI = this.trafficLightConfig.createUI(this.pendingChanges.trafficLightConfig.timing);
                    trafficContainer.appendChild(trafficUI);
                }
                break;
                
            case 'yield':
                if (yieldContainer) {
                    yieldContainer.style.display = 'block';
                    // Create yield configuration UI (similar to stop signs)
                    const yieldUI = this.createYieldUI(connections, this.pendingChanges.yieldPositions);
                    yieldContainer.appendChild(yieldUI);
                }
                break;
        }
    }
    
    createYieldUI(connections, yieldPositions) {
        const container = document.createElement('div');
        container.className = 'property-group';
        
        const label = document.createElement('label');
        label.textContent = 'Yield Sign Placement';
        container.appendChild(label);
        
        const selectorDiv = document.createElement('div');
        selectorDiv.className = 'yield-positions';
        
        const hint = document.createElement('p');
        hint.className = 'hint';
        hint.textContent = 'Click on approaches to toggle yield signs';
        selectorDiv.appendChild(hint);
        
        const diagramContainer = document.createElement('div');
        diagramContainer.className = 'intersection-diagram';
        
        const svg = this.diagramRenderer.createYieldSignDiagram(connections, yieldPositions);
        
        // Add click handlers
        const stopGroups = svg.querySelectorAll('.stop-position');
        stopGroups.forEach(group => {
            group.addEventListener('click', () => {
                const index = parseInt(group.getAttribute('data-index'));
                this.toggleYieldPosition(index);
                
                // Update diagram
                const polygon = group.querySelector('polygon');
                const hasYield = this.pendingChanges.yieldPositions.includes(index);
                polygon.setAttribute('fill', hasYield ? '#ff0000' : '#4a4a5a');
                polygon.setAttribute('stroke', hasYield ? '#ff6666' : '#6a6a7a');
            });
        });
        
        diagramContainer.appendChild(svg);
        selectorDiv.appendChild(diagramContainer);
        container.appendChild(selectorDiv);
        
        return container;
    }
    
    toggleYieldPosition(index) {
        if (!this.pendingChanges) return;
        
        const pos = this.pendingChanges.yieldPositions.indexOf(index);
        if (pos === -1) {
            this.pendingChanges.yieldPositions.push(index);
        } else {
            this.pendingChanges.yieldPositions.splice(pos, 1);
        }
    }
    
    applyChanges() {
        if (!this.currentIntersection || !this.pendingChanges) return;
        
        // Apply changes to intersection
        this.currentIntersection.controlType = this.pendingChanges.controlType;
        
        this.currentIntersection.stopSignConfig = { 
            positions: [...this.pendingChanges.stopPositions] 
        };
        
        this.currentIntersection.yieldSignConfig = { 
            positions: [...this.pendingChanges.yieldPositions] 
        };
        
        this.currentIntersection.trafficLightConfig = { ...this.pendingChanges.trafficLightConfig };
        
        // Notify element manager to update rendering
        this.elementManager.updateElement(this.currentIntersection);
        
        // Hide panel after applying
        setTimeout(() => {
            this.hide();
        }, 100);
    }
    
    cancelChanges() {
        this.hide();
    }
}