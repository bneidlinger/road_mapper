export class IntersectionPropertiesPanel {
  constructor(elementManager) {
    this.elementManager = elementManager;
    this.container = null;
    this.currentIntersection = null;
    this.isVisible = false;
    this.pendingChanges = null;
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
    this.setupElementManagerListeners();
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
            <label>Stop Sign Placement</label>
            <div id="stop-position-selector" class="stop-positions">
              <p class="hint">Click on approaches to toggle stop signs</p>
              <div class="intersection-diagram">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <!-- Will be populated dynamically -->
                </svg>
              </div>
            </div>
          </div>

          <div class="property-group" id="yield-sign-config" style="display: none;">
            <label>Yield Sign Placement</label>
            <div id="yield-position-selector" class="yield-positions">
              <p class="hint">Click on approaches to toggle yield signs</p>
              <div class="intersection-diagram">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <!-- Will be populated dynamically -->
                </svg>
              </div>
            </div>
          </div>

          <div class="property-group" id="traffic-light-config" style="display: none;">
            <label>Traffic Light Configuration</label>
            <div class="traffic-light-settings">
              <p class="hint">Traffic lights automatically coordinate opposite directions</p>
              <div class="timing-controls" style="margin-top: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <label style="flex: 1;">Green Time:</label>
                  <input type="number" id="green-time" value="15" min="5" max="60" style="width: 60px;">
                  <span style="color: #888;">seconds</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <label style="flex: 1;">Yellow Time:</label>
                  <input type="number" id="yellow-time" value="3" min="2" max="5" style="width: 60px;">
                  <span style="color: #888;">seconds</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <label style="flex: 1;">Red Time:</label>
                  <input type="number" id="red-time" value="12" min="5" max="60" style="width: 60px;">
                  <span style="color: #888;">seconds</span>
                </div>
              </div>
              <div class="cycle-info" style="margin-top: 1rem; padding: 0.75rem; background: #1a1a23; border-radius: 4px;">
                <p style="margin: 0; color: #888; font-size: 0.875rem;">
                  Total cycle time: <span id="total-cycle-time" style="color: #00d4ff;">30</span> seconds
                </p>
              </div>
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
        
        <div class="properties-footer" style="
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid #2a2a3a;
          background: #1a1a23;
        ">
          <button class="btn btn-primary" id="apply-changes" style="
            flex: 1;
            background: #00d4ff;
            color: #0f0f14;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          ">Apply</button>
          <button class="btn btn-secondary" id="cancel-changes" style="
            flex: 1;
            background: #2a2a3a;
            color: #e8e8ec;
            border: 1px solid #3a3a4a;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">Cancel</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Close button
    const closeBtn = this.container.querySelector('#close-properties');
    closeBtn.addEventListener('click', () => this.hide());

    // Apply button
    const applyBtn = this.container.querySelector('#apply-changes');
    applyBtn.addEventListener('click', () => this.applyChanges());

    // Cancel button
    const cancelBtn = this.container.querySelector('#cancel-changes');
    cancelBtn.addEventListener('click', () => this.cancelChanges());

    // Control type buttons
    this.container.querySelectorAll('.control-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = btn.dataset.type;
        this.setPendingControlType(type);
      });
    });

    // No longer need stop-count radio buttons

    // Traffic light timing configuration
    const greenTime = this.container.querySelector('#green-time');
    const yellowTime = this.container.querySelector('#yellow-time');
    const redTime = this.container.querySelector('#red-time');
    const totalCycleTime = this.container.querySelector('#total-cycle-time');
    
    const updateCycleTime = () => {
      if (this.pendingChanges && greenTime && yellowTime && redTime && totalCycleTime) {
        const green = parseInt(greenTime.value) || 15;
        const yellow = parseInt(yellowTime.value) || 3;
        const red = parseInt(redTime.value) || 12;
        
        this.pendingChanges.trafficLightConfig.greenTime = green;
        this.pendingChanges.trafficLightConfig.yellowTime = yellow;
        this.pendingChanges.trafficLightConfig.redTime = red;
        
        const total = green + yellow + red;
        totalCycleTime.textContent = total;
      }
    };
    
    if (greenTime) greenTime.addEventListener('input', updateCycleTime);
    if (yellowTime) yellowTime.addEventListener('input', updateCycleTime);
    if (redTime) redTime.addEventListener('input', updateCycleTime);
  }
  
  setupElementManagerListeners() {
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

  applyChanges() {
    if (!this.pendingChanges || !this.currentIntersection) return;
    
    console.log('Applying changes:', this.pendingChanges);
    
    // Apply all pending changes to the actual intersection
    this.currentIntersection.controlType = this.pendingChanges.controlType;
    this.currentIntersection.stopSignConfig = { 
      count: this.pendingChanges.stopSignConfig.count,
      positions: [...this.pendingChanges.stopSignConfig.positions]
    };
    this.currentIntersection.yieldSignConfig = { 
      positions: [...this.pendingChanges.yieldSignConfig.positions]
    };
    this.currentIntersection.trafficLightConfig = { ...this.pendingChanges.trafficLightConfig };
    
    console.log('Updated intersection:', this.currentIntersection);
    
    // Store reference before hiding (which clears currentIntersection)
    const intersectionToUpdate = this.currentIntersection;
    
    // Close the panel first
    this.hide();
    
    // Emit update event after a small delay to ensure DOM updates
    setTimeout(() => {
      this.elementManager.emit('elementUpdated', intersectionToUpdate);
    }, 10);
  }
  
  cancelChanges() {
    // Discard pending changes and close
    this.hide();
  }

  setPendingControlType(type) {
    if (!this.pendingChanges) return;

    this.pendingChanges.controlType = type;
    
    // Update UI
    this.container.querySelectorAll('.control-type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Show/hide relevant config sections
    const stopConfig = this.container.querySelector('#stop-sign-config');
    const yieldConfig = this.container.querySelector('#yield-sign-config');
    const trafficConfig = this.container.querySelector('#traffic-light-config');
    
    stopConfig.style.display = type === 'stop_sign' ? 'block' : 'none';
    yieldConfig.style.display = type === 'yield' ? 'block' : 'none';
    trafficConfig.style.display = type === 'traffic_light' ? 'block' : 'none';

    if (type === 'stop_sign') {
      this.updateStopPositionSelector();
    } else if (type === 'yield') {
      this.updateYieldPositionSelector();
    }
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
      
      const hasStopSign = this.pendingChanges.stopSignConfig.positions.includes(index);
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
    if (!this.pendingChanges) return;
    
    const positions = this.pendingChanges.stopSignConfig.positions;
    const idx = positions.indexOf(index);
    
    if (idx >= 0) {
      positions.splice(idx, 1);
    } else {
      positions.push(index);
    }
    
    this.updateStopPositionSelector();
  }

  updateYieldPositionSelector() {
    const svg = this.container.querySelector('#yield-position-selector svg');
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

    // Draw approach roads and yield sign positions
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

      // Draw yield sign position indicator
      const yieldX = center.x + Math.cos(angle) * distance;
      const yieldY = center.y + Math.sin(angle) * distance;
      
      const yieldGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      yieldGroup.setAttribute('class', 'yield-position');
      yieldGroup.setAttribute('data-index', index);
      yieldGroup.style.cursor = 'pointer';

      // Draw triangle for yield sign
      const triangleSize = 8;
      const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const points = `${yieldX},${yieldY - triangleSize} ${yieldX - triangleSize * 0.866},${yieldY + triangleSize * 0.5} ${yieldX + triangleSize * 0.866},${yieldY + triangleSize * 0.5}`;
      triangle.setAttribute('points', points);
      
      const hasYieldSign = this.pendingChanges.yieldSignConfig && this.pendingChanges.yieldSignConfig.positions.includes(index);
      triangle.setAttribute('fill', hasYieldSign ? '#ff4444' : '#333');
      triangle.setAttribute('stroke', '#fff');
      triangle.setAttribute('stroke-width', '2');
      
      yieldGroup.appendChild(triangle);
      
      // Add click handler
      yieldGroup.addEventListener('click', () => {
        this.toggleYieldPosition(index);
      });
      
      svg.appendChild(yieldGroup);
    });
  }

  toggleYieldPosition(index) {
    if (!this.pendingChanges) return;
    
    // Initialize yield config if not present
    if (!this.pendingChanges.yieldSignConfig) {
      this.pendingChanges.yieldSignConfig = { positions: [] };
    }
    
    const positions = this.pendingChanges.yieldSignConfig.positions;
    const idx = positions.indexOf(index);
    
    if (idx >= 0) {
      positions.splice(idx, 1);
    } else {
      positions.push(index);
    }
    
    this.updateYieldPositionSelector();
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
    
    // Create a copy of the intersection's properties for pending changes
    this.pendingChanges = {
      controlType: intersection.controlType,
      stopSignConfig: { 
        count: intersection.stopSignConfig.count,
        positions: [...intersection.stopSignConfig.positions] 
      },
      yieldSignConfig: intersection.yieldSignConfig ? 
        { positions: [...intersection.yieldSignConfig.positions] } : 
        { positions: [] },
      trafficLightConfig: { ...intersection.trafficLightConfig }
    };
    
    // First check if we have rendered content
    console.log('Container innerHTML length:', this.container.innerHTML.length);
    console.log('Container childNodes:', this.container.childNodes.length);
    
    // Find the panel element
    const panel = this.container.querySelector('.intersection-properties');
    
    if (!panel) {
      console.log('No panel found, skipping display');
      return;
    }
    
    // Show the container
    this.container.style.display = 'block';
    
    // Force the panel to be visible by adding inline styles
    panel.style.display = 'block';
    panel.style.position = 'fixed';
    panel.style.right = '20px';
    panel.style.top = '100px';
    panel.style.zIndex = '10000';
    
    console.log('IntersectionPropertiesPanel: container display set to block');
    console.log('Panel computed style display:', window.getComputedStyle(panel).display);
    console.log('Panel offsetHeight:', panel.offsetHeight);
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
    
    // No longer need to set stop count radio buttons
    
    // Set traffic light config
    const greenTimeInput = this.container.querySelector('#green-time');
    const yellowTimeInput = this.container.querySelector('#yellow-time');
    const redTimeInput = this.container.querySelector('#red-time');
    const totalCycleTimeSpan = this.container.querySelector('#total-cycle-time');
    
    if (greenTimeInput && intersection.trafficLightConfig) {
      greenTimeInput.value = intersection.trafficLightConfig.greenTime || 15;
      yellowTimeInput.value = intersection.trafficLightConfig.yellowTime || 3;
      redTimeInput.value = intersection.trafficLightConfig.redTime || 12;
      
      const total = (intersection.trafficLightConfig.greenTime || 15) + 
                    (intersection.trafficLightConfig.yellowTime || 3) + 
                    (intersection.trafficLightConfig.redTime || 12);
      totalCycleTimeSpan.textContent = total;
    }
    
    // Update connected roads list
    this.updateConnectedRoadsList();
    
    // Update position selectors if needed
    if (intersection.controlType === 'stop_sign') {
      this.updateStopPositionSelector();
    } else if (intersection.controlType === 'yield') {
      this.updateYieldPositionSelector();
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
    this.pendingChanges = null;
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