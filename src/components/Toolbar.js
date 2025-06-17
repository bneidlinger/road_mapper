import { TOOLS } from '../core/constants.js';

export class Toolbar {
  constructor(containerId, toolManager) {
    this.toolManager = toolManager;
    this.container = document.getElementById(containerId);
    this.buttons = new Map();
    
    if (!this.container) {
      console.error(`Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="toolbar">
        <button data-tool="${TOOLS.SELECT}" class="tool-button active" data-tooltip="Select Tool (V)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
            <path d="M13 13l6 6"/>
          </svg>
        </button>
        <button data-tool="${TOOLS.ROAD}" class="tool-button" data-tooltip="Draw Road (R)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 17L5 7C5 6.44772 5.44772 6 6 6L18 6C18.5523 6 19 6.44772 19 7L19 17C19 17.5523 18.5523 18 18 18L6 18C5.44772 18 5 17.5523 5 17Z"/>
            <path d="M12 9L12 15" stroke-dasharray="3 3"/>
          </svg>
        </button>
        <button data-tool="${TOOLS.INTERSECTION}" class="tool-button" data-tooltip="Place Intersection (I)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="6"/>
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
          </svg>
        </button>
        <button data-tool="${TOOLS.DELETE}" class="tool-button" data-tooltip="Delete Tool (D)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/>
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
          </svg>
        </button>
        <button data-tool="${TOOLS.BUILDING}" class="tool-button" data-tooltip="Building Tool (B)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"/>
            <path d="M5 21V7l8-4v18"/>
            <path d="M19 21V11l-6-4"/>
            <line x1="9" y1="9" x2="9" y2="9.01"/>
            <line x1="9" y1="12" x2="9" y2="12.01"/>
            <line x1="9" y1="15" x2="9" y2="15.01"/>
            <line x1="9" y1="18" x2="9" y2="18.01"/>
          </svg>
        </button>
        <div class="toolbar-separator"></div>
        <button data-tool="${TOOLS.PAN}" class="tool-button" data-tooltip="Pan Tool (Space)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
          </svg>
        </button>
        <div class="toolbar-separator"></div>
        <div class="road-type-selector" id="road-type-selector">
          <label class="toolbar-label">Road Type</label>
          <select id="road-type-select" class="toolbar-select">
            <option value="HIGHWAY">Highway</option>
            <option value="ARTERIAL">Arterial</option>
            <option value="STREET" selected>Street</option>
            <option value="ALLEY">Alley</option>
          </select>
        </div>
      </div>
    `;
    
    this.container.querySelectorAll('.tool-button').forEach(button => {
      this.buttons.set(button.dataset.tool, button);
    });
  }

  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const button = e.target.closest('.tool-button');
      if (button && button.dataset.tool) {
        this.selectTool(button.dataset.tool);
      }
    });
    
    this.toolManager.on('toolChange', (toolName) => {
      this.updateActiveButton(toolName);
    });
    
    // Road type selector
    const roadTypeSelect = document.getElementById('road-type-select');
    if (roadTypeSelect) {
      roadTypeSelect.addEventListener('change', (e) => {
        const roadTool = this.toolManager.tools[TOOLS.ROAD];
        if (roadTool) {
          roadTool.setRoadType(e.target.value);
        }
      });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      switch(e.key.toLowerCase()) {
        case 'v':
          this.selectTool(TOOLS.SELECT);
          break;
        case 'r':
          this.selectTool(TOOLS.ROAD);
          break;
        case 'i':
          this.selectTool(TOOLS.INTERSECTION);
          break;
        case 'd':
          this.selectTool(TOOLS.DELETE);
          break;
        case 'b':
          this.selectTool(TOOLS.BUILDING);
          break;
        case ' ':
          e.preventDefault();
          this.selectTool(TOOLS.PAN);
          break;
      }
    });
  }

  selectTool(toolName) {
    this.toolManager.setActiveTool(toolName);
  }

  updateActiveButton(toolName) {
    this.buttons.forEach((button, tool) => {
      button.classList.toggle('active', tool === toolName);
    });
  }
}