import { ZOOM_LEVELS, ROAD_COLORS } from '../../core/constants.js';

export class RoadRenderer {
  static getDetailLevel(zoom) {
    if (zoom < ZOOM_LEVELS.NETWORK) return 'network';
    if (zoom < ZOOM_LEVELS.SIMPLIFIED) return 'simplified';
    if (zoom < ZOOM_LEVELS.STANDARD) return 'standard';
    if (zoom < ZOOM_LEVELS.DETAILED) return 'detailed';
    return 'closeup';
  }

  static drawRoad(ctx, road, viewport) {
    const detailLevel = this.getDetailLevel(viewport.zoom);
    
    switch (detailLevel) {
      case 'network':
        this.drawNetworkLevel(ctx, road, viewport);
        break;
      case 'simplified':
        this.drawSimplifiedLevel(ctx, road, viewport);
        break;
      case 'standard':
        this.drawStandardLevel(ctx, road, viewport);
        break;
      case 'detailed':
        this.drawDetailedLevel(ctx, road, viewport);
        break;
      case 'closeup':
        this.drawCloseupLevel(ctx, road, viewport);
        break;
    }
  }

  static drawNetworkLevel(ctx, road, viewport) {
    // Simple line representation for network view
    ctx.save();
    
    // Scale width to screen space but keep minimum visible
    const screenWidth = Math.max(1, road.properties.width * viewport.zoom * 0.3);
    ctx.strokeStyle = road.properties.color;
    ctx.lineWidth = screenWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (road.selected) {
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 10;
    }
    
    this.drawPath(ctx, road.points, viewport);
    ctx.stroke();
    
    ctx.restore();
  }

  static drawSimplifiedLevel(ctx, road, viewport) {
    // Basic road shape with proper width
    ctx.save();
    
    ctx.strokeStyle = ROAD_COLORS.asphalt;
    ctx.lineWidth = road.properties.width * viewport.zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (road.selected) {
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 15;
    }
    
    this.drawPath(ctx, road.points, viewport);
    ctx.stroke();
    
    ctx.restore();
  }

  static drawStandardLevel(ctx, road, viewport) {
    // Road with lane markings
    ctx.save();
    
    // Draw road base (scale to screen space)
    ctx.strokeStyle = ROAD_COLORS.asphalt;
    ctx.lineWidth = road.properties.width * viewport.zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (road.selected) {
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;
    }
    
    this.drawPath(ctx, road.points, viewport);
    ctx.stroke();
    
    // Draw lane markings (scale line width to screen space)
    if (road.properties.lanes > 1) {
      ctx.strokeStyle = ROAD_COLORS.laneMarking;
      ctx.lineWidth = 0.1 * viewport.zoom;
      const dashLength = 5 * viewport.zoom;
      ctx.setLineDash([dashLength, dashLength]);
      
      const laneCount = road.properties.lanes;
      for (let i = 1; i < laneCount; i++) {
        const offset = (i - laneCount / 2) * road.properties.laneWidth;
        this.drawOffsetPath(ctx, road.points, viewport, offset);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
    }
    
    // Draw center line
    if (road.properties.lanes > 1) {
      ctx.strokeStyle = ROAD_COLORS.laneMarkingYellow;
      ctx.lineWidth = 0.15 * viewport.zoom;
      const centerDashLength = 10 * viewport.zoom;
      ctx.setLineDash([centerDashLength, centerDashLength]);
      this.drawPath(ctx, road.points, viewport);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  }

  static drawDetailedLevel(ctx, road, viewport) {
    // Road with sidewalks, curbs, and detailed markings
    ctx.save();
    
    const totalWidth = road.properties.width + road.properties.sidewalkWidth * 2;
    
    // Draw sidewalks (scale to screen space)
    ctx.strokeStyle = ROAD_COLORS.sidewalk;
    ctx.lineWidth = totalWidth * viewport.zoom;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.drawPath(ctx, road.points, viewport);
    ctx.stroke();
    
    // Draw curbs
    ctx.strokeStyle = ROAD_COLORS.curb;
    ctx.lineWidth = (road.properties.width + 0.5) * viewport.zoom;
    this.drawPath(ctx, road.points, viewport);
    ctx.stroke();
    
    // Draw road surface
    ctx.strokeStyle = ROAD_COLORS.asphalt;
    ctx.lineWidth = road.properties.width * viewport.zoom;
    
    if (road.selected) {
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 25;
    }
    
    this.drawPath(ctx, road.points, viewport);
    ctx.stroke();
    
    // Draw shoulders
    if (road.properties.shoulderWidth > 0) {
      ctx.strokeStyle = ROAD_COLORS.shoulder;
      ctx.lineWidth = (road.properties.width - road.properties.shoulderWidth * 2) * viewport.zoom;
      this.drawPath(ctx, road.points, viewport);
      ctx.stroke();
    }
    
    // Draw detailed lane markings
    this.drawLaneMarkings(ctx, road, viewport);
    
    ctx.restore();
  }

  static drawCloseupLevel(ctx, road, viewport) {
    // Very detailed view with textures and imperfections
    this.drawDetailedLevel(ctx, road, viewport);
    
    ctx.save();
    
    // Add road texture/imperfections
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = ROAD_COLORS.asphaltLight;
    
    // Draw subtle texture lines
    for (let i = 0; i < road.points.length - 1; i++) {
      const p1 = road.points[i];
      const p2 = road.points[i + 1];
      
      const screen1 = viewport.worldToScreen(p1.x, p1.y);
      const screen2 = viewport.worldToScreen(p2.x, p2.y);
      
      // Add random cracks and wear (scale with viewport)
      if (Math.random() > 0.7) {
        ctx.lineWidth = (Math.random() * 0.2 + 0.05) * viewport.zoom;
        ctx.beginPath();
        
        const offsetX = (Math.random() - 0.5) * road.properties.width * 0.8 * viewport.zoom;
        const offsetY = (Math.random() - 0.5) * road.properties.width * 0.8 * viewport.zoom;
        
        ctx.moveTo(screen1.x + offsetX, screen1.y + offsetY);
        ctx.lineTo(screen2.x + offsetX, screen2.y + offsetY);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }

  static drawLaneMarkings(ctx, road, viewport) {
    ctx.save();
    
    const laneCount = road.properties.lanes;
    const laneWidth = road.properties.laneWidth;
    
    // Draw dashed lane lines (scale to screen space)
    ctx.strokeStyle = ROAD_COLORS.laneMarking;
    ctx.lineWidth = 0.15 * viewport.zoom;
    const dashLength = 3 * viewport.zoom;
    const gapLength = 9 * viewport.zoom;
    ctx.setLineDash([dashLength, gapLength]);
    
    for (let i = 1; i < laneCount; i++) {
      const offset = (i - laneCount / 2) * laneWidth;
      this.drawOffsetPath(ctx, road.points, viewport, offset);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
    
    // Draw center line (double yellow for two-way roads)
    if (laneCount > 1) {
      ctx.strokeStyle = ROAD_COLORS.laneMarkingYellow;
      ctx.lineWidth = 0.15 * viewport.zoom;
      
      // Double line for highways and arterials
      if (road.type === 'HIGHWAY' || road.type === 'ARTERIAL') {
        this.drawOffsetPath(ctx, road.points, viewport, -0.15);
        ctx.stroke();
        this.drawOffsetPath(ctx, road.points, viewport, 0.15);
        ctx.stroke();
      } else {
        this.drawPath(ctx, road.points, viewport);
        ctx.stroke();
      }
    }
    
    // Draw edge lines
    ctx.strokeStyle = ROAD_COLORS.laneMarking;
    ctx.lineWidth = 0.2 * viewport.zoom;
    const edgeOffset = road.properties.width / 2 - 0.2;
    this.drawOffsetPath(ctx, road.points, viewport, -edgeOffset);
    ctx.stroke();
    this.drawOffsetPath(ctx, road.points, viewport, edgeOffset);
    ctx.stroke();
    
    ctx.restore();
  }

  static drawPath(ctx, points, viewport) {
    if (points.length < 2) return;
    
    ctx.beginPath();
    const firstPoint = viewport.worldToScreen(points[0].x, points[0].y);
    ctx.moveTo(firstPoint.x, firstPoint.y);
    
    for (let i = 1; i < points.length; i++) {
      const point = viewport.worldToScreen(points[i].x, points[i].y);
      ctx.lineTo(point.x, point.y);
    }
  }

  static drawOffsetPath(ctx, points, viewport, offset) {
    if (points.length < 2) return;
    
    ctx.beginPath();
    
    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const prev = points[i - 1] || curr;
      const next = points[i + 1] || curr;
      
      // Calculate normal vector
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const length = Math.sqrt(dx * dx + dy * dy) || 1;
      const normalX = -dy / length * offset;
      const normalY = dx / length * offset;
      
      const offsetPoint = viewport.worldToScreen(
        curr.x + normalX,
        curr.y + normalY
      );
      
      if (i === 0) {
        ctx.moveTo(offsetPoint.x, offsetPoint.y);
      } else {
        ctx.lineTo(offsetPoint.x, offsetPoint.y);
      }
    }
  }
}