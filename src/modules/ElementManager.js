import { EventEmitter } from '../core/EventEmitter.js';
import { Road } from './elements/Road.js';
import { Intersection } from './elements/Intersection.js';
import { Building } from './elements/Building.js';

export class ElementManager extends EventEmitter {
  constructor() {
    super();
    this.roads = new Map();
    this.intersections = new Map();
    this.buildings = new Map();
    
    // Listen for updates from properties panel
    this.on('elementUpdated', (element) => {
      // Trigger appropriate update event based on element type
      if (element.connectedRoads !== undefined) {
        // It's an intersection
        this.emit('intersectionUpdated', element);
      } else if (element.points !== undefined) {
        // It's a road
        this.emit('roadUpdated', element);
      } else if (element.width !== undefined && element.height !== undefined) {
        // It's a building
        this.emit('buildingUpdated', element);
      }
    });
  }

  addRoad(road) {
    this.roads.set(road.id, road);
    this.emit('roadAdded', road);
  }

  removeRoad(roadId) {
    const road = this.roads.get(roadId);
    if (road) {
      this.roads.delete(roadId);
      this.emit('roadRemoved', road);
    }
  }

  getRoad(roadId) {
    return this.roads.get(roadId);
  }

  getRoads() {
    return Array.from(this.roads.values());
  }

  findRoadByEndpoint(x, y, tolerance = 10) {
    for (const road of this.roads.values()) {
      const endpoint = road.isNearEndpoint(x, y, tolerance);
      if (endpoint) {
        return { road, endpoint };
      }
    }
    return null;
  }

  createIntersectionAt(x, y, connectedRoadIds = []) {
    const existingIntersection = this.getIntersectionAt(x, y, 10);
    
    if (existingIntersection) {
      for (const roadId of connectedRoadIds) {
        existingIntersection.addConnection(roadId, { x, y });
      }
      this.emit('intersectionUpdated', existingIntersection);
      return existingIntersection;
    }
    
    // Find ALL roads that connect at this point
    const allConnectedRoads = new Set(connectedRoadIds);
    
    // Check all roads to see if they have an endpoint at this location
    for (const road of this.roads.values()) {
      if (connectedRoadIds.includes(road.id)) continue; // Already included
      
      const firstPoint = road.points[0];
      const lastPoint = road.points[road.points.length - 1];
      
      // Check if either endpoint is at this intersection point (with small tolerance)
      const tolerance = 5;
      if ((Math.abs(firstPoint.x - x) < tolerance && Math.abs(firstPoint.y - y) < tolerance) ||
          (Math.abs(lastPoint.x - x) < tolerance && Math.abs(lastPoint.y - y) < tolerance)) {
        allConnectedRoads.add(road.id);
      }
    }
    
    const intersectionId = `intersection_${Date.now()}`;
    const intersection = new Intersection(intersectionId, x, y);
    
    for (const roadId of allConnectedRoads) {
      intersection.addConnection(roadId, { x, y });
    }
    
    // Creating intersection with connected roads
    
    this.intersections.set(intersectionId, intersection);
    this.emit('intersectionAdded', intersection);
    return intersection;
  }

  removeIntersection(intersectionId) {
    const intersection = this.intersections.get(intersectionId);
    if (intersection) {
      this.intersections.delete(intersectionId);
      this.emit('intersectionRemoved', intersection);
    }
  }

  getIntersection(intersectionId) {
    return this.intersections.get(intersectionId);
  }

  getIntersections() {
    return Array.from(this.intersections.values());
  }

  getIntersectionAt(x, y, tolerance = 5) {
    for (const intersection of this.intersections.values()) {
      if (intersection.hitTest(x, y)) {
        return intersection;
      }
    }
    return null;
  }

  addBuilding(building) {
    this.buildings.set(building.id, building);
    this.emit('buildingAdded', building);
    this.emit('elementsChanged');
  }

  removeBuilding(buildingId) {
    const building = this.buildings.get(buildingId);
    if (building) {
      this.buildings.delete(buildingId);
      this.emit('buildingRemoved', building);
    }
  }

  getBuilding(buildingId) {
    return this.buildings.get(buildingId);
  }

  getBuildings() {
    return Array.from(this.buildings.values());
  }

  getElementAt(x, y) {
    // Check intersections first (higher priority)
    for (const intersection of this.intersections.values()) {
      if (intersection.hitTest(x, y)) {
        return intersection;
      }
    }
    
    // Then check buildings
    for (const building of this.buildings.values()) {
      if (building.hitTest({ x, y })) {
        return building;
      }
    }
    
    // Finally check roads
    for (const road of this.roads.values()) {
      if (road.hitTest(x, y)) {
        return road;
      }
    }
    
    return null;
  }

  clear() {
    this.roads.clear();
    this.intersections.clear();
    this.buildings.clear();
    this.emit('cleared');
  }

  getBounds() {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    let hasElements = false;
    
    for (const road of this.roads.values()) {
      const bounds = road.getBounds();
      if (bounds) {
        hasElements = true;
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
      }
    }
    
    for (const intersection of this.intersections.values()) {
      const bounds = intersection.getBounds();
      hasElements = true;
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    }
    
    for (const building of this.buildings.values()) {
      const bounds = building.getBounds();
      hasElements = true;
      minX = Math.min(minX, bounds.minX);
      minY = Math.min(minY, bounds.minY);
      maxX = Math.max(maxX, bounds.maxX);
      maxY = Math.max(maxY, bounds.maxY);
    }
    
    if (!hasElements) {
      return { x: 0, y: 0, width: 100, height: 100 };
    }
    
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  toJSON() {
    return {
      roads: Array.from(this.roads.values()).map(road => road.toJSON()),
      intersections: Array.from(this.intersections.values()).map(intersection => intersection.toJSON()),
      buildings: Array.from(this.buildings.values()).map(building => building.toJSON())
    };
  }

  fromJSON(data) {
    this.clear();
    
    if (data.roads) {
      for (const roadData of data.roads) {
        const road = Road.fromJSON(roadData);
        this.roads.set(road.id, road);
      }
    }
    
    if (data.intersections) {
      for (const intersectionData of data.intersections) {
        const intersection = Intersection.fromJSON(intersectionData);
        this.intersections.set(intersection.id, intersection);
      }
    }
    
    if (data.buildings) {
      for (const buildingData of data.buildings) {
        const building = Building.fromJSON(buildingData);
        this.buildings.set(building.id, building);
      }
    }
    
    this.emit('loaded', data);
  }
}