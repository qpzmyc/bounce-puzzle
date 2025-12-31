import Matter from 'matter-js';
import { PHYSICS } from '../utils/constants';

const Physics = (entities, { time, dispatch }) => {
    const engine = entities.physics?.engine;
    if (!engine) return entities;

    // FIXED TIMESTEP ACCUMULATOR
    // This guarantees deterministic results regardless of framerate
    // We accumulate real time (delta) and consume it in fixed chunks (16.666ms)

    // Initialize accumulator if not present
    if (typeof entities.physics.accumulator === 'undefined') {
        entities.physics.accumulator = 0;
    }

    // Initialize trail step counter
    if (typeof entities.physics.trailStepCounter === 'undefined') {
        entities.physics.trailStepCounter = 0;
    }

    // Add current frame time (capped to prevent death spiral)
    const frameTime = Math.min(time.delta, 50);
    entities.physics.accumulator += frameTime;

    // Consume time in fixed steps (8.333ms = 120Hz for better collision detection)
    const fixedStep = 8.333;
    while (entities.physics.accumulator >= fixedStep) {

        // 1. APPLY FORCES (Fans) BEFORE UPDATE
        // We must re-query active balls every sub-step
        const ballKeys = Object.keys(entities).filter(k => k.startsWith('ball'));
        let balls = ballKeys.map(k => ({ key: k, ...entities[k] })).filter(b => b && b.body);

        const fanKeys = Object.keys(entities).filter(k => k.startsWith('fan'));
        fanKeys.forEach(fanKey => {
            const fan = entities[fanKey];
            if (!fan) return;

            balls.forEach(ball => {
                const { x, y } = ball.body.position;
                const fanX = fan.position.x + fan.size.width / 2;
                const fanY = fan.position.y + fan.size.height / 2;
                const H = fan.size.height / 2 + 10; // Vertical tolerance
                // Infinite Range Logic
                // Check if ball is in the "lane" defined by fan width/height
                let inLane = false;
                const fanW = fan.size.width / 2;
                const fanH = fan.size.height / 2;

                if (fan.direction === 'up' || fan.direction === 'down') {
                    // Vertical fan: Lane is X width
                    inLane = Math.abs(x - fanX) < fanW;
                } else {
                    // Horizontal fan: Lane is Y height
                    inLane = Math.abs(y - fanY) < fanH;
                }

                if (inLane) {
                    let inFront = false;
                    // Check if ball is in front of the fan (direction it is capturing)
                    if (fan.direction === 'up') inFront = y < fanY;
                    if (fan.direction === 'down') inFront = y > fanY;
                    if (fan.direction === 'left') inFront = x < fanX;
                    if (fan.direction === 'right') inFront = x > fanX;

                    if (inFront) {
                        const forceMag = PHYSICS.fanForce;
                        let fx = 0, fy = 0;
                        if (fan.direction === 'left') fx = -forceMag;
                        if (fan.direction === 'right') fx = forceMag;
                        if (fan.direction === 'up') fy = -forceMag;
                        if (fan.direction === 'down') fy = forceMag;

                        Matter.Body.applyForce(ball.body, ball.body.position, { x: fx, y: fy });
                    }
                }
            });
        });

        // 2. UPDATE PHYSICS
        Matter.Engine.update(engine, fixedStep);

        // 2.5 RECORD BALL TRAIL (distance-based for consistent appearance)
        if (entities.trail) {
            const MIN_DISTANCE = 12; // Minimum pixels between trail dots

            balls.forEach(ball => {
                if (ball && ball.body) {
                    const x = ball.body.position.x;
                    const y = ball.body.position.y;

                    // Initialize lastTrailPos tracking per ball if needed
                    if (!entities.trail.lastPos) {
                        entities.trail.lastPos = {};
                    }

                    const lastPos = entities.trail.lastPos[ball.key];

                    if (!lastPos) {
                        // First point for this ball
                        entities.trail.points.push({ x, y });
                        entities.trail.lastPos[ball.key] = { x, y };
                    } else {
                        // Calculate distance from last recorded position
                        const dx = x - lastPos.x;
                        const dy = y - lastPos.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist >= MIN_DISTANCE) {
                            entities.trail.points.push({ x, y });
                            entities.trail.lastPos[ball.key] = { x, y };
                        }
                    }
                }
            });

            // Limit trail length to prevent memory issues (keep last 500 points)
            if (entities.trail.points.length > 500) {
                entities.trail.points = entities.trail.points.slice(-500);
            }
        }

        // 3. CHECK TRIGGERS (Spikes & Goals) inside loop to prevent tunneling
        const spikeKeys = Object.keys(entities).filter(k => k.startsWith('spike'));
        let anyBallLost = false;

        spikeKeys.forEach(spikeKey => {
            const spike = entities[spikeKey];
            if (!spike) return;

            balls.forEach(ball => {
                const { x, y } = ball.body.position;
                const spikeX = spike.position.x;
                const spikeY = spike.position.y;

                // Hitbox check
                if (x > spikeX && x < spikeX + spike.size.width &&
                    y > spikeY && y < spikeY + spike.size.height + 5) {
                    anyBallLost = true;
                }
            });
        });

        // Goals
        const goal = entities.goal;
        let ballsCollected = 0;

        // We need to re-fetch balls or filter the list because balls might be removed
        balls.forEach(ball => {
            if (!ball || !ball.body) return;
            const { x, y } = ball.body.position;

            // Check goal
            if (goal) {
                const gX = goal.position.x;
                const gY = goal.position.y;
                const gW = goal.size.width;
                const gH = goal.size.height;

                if (x > gX && x < gX + gW && y > gY && y < gY + gH) {
                    Matter.World.remove(engine.world, ball.body);
                    delete entities[ball.key]; // Mutate entities
                    ballsCollected++;
                }
            }

            if (y > 600 || y < -1000 || x < -1000 || x > 1500) {
                anyBallLost = true;
            }
        });

        if (anyBallLost) {
            dispatch({ type: 'game-over', result: 'lose' });
        } else {
            // Check if all balls are gone
            const currentBallKeys = Object.keys(entities).filter(k => k.startsWith('ball'));
            if (currentBallKeys.length === 0) {
                // Assuming we started with >0 balls.
                dispatch({ type: 'game-over', result: 'win' });
            }
        }

        entities.physics.accumulator -= fixedStep;
    }

    return entities;
};

export default Physics;
