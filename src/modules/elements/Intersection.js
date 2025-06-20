import { ZOOM_LEVELS, ROAD_COLORS } from '../../core/constants.js';

export class Intersection {
  constructor(id, x, y, connectedRoads = []) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.connectedRoads = connectedRoads;
    this.radius = 25; // Increased for easier selection
    this.selected = false;
    this.type = 'standard'; // standard, roundabout, traffic_light
    this.controlType = 'none'; // 'none', 'stop_sign', 'traffic_light', 'yield'
    this.stopSignConfig = {
      count: 4, // number of stop signs (2, 3, or 4 way)
      positions: [] // which approaches have stop signs
    };
    this.yieldSignConfig = {
      positions: [] // which approaches have yield signs
    };
    this.trafficLightConfig = {
      timing: 'standard', // 'standard', 'rush_hour', 'sensor'
      cycle: 60 // seconds
    };
  }

  addConnection(roadId, point) {
    if (!this.connectedRoads.find(conn => conn.roadId === roadId)) {
      this.connectedRoads.push({ roadId, point });
    }
  }

  removeConnection(roadId) {
    this.connectedRoads = this.connectedRoads.filter(conn => conn.roadId !== roadId);
  }

  draw(ctx, viewport) {
    const screenPos = viewport.worldToScreen(this.x, this.y);
    const zoom = viewport.zoom;
    
    ctx.save();
    
    // Adjust rendering based on zoom level
    if (zoom < ZOOM_LEVELS.SIMPLIFIED) {
      // Network/simplified view - simple circle
      ctx.fillStyle = ROAD_COLORS.asphalt;
      const simpleRadius = Math.max(3, this.radius * zoom * 0.5);
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, simpleRadius, 0, Math.PI * 2);
      ctx.fill();
    } else if (zoom < ZOOM_LEVELS.DETAILED) {
      // Standard view - basic intersection
      ctx.fillStyle = ROAD_COLORS.asphalt;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, this.radius * zoom, 0, Math.PI * 2);
      ctx.fill();
      
      // Add simple markings
      if (zoom >= ZOOM_LEVELS.STANDARD) {
        ctx.strokeStyle = ROAD_COLORS.laneMarking;
        ctx.lineWidth = 1 * zoom;
        const dashSize = 2 * zoom;
        ctx.setLineDash([dashSize, dashSize]);
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, this.radius * zoom * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else {
      // Detailed/closeup view - full detail
      // Draw curb
      ctx.fillStyle = ROAD_COLORS.curb;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, (this.radius + 2) * zoom, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw asphalt
      ctx.fillStyle = ROAD_COLORS.asphalt;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, this.radius * zoom, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw crosswalk markings
      if (this.type === 'standard' || this.type === 'traffic_light') {
        ctx.save();
        ctx.strokeStyle = ROAD_COLORS.crosswalk;
        ctx.lineWidth = 2 * zoom;
        ctx.globalAlpha = 0.8;
        
        // Draw crosswalk stripes
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
          const startRadius = (this.radius + 5) * zoom;
          const endRadius = (this.radius + 15) * zoom;
          const startX = screenPos.x + Math.cos(angle) * startRadius;
          const startY = screenPos.y + Math.sin(angle) * startRadius;
          const endX = screenPos.x + Math.cos(angle) * endRadius;
          const endY = screenPos.y + Math.sin(angle) * endRadius;
          
          const dashLength = 3 * zoom;
          const gapLength = 2 * zoom;
          ctx.setLineDash([dashLength, gapLength]);
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    
    if (this.selected) {
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3 * zoom;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, (this.radius + 5) * zoom, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  hitTest(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }

  getBounds() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2
    };
  }

  toJSON() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      type: this.type,
      controlType: this.controlType,
      stopSignConfig: this.stopSignConfig,
      yieldSignConfig: this.yieldSignConfig,
      trafficLightConfig: this.trafficLightConfig,
      connectedRoads: this.connectedRoads
    };
  }

  static fromJSON(data) {
    const intersection = new Intersection(data.id, data.x, data.y, data.connectedRoads);
    intersection.type = data.type || 'standard';
    intersection.controlType = data.controlType || 'stop_sign';
    intersection.stopSignConfig = data.stopSignConfig || {
      count: 4,
      positions: []
    };
    intersection.yieldSignConfig = data.yieldSignConfig || {
      positions: []
    };
    intersection.trafficLightConfig = data.trafficLightConfig || {
      timing: 'standard',
      cycle: 60
    };
    return intersection;
  }
}