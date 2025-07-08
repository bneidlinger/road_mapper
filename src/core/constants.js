export const UNITS = {
  METRIC: 'metric',
  IMPERIAL: 'imperial'
};

export const TOOLS = {
  SELECT: 'select',
  ROAD: 'road',
  INTERSECTION: 'intersection',
  ZONE: 'zone',
  DELETE: 'delete',
  PAN: 'pan',
  BUILDING: 'building'
};

export const ROAD_TYPES = {
  HIGHWAY: { 
    name: 'Highway', 
    width: 40, 
    lanes: 4, 
    color: '#444',
    sidewalkWidth: 0,
    shoulderWidth: 4,
    laneWidth: 4
  },
  ARTERIAL: { 
    name: 'Arterial', 
    width: 30, 
    lanes: 3, 
    color: '#555',
    sidewalkWidth: 5,
    shoulderWidth: 3,
    laneWidth: 3.5
  },
  STREET: { 
    name: 'Street', 
    width: 20, 
    lanes: 2, 
    color: '#666',
    sidewalkWidth: 4,
    shoulderWidth: 1,
    laneWidth: 3.5
  },
  ALLEY: { 
    name: 'Alley', 
    width: 12, 
    lanes: 1, 
    color: '#777',
    sidewalkWidth: 2,
    shoulderWidth: 0,
    laneWidth: 4
  }
};

export const ZOOM_LEVELS = {
  NETWORK: 0.3,      // < 0.3: Network view - simple lines
  SIMPLIFIED: 0.7,   // 0.3-0.7: Simplified view - basic road shapes
  STANDARD: 1.5,     // 0.7-1.5: Standard view - lane markings
  DETAILED: 3.0,     // 1.5-3.0: Detailed view - sidewalks, curbs
  CLOSEUP: 5.0       // > 3.0: Close-up view - textures, cracks
};

// Professional SaaS Color palette
export const ROAD_COLORS = {
  asphalt: '#2a2a3a',
  asphaltLight: '#3a3a4a',
  concrete: '#4a4a5a',
  laneMarking: '#e8e8ec',
  laneMarkingYellow: '#ffb800',
  sidewalk: '#3a3a4a',
  curb: '#4a4a5a',
  shoulder: '#32324a',
  grass: '#1a3a2a',
  selection: '#00d4ff',
  intersection: '#ff4466',
  crosswalk: '#ffffff',
  // Bird's eye view colors
  birdsEyeRoad: '#00ff88',
  birdsEyeIntersection: '#ff4466',
  birdsEyeBackground: '#0a0a0a'
};

export const GRID_SIZES = {
  FINE: 5,      // 0.5m
  MEDIUM: 50,   // 5m
  COARSE: 250   // 25m
};

export const PIXELS_PER_METER = 10;

export const BUILDING_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INDUSTRIAL: 'industrial',
  OFFICE: 'office'
};