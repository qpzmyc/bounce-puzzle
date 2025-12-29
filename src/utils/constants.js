// Game constants - optimized for iPhone SE (375x667)
export const COLORS = {
  background: '#1a1a2e',
  ball: '#ff6b6b',
  ballGlow: 'rgba(255, 107, 107, 0.3)',
  platform: '#4ecdc4',
  platformPlaced: '#45b7aa',
  platformSticky: '#fbbf24', // Yellow (Gold)
  platformSuper: '#8b5cf6', // Violet
  goal: '#95e77e',
  goalGlow: 'rgba(149, 231, 126, 0.4)',
  wall: '#38bdf8', // Light blue
  fan: '#6b7280',  // Grey
  spike: '#ef4444',
  ui: {
    primary: '#7c3aed',
    secondary: '#a78bfa',
    text: '#ffffff',
    textDim: '#94a3b8',
    success: '#10b981',
    danger: '#ef4444',
    star: '#fbbf24',
    starEmpty: '#374151',
  }
};

// Distinct physics properties
// ball.restitution = 0.5 (Base bounce). 
// Restitution = max(ball, platform)
export const PLATFORM_TYPES = {
  normal: {
    id: 'normal',
    name: 'Normal',
    color: '#4ecdc4', // Teal
    restitution: 0.9, // Very Bouncy
    icon: ''
  },
  sticky: {
    id: 'sticky',
    name: 'Sticky',
    color: '#fbbf24', // Yellow
    restitution: 0.0, // Result 0.5 (Dull thud)
    icon: ''
  },
  super: {
    id: 'super',
    name: 'Super',
    color: '#8b5cf6', // Violet
    restitution: 1.5, // Super Bouncy (adds energy)
    icon: ''
  },
};

export const PHYSICS = {
  gravity: { x: 0, y: 0.8 },
  ballRadius: 10,
  ballRestitution: 0.5, // CRITICAL: Must be high enough to allow bounce logic to work
  ballFriction: 0.0, // Frictionless ball
  platformWidth: 70,
  platformHeight: 12,
  fanForce: 0.001,
};

export const GAME = {
  width: 340,
  height: 520,
};
