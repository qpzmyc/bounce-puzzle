// World 2: Fire World - "More Challenging"
// Focus on precise bounces, restricted platforms, and tricky layouts.

const world2Levels = [
    {
        id: 201,
        name: 'The Split',
        difficulty: 6,
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
        name: 'Needle Thread II',
        difficulty: 5,
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
        difficulty: 7,
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
        name: 'Ricochet',
        difficulty: 6,
        balls: [{ x: 40, y: 50 }],
        goal: { x: 230, y: 320, width: 30, height: 30 },
        walls: [
            { x: 190, y: 260, width: 10, height: 120 }, // Right-side bumper
            { x: 190, y: 375, width: 10, height: 50 }, // Right-side bumper
            { x: 150, y: 300, width: 10, height: 200 }, // Left-side bumper
            { x: 135, y: 90, width: 120, height: 10 }, // Top divider
            { x: 230, y: 355, width: 80, height: 10 }, // Bottom divider
            { x: 230, y: 315, width: 80, height: 10 }, // Bottom divider
            { x: 265, y: 335, width: 10, height: 50 }, // Bottom divider
            { x: 75, y: 395, width: 150, height: 10 }, // Bottom divider
        ],
        platforms: { normal: 0, sticky: 1, super: 3 }, // All super
        spikes: [
            { x: 80, y: 100, width: 110, height: 10, direction: 'down' },
            { x: 145, y: 185, width: 10, height: 10, direction: 'up' },
            { x: 5, y: 375, width: 140, height: 10, direction: 'up' },

        ],
        fans: [],
        noPlaceZones: [
            { x: 175, y: 310, width: 350, height: 140 },
            { x: 175, y: 70, width: 350, height: 140 },
        ]
    },
    {
        id: 205,
        name: "Launcher",
        difficulty: 5,
        balls: [
            { x: 60, y: 20 },
            { x: 290, y: 20 },
            { x: 60, y: 120 },
            { x: 290, y: 120 },
            { x: 60, y: 210 },
            { x: 290, y: 210 },
            { x: 60, y: 290 },
            { x: 290, y: 290 },
            { x: 60, y: 360 },
            { x: 290, y: 360 },
            { x: 170, y: 20 },

        ],
        goal: { x: 155, y: 260, width: 30, height: 30 },
        walls: [],
        platforms: { normal: 0, sticky: 0, super: 4 },
        spikes: [],
        fans: [],
        noPlaceZones: [
            { x: 170, y: 270, width: 150, height: 300 },

        ]
    },
    {
        id: 206,
        name: 'Against the Wind',
        difficulty: 5,
        balls: [{ x: 250, y: 350 }],
        goal: { x: 290, y: 180, width: 40, height: 40 },
        walls: [
            { x: 250, y: 280, width: 200, height: 10 },
            { x: 135, y: 450, width: 50, height: 10 },
        ],
        platforms: { normal: 1, sticky: 0, super: 3 },
        spikes: [
            { x: 110, y: 430, width: 50, height: 10, direction: 'up' },
        ],
        fans: [
            { x: 110, y: 10, width: 40, height: 40, direction: 'down' },
            { x: 280, y: 230, width: 40, height: 40, direction: 'left' },
            { x: 10, y: 180, width: 40, height: 40, direction: 'right' },
        ],
        noPlaceZones: [
            { x: 175, y: 325, width: 346, height: 76 },
        ]
    },

    {
        id: 207,
        name: 'Spike Field',
        difficulty: 4,
        balls: [{ x: 40, y: 65 }],
        goal: { x: 300, y: 470, width: 30, height: 30 },
        walls: [
            { x: 55, y: 155, width: 100, height: 10 },
            { x: 105, y: 235, width: 100, height: 10 },
            { x: 230, y: 160, width: 100, height: 10 },
            { x: 270, y: 240, width: 100, height: 10 },
            { x: 60, y: 390, width: 100, height: 10 },
            { x: 170, y: 320, width: 100, height: 10 },
            { x: 275, y: 380, width: 100, height: 10 },
            { x: 190, y: 450, width: 100, height: 10 },
            { x: 155, y: 100, width: 100, height: 10 },
            { x: 275, y: 50, width: 100, height: 10 },
        ],
        platforms: { normal: 3, sticky: 1, super: 1 },
        spikes: [
            { x: 5, y: 135, width: 100, height: 10, direction: 'up' },
            { x: 55, y: 215, width: 100, height: 10, direction: 'up' },
            { x: 180, y: 140, width: 100, height: 10, direction: 'up' },
            { x: 220, y: 220, width: 100, height: 10, direction: 'up' },
            { x: 10, y: 370, width: 100, height: 10, direction: 'up' },
            { x: 120, y: 300, width: 100, height: 10, direction: 'up' },
            { x: 225, y: 360, width: 100, height: 10, direction: 'up' },
            { x: 140, y: 430, width: 100, height: 10, direction: 'up' },
            { x: 105, y: 80, width: 100, height: 10, direction: 'up' },
            { x: 225, y: 30, width: 100, height: 10, direction: 'up' },
        ],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 208,
        name: 'Treasure Cave',
        difficulty: 6,
        balls: [{ x: 50, y: 60 }],
        goal: { x: 120, y: 450, width: 40, height: 40 },
        walls: [
            { x: 195, y: 300, width: 195, height: 10 },
            { x: 145, y: 430, width: 90, height: 10 },
            { x: 230, y: 430, width: 10, height: 160 },
            { x: 100, y: 400, width: 10, height: 210 },
        ],
        platforms: { normal: 3, sticky: 1, super: 1 },
        spikes: [
            { x: 100, y: 280, width: 100, height: 10, direction: 'up' },
            { x: 295, y: 295, width: 10, height: 10, direction: 'right' },
            { x: 225, y: 310, width: 10, height: 10, direction: 'down' },
            { x: 225, y: 335, width: 10, height: 10, direction: 'up' },
            { x: 105, y: 410, width: 85, height: 10, direction: 'up' },
        ],
        fans: [],
        noPlaceZones: [
            { x: 225, y: 150, width: 255, height: 285 },
        ]
    },
    {
        id: 209,
        name: 'Dunk',
        difficulty: 5,
        balls: [{ x: 295, y: 95 }],
        goal: { x: 150, y: 465, width: 20, height: 20 },
        walls: [
            { x: 175, y: 385, width: 10, height: 220 },
            { x: 145, y: 385, width: 10, height: 220 },
            { x: 160, y: 490, width: 30, height: 10 },
        ],
        platforms: { normal: 1, sticky: 1, super: 1 },
        spikes: [],
        fans: [
            { x: 165, y: 25, width: 40, height: 40, direction: 'down' },
        ],
        noPlaceZones: [
            { x: 110, y: 255, width: 210, height: 510 },
            { x: 280, y: 395, width: 130, height: 230 },
        ]
    },
    {
        id: 210,
        name: 'Dangerous Highway',
        difficulty: 6,
        balls: [{ x: 30, y: 110 }],
        goal: { x: 300, y: 240, width: 30, height: 30 },
        walls: [
            { x: 155, y: 265, width: 100, height: 10 },
            { x: 285, y: 220, width: 110, height: 10 },
            { x: 285, y: 290, width: 110, height: 10 },
        ],
        platforms: { normal: 0, sticky: 3, super: 0 },
        spikes: [
            { x: 230, y: 270, width: 105, height: 10, direction: 'up' },
            { x: 230, y: 230, width: 105, height: 10, direction: 'down' },
            { x: 105, y: 245, width: 100, height: 10, direction: 'up' },
        ],
        fans: [
            { x: 155, y: 15, width: 40, height: 40, direction: 'down' },
            { x: 15, y: 220, width: 40, height: 40, direction: 'right' },
            { x: 75, y: 475, width: 40, height: 40, direction: 'up' },
        ],
        noPlaceZones: [
            { x: 270, y: 260, width: 140, height: 520 },

        ]
    },
    {
        id: 211,
        name: 'Criss Cross',
        difficulty: 6,
        balls: [{ x: 45, y: 195 }, { x: 270, y: 40 }, { x: 260, y: 340 }],
        goal: { x: 15, y: 435, width: 30, height: 30 },
        walls: [
            { x: 170, y: 60, width: 10, height: 120 },
            { x: 170, y: 205, width: 10, height: 80 },
            { x: 170, y: 350, width: 10, height: 120 },
            { x: 260, y: 245, width: 190, height: 10 },
            { x: 50, y: 475, width: 95, height: 10 },
            { x: 260, y: 360, width: 35, height: 10 },
        ],
        platforms: { normal: 0, sticky: 0, super: 5 },
        spikes: [
            { x: 165, y: 150, width: 10, height: 10, direction: 'up' },
            { x: 175, y: 225, width: 160, height: 10, direction: 'up' },

        ],
        fans: [],
        noPlaceZones: [
            { x: 260, y: 330, width: 185, height: 160 },
        ]
    },
    {
        id: 212,
        name: 'Stairs',
        difficulty: 4,
        balls: [{ x: 45, y: 90 }],
        goal: { x: 15, y: 450, width: 40, height: 40 },
        walls: [
            { x: 125, y: 165, width: 10, height: 60 },
            { x: 150, y: 190, width: 60, height: 10 },
            { x: 175, y: 215, width: 10, height: 60 },
            { x: 200, y: 240, width: 60, height: 10 },
            { x: 225, y: 265, width: 10, height: 60 },
            { x: 175, y: 0, width: 350, height: 10 },
            { x: 130, y: 290, width: 260, height: 10 },
            { x: 100, y: 140, width: 60, height: 10 },
            { x: 75, y: 215, width: 10, height: 150 },
            { x: 180, y: 80, width: 10, height: 150 },
            { x: 230, y: 105, width: 10, height: 200 },
            { x: 280, y: 130, width: 10, height: 250 },
            { x: 180, y: 315, width: 10, height: 50 },
            { x: 180, y: 450, width: 10, height: 120 },
        ],
        platforms: { normal: 1, sticky: 4, super: 1 },
        spikes: [
            { x: 210, y: 5, width: 10, height: 200, direction: 'left' },
            { x: 160, y: 5, width: 10, height: 150, direction: 'left' },
            { x: 260, y: 5, width: 10, height: 250, direction: 'left' },
            { x: 175, y: 375, width: 10, height: 10, direction: 'up' },
            { x: 175, y: 345, width: 10, height: 10, direction: 'down' },
        ],
        fans: [
            { x: 15, y: 240, width: 40, height: 40, direction: 'right' },
            { x: 15, y: 190, width: 40, height: 40, direction: 'right' },
            { x: 15, y: 140, width: 40, height: 40, direction: 'right' },
            { x: 15, y: 90, width: 40, height: 40, direction: 'right' },
        ],
        noPlaceZones: []
    },
    {
        id: 213,
        name: 'Spiky Hurdles',
        difficulty: 6,
        balls: [{ x: 240, y: 300 }],
        goal: { x: 10, y: 350, width: 30, height: 30 },
        walls: [
            { x: 170, y: 340, width: 10, height: 340 }, // The Barrier
            { x: 150, y: 170, width: 50, height: 10 }, // The Barrier
            { x: 130, y: 340, width: 10, height: 340 }, // The Barrier
            { x: 25, y: 390, width: 60, height: 10 },
            { x: 50, y: 305, width: 10, height: 170 },
        ],
        platforms: { normal: 1, sticky: 0, super: 2 }, // Must jump over
        spikes: [
            { x: 125, y: 150, width: 50, height: 10, direction: 'up' },
            { x: 45, y: 205, width: 10, height: 10, direction: 'up' },
            { x: 60, y: 220, width: 10, height: 175, direction: 'right' },
            { x: 180, y: 165, width: 10, height: 340, direction: 'right' },
            { x: 110, y: 165, width: 10, height: 340, direction: 'left' },
            { x: 5, y: 400, width: 50, height: 10, direction: 'down' },
        ],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 214,
        name: 'Chain Reacion',
        difficulty: 6,
        balls: [{ x: 170, y: 470 }, { x: 120, y: 40 }],
        goal: { x: 15, y: 35, width: 40, height: 40 },
        walls: [
            { x: 210, y: 485, width: 265, height: 10 },
            { x: 150, y: 445, width: 155, height: 10 },
            { x: 70, y: 210, width: 10, height: 260 },
            { x: 175, y: 85, width: 215, height: 10 },
            { x: 240, y: 220, width: 215, height: 10 },
            { x: 225, y: 355, width: 10, height: 190 },
        ],
        platforms: { normal: 2, sticky: 0, super: 2 },
        spikes: [
            { x: 80, y: 425, width: 140, height: 10, direction: 'up' },
            { x: 250, y: 200, width: 85, height: 10, direction: 'up' },
            { x: 50, y: 80, width: 10, height: 260, direction: 'left' },
            { x: 220, y: 245, width: 10, height: 10, direction: 'up' },
        ],
        fans: [
            { x: 40, y: 505, width: 40, height: 40, direction: 'up' },
            { x: 5, y: 505, width: 40, height: 40, direction: 'up' },
        ],
        noPlaceZones: [
            { x: 175, y: 415, width: 345, height: 150 },
            { x: 175, y: 155, width: 345, height: 140 },
        ]
    },
    {
        id: 215,
        name: 'The Maze',
        difficulty: 7,
        balls: [{ x: 40, y: 140 }],
        goal: { x: 185, y: 480, width: 20, height: 20 },
        walls: [
            { x: 200, y: 80, width: 280, height: 10 },
            { x: 97.5, y: 140, width: 50, height: 10 },
            { x: 40, y: 205, width: 70, height: 10 },
            { x: 77.5, y: 172.5, width: 10, height: 75 },
            { x: 260, y: 165, width: 10, height: 80 },
            { x: 195, y: 205, width: 140, height: 10 },
            { x: 100, y: 205, width: 60, height: 10 },
            { x: 120, y: 172.5, width: 10, height: 75 },
            { x: 230, y: 290, width: 210, height: 10 },
            { x: 165, y: 450, width: 10, height: 120 },
            { x: 225, y: 450, width: 10, height: 120 },
        ],
        platforms: { normal: 2, sticky: 3, super: 3 },
        spikes: [
            { x: 240, y: 130, width: 10, height: 60, direction: 'left' },
            { x: 60, y: 90, width: 170, height: 10, direction: 'down' },
            { x: 280, y: 90, width: 55, height: 10, direction: 'down' },
            { x: 320, y: 100, width: 10, height: 170, direction: 'left' },
            { x: 5, y: 185, width: 70, height: 10, direction: 'up' },
            { x: 175, y: 240, width: 40, height: 10, direction: 'up' },
            { x: 175, y: 390, width: 10, height: 120, direction: 'right' },
            { x: 205, y: 390, width: 10, height: 120, direction: 'left' },
            { x: 125, y: 270, width: 50, height: 10, direction: 'up' },
            { x: 215, y: 270, width: 120, height: 10, direction: 'up' },
            { x: 5, y: 215, width: 140, height: 10, direction: 'down' },
            { x: 125, y: 185, width: 120, height: 10, direction: 'up' },
        ],
        fans: [
            { x: 10, y: 340, width: 40, height: 40, direction: 'right' },
            { x: 175, y: 260, width: 40, height: 40, direction: 'down' },
        ],
        noPlaceZones: []
    },


    {
        id: 216,
        name: 'Tunnel',
        difficulty: 6,
        balls: [{ x: 30, y: 325 }],
        goal: { x: 260, y: 310, width: 30, height: 30 },
        walls: [
            { x: 175, y: 305, width: 345, height: 10 },
            { x: 175, y: 345, width: 355, height: 10 },
        ],
        platforms: { normal: 0, sticky: 0, super: 4 },
        spikes: [],
        fans: [
            { x: 305, y: 330, width: 30, height: 30, direction: 'left' },
        ],
        noPlaceZones: [
            { x: 175, y: 150, width: 350, height: 300 },
        ]
    },
    {
        id: 217,
        name: 'Precision II',
        difficulty: 8,
        balls: [{ x: 175, y: 20 }],
        goal: { x: 165, y: 490, width: 40, height: 20 },
        walls: [
            { x: 120, y: 255, width: 10, height: 510 },
            { x: 230, y: 255, width: 10, height: 510 },
            { x: 170, y: 0, width: 340, height: 10 },
            { x: 155, y: 340, width: 70, height: 10 },
            { x: 200, y: 200, width: 70, height: 10 },
        ],
        spikes: [
            { x: 165, y: 180, width: 60, height: 10, direction: 'up' },
            { x: 165, y: 210, width: 60, height: 10, direction: 'down' },
            { x: 125, y: 320, width: 60, height: 10, direction: 'up' },
            { x: 125, y: 350, width: 60, height: 10, direction: 'down' },
            { x: 150, y: 195, width: 60, height: 10, direction: 'left' },
            { x: 145, y: 335, width: 60, height: 10, direction: 'right' },
        ],
        platforms: { normal: 1, sticky: 1, super: 1 },
        fans: [],
        noPlaceZones: [
            { x: 175, y: 430, width: 100, height: 160 },

        ]
    },

    {
        id: 218,
        name: 'Leap of Faith',
        difficulty: 9,
        balls: [{ x: 30, y: 85 }],
        goal: { x: 280, y: 265, width: 20, height: 20 },
        walls: [
            { x: 292.5, y: 290, width: 75, height: 10 },
            { x: 165, y: 285, width: 10, height: 60 },
            { x: 212.5, y: 210, width: 65, height: 10 },
            { x: 260, y: 270, width: 10, height: 45 },
            { x: 175, y: 255, width: 30, height: 10 },
            { x: 185, y: 232.5, width: 10, height: 50 },
            { x: 250, y: 250, width: 30, height: 10 },
            { x: 240, y: 230, width: 10, height: 40 },
            { x: 215, y: 190, width: 10, height: 40 },
            { x: 325, y: 245, width: 10, height: 95 },
            { x: 310, y: 200, width: 40, height: 10 },
            { x: 290, y: 177.5, width: 10, height: 55 },
            { x: 275, y: 155, width: 35, height: 10 },
            { x: 260, y: 137.5, width: 10, height: 45 },
            { x: 210, y: 120, width: 100, height: 10 },
            { x: 165, y: 140, width: 10, height: 40 },
            { x: 40, y: 165, width: 75, height: 10 },
        ],
        platforms: { normal: 2, sticky: 1, super: 1 },
        spikes: [
            { x: 220, y: 190, width: 25, height: 10, direction: 'up' },
            { x: 180, y: 190, width: 30, height: 10, direction: 'up' },
            { x: 210, y: 157.5, width: 10, height: 10, direction: 'up' },
            { x: 175, y: 125, width: 10, height: 35, direction: 'right' },
            { x: 250, y: 205, width: 10, height: 40, direction: 'right' },
            { x: 240, y: 125, width: 10, height: 35, direction: 'left' },
            { x: 270, y: 160, width: 10, height: 40, direction: 'left' },
            { x: 255, y: 165, width: 15, height: 10, direction: 'down' },
            { x: 285, y: 210, width: 35, height: 10, direction: 'down' },
            { x: 305, y: 220, width: 10, height: 50, direction: 'left' },
            { x: 165, y: 205, width: 10, height: 45, direction: 'left' },
            { x: 5, y: 145, width: 70, height: 10, direction: 'up' },
        ],
        fans: [],
        noPlaceZones: [
            { x: 255, y: 255, width: 185, height: 500 },
        ]
    },
    {
        id: 219,
        name: 'Wrong Way',
        difficulty: 8,
        balls: [{ x: 95, y: 135 }],
        goal: { x: 270, y: 165, width: 40, height: 40 },
        walls: [
            { x: 170, y: 60, width: 10, height: 120 },
            { x: 170, y: 305, width: 10, height: 170 },
            { x: 175, y: 0, width: 350, height: 10 },
            { x: 290, y: 340, width: 90, height: 10 },
        ],
        platforms: { normal: 2, sticky: 1, super: 2 },
        spikes: [
            { x: 245, y: 350, width: 90, height: 10, direction: 'down' },
        ],
        fans: [
            { x: 330, y: 145, width: 40, height: 40, direction: 'left' },
            { x: 330, y: 185, width: 40, height: 40, direction: 'left' },
            { x: 95, y: 465, width: 40, height: 40, direction: 'up' },
            { x: 55, y: 465, width: 40, height: 40, direction: 'up' },
            { x: 270, y: 465, width: 40, height: 40, direction: 'up' },
        ],
        noPlaceZones: []
    },


    {
        id: 220,
        name: 'Treacherous Cavern',
        difficulty: 9,
        balls: [{ x: 40, y: 100 }],
        goal: { x: 10, y: 380, width: 40, height: 40 },
        walls: [
            { x: 60, y: 385, width: 10, height: 90 },
            { x: 30, y: 430, width: 70, height: 10 },
            { x: 140, y: 235, width: 280, height: 10 },
            { x: 140, y: 195, width: 280, height: 10 },
            { x: 230, y: 290, width: 235, height: 10 },
            { x: 115, y: 317.5, width: 10, height: 65 },
            { x: 85, y: 345, width: 60, height: 10 },
            { x: 155, y: 130, width: 120, height: 10 },
            { x: 275, y: 160, width: 10, height: 150 },
            { x: 100, y: 65, width: 10, height: 130 },
            { x: 210, y: 65, width: 10, height: 130 },
            { x: 175, y: 0, width: 350, height: 10 },
        ],
        platforms: { normal: 1, sticky: 1, super: 3 },
        spikes: [
            { x: 95, y: 175, width: 120, height: 10, direction: 'up' },
            { x: 95, y: 140, width: 120, height: 10, direction: 'down' },
            { x: 80, y: 5, width: 10, height: 130, direction: 'left' },
            { x: 220, y: 5, width: 10, height: 130, direction: 'right' },
            { x: 10, y: 5, width: 10, height: 185, direction: 'right' },
            { x: 285, y: 85, width: 10, height: 155, direction: 'right' },
            { x: 270, y: 70, width: 10, height: 10, direction: 'up' },
            { x: 255, y: 85, width: 10, height: 50, direction: 'left' },
            { x: 10, y: 240, width: 10, height: 140, direction: 'right' },
            { x: 95, y: 285, width: 10, height: 55, direction: 'left' },
            { x: 40, y: 340, width: 10, height: 40, direction: 'left' },
            { x: 55, y: 325, width: 45, height: 10, direction: 'up' },

        ],
        fans: [],
        noPlaceZones: []
    },
    {
        id: 221,
        name: 'Speedway',
        difficulty: 7,
        requiredStars: 126,
        balls: [{ x: 50, y: 50 }],
        goal: { x: 280, y: 450, width: 40, height: 40 },
        walls: [
            { x: 125, y: 150, width: 250, height: 10 },
            { x: 125, y: 230, width: 250, height: 10 },
            { x: 215, y: 190, width: 250, height: 10 },
            { x: 215, y: 270, width: 250, height: 10 },
            { x: 125, y: 310, width: 250, height: 10 },
        ],
        platforms: { normal: 2, sticky: 0, super: 1 },
        spikes: [
            { x: 320, y: 0, width: 10, height: 110, direction: 'left' },

        ],
        fans: [],
        noPlaceZones: []
    },

    {
        id: 222,
        name: 'Reverse Loop',
        difficulty: 9,
        requiredStars: 129,
        balls: [{ x: 150, y: 375 }],
        goal: { x: 120, y: 260, width: 40, height: 40 },
        fans: [
            { x: 20, y: 150, width: 40, height: 40, direction: 'right' },
            { x: 20, y: 350, width: 40, height: 40, direction: 'right' },
        ],
        walls: [
            { x: 170, y: 60, width: 10, height: 120 },
            { x: 170, y: 270, width: 10, height: 160 },
            { x: 170, y: 450, width: 10, height: 120 },
            { x: 150, y: 395, width: 40, height: 10 },
        ],
        spikes: [],
        platforms: { normal: 0, sticky: 1, super: 3 },
        noPlaceZones: [
            { x: 100, y: 390, width: 190, height: 240 },
        ]
    },
    {
        id: 223,
        name: 'Mirror Collision',
        difficulty: 10,
        requiredStars: 135,
        balls: [{ x: 265, y: 275 }, { x: 75, y: 275 }, { x: 80, y: 165 }, { x: 260, y: 165 }],
        goal: { x: 180, y: 400, width: 100, height: 40 },
        walls: [
            { x: 170, y: 300, width: 10, height: 200 },
            { x: 170, y: 475, width: 10, height: 70 },
            { x: 170, y: 80, width: 10, height: 160 },
            { x: 260, y: 180, width: 40, height: 10 },
            { x: 80, y: 180, width: 40, height: 10 },
            { x: 245, y: 172.5, width: 10, height: 15 },
            { x: 95, y: 172.5, width: 10, height: 15 },
        ],
        platforms: { normal: 1, sticky: 1, super: 3 },
        spikes: [
            { x: 180, y: 200, width: 10, height: 15, direction: 'right' },
            { x: 150, y: 200, width: 10, height: 15, direction: 'left' },
            { x: 180, y: 0, width: 10, height: 155, direction: 'right' },
            { x: 150, y: 0, width: 10, height: 155, direction: 'left' },
            { x: 165, y: 185, width: 10, height: 10, direction: 'up' },
            { x: 165, y: 165, width: 10, height: 10, direction: 'down' },
        ],
        fans: [],
        noPlaceZones: [
            { x: 170, y: 120, width: 340, height: 240 },

        ]
    },
];

export default world2Levels;
