import { EventEmitter } from '../core/EventEmitter.js';
import { ROAD_TYPES } from '../core/constants.js';

export class RoadPropertiesPanel extends EventEmitter {
    constructor() {
        super();
        this.element = null;
        this.currentRoad = null;
        this.createPanel();
    }

    createPanel() {
        this.element = document.createElement('div');
        this.element.className = 'properties-panel road-properties';
        this.element.innerHTML = `
            <div class="properties-header">
                <h3>Road Properties</h3>
                <button class="close-btn" title="Close">×</button>
            </div>
            <div class="properties-content">
                <div class="property-group">
                    <label>Road ID</label>
                    <input type="text" class="road-id" readonly>
                </div>
                
                <div class="property-group">
                    <label>Type</label>
                    <select class="road-type">
                        <option value="STREET">Street</option>
                        <option value="AVENUE">Avenue</option>
                        <option value="HIGHWAY">Highway</option>
                    </select>
                </div>
                
                <div class="property-group">
                    <label>Name</label>
                    <input type="text" class="road-name" placeholder="Enter road name">
                </div>
                
                <div class="property-section">
                    <h4>Name Display</h4>
                    
                    <div class="property-group">
                        <label>
                            <input type="checkbox" class="name-enabled">
                            Show Name
                        </label>
                    </div>
                    
                    <div class="property-group">
                        <label>Font Size</label>
                        <div class="input-group">
                            <input type="range" class="name-font-size" min="10" max="24" value="14" step="1">
                            <span class="font-size-value">14px</span>
                        </div>
                    </div>
                    
                    <div class="property-group">
                        <label>Font Family</label>
                        <select class="name-font-family">
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                            <option value="'Segoe UI', Tahoma, sans-serif">Segoe UI</option>
                            <option value="'Roboto', sans-serif">Roboto</option>
                            <option value="'Inter', sans-serif">Inter</option>
                            <option value="monospace">Monospace</option>
                        </select>
                    </div>
                    
                    <div class="property-group">
                        <label>Font Weight</label>
                        <select class="name-font-weight">
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="lighter">Light</option>
                        </select>
                    </div>
                    
                    <div class="property-group">
                        <label>Color</label>
                        <div class="input-group">
                            <input type="color" class="name-color" value="#ffffff">
                            <input type="text" class="name-color-text" value="#ffffff" pattern="^#[0-9A-Fa-f]{6}$">
                        </div>
                    </div>
                    
                    <div class="property-group">
                        <label>Opacity</label>
                        <div class="input-group">
                            <input type="range" class="name-opacity" min="0" max="1" value="0.8" step="0.1">
                            <span class="opacity-value">80%</span>
                        </div>
                    </div>
                    
                    <div class="property-group">
                        <label>Offset from Road</label>
                        <div class="input-group">
                            <input type="range" class="name-offset" min="10" max="40" value="20" step="2">
                            <span class="offset-value">20px</span>
                        </div>
                    </div>
                </div>
                
                <div class="properties-actions">
                    <button class="btn btn-primary apply-btn">Apply</button>
                    <button class="btn btn-danger delete-btn">Delete Road</button>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        // Close button
        this.element.querySelector('.close-btn').addEventListener('click', () => {
            this.hide();
        });

        // Type change
        this.element.querySelector('.road-type').addEventListener('change', (e) => {
            if (this.currentRoad) {
                this.currentRoad.type = e.target.value;
                this.currentRoad.properties = { ...ROAD_TYPES[e.target.value] };
                this.emit('update-road', { road: this.currentRoad, changes: { type: e.target.value } });
            }
        });

        // Name change
        const nameInput = this.element.querySelector('.road-name');
        nameInput.addEventListener('input', (e) => {
            if (this.currentRoad) {
                this.currentRoad.name = e.target.value;
                // Optional: Live update (can be commented out if performance is an issue)
                // this.emit('update-road', { road: this.currentRoad, changes: { name: e.target.value } });
            }
        });
        
        // Also update on Enter key
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.currentRoad) {
                this.emit('update-road', { 
                    road: this.currentRoad, 
                    changes: {
                        name: this.currentRoad.name,
                        nameDisplay: this.currentRoad.nameDisplay
                    }
                });
            }
        });

        // Name display settings
        this.element.querySelector('.name-enabled').addEventListener('change', (e) => {
            if (this.currentRoad) {
                this.currentRoad.nameDisplay.enabled = e.target.checked;
                // Immediate update when toggling visibility
                this.emit('update-road', { 
                    road: this.currentRoad, 
                    changes: { nameDisplay: this.currentRoad.nameDisplay }
                });
            }
        });

        // Font size
        const fontSizeInput = this.element.querySelector('.name-font-size');
        const fontSizeValue = this.element.querySelector('.font-size-value');
        fontSizeInput.addEventListener('input', (e) => {
            fontSizeValue.textContent = `${e.target.value}px`;
            if (this.currentRoad) {
                this.currentRoad.nameDisplay.fontSize = parseInt(e.target.value);
            }
        });

        // Font family
        this.element.querySelector('.name-font-family').addEventListener('change', (e) => {
            if (this.currentRoad) {
                this.currentRoad.nameDisplay.fontFamily = e.target.value;
            }
        });

        // Font weight
        this.element.querySelector('.name-font-weight').addEventListener('change', (e) => {
            if (this.currentRoad) {
                this.currentRoad.nameDisplay.fontWeight = e.target.value;
            }
        });

        // Color
        const colorInput = this.element.querySelector('.name-color');
        const colorText = this.element.querySelector('.name-color-text');
        
        colorInput.addEventListener('input', (e) => {
            colorText.value = e.target.value;
            if (this.currentRoad) {
                this.currentRoad.nameDisplay.color = e.target.value;
            }
        });
        
        colorText.addEventListener('input', (e) => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                colorInput.value = e.target.value;
                if (this.currentRoad) {
                    this.currentRoad.nameDisplay.color = e.target.value;
                }
            }
        });

        // Opacity
        const opacityInput = this.element.querySelector('.name-opacity');
        const opacityValue = this.element.querySelector('.opacity-value');
        opacityInput.addEventListener('input', (e) => {
            opacityValue.textContent = `${Math.round(e.target.value * 100)}%`;
            if (this.currentRoad) {
                this.currentRoad.nameDisplay.opacity = parseFloat(e.target.value);
            }
        });

        // Offset
        const offsetInput = this.element.querySelector('.name-offset');
        const offsetValue = this.element.querySelector('.offset-value');
        offsetInput.addEventListener('input', (e) => {
            offsetValue.textContent = `${e.target.value}px`;
            if (this.currentRoad) {
                this.currentRoad.nameDisplay.offset = parseInt(e.target.value);
            }
        });

        // Apply button
        this.element.querySelector('.apply-btn').addEventListener('click', () => {
            if (this.currentRoad) {
                this.emit('update-road', { 
                    road: this.currentRoad, 
                    changes: {
                        name: this.currentRoad.name,
                        nameDisplay: this.currentRoad.nameDisplay
                    }
                });
            }
        });

        // Delete button
        this.element.querySelector('.delete-btn').addEventListener('click', () => {
            if (this.currentRoad && confirm('Are you sure you want to delete this road?')) {
                this.emit('delete-road', this.currentRoad);
                this.hide();
            }
        });
    }

    show(road) {
        this.currentRoad = road;
        this.updateUI();
        this.element.classList.add('visible');
    }

    hide() {
        this.element.classList.remove('visible');
        this.currentRoad = null;
    }

    updateUI() {
        if (!this.currentRoad) return;

        // Update all form fields
        this.element.querySelector('.road-id').value = this.currentRoad.id;
        this.element.querySelector('.road-type').value = this.currentRoad.type;
        this.element.querySelector('.road-name').value = this.currentRoad.name || '';
        
        // Name display settings
        const nd = this.currentRoad.nameDisplay;
        this.element.querySelector('.name-enabled').checked = nd.enabled;
        this.element.querySelector('.name-font-size').value = nd.fontSize;
        this.element.querySelector('.font-size-value').textContent = `${nd.fontSize}px`;
        this.element.querySelector('.name-font-family').value = nd.fontFamily;
        this.element.querySelector('.name-font-weight').value = nd.fontWeight;
        this.element.querySelector('.name-color').value = nd.color;
        this.element.querySelector('.name-color-text').value = nd.color;
        this.element.querySelector('.name-opacity').value = nd.opacity;
        this.element.querySelector('.opacity-value').textContent = `${Math.round(nd.opacity * 100)}%`;
        this.element.querySelector('.name-offset').value = nd.offset;
        this.element.querySelector('.offset-value').textContent = `${nd.offset}px`;
    }
    
    getElement() {
        return this.element;
    }
}