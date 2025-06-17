export class IntersectionDetector {
  constructor(elementManager) {
    this.elementManager = elementManager;
    this.detectionRadius = 30; // Distance threshold for intersection detection
  }

  /**
   * Detects if a point would create a T-intersection with existing roads
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} excludeRoadId - Road ID to exclude from detection (current road being drawn)
   * @returns {Object|null} Intersection info or null
   */
  detectTIntersection(x, y, excludeRoadId = null, approachFrom = null) {
    const roads = this.elementManager.getRoads();
    
    // Debug logging
    if (roads.length > 0 && !this._hasLoggedDetection) {
      console.log('detectTIntersection: Checking', roads.length, 'roads at point', {x, y});
      this._hasLoggedDetection = true;
    }
    
    for (const road of roads) {
      if (road.id === excludeRoadId) continue;
      
      // Find the closest point on the road to our test point
      const closestPoint = this.getClosestPointOnRoad(road, x, y);
      
      if (closestPoint.distance <= this.detectionRadius) {
        // For angle calculation, use the approach point if provided, otherwise use the current point
        const approachPoint = approachFrom || { x, y };
        const angle = this.calculateApproachAngle(road, closestPoint.point, approachPoint, { x, y });
        const angleDegrees = angle * 180 / Math.PI;
        
        console.log('Found road within range:', road.id, 'distance:', closestPoint.distance, 'angle:', angleDegrees);
        
        // T-intersection typically has angles close to 90 degrees
        if (this.isTIntersectionAngle(angle)) {
          console.log('T-intersection detected!');
          return {
            type: 'T',
            road: road,
            point: closestPoint.point,
            segment: closestPoint.segment,
            angle: angle,
            approachPoint: { x, y }
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Gets the closest point on a road to a given point
   */
  getClosestPointOnRoad(road, x, y) {
    let minDistance = Infinity;
    let closestPoint = null;
    let closestSegment = -1;
    
    for (let i = 0; i < road.points.length - 1; i++) {
      const p1 = road.points[i];
      const p2 = road.points[i + 1];
      
      const point = this.getClosestPointOnSegment(p1, p2, { x, y });
      const distance = this.getDistance(point, { x, y });
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
        closestSegment = i;
      }
    }
    
    return {
      point: closestPoint,
      distance: minDistance,
      segment: closestSegment
    };
  }

  /**
   * Gets the closest point on a line segment to a given point
   */
  getClosestPointOnSegment(p1, p2, point) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    if (dx === 0 && dy === 0) {
      return { x: p1.x, y: p1.y };
    }
    
    const t = Math.max(0, Math.min(1, 
      ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / (dx * dx + dy * dy)
    ));
    
    return {
      x: p1.x + t * dx,
      y: p1.y + t * dy
    };
  }

  /**
   * Calculates the approach angle for a potential intersection
   */
  calculateApproachAngle(road, intersectionPoint, approachFrom, approachTo) {
    // Get the road direction at the intersection point
    const roadDirection = this.getRoadDirectionAtPoint(road, intersectionPoint);
    
    // Get the approach direction - from the start of the segment to the end
    const approachDirection = {
      x: approachTo.x - approachFrom.x,
      y: approachTo.y - approachFrom.y
    };
    
    // Normalize vectors
    const roadMag = Math.sqrt(roadDirection.x ** 2 + roadDirection.y ** 2);
    const approachMag = Math.sqrt(approachDirection.x ** 2 + approachDirection.y ** 2);
    
    if (roadMag === 0 || approachMag === 0) {
      return Math.PI / 2; // Default to 90 degrees
    }
    
    roadDirection.x /= roadMag;
    roadDirection.y /= roadMag;
    approachDirection.x /= approachMag;
    approachDirection.y /= approachMag;
    
    // Calculate angle between vectors
    const dot = roadDirection.x * approachDirection.x + roadDirection.y * approachDirection.y;
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
    
    // Return the minimum angle (could be angle or PI - angle)
    return Math.min(Math.abs(angle), Math.abs(Math.PI - angle));
  }

  /**
   * Gets the road direction at a specific point
   */
  getRoadDirectionAtPoint(road, point) {
    // Find which segment contains this point
    for (let i = 0; i < road.points.length - 1; i++) {
      const p1 = road.points[i];
      const p2 = road.points[i + 1];
      
      // Check if point is on this segment (with small tolerance)
      const segmentLength = this.getDistance(p1, p2);
      const dist1 = this.getDistance(p1, point);
      const dist2 = this.getDistance(p2, point);
      
      if (Math.abs(dist1 + dist2 - segmentLength) < 0.1) {
        return {
          x: p2.x - p1.x,
          y: p2.y - p1.y
        };
      }
    }
    
    // Fallback: use the closest segment
    const closest = this.getClosestPointOnRoad(road, point.x, point.y);
    if (closest.segment >= 0 && closest.segment < road.points.length - 1) {
      const p1 = road.points[closest.segment];
      const p2 = road.points[closest.segment + 1];
      return {
        x: p2.x - p1.x,
        y: p2.y - p1.y
      };
    }
    
    return { x: 1, y: 0 }; // Default direction
  }

  /**
   * Checks if an angle is suitable for a T-intersection
   */
  isTIntersectionAngle(angle) {
    // T-intersections are typically between 70-110 degrees
    const degrees = angle * 180 / Math.PI;
    return degrees >= 70 && degrees <= 110;
  }

  /**
   * Calculates distance between two points
   */
  getDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Finds all existing intersections at a point
   */
  findIntersectionsAtPoint(x, y, radius = 30) {
    return this.elementManager.getIntersections().filter(intersection => {
      return this.getDistance(intersection, { x, y }) <= radius;
    });
  }

  /**
   * Finds all intersections between a new road and existing roads
   * @param {Road} newRoad - The new road to check
   * @param {Array} roads - Array of existing roads
   * @returns {Array} Array of intersection objects with point and roadIds
   */
  findIntersections(newRoad, roads) {
    const intersections = [];
    
    for (const road of roads) {
      if (road.id === newRoad.id) continue;
      
      // Check for line-line intersections
      const lineIntersections = this.findLineIntersections(newRoad, road);
      for (const point of lineIntersections) {
        intersections.push({
          point: point,
          roadIds: [newRoad.id, road.id]
        });
      }
      
      // Check for T-intersections at road endpoints
      const firstPoint = newRoad.points[0];
      const lastPoint = newRoad.points[newRoad.points.length - 1];
      
      // Check if first point creates a T-intersection
      const firstIntersection = this.detectTIntersection(
        firstPoint.x, firstPoint.y, newRoad.id
      );
      if (firstIntersection && firstIntersection.road.id === road.id) {
        intersections.push({
          point: firstIntersection.point,
          roadIds: [newRoad.id, road.id]
        });
      }
      
      // Check if last point creates a T-intersection
      const lastIntersection = this.detectTIntersection(
        lastPoint.x, lastPoint.y, newRoad.id
      );
      if (lastIntersection && lastIntersection.road.id === road.id) {
        intersections.push({
          point: lastIntersection.point,
          roadIds: [newRoad.id, road.id]
        });
      }
    }
    
    return intersections;
  }

  /**
   * Finds line-line intersections between two roads
   * @private
   */
  findLineIntersections(road1, road2) {
    const intersections = [];
    
    for (let i = 0; i < road1.points.length - 1; i++) {
      for (let j = 0; j < road2.points.length - 1; j++) {
        const intersection = this.lineIntersection(
          road1.points[i], road1.points[i + 1],
          road2.points[j], road2.points[j + 1]
        );
        
        if (intersection) {
          intersections.push(intersection);
        }
      }
    }
    
    return intersections;
  }

  /**
   * Calculates intersection point between two line segments
   * @private
   */
  lineIntersection(p1, p2, p3, p4) {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;
    
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 0.0001) return null;
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }
    
    return null;
  }
}