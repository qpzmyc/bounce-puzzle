// Level definitions - Reworked for Tutorial Progression
// Constraints: No Left Wall, No Bottom Wall (Spikes at bottom)

const levels = [
    // 1. INTRO: Basic Bounce
    {
        id: 101,
        name: "Hello Bounce",
        balls: [{ x: 80, y: 50 }],
        goal: { x: 250, y: 350, width: 40, height: 40 },
        walls: [
            { x: 345, y: 240, width: 15, height: 480 }, // Right Wall
        ],
        platforms: { normal: 3, sticky: 0, super: 0 },
        fans: [],
        spikes: [],
        noPlaceZones: [],
    },
    // 2. INTRO: Spikes
    // Spike directly in path. Bounce around it.

    {
        id: 102,
        name: "Watch Your Step",
        balls: [{ x: 170, y: 50 }],
        goal: { x: 150, y: 400, width: 40, height: 40 },  // Centered (GAME.width/2 - width/2 = 170 - 25 = 145)
        walls: [
            { x: 170, y: 220, width: 100, height: 10 }, // Right Wall
        ],
        platforms: { normal: 4, sticky: 0, super: 0 },
        fans: [],
        spikes: [
            { x: 120, y: 200, width: 100, height: 10, direction: 'up' } // Middle spike
        ],
        noPlaceZones: [],
    },
    // 3. INTRO: Fans
    // Fan blows right. Ball drops left. Goal is far right.
    // You need to bounce it up slightly so the fan carries it.
    {
        id: 103,
        name: "Windy Day",
        balls: [{ x: 60, y: 60 }],
        goal: { x: 270, y: 300, width: 40, height: 40 },
        walls: [
            { x: 345, y: 240, width: 15, height: 480 },
        ],
        platforms: { normal: 3, sticky: 0, super: 0 },
        fans: [
            { x: 10, y: 70, width: 50, height: 100, direction: 'right' }  // Moved right to be fully in bounds
        ],
        spikes: [],
        noPlaceZones: [{ x: 90, y: 255, width: 170, height: 510 }],
    },
    // 4. INTRO: SUPER
    {
        id: 104,
        name: "Wall Dive",
        balls: [{ x: 50, y: 200 }],
        goal: { x: 280, y: 230, width: 40, height: 40 }, // Goal moved Lower (150 -> 180) for easier shot
        walls: [
            { x: 175, y: 190, width: 15, height: 380 }, // Wall extended LOWER (height 260->360, y 130->180) to force tight angle
            { x: 175, y: 0, width: 350, height: 10 },
        ],
        platforms: { normal: 2, sticky: 0, super: 2 },
        fans: [],
        spikes: [],
        noPlaceZones: [{ x: 170, y: 190, width: 340, height: 380 }],
    },


    // 5. INTRO: Sticky
    {
        id: 105,
        name: "Physics Lab",
        balls: [{ x: 50, y: 150 }, { x: 200, y: 50 }],  // Left ball starts lower to require super pad
        goal: { x: 270, y: 200, width: 40, height: 40 }, // Lowered goal
        walls: [
            { x: 150, y: 230, width: 10, height: 300 }, // Taller/Higher divider
        ],
        platforms: { normal: 0, sticky: 2, super: 2 },
        fans: [],
        spikes: [],
        noPlaceZones: [{ x: 75, y: 140, width: 150, height: 150 }],
    },

    // 6. MAIN: The Drop (True Zig Zag)
    {
        id: 106,
        name: "Zig Zag",
        balls: [{ x: 50, y: 50 }],
        goal: { x: 50, y: 460, width: 40, height: 40 },
        walls: [
            { x: 100, y: 150, width: 200, height: 10 }, // Left Top
            { x: 240, y: 280, width: 200, height: 10 }, // Right Middle
            { x: 100, y: 410, width: 200, height: 10 }, // Left Bottom
        ],
        platforms: { normal: 4, sticky: 2, super: 1 },
        fans: [],
        spikes: [
            { x: 0, y: 130, width: 200, height: 10, direction: 'up' },
            { x: 140, y: 260, width: 200, height: 10, direction: 'up' },
            { x: 0, y: 390, width: 200, height: 10, direction: 'up' },
        ],
    },

    // 7. MAIN: Crosswind
    {
        id: 107,
        name: "Crosswind",
        balls: [{ x: 170, y: 50 }],
        goal: { x: 170, y: 450, width: 40, height: 40 },
        walls: [
            { x: 280, y: 260, width: 80, height: 10 },
            { x: 60, y: 400, width: 80, height: 10 },
        ],
        platforms: { normal: 1, sticky: 2, super: 0 },
        fans: [
            { x: 10, y: 150, width: 40, height: 40, direction: 'right' },
            { x: 290, y: 300, width: 40, height: 40, direction: 'left' },
            { x: 290, y: 345, width: 40, height: 40, direction: 'left' },
            { x: 10, y: 105, width: 40, height: 40, direction: 'right' },
        ],
        spikes: [
            { x: 240, y: 240, width: 80, height: 10, direction: 'up' },  // Lowered from 180 to 240
            { x: 20, y: 380, width: 80, height: 10, direction: 'up' },   // Bottom left
        ],
        noPlaceZones: [
            { x: 280, y: 200, width: 100, height: 150 },
            { x: 60, y: 340, width: 100, height: 150 },
        ],
    },
    // 8. INTRO: Dual Balls
    // Two balls, one goal. Symmetrical.
    {
        id: 108,
        name: "Double Trouble",
        balls: [{ x: 80, y: 50 }, { x: 260, y: 50 }],
        goal: { x: 170, y: 350, width: 40, height: 40 },
        walls: [],
        platforms: { normal: 4, sticky: 0, super: 0 },
        fans: [],
        spikes: [],
        noPlaceZones: [
            { x: 175, y: 110, width: 350, height: 300 },

        ],
    },
    // 9. MAIN: Precision (True Needle Thread)
    {
        id: 109,
        name: "Needle Thread",
        balls: [{ x: 50, y: 50 }], // Offset, not aligned!
        goal: { x: 50, y: 450, width: 40, height: 40 }, // Moved to LEFT side (170 -> 50)
        walls: [
            { x: 80, y: 295, width: 160, height: 10 }, // Left block (Ends at x=160)
            { x: 260, y: 295, width: 160, height: 10 }, // Right block (Starts at x=180)
        ],
        platforms: { normal: 2, sticky: 2, super: 0 },
        fans: [],
        spikes: [
            { x: 0, y: 275, width: 155, height: 10, direction: 'up' },    // Left side spikes (up to gap)
            { x: 185, y: 275, width: 155, height: 10, direction: 'up' },  // Right side spikes (after gap)
        ],
        noPlaceZones: [
            { x: 200, y: 140, width: 20, height: 260 }, // Gap
        ],
    },

    // 10. BOSS: Upside Down
    {
        id: 110,
        name: "Upside Down Chute",
        balls: [{ x: 30, y: 400 }, { x: 300, y: 400 }],
        goal: { x: 170, y: 20, width: 40, height: 40 },
        walls: [
            { x: 155, y: 85, width: 10, height: 160 },
            { x: 225, y: 85, width: 10, height: 160 },
            { x: 30, y: 260, width: 60, height: 10 },
            { x: 245, y: 260, width: 270, height: 10 },
        ],
        platforms: { normal: 5, sticky: 2, super: 0 },
        fans: [
            { x: 10, y: 450, width: 40, height: 40, direction: 'up' },
            { x: 57, y: 450, width: 40, height: 40, direction: 'up' },
            { x: 104, y: 450, width: 40, height: 40, direction: 'up' },
            { x: 151, y: 450, width: 40, height: 40, direction: 'up' },
            { x: 198, y: 450, width: 40, height: 40, direction: 'up' },
            { x: 245, y: 450, width: 40, height: 40, direction: 'up' },
            { x: 292, y: 450, width: 40, height: 40, direction: 'up' },
        ],
        spikes: [
            { x: 5, y: 270, width: 55, height: 10, direction: 'down' },
            { x: 110, y: 270, width: 225, height: 10, direction: 'down' },
            { x: 0, y: 0, width: 340, height: 10, direction: 'down' },
            { x: 165, y: 5, width: 10, height: 160, direction: 'right' },
            { x: 205, y: 5, width: 10, height: 160, direction: 'left' },

        ],
        noPlaceZones: [],
    },

    // 11. The Decoy
    {
        id: 111,
        name: "The Decoy",
        balls: [{ x: 50, y: 50 }],
        goal: { x: 280, y: 450, width: 40, height: 40 },
        walls: [
            { x: 160, y: 285, width: 10, height: 80 }, // Divider
            { x: 160, y: 165, width: 10, height: 80 }, // Divider
            { x: 65, y: 300, width: 110, height: 10 }, // Divider
        ],
        platforms: { normal: 2, sticky: 1, super: 0 }, // Added 2 extra sticky (1->3)
        fans: [
            { x: 230, y: 200, width: 40, height: 40, direction: 'left' }
        ],
        spikes: [
            { x: 10, y: 280, width: 110, height: 10, direction: 'up' }, // Moved decent bit left (center 70 -> 50)
        ],

        noPlaceZones: [],
    },

    // 12. Ascension
    {
        id: 112,
        name: "Ascension",
        balls: [{ x: 50, y: 450 }],
        goal: { x: 120, y: 200, width: 40, height: 40 },
        walls: [
            { x: 130, y: 250, width: 250, height: 10 },
            { x: 285, y: 10, width: 130, height: 10 },
            { x: 110, y: 215, width: 10, height: 70 },
            { x: 170, y: 215, width: 10, height: 70 },
        ],
        platforms: { normal: 1, sticky: 0, super: 2 },
        fans: [
            { x: 50, y: 350, width: 50, height: 40, direction: 'right' }, // Turned Left fan to RIGHT
            { x: 260, y: 300, width: 50, height: 40, direction: 'up' }, // Moved right fan further right (230 -> 260)
        ],
        spikes: [],
        noPlaceZones: [],
    },

    // 13. Precision
    {
        id: 113,
        name: "Precision",
        balls: [{ x: 300, y: 50 }],
        goal: { x: 290, y: 265, width: 30, height: 30 },
        walls: [
            { x: 230, y: 250, width: 220, height: 10 }, // Ceiling
            { x: 230, y: 310, width: 220, height: 10 }, // Floor (Raised 350->330)
        ],
        platforms: { normal: 3, sticky: 2, super: 0 },
        fans: [
            { x: 10, y: 260, width: 40, height: 40, direction: 'right' } // Moved Up/Left (50,300 -> 30,250)
        ],
        spikes: [
            { x: 120, y: 260, width: 230, height: 10, direction: 'down' }, // Ceiling spikes
            { x: 120, y: 290, width: 230, height: 10, direction: 'up' }, // Floor spikes (Raised)
            { x: 120, y: 230, width: 230, height: 10, direction: 'up' }, // Ceiling spikes

        ],
        noPlaceZones: [
            { x: 260, y: 280, width: 180, height: 75 }, // Ceiling no place zone
        ],
    },

    // 14. The Loop
    {
        id: 114,
        name: "The Loop",
        balls: [{ x: 50, y: 100 }],
        goal: { x: 50, y: 350, width: 40, height: 40 },
        walls: [
            { x: 175, y: 230, width: 10, height: 150 }, // Barrier
            { x: 175, y: 400, width: 10, height: 110 }, // Barrier
            { x: 120, y: 0, width: 230, height: 10 },
        ],
        platforms: { normal: 1, sticky: 2, super: 1 },
        fans: [
            // 3 Upward fans below goal to prevent straight drop
            { x: 20, y: 400, width: 40, height: 40, direction: 'up' },
            { x: 70, y: 400, width: 40, height: 40, direction: 'up' },
            { x: 120, y: 400, width: 40, height: 40, direction: 'up' },
            { x: 300, y: 100, width: 40, height: 40, direction: 'left' },
            { x: 300, y: 300, width: 40, height: 40, direction: 'left' }
        ],
        spikes: [],
        noPlaceZones: [],
    },

    // 15. Bunker
    {
        id: 115,
        name: "Two Points",
        balls: [{ x: 50, y: 110 }, { x: 100, y: 230 }], // Start low left
        goal: { x: 290, y: 400, width: 40, height: 40 }, // In box bottom right
        walls: [
            { x: 280, y: 400, width: 10, height: 100 }, // Left wall of bunker
            { x: 310, y: 450, width: 60, height: 10 },  // Roof (with gap?) No, open top.
            { x: 140, y: 355, width: 280, height: 10 }, // Right wall of bunker
        ],
        platforms: { normal: 1, sticky: 0, super: 2 }, // Need to super jump over
        fans: [],
        spikes: [
            { x: 0, y: 335, width: 280, height: 10, direction: 'up' }, // Floor hazard
            { x: 320, y: 0, width: 10, height: 230, direction: 'left' }, // Left hazard
        ],
        noPlaceZones: [
            { x: 250, y: 255, width: 170, height: 510 }, // Left wall of bunker
        ],
    },

    // 16. Switchback
    {
        id: 116,
        name: "Strong Current",
        balls: [{ x: 50, y: 80 }],
        goal: { x: 150, y: 450, width: 40, height: 40 },
        walls: [],
        platforms: { normal: 4, sticky: 0, super: 0 },
        fans: [
            { x: 30, y: 0, width: 40, height: 40, direction: 'down' },
            { x: 100, y: 0, width: 40, height: 40, direction: 'down' },
            { x: 270, y: 150, width: 40, height: 40, direction: 'left' },
            { x: 270, y: 200, width: 40, height: 40, direction: 'left' },
            { x: 270, y: 250, width: 40, height: 40, direction: 'left' },
            { x: 270, y: 300, width: 40, height: 40, direction: 'left' },
            { x: 270, y: 350, width: 40, height: 40, direction: 'left' },
            { x: 270, y: 400, width: 40, height: 40, direction: 'left' },
            { x: 270, y: 100, width: 40, height: 40, direction: 'left' },
        ],
        spikes: [
            { x: 10, y: 0, width: 10, height: 510, direction: 'right' },
        ]
    },
    // 17. The Vault
    {
        id: 117,
        name: "The Vault",
        balls: [{ x: 175, y: 50 }], // Falling down
        goal: { x: 150, y: 350, width: 40, height: 40 }, // High up, guarded
        walls: [
            { x: 170, y: 330, width: 100, height: 10 }, // Floor under goa
            { x: 220, y: 375, width: 10, height: 100 },
            { x: 120, y: 375, width: 10, height: 100 },
            { x: 50, y: 140, width: 100, height: 10 },
            { x: 250, y: 140, width: 200, height: 10 },
            { x: 325, y: 250, width: 50, height: 10 },
            { x: 125, y: 250, width: 250, height: 10 },
        ],
        platforms: { normal: 1, sticky: 2, super: 2 }, // Chain super jumps
        fans: [],
        spikes: [
            { x: 5, y: 120, width: 95, height: 10, direction: 'up' },
            { x: 150, y: 120, width: 185, height: 10, direction: 'up' },
            { x: 300, y: 230, width: 35, height: 10, direction: 'up' },
            { x: 5, y: 230, width: 245, height: 10, direction: 'up' },
            { x: 120, y: 310, width: 100, height: 10, direction: 'up' },
        ],
        noPlaceZones: [
            { x: 175, y: 340, width: 350, height: 200 },
        ],
    },

    // 18. Orbit
    {
        id: 118,
        name: "Orbit",
        balls: [{ x: 30, y: 50 }, { x: 45, y: 80 }, { x: 60, y: 110 }],
        goal: { x: 220, y: 360, width: 40, height: 40 }, // CENTER
        walls: [
            { x: 175, y: 480, width: 350, height: 10 },
            { x: 180, y: 350, width: 180, height: 10 },
            { x: 180, y: 410, width: 180, height: 10 },
            { x: 135, y: 200, width: 270, height: 10 },
            { x: 265, y: 130, width: 350, height: 10 },
            { x: 270, y: 305, width: 10, height: 220 }, // Center divider
        ],
        platforms: { normal: 2, sticky: 1, super: 1 },
        fans: [
            { x: 0, y: 140, width: 40, height: 40, direction: 'right' },
            { x: 290, y: 210, width: 40, height: 40, direction: 'down' },
            { x: 230, y: 425, width: 40, height: 40, direction: 'left' },
        ],
        spikes: [
            { x: 90, y: 330, width: 175, height: 10, direction: 'up' },
        ],
        noPlaceZones: [],
    },

    // 19. Choice
    {
        id: 119,
        name: "Funnel",
        balls: [
            { x: 320, y: 50 },
            { x: 170, y: 50 },
            { x: 200, y: 50 },
            { x: 230, y: 50 },
            { x: 260, y: 50 },
            { x: 290, y: 50 },
            { x: 140, y: 50 },
            { x: 110, y: 50 },
            { x: 80, y: 50 },
            { x: 50, y: 50 },
            { x: 20, y: 50 },
        ],
        goal: { x: 270, y: 420, width: 40, height: 40 },
        walls: [
            { x: 280, y: 400, width: 120, height: 10 },
            { x: 70, y: 270, width: 140, height: 10 },
            { x: 270, y: 270, width: 140, height: 10 },

        ],
        platforms: { normal: 6, sticky: 3, super: 1 }, // TONS of platforms
        fans: [],
        spikes: [
            { x: 5, y: 250, width: 135, height: 10, direction: 'up' },
            { x: 200, y: 250, width: 135, height: 10, direction: 'up' },
            { x: 220, y: 380, width: 115, height: 10, direction: 'up' },
        ],
        noPlaceZones: [
            { x: 175, y: 300, width: 350, height: 150 },
        ],
    },

    // 20. Mastermind
    {
        id: 120,
        name: "Two Paths",
        balls: [{ x: 80, y: 150 }, { x: 60, y: 450 }],
        goal: { x: 185, y: 50, width: 40, height: 40 }, // Top right
        walls: [
            { x: 175, y: 150, width: 10, height: 300 }, // Vertical divider
            { x: 210, y: 300, width: 140, height: 10 }, // Vertical divider
            { x: 210, y: 340, width: 140, height: 10 }, // Vertical divider
            { x: 145, y: 320, width: 10, height: 40 }, // Vertical divider
            { x: 275, y: 320, width: 10, height: 40 }, // Vertical divider
        ],
        platforms: { normal: 2, sticky: 2, super: 1 },
        fans: [
            { x: 20, y: 350, width: 40, height: 40, direction: 'right' }, // Bottom left pusher
            { x: 170, y: 480, width: 40, height: 40, direction: 'up' },   // Bottom right lifter
            { x: 230, y: 480, width: 40, height: 40, direction: 'up' },   // Bottom right lifter
            { x: 290, y: 480, width: 40, height: 40, direction: 'up' },   // Bottom right lifter
        ],
        spikes: [
            { x: 140, y: 350, width: 140, height: 10, direction: 'down' }, // Center hazard
            { x: 140, y: 390, width: 140, height: 10, direction: 'up' }, // Center hazard
            { x: 140, y: 410, width: 140, height: 10, direction: 'down' }, // Vertical divider
        ],
        noPlaceZones: [
            { x: 260, y: 250, width: 180, height: 300 }, // Vertical divider
        ],
    },

    // 21. Bonus I (50 Stars)
    {
        id: 121,
        name: "Star Gate I",
        requiredStars: 50,
        balls: [{ x: 175, y: 50 }],
        goal: { x: 160, y: 310, width: 30, height: 30 },
        walls: [
            { x: 175, y: 250, width: 80, height: 10 },
            { x: 70, y: 250, width: 50, height: 10 },
            { x: 275, y: 250, width: 40, height: 10 },
            { x: 175, y: 350, width: 70, height: 10 },
        ],
        platforms: { normal: 1, sticky: 0, super: 2 },
        fans: [
            { x: 100, y: 450, width: 40, height: 40, direction: 'up' },
            { x: 220, y: 450, width: 40, height: 40, direction: 'up' }
        ],
        spikes: [
            { x: 0, y: 0, width: 350, height: 10, direction: 'down' },
            { x: 140, y: 260, width: 70, height: 10, direction: 'down' },
        ],
        noPlaceZones: [
            { x: 175, y: 250, width: 350, height: 200 },
            { x: 175, y: 400, width: 140, height: 100 },
        ],
    },

    // 22. Bonus II (58 Stars)
    {
        id: 122,
        name: "Star Gate II",
        requiredStars: 58,
        balls: [{ x: 50, y: 350 }],
        goal: { x: 300, y: 50, width: 30, height: 30 },
        walls: [
            { x: 175, y: 370, width: 10, height: 270 },
            { x: 175, y: 100, width: 10, height: 200 },
            { x: 175, y: 0, width: 350, height: 20 },
        ],
        platforms: { normal: 1, sticky: 0, super: 4 },
        fans: [
            { x: 120, y: 450, width: 40, height: 40, direction: 'up' },
            { x: 200, y: 20, width: 40, height: 40, direction: 'down' }
        ],
        spikes: [
            { x: 175, y: 550, width: 350, height: 10, direction: 'up' }
        ],
        noPlaceZones: [],
    },

    // 23. Bonus III (66 Stars)
    {
        id: 123,
        name: "Isaac's Gauntlet",
        requiredStars: 66,
        balls: [{ x: 175, y: 50 }, { x: 250, y: 470 }],
        goal: { x: 315, y: 490, width: 20, height: 20 },
        walls: [
            { x: 310, y: 450, width: 10, height: 90 },
            { x: 265, y: 85, width: 10, height: 170 },
            { x: 307.5, y: 0, width: 85, height: 10 },
            { x: 157.5, y: 170, width: 225, height: 10 },
            { x: 100, y: 305, width: 200, height: 10 },
            { x: 160, y: 450, width: 220, height: 10 },
            { x: 160, y: 490, width: 220, height: 10 },
            { x: 190, y: 190, width: 10, height: 50 },
        ],
        platforms: { normal: 4, sticky: 2, super: 2 },
        fans: [
            { x: 50, y: 120, width: 40, height: 40, direction: 'right' },
            { x: 250, y: 250, width: 40, height: 40, direction: 'left' },
            { x: 50, y: 380, width: 40, height: 40, direction: 'right' },
            { x: 270, y: 480, width: 40, height: 40, direction: 'up' },
        ],
        spikes: [
            { x: 300, y: 390, width: 20, height: 10, direction: 'up' },
            { x: 245, y: 0, width: 10, height: 165, direction: 'left' },
            { x: 10, y: 200, width: 10, height: 100, direction: 'right' },
            { x: 50, y: 430, width: 220, height: 10, direction: 'up' },
            { x: 170, y: 175, width: 10, height: 40, direction: 'left' },
            { x: 10, y: 0, width: 10, height: 120, direction: 'right' },
            { x: 10, y: 310, width: 10, height: 100, direction: 'right' },
            { x: 270, y: 10, width: 65, height: 10, direction: 'down' },
        ],
        noPlaceZones: [
            { x: 25, y: 150, width: 40, height: 300 },
            { x: 180, y: 470, width: 180, height: 34 },
            { x: 90, y: 370, width: 170, height: 120 },
            { x: 302.5, y: 315, width: 65, height: 450 },
        ],
    }
];

export default levels;
