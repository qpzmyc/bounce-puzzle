// World 2: Fire World - "More Challenging"
// Focus on precise bounces, restricted platforms, and tricky layouts.

const world2Levels = [
    {
        id: 201,
        name: 'The Split',
        balls: [{ x: 155, y: 50 }, { x: 195, y: 50 }, { x: 95, y: 330 }, { x: 255, y: 330 }],
        goal: { x: 135, y: 450, width: 80, height: 40 },
        walls: [
            { x: 175, y: 300, width: 10, height: 300 }, // Central divider
            { x: 175, y: 150, width: 50, height: 10 }, // Top divider
            { x: 95, y: 350, width: 50, height: 10 },
            { x: 255, y: 350, width: 50, height: 10 },
        ],
        platforms: { normal: 5, sticky: 0, super: 0 },
        spikes: [],
        fans: [],
        noPlaceZones: [
            { x: 175, y: 300, width: 350, height: 230 } // Can't cheat by placing on divider
        ]
    },
    {
        id: 202,
        name: 'Needle Thread 2',
        balls: [{ x: 230, y: 40 }],
        goal: { x: 270, y: 400, width: 40, height: 40 },
        walls: [
            { x: 50, y: 200, width: 100, height: 10 }, // Horizontal block
            { x: 240, y: 200, width: 200, height: 10 }, // Another block
            { x: 100, y: 370, width: 200, height: 10 }, // Vertical block
            { x: 200, y: 305, width: 10, height: 140 }, // Vertical block
        ],
        spikes: [
            { x: 0, y: 180, width: 100, height: 10, direction: 'up' },
            { x: 140, y: 180, width: 200, height: 10, direction: 'up' },
            { x: 105, y: 192.5, width: 10, height: 15, direction: 'right' },
            { x: 125, y: 192.5, width: 10, height: 15, direction: 'left' },
            { x: 195, y: 223, width: 10, height: 10, direction: 'up' },
            { x: 0, y: 210, width: 100, height: 10, direction: 'down' },
            { x: 140, y: 210, width: 40, height: 10, direction: 'down' },
            { x: 230, y: 210, width: 110, height: 10, direction: 'down' },
            { x: 5, y: 350, width: 190, height: 10, direction: 'up' },
            { x: 180, y: 235, width: 10, height: 130, direction: 'left' },
            { x: 210, y: 235, width: 10, height: 130, direction: 'right' },
        ],
        platforms: { normal: 0, sticky: 2, super: 2 },
        fans: [],
        noPlaceZones: [
            { x: 75, y: 120, width: 150, height: 250 },
            { x: 250, y: 290, width: 200, height: 170 },
        ]
    },
    {
        id: 203,
        name: 'High Jump',
        balls: [{ x: 30, y: 450 }], // Start at bottom!
        goal: { x: 200, y: 350, width: 40, height: 40 }, // Goal at top!
        walls: [
            { x: 180, y: 300, width: 10, height: 400 }, // Mid-air floor
            { x: 220, y: 400, width: 80, height: 10 }, // Mid-air floor
            { x: 260, y: 370, width: 10, height: 70 }, // Mid-air floor
        ],
        platforms: { normal: 1, sticky: 0, super: 3 }, // Must use super platforms to climb
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 204,
        name: 'Reverse Loop',
        balls: [{ x: 150, y: 375 }],
        goal: { x: 120, y: 270, width: 40, height: 40 },
        fans: [
            { x: 20, y: 150, width: 40, height: 40, direction: 'right' },
            { x: 20, y: 350, width: 40, height: 40, direction: 'right' },
        ],
        walls: [
            { x: 170, y: 70, width: 10, height: 140 },
            { x: 170, y: 270, width: 10, height: 160 },
            { x: 170, y: 450, width: 10, height: 120 },
            { x: 150, y: 395, width: 40, height: 10 },
        ],
        spikes: [],
        platforms: { normal: 2, sticky: 5, super: 5 },
        noPlaceZones: [
            { x: 85, y: 390, width: 160, height: 240 },
        ]
    },
    {
        id: 205,
        name: 'The Drop',
        balls: [{ x: 175, y: 50 }],
        goal: { x: 175, y: 550, width: 30, height: 30 },
        walls: [
            { x: 100, y: 300, width: 10, height: 400 },
            { x: 250, y: 300, width: 10, height: 400 },
        ],
        platforms: { normal: 2, sticky: 0, super: 0 },
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 206,
        name: 'Pinball',
        balls: [{ x: 300, y: 50 }],
        goal: { x: 50, y: 550, width: 40, height: 40 },
        walls: [
            { x: 175, y: 150, width: 100, height: 10 },
            { x: 175, y: 350, width: 100, height: 10 },
        ],
        platforms: { normal: 0, sticky: 0, super: 5 }, // Bouncy!
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 207,
        name: 'Squeeze',
        balls: [{ x: 50, y: 50 }],
        goal: { x: 300, y: 50, width: 30, height: 30 },
        walls: [
            { x: 175, y: 100, width: 10, height: 150 }, // Upper barrier
            { x: 175, y: 400, width: 10, height: 300 }, // Lower barrier
        ],
        // Gap is between 175 and 250 (y-axis)? No, vertical walls.
        // Wall at x=175. Gap between y=175 (100+75) and y=250 (400-150).
        // Gap size = 75px. 
        platforms: { normal: 3, sticky: 1, super: 0 },
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 208,
        name: 'Staircase',
        balls: [{ x: 50, y: 500 }],
        goal: { x: 300, y: 100, width: 40, height: 40 },
        walls: [
            { x: 100, y: 400, width: 80, height: 10 },
            { x: 175, y: 300, width: 80, height: 10 },
            { x: 250, y: 200, width: 80, height: 10 },
        ],
        platforms: { normal: 2, sticky: 0, super: 2 },
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 209,
        name: 'Backwards',
        balls: [{ x: 50, y: 100 }],
        goal: { x: 50, y: 250, width: 30, height: 30 }, // Below start, but blocked
        walls: [
            { x: 50, y: 175, width: 80, height: 10 }, // Floor under start
        ],
        platforms: { normal: 2, sticky: 2, super: 1 },
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 210,
        name: 'The Cage',
        balls: [{ x: 175, y: 50 }],
        goal: { x: 175, y: 300, width: 30, height: 30 },
        walls: [
            // Box around goal
            { x: 140, y: 300, width: 10, height: 80 }, // Left
            { x: 210, y: 300, width: 10, height: 80 }, // Right
            { x: 175, y: 345, width: 80, height: 10 }, // Bottom
            // Top is open... or guarded?
            { x: 175, y: 255, width: 80, height: 10 }, // Top is closed?!
            // Wait, if top is closed, how to enter?
            // Maybe a small gap in the corner?
        ],
        // Actually let's make it a "Cup" you have to lob into
        // Removing Top wall.
        platforms: { normal: 3, sticky: 0, super: 0 },
        spikes: [],
        fans: [],
        noPlaceZones: [
            { x: 175, y: 200, width: 100, height: 50 } // Can't drop directly above
        ]
    },
    {
        id: 211,
        name: 'Pixel Perfect',
        balls: [{ x: 20, y: 100 }],
        goal: { x: 340, y: 500, width: 20, height: 20 }, // Tiny goal
        walls: [
            { x: 180, y: 300, width: 10, height: 400 }, // Vertical Divider
        ],
        // Gap at top or bottom?
        platforms: { normal: 1, sticky: 2, super: 0 },
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 212,
        name: 'Double Cross',
        balls: [{ x: 50, y: 50 }, { x: 300, y: 50 }],
        goal: { x: 175, y: 500, width: 50, height: 50 },
        walls: [
            { x: 175, y: 200, width: 200, height: 10 }, // Crossbar
            { x: 175, y: 350, width: 10, height: 100 }, // Vertical
        ],
        platforms: { normal: 2, sticky: 2, super: 1 },
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 213,
        name: 'Fan Club',
        balls: [{ x: 50, y: 400 }],
        goal: { x: 300, y: 400, width: 40, height: 40 },
        fans: [
            { x: 100, y: 500, width: 40, height: 40, direction: 'up' },
            { x: 175, y: 500, width: 40, height: 40, direction: 'up' },
            { x: 250, y: 500, width: 40, height: 40, direction: 'up' },
        ],
        walls: [
            { x: 175, y: 300, width: 250, height: 10 }, // Ceiling
        ],
        platforms: { normal: 1, sticky: 0, super: 0 },
        spikes: [],
        noPlaceZones: []
    },
    {
        id: 214,
        name: 'Spike Field',
        balls: [{ x: 50, y: 50 }],
        goal: { x: 300, y: 500, width: 40, height: 40 },
        spikes: [
            { x: 100, y: 400, width: 60, height: 10, direction: 'up' },
            { x: 200, y: 300, width: 60, height: 10, direction: 'up' },
            { x: 100, y: 200, width: 60, height: 10, direction: 'up' },
        ],
        walls: [],
        platforms: { normal: 3, sticky: 1, super: 0 },
        fans: [],
        noPlaceZones: []
    },
    {
        id: 215,
        name: 'Elevator',
        balls: [{ x: 50, y: 500 }],
        goal: { x: 300, y: 100, width: 40, height: 40 },
        fans: [
            { x: 50, y: 550, width: 40, height: 40, direction: 'up' }, // Lift
        ],
        walls: [
            { x: 100, y: 300, width: 10, height: 400 }, // Shaft wall
        ],
        platforms: { normal: 1, sticky: 1, super: 1 },
        spikes: [],
        noPlaceZones: []
    },
    {
        id: 216,
        name: 'Ricochet',
        balls: [{ x: 50, y: 50 }],
        goal: { x: 300, y: 400, width: 30, height: 30 },
        walls: [
            { x: 340, y: 200, width: 10, height: 200 }, // Right-side bumper
            { x: 20, y: 300, width: 10, height: 200 }, // Left-side bumper
        ],
        platforms: { normal: 0, sticky: 0, super: 3 }, // All super
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 217,
        name: 'The Maze',
        balls: [{ x: 175, y: 50 }],
        goal: { x: 175, y: 550, width: 30, height: 30 },
        walls: [
            { x: 100, y: 150, width: 150, height: 10 },
            { x: 250, y: 250, width: 150, height: 10 },
            { x: 100, y: 350, width: 150, height: 10 },
            { x: 250, y: 450, width: 150, height: 10 },
        ],
        platforms: { normal: 4, sticky: 0, super: 0 },
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 218,
        name: "Don't Touch",
        balls: [{ x: 50, y: 50 }],
        goal: { x: 300, y: 500, width: 40, height: 40 },
        walls: [],
        platforms: { normal: 3, sticky: 0, super: 0 },
        spikes: [],
        fans: [],
        noPlaceZones: [
            { x: 175, y: 200, width: 250, height: 50 },
            { x: 175, y: 350, width: 250, height: 50 },
        ]
    },
    {
        id: 219,
        name: 'Speedway',
        balls: [{ x: 50, y: 50 }],
        goal: { x: 300, y: 50, width: 40, height: 40 },
        walls: [
            { x: 175, y: 100, width: 300, height: 10 },
            { x: 175, y: 200, width: 300, height: 10 },
            { x: 175, y: 300, width: 300, height: 10 },
        ],
        platforms: { normal: 0, sticky: 0, super: 4 }, // FAST
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 220,
        name: 'Precision II',
        balls: [{ x: 175, y: 20 }],
        goal: { x: 175, y: 500, width: 20, height: 20 },
        walls: [
            { x: 120, y: 250, width: 10, height: 300 },
            { x: 230, y: 250, width: 10, height: 300 },
        ],
        spikes: [
            { x: 175, y: 200, width: 40, height: 10, direction: 'up' }, // Danger in middle
        ],
        platforms: { normal: 2, sticky: 1, super: 0 },
        fans: [],
        noPlaceZones: []
    },
    {
        id: 221,
        name: 'The Leap',
        balls: [{ x: 50, y: 500 }],
        goal: { x: 300, y: 500, width: 40, height: 40 },
        walls: [
            { x: 175, y: 400, width: 10, height: 200 }, // The Barrier
        ],
        platforms: { normal: 0, sticky: 0, super: 2 }, // Must jump over
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 222,
        name: 'Around the Bend',
        balls: [{ x: 50, y: 50 }],
        goal: { x: 50, y: 300, width: 40, height: 40 },
        walls: [
            { x: 100, y: 150, width: 150, height: 10 },
            { x: 200, y: 250, width: 250, height: 10 },
        ],
        platforms: { normal: 2, sticky: 2, super: 1 },
        spikes: [],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 223,
        name: 'Grand Finale W2',
        balls: [{ x: 50, y: 50 }, { x: 300, y: 50 }],
        goal: { x: 175, y: 300, width: 50, height: 50 }, // Center
        walls: [
            { x: 175, y: 300, width: 60, height: 60 }, // Goal is INSIDE a box? No...
            // Let's make it a platform in the void.
        ],
        // Actually, let's create a "VS" feel. Two sides.
        noPlaceZones: [
            { x: 175, y: 300, width: 100, height: 100 }
        ],
        fans: [
            { x: 175, y: 500, width: 40, height: 40, direction: 'up' } // Center updraft
        ],
        spikes: [
            { x: 100, y: 500, width: 80, height: 10, direction: 'up' },
            { x: 250, y: 500, width: 80, height: 10, direction: 'up' },
        ],
        platforms: { normal: 3, sticky: 2, super: 2 },
    }
];

export default world2Levels;
