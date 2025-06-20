// Animation and effect constants for bird's eye view and other visual effects

export const ANIMATION = {
  // Durations
  PULSE_DURATION: 3000, // 3 seconds for subtle effect
  FADE_DURATION: 300,
  GLOW_DURATION: 2000,
  
  // Bird's eye view specific
  BIRDS_EYE: {
    // Intersection pulsing
    INTERSECTION: {
      OUTER_RADIUS_SCALE: [1.5, 2, 1.5],
      OUTER_OPACITY: [0.2, 0.1, 0.2],
      GLOW_OPACITY: [0.4, 0.6, 0.4],
      CORE_COLORS: ['#ff4466', '#ff6688', '#ff4466'],
      BASE_SIZE_MULTIPLIER: {
        OUTER: 1.5,
        GLOW: 1,
        MIDDLE: 0.7,
        CORE: 0.4,
        INNER: 0.2
      }
    },
    
    // Road styling
    ROAD: {
      COLOR: '#00ff88',
      STROKE_WIDTH: 5,
      GLOW_FILTER: 'circuit-glow'
    }
  },
  
  // Easing functions (as CSS strings)
  EASING: {
    SMOOTH: 'ease-in-out',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    ELASTIC: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
  }
};

export const COLORS = {
  // Intersection colors
  INTERSECTION: {
    RED_DARK: '#ff0044',
    RED_MEDIUM: '#ff2255',
    RED_LIGHT: '#ff4466',
    RED_BRIGHT: '#ff6688',
    RED_PALE: '#ff88aa'
  },
  
  // Road colors
  ROAD: {
    CIRCUIT_GREEN: '#00ff88',
    ASPHALT: '#2a2a3a',
    ASPHALT_LIGHT: '#3a3a4a'
  }
};

// Zoom thresholds for different rendering modes
export const ZOOM_THRESHOLDS = {
  BIRDS_EYE: 0.25,  // Increased from 0.2 to activate bird's eye sooner
  NETWORK: 0.4,     // Adjusted for better transition
  SIMPLIFIED: 0.7,
  STANDARD: 1.5,
  DETAILED: 3.0,
  CLOSEUP: 5.0
};

// Filter definitions
export const FILTERS = {
  CIRCUIT_GLOW: {
    id: 'circuit-glow',
    width: '200%',
    height: '200%',
    x: '-50%',
    y: '-50%'
  },
  BLUR: {
    LIGHT: 1,
    MEDIUM: 2,
    HEAVY: 3
  }
};