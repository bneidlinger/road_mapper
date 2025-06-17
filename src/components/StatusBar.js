import { PIXELS_PER_METER, ZOOM_LEVELS } from '../core/constants.js';
import { RoadRenderer } from '../modules/rendering/RoadRenderer.js';

export class StatusBar {
  constructor(viewport, toolManager) {
    this.viewport = viewport;
    this.toolManager = toolManager;
    this.container = null;
    this.elements = {};
  }

  mount(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="status-bar">
        <div class="status-item">
          <span class="status-label">Position:</span>
          <span class="status-value" id="cursor-position">0, 0</span>
        </div>
        <div class="status-item">
          <span class="status-label">Zoom:</span>
          <span class="status-value" id="zoom-level">100%</span>
        </div>
        <div class="status-item">
          <span class="status-label">Tool:</span>
          <span class="status-value" id="active-tool">Select</span>
        </div>
        <div class="status-item">
          <span class="status-label">Grid:</span>
          <span class="status-value" id="grid-status">On</span>
        </div>
        <div class="status-item">
          <span class="status-label">View:</span>
          <span class="status-value" id="detail-level">Standard</span>
        </div>
        <div class="status-item" style="margin-left: auto;">
          <span class="status-label">Mode:</span>
          <span class="status-value" id="view-mode">Normal</span>
        </div>
      </div>
    `;
    
    this.elements = {
      cursorPosition: document.getElementById('cursor-position'),
      zoomLevel: document.getElementById('zoom-level'),
      activeTool: document.getElementById('active-tool'),
      gridStatus: document.getElementById('grid-status'),
      detailLevel: document.getElementById('detail-level'),
      viewMode: document.getElementById('view-mode')
    };
  }

  bindEvents() {
    this.toolManager.on('cursorMove', (worldPos) => {
      const x = Math.round(worldPos.x / PIXELS_PER_METER);
      const y = Math.round(worldPos.y / PIXELS_PER_METER);
      this.elements.cursorPosition.textContent = `${x}m, ${y}m`;
    });
    
    this.viewport.on('change', () => {
      const zoomPercent = Math.round(this.viewport.zoom * 100);
      this.elements.zoomLevel.textContent = `${zoomPercent}%`;
      
      // Update detail level indicator
      const detailLevel = RoadRenderer.getDetailLevel(this.viewport.zoom);
      const detailNames = {
        network: 'Network',
        simplified: 'Simplified',
        standard: 'Standard',
        detailed: 'Detailed',
        closeup: 'Close-up'
      };
      this.elements.detailLevel.textContent = detailNames[detailLevel] || detailLevel;
      
      // Update view mode (bird's eye or normal)
      const isBirdsEye = this.viewport.zoom < 0.2;
      this.elements.viewMode.textContent = isBirdsEye ? 'Bird\'s Eye' : 'Normal';
      this.elements.viewMode.style.color = isBirdsEye ? '#00ff88' : '';
    });
    
    this.toolManager.on('toolChange', (toolName) => {
      const toolNames = {
        select: 'Select',
        road: 'Road',
        intersection: 'Intersection',
        delete: 'Delete',
        pan: 'Pan'
      };
      this.elements.activeTool.textContent = toolNames[toolName] || toolName;
    });
  }

  updateGridStatus(enabled) {
    this.elements.gridStatus.textContent = enabled ? 'On' : 'Off';
  }
}