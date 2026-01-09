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

export const BALL_SKINS = {
  red: { id: 'red', color: '#ff6b6b', name: 'Red', unlockText: null },
  cyan: { id: 'cyan', color: '#4ecdc4', name: 'Cyan', unlockText: 'Complete World 1 to unlock' },
  orange: { id: 'orange', color: '#f97316', name: 'Orange', unlockText: 'Complete World 2 to unlock' },
  yellow: { id: 'yellow', color: '#facc15', name: 'Yellow', unlockText: '100 Bounces to unlock' },
  violet: { id: 'violet', color: '#8b5cf6', name: 'Violet', unlockText: '1000 Bounces to unlock' },
  green: { id: 'green', color: '#22c55e', name: 'Green', unlockText: 'Watch 1 Bonus Star Ad' },
};

export const TRAIL_SKINS = {
  red: { id: 'red', color: '#ff6b6b', name: 'Red', unlockText: null },
  cyan: { id: 'cyan', color: '#4ecdc4', name: 'Cyan', unlockText: 'Watch 5 Bonus Star Ads' },
  orange: { id: 'orange', color: '#f97316', name: 'Orange', unlockText: '20 Deaths to unlock' },
  green: { id: 'green', color: '#22c55e', name: 'Green', unlockText: '200 Deaths to unlock' },
  white: { id: 'white', color: '#ffffff', name: 'White', unlockText: '2000 Bounces to unlock' },
  violet: { id: 'violet', color: '#8b5cf6', name: 'Violet', unlockText: '500 Deaths to unlock' },
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
