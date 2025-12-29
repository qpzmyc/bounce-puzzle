// Level definitions - Reworked for Tutorial Progression
// Constraints: No Left Wall, No Bottom Wall (Spikes at bottom)

const levels = [
    // 1. INTRO: Basic Bounce
    {
        id: 1,
        name: "Hello Bounce",
        description: "Drag a platform to guide the ball to the goal.",
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

    // 2. INTRO: Fans
    // Fan blows right. Ball drops left. Goal is far right.
    // You need to bounce it up slightly so the fan carries it.
    {
        id: 2,
        name: "Windy Day",
        description: "Fans push the ball. Use them!",
        balls: [{ x: 60, y: 50 }],
        goal: { x: 270, y: 300, width: 40, height: 40 },
        walls: [
            { x: 345, y: 240, width: 15, height: 480 },
        ],
        platforms: { normal: 3, sticky: 0, super: 0 },
        fans: [
            { x: 10, y: 150, width: 50, height: 100, direction: 'right' }  // Moved right to be fully in bounds
        ],
        spikes: [],
        noPlaceZones: [{ x: 85, y: 260, width: 170, height: 510 }],
    },

    // 3. INTRO: Spikes
    // Spike directly in path. Bounce around it.
    {
        id: 3,
        name: "Watch Your Step",
        description: "Spikes destroy the ball.",
        balls: [{ x: 170, y: 50 }],
        goal: { x: 150, y: 400, width: 40, height: 40 },  // Centered (GAME.width/2 - width/2 = 170 - 25 = 145)
        walls: [],
        platforms: { normal: 4, sticky: 0, super: 0 },
        fans: [],
        spikes: [
            { x: 120, y: 200, width: 100, height: 15 } // Middle spike
        ],
        noPlaceZones: [],
    },

    // 4. INTRO: Dual Balls
    // Two balls, one goal. Symmetrical.
    {
        id: 4,
        name: "Double Trouble",
        description: "Get BOTH balls into the goal.",
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

    // 5. INTRO: Sticky & Super
    {
        id: 5,
        name: "Physics Lab",
        description: "Violet jumps high, Yellow stops dead.",
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
        id: 6,
        name: "Zig Zag",
        description: "Bounce back and forth to descend safely.",
        balls: [{ x: 50, y: 50 }],
        goal: { x: 280, y: 460, width: 40, height: 40 },
        walls: [
            { x: 100, y: 150, width: 200, height: 15 }, // Left Top
            { x: 240, y: 280, width: 200, height: 15 }, // Right Middle
            { x: 100, y: 410, width: 200, height: 15 }, // Left Bottom
        ],
        platforms: { normal: 3, sticky: 2, super: 0 },
        fans: [],
        spikes: [],
    },

    // 7. MAIN: Wall Dive (ball must go UNDER the wall)
    {
        id: 7,
        name: "Wall Dive",
        description: "Go UNDER the wall.",
        balls: [{ x: 50, y: 200 }],
        goal: { x: 300, y: 230, width: 40, height: 40 }, // Goal moved Lower (150 -> 180) for easier shot
        walls: [
            { x: 170, y: 190, width: 15, height: 380 }, // Wall extended LOWER (height 260->360, y 130->180) to force tight angle
        ],
        platforms: { normal: 0, sticky: 0, super: 4 },
        fans: [],
        spikes: [],
    },

    // 8. MAIN: Crosswind
    {
        id: 8,
        name: "Crosswind",
        description: "Fight the wind or fall to spikes.",
        balls: [{ x: 170, y: 50 }],
        goal: { x: 170, y: 450, width: 40, height: 40 },
        walls: [
            { x: 345, y: 240, width: 15, height: 480 },
        ],
        platforms: { normal: 2, sticky: 2, super: 0 },
        fans: [
            { x: 10, y: 150, width: 40, height: 40, direction: 'right' },
            { x: 290, y: 300, width: 40, height: 40, direction: 'left' },
            { x: 290, y: 345, width: 40, height: 40, direction: 'left' },
            { x: 10, y: 105, width: 40, height: 40, direction: 'right' },
        ],
        spikes: [
            { x: 260, y: 240, width: 80, height: 15 },  // Lowered from 180 to 240
            { x: 10, y: 380, width: 80, height: 15 },   // Bottom left
        ],
        noPlaceZones: [
            { x: 280, y: 200, width: 100, height: 150 },
            { x: 50, y: 340, width: 100, height: 150 },
        ],
    },

    // 9. MAIN: Precision (True Needle Thread)
    {
        id: 9,
        name: "Needle Thread",
        description: "Pass through the narrow gap.",
        balls: [{ x: 50, y: 50 }], // Offset, not aligned!
        goal: { x: 50, y: 450, width: 40, height: 40 }, // Moved to LEFT side (170 -> 50)
        walls: [
            // The constriction
            { x: 80, y: 295, width: 160, height: 10 }, // Left block (Ends at x=160)
            { x: 260, y: 295, width: 160, height: 10 }, // Right block (Starts at x=180)
            // Gap: x=160 to x=180 (20px)
        ],
        platforms: { normal: 2, sticky: 2, super: 0 },
        fans: [],
        spikes: [
            // Spikes covering entire mid platform except the gap (x=160-180)
            { x: 0, y: 275, width: 155, height: 10 },    // Left side spikes (up to gap)
            { x: 185, y: 275, width: 155, height: 10 },  // Right side spikes (after gap)
        ],
        noPlaceZones: [
            { x: 200, y: 140, width: 20, height: 260 }, // Gap
        ],
    },

    // 10. BOSS: The Mix
    {
        id: 10,
        name: "First Test",
        description: "Use everything you learned.",
        balls: [{ x: 50, y: 50 }, { x: 300, y: 50 }],
        goal: { x: 170, y: 400, width: 60, height: 20 },
        walls: [
            { x: 345, y: 240, width: 15, height: 480 },
            { x: 170, y: 200, width: 10, height: 200 }, // Center divider
        ],
        platforms: { normal: 1, sticky: 1, super: 1 },
        fans: [
            { x: 170, y: 100, width: 40, height: 40, direction: 'left' }
        ],
        spikes: [
            { x: 80, y: 300, width: 40, height: 10 },
            { x: 260, y: 300, width: 40, height: 10 }
        ],
        noPlaceZones: [],
    },

    // 11. The Decoy
    {
        id: 11,
        name: "The Decoy",
        description: "Looks can be deceiving.",
        balls: [{ x: 50, y: 50 }],
        goal: { x: 280, y: 450, width: 40, height: 40 },
        walls: [
            { x: 160, y: 275, width: 10, height: 300 }, // Divider
        ],
        platforms: { normal: 2, sticky: 2, super: 0 }, // Added 2 extra sticky (1->3)
        fans: [
            { x: 250, y: 200, width: 40, height: 40, direction: 'left' }
        ],
        spikes: [
            { x: 0, y: 280, width: 120, height: 10 }, // Moved decent bit left (center 70 -> 50)
        ]
        ,
        noPlaceZones: [],
    },

    // 12. Ascension
    {
        id: 12,
        name: "Ascension",
        description: "Ride the wind up.",
        balls: [{ x: 50, y: 450 }],
        goal: { x: 20, y: 200, width: 40, height: 40 },
        walls: [
            { x: 130, y: 250, width: 240, height: 10 },
            { x: 290, y: 10, width: 120, height: 10 },
            { x: 80, y: 210, width: 10, height: 70 },
        ],
        platforms: { normal: 1, sticky: 0, super: 2 },
        fans: [
            { x: 50, y: 350, width: 50, height: 40, direction: 'right' }, // Turned Left fan to RIGHT
            { x: 260, y: 300, width: 50, height: 40, direction: 'up' }, // Moved right fan further right (230 -> 260)
        ],
        spikes: [],
        noPlaceZones: [],
    },

    // 13. Precision - Reworked
    {
        id: 13,
        name: "Precision",
        description: "Into the tunnel.",
        balls: [{ x: 300, y: 50 }],
        goal: { x: 290, y: 275, width: 40, height: 40 },
        walls: [
            // Tunnel Structure
            { x: 230, y: 250, width: 220, height: 10 }, // Ceiling
            { x: 230, y: 330, width: 220, height: 10 }, // Floor (Raised 350->330)
        ],
        platforms: { normal: 1, sticky: 3, super: 0 },
        fans: [
            { x: 10, y: 250, width: 40, height: 40, direction: 'right' } // Moved Up/Left (50,300 -> 30,250)
        ],
        spikes: [
            // Spikes inside tunnel (Extended left: x 200, width 200)
            { x: 130, y: 255, width: 220, height: 10 }, // Ceiling spikes
            { x: 130, y: 310, width: 220, height: 10 }, // Floor spikes (Raised)
        ],
        noPlaceZones: [
            { x: 260, y: 280, width: 180, height: 75 }, // Ceiling no place zone

        ],
    },

    // 14. The Loop
    {
        id: 14,
        name: "The Loop",
        description: "Redirect momentum.",
        balls: [{ x: 50, y: 100 }],
        goal: { x: 50, y: 300, width: 40, height: 40 },
        walls: [
            { x: 175, y: 200, width: 10, height: 200 }, // Barrier
            { x: 120, y: 0, width: 230, height: 10 },
        ],
        platforms: { normal: 2, sticky: 1, super: 1 },
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
        id: 15,
        name: "Double Dunk",
        description: "Drop in from above.",
        balls: [{ x: 50, y: 110 }, { x: 100, y: 230 }], // Start low left
        goal: { x: 300, y: 400, width: 30, height: 30 }, // In box bottom right
        walls: [
            { x: 280, y: 400, width: 10, height: 100 }, // Left wall of bunker
            { x: 310, y: 450, width: 60, height: 10 },  // Roof (with gap?) No, open top.
            { x: 140, y: 355, width: 280, height: 10 }, // Right wall of bunker
        ],
        platforms: { normal: 0, sticky: 0, super: 3 }, // Need to super jump over
        fans: [],
        spikes: [
            { x: 0, y: 335, width: 280, height: 10 } // Floor hazard
        ],
        noPlaceZones: [
            { x: 250, y: 250, width: 160, height: 500 }, // Left wall of bunker
        ],
    },

    // 16. Switchback
    {
        id: 16,
        name: "Switchback",
        description: "Zig zag down.",
        balls: [{ x: 50, y: 80 }],
        goal: { x: 150, y: 450, width: 40, height: 40 },
        walls: [],
        platforms: { normal: 7, sticky: 0, super: 0 },
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
            { x: 5, y: 100, width: 20, height: 10 },
            { x: 5, y: 120, width: 20, height: 10 },
            { x: 5, y: 140, width: 20, height: 10 },
            { x: 5, y: 160, width: 20, height: 10 },
            { x: 5, y: 180, width: 20, height: 10 },
            { x: 5, y: 200, width: 20, height: 10 },
            { x: 5, y: 220, width: 20, height: 10 },
            { x: 5, y: 240, width: 20, height: 10 },
            { x: 5, y: 260, width: 20, height: 10 },
            { x: 5, y: 280, width: 20, height: 10 },
            { x: 5, y: 300, width: 20, height: 10 },
            { x: 5, y: 320, width: 20, height: 10 },
            { x: 5, y: 340, width: 20, height: 10 },
            { x: 5, y: 360, width: 20, height: 10 },
            { x: 5, y: 380, width: 20, height: 10 },
            { x: 5, y: 400, width: 20, height: 10 },
            { x: 5, y: 420, width: 20, height: 10 },
            { x: 5, y: 440, width: 20, height: 10 },
        ]
    },

    // 17. The Vault
    {
        id: 17,
        name: "The Vault",
        description: "Reach the impossible height.",
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
        platforms: { normal: 1, sticky: 4, super: 2 }, // Chain super jumps
        fans: [],
        spikes: [
            { x: 0, y: 120, width: 100, height: 10 },
            { x: 150, y: 120, width: 200, height: 10 },
            { x: 300, y: 230, width: 50, height: 10 },
            { x: 0, y: 230, width: 250, height: 10 },
            { x: 120, y: 310, width: 100, height: 10 },
        ],
        noPlaceZones: [
            { x: 175, y: 340, width: 350, height: 200 },
        ],
    },

    // 18. Orbit
    {
        id: 18,
        name: "Orbit",
        description: "Around the world.",
        balls: [{ x: 30, y: 50 }, { x: 45, y: 80 }, { x: 60, y: 110 }],
        goal: { x: 220, y: 360, width: 40, height: 40 }, // CENTER
        walls: [
            { x: 175, y: 490, width: 350, height: 30 },
            { x: 180, y: 350, width: 180, height: 10 },
            { x: 180, y: 410, width: 180, height: 10 },
            { x: 135, y: 200, width: 270, height: 10 },
            { x: 265, y: 130, width: 350, height: 10 },
            { x: 270, y: 305, width: 10, height: 220 }, // Center divider
        ],
        platforms: { normal: 2, sticky: 2, super: 1 },
        fans: [
            { x: 0, y: 140, width: 40, height: 40, direction: 'right' },
            { x: 290, y: 210, width: 40, height: 40, direction: 'down' },
            { x: 210, y: 425, width: 40, height: 40, direction: 'left' },
        ],
        spikes: [],
        noPlaceZones: [],
    },

    // 19. Choice
    {
        id: 19,
        name: "Funnel",
        description: "Distractions everywhere.",
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
            { x: 75, y: 270, width: 150, height: 10 },
            { x: 275, y: 270, width: 150, height: 10 },

        ],
        platforms: { normal: 8, sticky: 2, super: 1 }, // TONS of platforms
        fans: [],
        spikes: [
            { x: 0, y: 250, width: 150, height: 10 },
            { x: 200, y: 250, width: 150, height: 10 },
        ],
        noPlaceZones: [
            { x: 175, y: 300, width: 350, height: 150 },
        ],
    },

    // 20. Mastermind
    {
        id: 20,
        name: "Mastermind",
        description: "The final puzzle.",
        balls: [{ x: 80, y: 150 }, { x: 60, y: 450 }],
        goal: { x: 185, y: 50, width: 40, height: 40 }, // Top right
        walls: [
            { x: 175, y: 150, width: 10, height: 300 }, // Vertical divider
        ],
        platforms: { normal: 2, sticky: 2, super: 2 },
        fans: [
            { x: 20, y: 350, width: 40, height: 40, direction: 'right' }, // Bottom left pusher
            { x: 170, y: 480, width: 40, height: 40, direction: 'up' },   // Bottom right lifter
            { x: 230, y: 480, width: 40, height: 40, direction: 'up' },   // Bottom right lifter
            { x: 290, y: 480, width: 40, height: 40, direction: 'up' },   // Bottom right lifter
        ],
        spikes: [
            { x: 140, y: 320, width: 140, height: 40 }, // Center hazard
            { x: 140, y: 400, width: 140, height: 40 }, // Center hazard
        ],
        noPlaceZones: [
            { x: 260, y: 250, width: 180, height: 300 }, // Vertical divider
        ],
    },

    // 21. Bonus I (50 Stars)
    {
        id: 21,
        name: "Star Gate I",
        description: "Bonus Challenge.",
        requiredStars: 50,
        balls: [{ x: 175, y: 50 }],
        goal: { x: 160, y: 310, width: 30, height: 30 },
        walls: [
            { x: 175, y: 250, width: 200, height: 10 },
            { x: 175, y: 350, width: 70, height: 10 },
        ],
        platforms: { normal: 1, sticky: 0, super: 3 },
        fans: [
            { x: 100, y: 450, width: 40, height: 40, direction: 'up' },
            { x: 220, y: 450, width: 40, height: 40, direction: 'up' }
        ],
        spikes: [
            { x: 0, y: 0, width: 350, height: 10 },
            { x: 140, y: 260, width: 70, height: 10 },
        ],
        noPlaceZones: [
            { x: 175, y: 250, width: 350, height: 200 },
            { x: 175, y: 400, width: 140, height: 100 },
        ],
    },

    // 22. Bonus II (58 Stars)
    {
        id: 22,
        name: "Star Gate II",
        description: "Mastery Required.",
        requiredStars: 58,
        balls: [{ x: 50, y: 350 }],
        goal: { x: 300, y: 50, width: 30, height: 30 },
        walls: [
            { x: 175, y: 370, width: 10, height: 270 },
            { x: 175, y: 100, width: 10, height: 200 },
            { x: 175, y: 0, width: 350, height: 20 },
        ],
        platforms: { normal: 1, sticky: 0, super: 5 },
        fans: [
            { x: 120, y: 450, width: 40, height: 40, direction: 'up' },
            { x: 200, y: 20, width: 40, height: 40, direction: 'down' }
        ],
        spikes: [
            { x: 175, y: 550, width: 350, height: 10 }
        ],
        noPlaceZones: [
            { x: 87, y: 300, width: 175, height: 300 },

        ],
    },

    // 23. Bonus III (66 Stars)
    {
        id: 23,
        name: "Star Gate III",
        description: "The Ultimate Test.",
        requiredStars: 66,
        balls: [{ x: 175, y: 50 }],
        goal: { x: 175, y: 550, width: 20, height: 20 },
        walls: [],
        platforms: { normal: 5, sticky: 5, super: 5 },
        fans: [
            { x: 50, y: 150, width: 40, height: 40, direction: 'right' },
            { x: 300, y: 300, width: 40, height: 40, direction: 'left' },
            { x: 50, y: 450, width: 40, height: 40, direction: 'right' }
        ],
        spikes: [
            { x: 175, y: 300, width: 20, height: 20 }
        ],
        noPlaceZones: [],
    }
];

export default levels;
