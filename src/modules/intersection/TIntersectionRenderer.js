import { ROAD_COLORS } from '../../core/constants.js';

export class TIntersectionRenderer {
  constructor() {
    this.cornerRadius = 8; // Radius for rounded corners
    this.stopSignSize = 12; // Size of stop signs
    this.roadWidth = 20; // Standard road width
  }

  /**
   * Renders a T-intersection
   */
  render(ctx, intersection, viewport) {
    const screenPos = viewport.worldToScreen(intersection.x, intersection.y);
    const zoom = viewport.zoom;
    
    ctx.save();
    
    // Get connected roads and their angles
    const connections = this.getConnectionAngles(intersection);
    
    if (connections.length === 3) {
      this.renderTIntersection(ctx, screenPos, connections, zoom);
      this.renderStopSigns(ctx, screenPos, connections, zoom);
    } else {
      // Fallback to simple circle for non-T intersections
      this.renderSimpleIntersection(ctx, screenPos, zoom);
    }
    
    // Render selection highlight if selected
    if (intersection.selected) {
      this.renderSelectionHighlight(ctx, screenPos, zoom);
    }
    
    ctx.restore();
  }

  /**
   * Renders a preview of a T-intersection
   */
  renderPreview(ctx, x, y, roadAngle, viewport) {
    const screenPos = viewport.worldToScreen(x, y);
    const zoom = viewport.zoom;
    
    ctx.save();
    ctx.globalAlpha = 0.5;
    
    // Create mock connections for preview
    const connections = [
      { angle: roadAngle },
      { angle: roadAngle + Math.PI },
      { angle: roadAngle + Math.PI / 2 }
    ];
    
    this.renderTIntersection(ctx, screenPos, connections, zoom);
    
    ctx.restore();
  }

  /**
   * Renders the T-intersection shape with proper road alignment
   */
  renderTIntersection(ctx, screenPos, connections, zoom) {
    const roadWidth = this.roadWidth * zoom;
    const cornerRadius = this.cornerRadius * zoom;
    
    // Draw curb/outline first
    ctx.fillStyle = ROAD_COLORS.curb;
    this.drawTShape(ctx, screenPos, connections, roadWidth + 4 * zoom, cornerRadius);
    
    // Draw asphalt
    ctx.fillStyle = ROAD_COLORS.asphalt;
    this.drawTShape(ctx, screenPos, connections, roadWidth, cornerRadius);
    
    // Draw road markings if zoomed in enough
    if (zoom >= 0.5) {
      this.drawRoadMarkings(ctx, screenPos, connections, roadWidth, zoom);
    }
  }

  /**
   * Draws the T-shaped intersection
   */
  drawTShape(ctx, center, connections, width, cornerRadius) {
    ctx.beginPath();
    
    // Sort connections by angle to ensure proper drawing order
    const sortedConnections = [...connections].sort((a, b) => a.angle - b.angle);
    
    // For each connection, draw the road extending from center
    for (let i = 0; i < sortedConnections.length; i++) {
      const conn = sortedConnections[i];
      const nextConn = sortedConnections[(i + 1) % sortedConnections.length];
      
      // Calculate road edge points
      const perpAngle = conn.angle + Math.PI / 2;
      const edgeOffset = width / 2;
      
      const startPoint = {
        x: center.x + Math.cos(perpAngle) * edgeOffset,
        y: center.y + Math.sin(perpAngle) * edgeOffset
      };
      
      const endPoint = {
        x: center.x - Math.cos(perpAngle) * edgeOffset,
        y: center.y - Math.sin(perpAngle) * edgeOffset
      };
      
      // Extend points outward
      const extendDistance = width * 1.5;
      const extendedStart = {
        x: startPoint.x + Math.cos(conn.angle) * extendDistance,
        y: startPoint.y + Math.sin(conn.angle) * extendDistance
      };
      
      const extendedEnd = {
        x: endPoint.x + Math.cos(conn.angle) * extendDistance,
        y: endPoint.y + Math.sin(conn.angle) * extendDistance
      };
      
      if (i === 0) {
        ctx.moveTo(extendedStart.x, extendedStart.y);
      }
      
      ctx.lineTo(startPoint.x, startPoint.y);
      
      // Draw rounded corner to next road
      const nextPerpAngle = nextConn.angle + Math.PI / 2;
      const nextStartPoint = {
        x: center.x + Math.cos(nextPerpAngle) * edgeOffset,
        y: center.y + Math.sin(nextPerpAngle) * edgeOffset
      };
      
      // Use quadratic curve for rounded corner
      ctx.quadraticCurveTo(center.x, center.y, nextStartPoint.x, nextStartPoint.y);
    }
    
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Draws road markings (lane lines, etc.)
   */
  drawRoadMarkings(ctx, center, connections, roadWidth, zoom) {
    ctx.save();
    ctx.strokeStyle = ROAD_COLORS.laneMarking;
    ctx.lineWidth = 2 * zoom;
    ctx.setLineDash([10 * zoom, 10 * zoom]);
    
    // Draw center lines for each road
    for (const conn of connections) {
      const extendDistance = roadWidth * 2;
      
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(
        center.x + Math.cos(conn.angle) * extendDistance,
        center.y + Math.sin(conn.angle) * extendDistance
      );
      ctx.stroke();
    }
    
    ctx.restore();
  }

  /**
   * Renders stop signs at appropriate positions
   */
  renderStopSigns(ctx, center, connections, zoom) {
    if (zoom < 0.5) return; // Don't show stop signs when zoomed out
    
    const stopSignSize = this.stopSignSize * zoom;
    const roadWidth = this.roadWidth * zoom;
    
    // Find the "main" road (usually the through road)
    // For now, we'll place stop signs on the perpendicular road
    const angles = connections.map(c => c.angle).sort((a, b) => a - b);
    
    // Find the road that forms the stem of the T
    let stemAngle = null;
    for (let i = 0; i < angles.length; i++) {
      const angle1 = angles[i];
      const angle2 = angles[(i + 1) % angles.length];
      const diff = Math.abs(angle2 - angle1);
      
      // If two roads are roughly opposite (180 degrees), the third is the stem
      if (Math.abs(diff - Math.PI) < 0.3) {
        stemAngle = angles[(i + 2) % angles.length];
        break;
      }
    }
    
    if (stemAngle !== null) {
      // Place stop sign on the stem road
      const signDistance = roadWidth * 1.2;
      const signX = center.x + Math.cos(stemAngle) * signDistance;
      const signY = center.y + Math.sin(stemAngle) * signDistance;
      
      this.drawStopSign(ctx, signX, signY, stopSignSize, stemAngle);
    }
  }

  /**
   * Draws a single stop sign
   */
  drawStopSign(ctx, x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    
    // Draw octagonal stop sign
    ctx.fillStyle = '#dd0000';
    ctx.beginPath();
    const sides = 8;
    for (let i = 0; i < sides; i++) {
      const a = (i * 2 * Math.PI) / sides - Math.PI / 8;
      const px = Math.cos(a) * size;
      const py = Math.sin(a) * size;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // White border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.1;
    ctx.stroke();
    
    // "STOP" text
    if (size > 8) {
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size * 0.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('STOP', 0, 0);
    }
    
    ctx.restore();
  }

  /**
   * Gets connection angles from an intersection
   */
  getConnectionAngles(intersection) {
    // This would normally get the actual connected roads and calculate their angles
    // For now, return mock data
    return intersection.connectedRoads.map((conn, index) => ({
      angle: (index * 2 * Math.PI) / intersection.connectedRoads.length,
      roadId: conn.roadId
    }));
  }

  /**
   * Renders a simple circular intersection
   */
  renderSimpleIntersection(ctx, screenPos, zoom) {
    const radius = 15 * zoom;
    
    ctx.fillStyle = ROAD_COLORS.curb;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, radius + 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = ROAD_COLORS.asphalt;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Renders selection highlight
   */
  renderSelectionHighlight(ctx, screenPos, zoom) {
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3 * zoom;
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, 25 * zoom, 0, Math.PI * 2);
    ctx.stroke();
  }
}