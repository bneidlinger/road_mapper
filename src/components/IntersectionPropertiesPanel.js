export class IntersectionPropertiesPanel {
  constructor(elementManager) {
    this.elementManager = elementManager;
    this.container = null;
    this.currentIntersection = null;
    this.isVisible = false;
  }

  mount(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container ${containerId} not found`);
      return;
    }
    
    console.log('IntersectionPropertiesPanel: Mounted to container', containerId);
    console.log('Container before render:', this.container);
    this.render();
    console.log('Container after render:', this.container.innerHTML.substring(0, 200) + '...');
    this.bindEvents();
    // Don't hide initially - let it be controlled by selection events
    // this.hide();
    this.container.style.display = 'none'; // Just hide it without clearing content
  }

  render() {
    console.log('IntersectionPropertiesPanel: Rendering HTML content');
    this.container.innerHTML = `
      <div class="properties-panel intersection-properties" id="intersection-properties-panel" style="
        width: 320px;
        background: #1a1a23;
        border: 1px solid #2a2a3a;
        border-radius: 8px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        color: #e8e8ec;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div class="properties-header" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #2a2a3a;
        ">
          <h3 style="margin: 0; font-size: 1rem; font-weight: 500;">Intersection Properties</h3>
          <button class="close-button" id="close-properties" style="
            background: none;
            border: none;
            color: #a0a0b8;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
          ">×</button>
        </div>
        <div class="properties-content" style="
          padding: 1.25rem;
          max-height: 70vh;
          overflow-y: auto;
        ">
          <div class="property-group">
            <label>Control Type</label>
            <div class="control-type-buttons">
              <button class="control-type-btn" data-type="none" title="No control">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              </button>
              <button class="control-type-btn active" data-type="stop_sign" title="Stop sign">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/>
                  <text x="12" y="16" text-anchor="middle" font-size="10" fill="currentColor">STOP</text>
                </svg>
              </button>
              <button class="control-type-btn" data-type="traffic_light" title="Traffic light">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="8" y="2" width="8" height="20" rx="1"/>
                  <circle cx="12" cy="7" r="2" fill="#ff4444"/>
                  <circle cx="12" cy="12" r="2" fill="#ffaa00"/>
                  <circle cx="12" cy="17" r="2" fill="#44ff44"/>
                </svg>
              </button>
              <button class="control-type-btn" data-type="yield" title="Yield sign">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12,4 22,20 2,20"/>
                  <text x="12" y="17" text-anchor="middle" font-size="8" fill="currentColor">YIELD</text>
                </svg>
              </button>
            </div>
          </div>

          <div class="property-group" id="stop-sign-config">
            <label>Stop Sign Configuration</label>
            <div class="stop-sign-options">
              <label class="radio-option">
                <input type="radio" name="stop-count" value="2">
                <span>2-way stop</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="stop-count" value="3">
                <span>3-way stop</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="stop-count" value="4" checked>
                <span>4-way stop</span>
              </label>
            </div>
            <div id="stop-position-selector" class="stop-positions">
              <p class="hint">Click on approaches to toggle stop signs</p>
              <div class="intersection-diagram">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <!-- Will be populated dynamically -->
                </svg>
              </div>
            </div>
          </div>

          <div class="property-group" id="traffic-light-config" style="display: none;">
            <label>Traffic Light Configuration</label>
            <div class="traffic-light-options">
              <label>Timing Mode</label>
              <select id="traffic-timing">
                <option value="standard">Standard</option>
                <option value="rush_hour">Rush Hour Adaptive</option>
                <option value="sensor">Sensor Controlled</option>
              </select>
              
              <label>Cycle Time (seconds)</label>
              <input type="number" id="traffic-cycle" min="30" max="180" value="60" step="5">
            </div>
          </div>

          <div class="property-group">
            <label>Intersection ID</label>
            <input type="text" id="intersection-id" readonly>
          </div>

          <div class="property-group">
            <label>Connected Roads</label>
            <div id="connected-roads-list" class="connected-roads">
              <!-- Will be populated dynamically -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Close button
    const closeBtn = this.container.querySelector('#close-properties');
    closeBtn.addEventListener('click', () => this.hide());

    // Control type buttons
    this.container.querySelectorAll('.control-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = btn.dataset.type;
        this.setControlType(type);
      });
    });

    // Stop sign configuration
    this.container.querySelectorAll('input[name="stop-count"]').forEach(input => {
      input.addEventListener('change', (e) => {
        if (this.currentIntersection) {
          this.currentIntersection.stopSignConfig.count = parseInt(e.target.value);
          this.updateStopPositionSelector();
          this.elementManager.emit('elementUpdated', this.currentIntersection);
        }
      });
    });

    // Traffic light configuration
    const timingSelect = this.container.querySelector('#traffic-timing');
    const cycleInput = this.container.querySelector('#traffic-cycle');
    
    timingSelect.addEventListener('change', (e) => {
      if (this.currentIntersection) {
        this.currentIntersection.trafficLightConfig.timing = e.target.value;
        this.elementManager.emit('elementUpdated', this.currentIntersection);
      }
    });

    cycleInput.addEventListener('change', (e) => {
      if (this.currentIntersection) {
        this.currentIntersection.trafficLightConfig.cycle = parseInt(e.target.value);
        this.elementManager.emit('elementUpdated', this.currentIntersection);
      }
    });

    // Listen for selection events
    this.elementManager.on('elementSelected', (element) => {
      console.log('IntersectionPropertiesPanel: elementSelected event received', element);
      if (element && element.connectedRoads !== undefined) {
        // It's an intersection
        console.log('IntersectionPropertiesPanel: Showing for intersection', element.id);
        this.showForIntersection(element);
      } else {
        this.hide();
      }
    });

    this.elementManager.on('elementDeselected', () => {
      console.log('IntersectionPropertiesPanel: elementDeselected event received');
      this.hide();
    });
  }

  setControlType(type) {
    if (!this.currentIntersection) return;

    this.currentIntersection.controlType = type;
    
    // Update UI
    this.container.querySelectorAll('.control-type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Show/hide relevant config sections
    const stopConfig = this.container.querySelector('#stop-sign-config');
    const trafficConfig = this.container.querySelector('#traffic-light-config');
    
    stopConfig.style.display = type === 'stop_sign' ? 'block' : 'none';
    trafficConfig.style.display = type === 'traffic_light' ? 'block' : 'none';

    if (type === 'stop_sign') {
      this.updateStopPositionSelector();
    }

    this.elementManager.emit('elementUpdated', this.currentIntersection);
  }

  updateStopPositionSelector() {
    const svg = this.container.querySelector('.intersection-diagram svg');
    const connections = this.getConnectionAngles();
    
    svg.innerHTML = '';
    
    // Draw intersection center
    const center = { x: 60, y: 60 };
    const intersectionCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    intersectionCircle.setAttribute('cx', center.x);
    intersectionCircle.setAttribute('cy', center.y);
    intersectionCircle.setAttribute('r', '20');
    intersectionCircle.setAttribute('fill', '#666');
    intersectionCircle.setAttribute('stroke', '#333');
    intersectionCircle.setAttribute('stroke-width', '2');
    svg.appendChild(intersectionCircle);

    // Draw approach roads and stop sign positions
    connections.forEach((conn, index) => {
      const angle = conn.angle;
      const distance = 40;
      
      // Draw road approach
      const roadPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const startX = center.x + Math.cos(angle) * 20;
      const startY = center.y + Math.sin(angle) * 20;
      const endX = center.x + Math.cos(angle) * 55;
      const endY = center.y + Math.sin(angle) * 55;
      
      roadPath.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
      roadPath.setAttribute('stroke', '#999');
      roadPath.setAttribute('stroke-width', '10');
      roadPath.setAttribute('stroke-linecap', 'round');
      svg.appendChild(roadPath);

      // Draw stop sign position indicator
      const stopX = center.x + Math.cos(angle) * distance;
      const stopY = center.y + Math.sin(angle) * distance;
      
      const stopGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      stopGroup.setAttribute('class', 'stop-position');
      stopGroup.setAttribute('data-index', index);
      stopGroup.style.cursor = 'pointer';

      const stopCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      stopCircle.setAttribute('cx', stopX);
      stopCircle.setAttribute('cy', stopY);
      stopCircle.setAttribute('r', '8');
      
      const hasStopSign = this.currentIntersection.stopSignConfig.positions.includes(index);
      stopCircle.setAttribute('fill', hasStopSign ? '#ff4444' : '#333');
      stopCircle.setAttribute('stroke', '#fff');
      stopCircle.setAttribute('stroke-width', '2');
      
      stopGroup.appendChild(stopCircle);
      
      // Add click handler
      stopGroup.addEventListener('click', () => {
        this.toggleStopPosition(index);
      });
      
      svg.appendChild(stopGroup);
    });
  }

  toggleStopPosition(index) {
    if (!this.currentIntersection) return;
    
    const positions = this.currentIntersection.stopSignConfig.positions;
    const idx = positions.indexOf(index);
    
    if (idx >= 0) {
      positions.splice(idx, 1);
    } else {
      positions.push(index);
    }
    
    this.updateStopPositionSelector();
    this.elementManager.emit('elementUpdated', this.currentIntersection);
  }

  getConnectionAngles() {
    if (!this.currentIntersection) return [];
    
    // Get actual road angles from connected roads
    const connections = [];
    const roads = this.elementManager.getRoads();
    
    for (const conn of this.currentIntersection.connectedRoads) {
      const road = roads.find(r => r.id === conn.roadId);
      if (road) {
        const angles = this.getRoadAnglesAtIntersection(road, this.currentIntersection);
        for (const angle of angles) {
          connections.push({ angle, roadId: conn.roadId });
        }
      }
    }
    return connections;
  }

  getRoadAnglesAtIntersection(road, intersection) {
    const angles = [];
    const tolerance = 10;
    
    const firstPoint = road.points[0];
    const lastPoint = road.points[road.points.length - 1];
    
    const distToFirst = Math.hypot(firstPoint.x - intersection.x, firstPoint.y - intersection.y);
    const distToLast = Math.hypot(lastPoint.x - intersection.x, lastPoint.y - intersection.y);
    
    if (distToFirst < tolerance && road.points.length > 1) {
      const nextPoint = road.points[1];
      angles.push(Math.atan2(nextPoint.y - intersection.y, nextPoint.x - intersection.x));
    }
    
    if (distToLast < tolerance && road.points.length > 1) {
      const prevPoint = road.points[road.points.length - 2];
      angles.push(Math.atan2(prevPoint.y - intersection.y, prevPoint.x - intersection.x));
    }
    
    // Check if road passes through intersection
    if (distToFirst >= tolerance && distToLast >= tolerance) {
      for (let i = 0; i < road.points.length - 1; i++) {
        const p1 = road.points[i];
        const p2 = road.points[i + 1];
        
        const segmentLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const dist1 = Math.hypot(intersection.x - p1.x, intersection.y - p1.y);
        const dist2 = Math.hypot(intersection.x - p2.x, intersection.y - p2.y);
        
        if (Math.abs(dist1 + dist2 - segmentLength) < 1) {
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          angles.push(angle);
          angles.push(angle + Math.PI);
          break;
        }
      }
    }
    
    return angles;
  }

  showForIntersection(intersection) {
    console.log('IntersectionPropertiesPanel: showForIntersection called', intersection);
    this.currentIntersection = intersection;
    this.isVisible = true;
    
    // First check if we have rendered content
    console.log('Container innerHTML length:', this.container.innerHTML.length);
    console.log('Container childNodes:', this.container.childNodes.length);
    
    // If no content, render it
    if (this.container.childNodes.length === 0) {
      console.log('No content in container, rendering now');
      this.render();
      this.bindEvents();
    }
    
    // Apply styles directly to container
    this.container.style.display = 'block';
    this.container.style.position = 'fixed';
    this.container.style.right = '20px';
    this.container.style.top = '100px';
    this.container.style.zIndex = '10000';
    
    console.log('IntersectionPropertiesPanel: container display set to block');
    
    // Debug: Check if container and panel are in DOM
    const panel = this.container.querySelector('.properties-panel');
    console.log('Container element:', this.container);
    console.log('Container id:', this.container.id);
    console.log('Container display:', window.getComputedStyle(this.container).display);
    console.log('Panel element:', panel);
    if (panel) {
      const panelStyle = window.getComputedStyle(panel);
      const rect = panel.getBoundingClientRect();
      console.log('Panel display:', panelStyle.display);
      console.log('Panel position:', panelStyle.position);
      console.log('Panel z-index:', panelStyle.zIndex);
      console.log('Panel dimensions:', rect.width + 'x' + rect.height);
      console.log('Panel position rect:', {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left
      });
      console.log('Panel visibility:', panelStyle.visibility);
      console.log('Panel opacity:', panelStyle.opacity);
    }
    
    // Update UI with intersection data
    this.container.querySelector('#intersection-id').value = intersection.id;
    
    // Set control type
    this.setControlType(intersection.controlType);
    
    // Set stop sign config
    const stopCountInput = this.container.querySelector(`input[name="stop-count"][value="${intersection.stopSignConfig.count}"]`);
    if (stopCountInput) {
      stopCountInput.checked = true;
    }
    
    // Set traffic light config
    this.container.querySelector('#traffic-timing').value = intersection.trafficLightConfig.timing;
    this.container.querySelector('#traffic-cycle').value = intersection.trafficLightConfig.cycle;
    
    // Update connected roads list
    this.updateConnectedRoadsList();
    
    // Update stop position selector if needed
    if (intersection.controlType === 'stop_sign') {
      this.updateStopPositionSelector();
    }
  }

  updateConnectedRoadsList() {
    const listContainer = this.container.querySelector('#connected-roads-list');
    const roads = this.elementManager.getRoads();
    
    listContainer.innerHTML = '';
    
    this.currentIntersection.connectedRoads.forEach(conn => {
      const road = roads.find(r => r.id === conn.roadId);
      if (road) {
        const item = document.createElement('div');
        item.className = 'connected-road-item';
        item.textContent = `${road.type} - ${road.id}`;
        listContainer.appendChild(item);
      }
    });
  }

  hide() {
    this.isVisible = false;
    this.container.style.display = 'none';
    this.currentIntersection = null;
  }
  
  // Temporary method to force show the panel
  forceShow() {
    console.log('ForceShow called');
    console.log('Container:', this.container);
    console.log('Container innerHTML:', this.container.innerHTML ? 'Has content' : 'Empty');
    
    // Re-render to be sure
    this.render();
    
    this.container.style.display = 'block';
    this.container.style.position = 'fixed';
    this.container.style.top = '100px';
    this.container.style.right = '20px';
    this.container.style.zIndex = '99999';
    this.container.style.width = '320px';
    this.container.style.minHeight = '500px';
    this.container.style.background = 'white';
    this.container.style.border = '5px solid red';
    console.log('Force showing panel');
    
    // Log the actual panel
    const panel = this.container.querySelector('.properties-panel');
    console.log('Inner panel found:', panel ? 'Yes' : 'No');
    if (panel) {
      console.log('Panel display:', window.getComputedStyle(panel).display);
    }
  }
}