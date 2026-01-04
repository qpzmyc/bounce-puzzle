import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, PanResponder, Alert, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // Fixed Import
import { useIsFocused } from '@react-navigation/native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import Ball from '../components/Ball';
import Platform from '../components/Platform';
import Goal from '../components/Goal';
import StartArea from '../components/StartArea';
import Wall from '../components/Wall';
import Fan from '../components/Fan';
import Spike from '../components/Spike';
import BallTrail from '../components/BallTrail';
import ParticleSystem from '../components/ParticleSystem';
import Physics from '../systems/Physics';
import { COLORS, PHYSICS, GAME, PLATFORM_TYPES } from '../utils/constants';
import levels from '../levels';
import world2Levels from '../levels/world2';
import world3Levels from '../levels/world3';
import { getLevelProgress, saveLevelProgress, getSettings, getBonusStars, saveBonusStars, hasEnteredWorld, markWorldEntered } from '../utils/storage';
import { getTotalStars, getNextLevelOrRedirect } from '../utils/gameLogic';
import * as Haptics from 'expo-haptics';
import { loadSounds, playSound, unloadSounds, setSoundEnabled, playMusic, stopMusic, pauseMusic, resumeMusic } from '../utils/audio';
import { recordLevelCompletion, shouldShowAd, showInterstitialAd, resolveAdTrigger, showRewardedAd } from '../utils/ads';
import { BannerAd, BannerAdSize, TestIds } from '../utils/ads';
import StyledModal from '../components/StyledModal';

const productionAdUnitID = 'ca-app-pub-9298010065130394/2984194822';
// Always use TestIds.BANNER in development/simulators to avoid violating Google policy
// But user asked to use *this* code. We'll use conditional logic.
const adUnitID = __DEV__ ? TestIds.BANNER : productionAdUnitID;


const { width: SW, height: SH } = Dimensions.get('window');

const BASE_WIDTH = 375;
const uiScale = SW / BASE_WIDTH;
const s = (size) => Math.round(size * uiScale);

// Store measured game area position globally (will be set by ref callback)
let measuredGameAreaLayout = null;

// Convert screen coordinates to game coordinates
// Uses measured layout when available, otherwise falls back to calculation
// Convert screen coordinates to game coordinates
// Uses measured layout when available, otherwise falls back to calculation
const screenToGameCoords = (touchX, touchY, scale, layoutOverride = null) => {
    const layout = layoutOverride || measuredGameAreaLayout;

    let gameAreaLeft, gameAreaTop, gameAreaRight, gameAreaBottom;

    if (layout) {
        // Use actual measured position
        gameAreaLeft = layout.x;
        gameAreaTop = layout.y;
        gameAreaRight = layout.x + layout.width;
        gameAreaBottom = layout.y + layout.height;
    } else {
        // Fallback to calculated position (less accurate)
        // Note: This fallback relies on the 'scale' passed in
        gameAreaLeft = (SW - GAME.width * scale) / 2;
        gameAreaTop = 140; // Approximate
        gameAreaRight = gameAreaLeft + GAME.width * scale;
        gameAreaBottom = gameAreaTop + GAME.height * scale;
    }

    const gameX = Math.max(PHYSICS.platformWidth / 2,
        Math.min(GAME.width - PHYSICS.platformWidth / 2,
            (touchX - gameAreaLeft) / scale));
    const gameY = Math.max(PHYSICS.platformHeight / 2,
        Math.min(GAME.height - PHYSICS.platformHeight / 2,
            (touchY - gameAreaTop) / scale));

    // Check bounds
    let isInBounds = touchX >= gameAreaLeft - 20 && touchX <= gameAreaRight + 20 &&
        touchY >= gameAreaTop - 20 && touchY <= gameAreaBottom + 20;

    return { gameX, gameY, isInBounds };
};

// Check if a platform placement intersects with any no-place zones
// Check if a platform placement intersects with any no-place zones
// Now supports rotation (approximated by checking corners)
const isPlacementValid = (x, y, angle, zones) => {
    if (!zones || zones.length === 0) return true;
    const pW = PHYSICS.platformWidth;
    const pH = PHYSICS.platformHeight;

    // Calculate the 4 corners of the rotated platform
    const corners = [
        { x: -pW / 2, y: -pH / 2 },
        { x: pW / 2, y: -pH / 2 },
        { x: pW / 2, y: pH / 2 },
        { x: -pW / 2, y: pH / 2 },
    ].map(p => {
        // Rotate point
        const rx = p.x * Math.cos(angle) - p.y * Math.sin(angle);
        const ry = p.x * Math.sin(angle) + p.y * Math.cos(angle);
        // Translate to position
        return { x: rx + x, y: ry + y };
    });

    for (const z of zones) {
        // Zone bounds (Axis Aligned)
        const zLeft = z.x - z.width / 2;
        const zRight = z.x + z.width / 2;
        const zTop = z.y - z.height / 2;
        const zBottom = z.y + z.height / 2;

        // Check if ANY corner is inside the zone
        // (This catches most cases. For very large zones and small platforms, 
        // we might need to check if zone centers are inside platform, 
        // but given typical sizes, corner checks are usually sufficient for "no place")
        // Improving: Also check if Zone Center is inside Platform? 
        // Or simply: Separating Axis Theorem is best, but let's stick to corner checks + center check for robustness.

        let intersect = false;

        // 1. Check platform corners in Zone
        for (const c of corners) {
            if (c.x > zLeft && c.x < zRight && c.y > zTop && c.y < zBottom) {
                intersect = true;
                break;
            }
        }

        // 2. Check if Zone center is inside Platform (Inverse rotation check)
        // Only needed if Zone is smaller than platform, but rare here.
        // Let's stick to corners for now as zones are "restricted areas" usually larger than a platform.
        // Actually, let's also check center to be safe.
        // (x,y) is platform center.
        if (x > zLeft && x < zRight && y > zTop && y < zBottom) intersect = true;

        if (intersect) return false;
    }
    return true;
};

const GameScreen = ({ route, navigation }) => {

    const isFocused = useIsFocused();
    const levelId = route?.params?.levelId || 1;
    const allLevels = [...levels, ...world2Levels, ...world3Levels]; // Combine all worlds
    const level = allLevels.find(l => l.id === levelId) || levels[0];

    // Determine World ID based on Level ID
    const currentWorldId = levelId >= 300 ? 3 : levelId >= 200 ? 2 : 1;

    const insets = useSafeAreaInsets();
    // CALC DYNAMIC SCALE: How much space is left for the game area?
    // Reserves: Header area (roughly s(90)) + Footer area (roughly s(60)) + Safe Area Insets
    const headerReserved = s(85);
    const footerReserved = s(65);
    const availW = SW - s(20);
    const availH = SH - insets.top - insets.bottom - headerReserved - footerReserved;
    const scale = Math.min(availW / GAME.width, availH / GAME.height);

    const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'win', 'lose'
    const [placedPlatforms, setPlacedPlatforms] = useState([]);
    const [entities, setEntities] = useState(null);
    const [stars, setStars] = useState(0);
    const [bonusStars, setBonusStars] = useState(0);
    const [lastTrail, setLastTrail] = useState([]);  // Store trail from last attempt
    const [liveTrail, setLiveTrail] = useState([]);  // Trail during current attempt
    const [draggingPlatform, setDraggingPlatform] = useState(null);  // { type, gameX, gameY } for ghost preview
    const [settings, setSettings] = useState({ haptics: true, sound: true });
    const [showTutorial, setShowTutorial] = useState(false);
    const [selectedPlatformIndex, setSelectedPlatformIndex] = useState(null);  // Index of selected platform, or null

    // Modal states
    const [worldWelcomeModal, setWorldWelcomeModal] = useState({ visible: false, worldId: 1 });
    const [lockedLevelModal, setLockedLevelModal] = useState({ visible: false, required: 0, current: 0, quickPlayLevelId: 101 });


    useEffect(() => {
        if (levelId === 101) {
            setShowTutorial(true);
        }
    }, [levelId]);

    useEffect(() => {
        getSettings().then(s => {
            setSettings(s);
            setSoundEnabled(s.sound);
        });
    }, []);

    const gameEngineRef = useRef(null);
    const particleSystemRef = useRef(null);
    const isGameOverRef = useRef(false);  // Ref to prevent double game-over triggers (e.g. win after lose logic started)
    const hasTriggeredDeathRef = useRef(false); // Ref to ensure death sound/particles only happen once
    const hasScoredThisSession = useRef(false); // Ad system: Track if we've added difficulty score for this session
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const gameAreaRef = useRef(null);  // Ref to track game area position
    const dragPosRef = useRef({ x: 0, y: 0 }); // Track internal position for damping LERP

    // Calculate available platforms
    const getTotalPlatforms = () => Object.values(level.platforms).reduce((a, b) => a + b, 0);
    const getUsedByType = (t) => placedPlatforms.filter(p => p.type === t).length;
    const getRemainingByType = (t) => (level.platforms[t] || 0) - getUsedByType(t);
    const calculateStars = () => {
        const unused = getTotalPlatforms() - placedPlatforms.length;
        return unused >= 2 ? 3 : unused >= 1 ? 2 : 1;
    };

    // Theme Logic
    const isWorld2 = levelId >= 200 && levelId < 300;
    const isWorld3 = levelId >= 300;
    const THEME = {
        wall: isWorld3 ? '#3b82f6' : (isWorld2 ? '#f97316' : COLORS.wall), // Blue (W3) / Orange (W2)
        spike: isWorld3 ? '#a855f7' : (isWorld2 ? '#ef4444' : COLORS.spike), // Purple (W3) / Red (W2)
        fan: isWorld3 ? '#60a5fa' : (isWorld2 ? '#eab308' : COLORS.fan), // Light Blue (W3) / Yellow (W2)
    };

    // Build physics entities
    const buildEntities = (withBalls) => {
        try {
            const engine = Matter.Engine.create({ enableSleeping: false });
            engine.world.gravity = PHYSICS.gravity;
            let ents = { physics: { engine, world: engine.world } };

            // GLOBAL INVISIBLE SAFETY WALLS
            const wallThick = 50;
            const wallH = GAME.height * 2;

            // Left (Move inward to ensure no clipping) -> Edge at x=5
            const leftWallBody = Matter.Bodies.rectangle(-20, GAME.height / 2, wallThick, wallH, { isStatic: true, restitution: 1.0, friction: 0 });
            Matter.World.add(engine.world, leftWallBody);
            ents['wall-left-invis'] = {
                body: leftWallBody,
                size: { width: wallThick, height: wallH },
                renderer: Wall,
                color: THEME.wall
            };

            // Right (Move inward) -> Edge at width-5
            const rightWallBody = Matter.Bodies.rectangle(GAME.width + 20, GAME.height / 2, wallThick, wallH, { isStatic: true, restitution: 1.0, friction: 0 });
            Matter.World.add(engine.world, rightWallBody);
            ents['wall-right-invis'] = {
                body: rightWallBody,
                size: { width: wallThick, height: wallH },
                renderer: Wall,
                color: THEME.wall
            };

            level.walls.forEach((w, i) => {
                const b = Matter.Bodies.rectangle(w.x, w.y, w.width, w.height, { isStatic: true, restitution: 0.3 });
                Matter.World.add(engine.world, b);
                ents[`wall${i}`] = { body: b, size: { width: w.width, height: w.height }, renderer: Wall, color: THEME.wall };
            });

            ents.goal = { position: { x: level.goal.x, y: level.goal.y }, size: { width: level.goal.width, height: level.goal.height }, renderer: Goal };

            (level.fans || []).forEach((f, i) => {
                ents[`fan${i}`] = { position: { x: f.x, y: f.y }, size: { width: f.width, height: f.height }, direction: f.direction, renderer: Fan, color: THEME.fan };
            });

            (level.spikes || []).forEach((s, i) => {
                ents[`spike${i}`] = {
                    position: { x: s.x, y: s.y },
                    size: { width: s.width, height: s.height },
                    direction: s.direction || 'up',
                    renderer: Spike,
                    color: THEME.spike
                };
            });

            // Add GLOBAL FLOOR SPIKE
            const floorY = GAME.height - 10;
            ents['spike-floor'] = {
                position: { x: 0, y: floorY },
                size: { width: GAME.width, height: 20 },
                renderer: Spike,
                color: THEME.spike
            };



            placedPlatforms.forEach((p, i) => {
                // NOTE: We rely on manual collision logic now, so restitution here is backup
                const b = Matter.Bodies.rectangle(p.x, p.y, PHYSICS.platformWidth, PHYSICS.platformHeight, {
                    isStatic: true,
                    angle: p.angle || 0,
                    restitution: 0, // Manual override handles it
                    label: `platform-${p.type || 'normal'}` // Tag for collision listener
                });
                Matter.World.add(engine.world, b);
                // During setup, use invisible renderer (DraggablePlatform handles visuals)
                // During play, use Platform renderer
                ents[`plat${i}`] = {
                    body: b,
                    size: { width: PHYSICS.platformWidth, height: PHYSICS.platformHeight },
                    platformType: p.type,
                    renderer: withBalls ? Platform : () => null
                };
            });

            // Add trail entity for recording ball path
            ents.trail = { points: [], renderer: () => null };  // Invisible renderer, we render separately

            if (withBalls) {
                (level.balls || [{ x: 160, y: 40 }]).forEach((pos, i) => {
                    const b = Matter.Bodies.circle(pos.x, pos.y, PHYSICS.ballRadius, {
                        restitution: 0.5,
                        friction: 0,
                        frictionAir: 0.002,
                        label: 'ball'
                    });
                    Matter.World.add(engine.world, b);
                    ents[`ball${i}`] = { body: b, renderer: Ball };
                });

                // Track which ball-platform pairs have already played sticky audio
                const stickyBounced = new Set();

                // CUSTOM COLLISION LOGIC
                Matter.Events.on(engine, 'collisionStart', (event) => {
                    event.pairs.forEach((pair) => {
                        const { bodyA, bodyB } = pair;
                        // Identify ball and platform
                        let ball = null;
                        let platformLabel = null;
                        let platformBody = null; // We need to know which is static to calculate normal?

                        if (bodyA.label === 'ball') { ball = bodyA; platformLabel = bodyB.label; platformBody = bodyB; }
                        else if (bodyB.label === 'ball') { ball = bodyB; platformLabel = bodyA.label; platformBody = bodyA; }

                        if (ball && platformLabel && platformLabel.startsWith('platform-')) {
                            const type = platformLabel.split('-')[1];

                            // Ensure we are hitting the TOP of the platform? 
                            // Actually, for "Super" we just want to launch it away.
                            // But if we hit the bottom, we shouldn't launch UP.
                            // Simple velocity check: if ball is moving DOWN (vy > 0), bounce.
                            if (ball.velocity.y > 0) {
                                if (type === 'sticky') {
                                    // STICKY: No bounce (Y=0), but apply standard rolling (Keep X)
                                    Matter.Body.setVelocity(ball, { x: ball.velocity.x, y: 0 });
                                    // Play sound only once per ball-platform pair
                                    const key = `${ball.id}-${platformBody.id}`;
                                    if (!stickyBounced.has(key)) {
                                        stickyBounced.add(key);
                                        if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                        playSound('sticky');
                                    }
                                } else if (type === 'super') {
                                    // DIRECTIONAL SUPER JUMP
                                    // 1. Calculate Normal based on platform angle
                                    const angle = platformBody.angle;
                                    const normal = { x: Math.sin(angle), y: -Math.cos(angle) };

                                    // 2. Fixed Boost Magnitude (Back to 11)
                                    const speed = 11;

                                    // 3. Apply velocity along the normal (Simple Launch)
                                    // OR Reflect? User said "reflect the angle".
                                    // A true reflection requires incoming vector.
                                    // Let's try simple Reflection of the velocity vector against the Normal.
                                    // V_new = V_old - 2(V_old . N)N
                                    const dot = ball.velocity.x * normal.x + ball.velocity.y * normal.y;
                                    const rx = ball.velocity.x - 2 * dot * normal.x;
                                    const ry = ball.velocity.y - 2 * dot * normal.y;

                                    // Normalize reflection and apply fixed boost speed
                                    const mag = Math.sqrt(rx * rx + ry * ry);
                                    if (mag > 0.1) {
                                        Matter.Body.setVelocity(ball, {
                                            x: (rx / mag) * speed,
                                            y: (ry / mag) * speed
                                        });
                                        if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                        playSound('super');
                                    }
                                } else if (type === 'normal') {
                                    // Standard Bounce
                                    // Check if bounce is significant (>~5px height -> ~2.0 velocity)
                                    if (ball.velocity.y > 2.0) {
                                        if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        playSound('normal');
                                    }
                                }
                            }
                        }
                    });
                });
            }
            return ents;
        } catch (error) {
            console.error("[GameScreen] Build Entities Error:", error);
            // Alert.alert("Error", "Failed to load level entities: " + error.message);
            return {};
        }

    };

    useEffect(() => { setPlacedPlatforms([]); setGameState('setup'); setStars(0); setLastTrail([]); setLiveTrail([]); setSelectedPlatformIndex(null); isGameOverRef.current = false; hasTriggeredDeathRef.current = false; hasScoredThisSession.current = false; }, [levelId]);

    // Theme logic moved up
    // console.log(`[GameScreen] Level: ${levelId}...`);

    // console.log(`[GameScreen] Level: ${levelId}...`);

    // Initialize Audio & Music
    useEffect(() => {
        // Audio is now loaded globally in App.js to prevent unloading on navigation
        getBonusStars().then(setBonusStars);

        return () => {
            // Do NOT unload sounds here, as we need them for the Menu
            // Note: stopMusic is handled by the focus effect below
        };
    }, []);

    // World Welcome Popup (on first entry to any world > 1)
    useEffect(() => {
        const checkWorldWelcome = async () => {
            // Check if we are in World 2+ and haven't welcomed the player yet
            if (currentWorldId > 1) {
                const alreadyEntered = await hasEnteredWorld(currentWorldId);
                if (!alreadyEntered) {
                    // Reset bonus stars and show popup
                    await saveBonusStars(0);
                    setBonusStars(0);
                    await markWorldEntered(currentWorldId);
                    setWorldWelcomeModal({ visible: true, worldId: currentWorldId });
                }
            }
        };
        checkWorldWelcome();
    }, [currentWorldId]);

    // Resume/Stop music on focus/blur
    useEffect(() => {
        if (isFocused) {
            // Determine track again in case we came back
            let track = 'menu';
            if (levelId >= 101 && levelId < 200) track = 'world1';
            else if (levelId >= 201 && levelId < 300) track = 'world2';
            else if (levelId >= 301) track = 'world3';
            playMusic(track);
        }
        // NOTE: Do NOT stop music on blur!
        // The next screen will call playMusic with its own track.
        // Stopping here causes a race condition where we kill the music
        // that the new screen just started.
    }, [isFocused, levelId]);

    useEffect(() => {
        const e = buildEntities(false);
        setEntities(e);
        gameEngineRef.current?.swap(e);

        if (levelId >= 200) {
            // Debug check removed
        }
    }, [placedPlatforms, levelId]);

    useEffect(() => {
        if (gameState === 'win' || gameState === 'lose') {
            if (gameState === 'win') {
                const s = calculateStars();
                setStars(s);

                if (!hasScoredThisSession.current) {
                    recordLevelCompletion(level.difficulty || 0);
                    hasScoredThisSession.current = true;
                }

                // The original code had saveLevelProgress here, and the snippet had a conditional.
                // Assuming the conditional was meant to wrap the save and playSound.
                // If level.id === 123 is a special case (e.g., last level of a world),
                // it might not save progress or play sound immediately.
                // For now, I'll integrate the snippet's structure, assuming `level.id !== 123`
                // is a placeholder or specific logic for a particular level.
                // If the user intended to remove saveLevelProgress for level 123, this is correct.
                if (level.id !== 123) { // Hardcoded exclusion for last level? Or just standard logic.
                    saveLevelProgress(levelId, s);
                }
                playSound('level_complete');
            }
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        } else fadeAnim.setValue(0);
    }, [gameState]);

    // Sync live trail from entities during gameplay
    useEffect(() => {
        let interval;
        if (gameState === 'playing' && entities?.trail?.points) {
            interval = setInterval(() => {
                setLiveTrail([...entities.trail.points]);
            }, 50); // Update 20 times per second
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [gameState, entities]);

    const isPlayingRef = useRef(false); // Track if game is actually in progress (to ignore physics events in setup)
    const levelFailedTimeoutRef = useRef(null); // Track timeout to clear it on retry

    const handleDrop = () => {
        if (gameState !== 'setup') return;
        isPlayingRef.current = true; // Mark game as active
        setGameState('playing');
        const e = buildEntities(true);
        setEntities(e);
        gameEngineRef.current?.swap(e);
    };

    const handleRetry = async () => {
        // Fix: Save current trail if we are interrupting a live game
        if (gameState === 'playing' && entities?.trail?.points) {
            setLastTrail([...entities.trail.points]);
        }
        // If restarting from Win/Lose, lastTrail was already set in handleEvent('game-over')

        // Clear any pending level failed timeout
        if (levelFailedTimeoutRef.current) {
            clearTimeout(levelFailedTimeoutRef.current);
            levelFailedTimeoutRef.current = null;
        }

        // Check for Time-Based Ad Trigger ONLY on retry
        // User request: "10 minute ad to play at the first restart/retry"
        const triggerReason = await shouldShowAd();
        if (triggerReason === 'TIME') {
            pauseMusic();
            await showInterstitialAd();
            resumeMusic();
            await resolveAdTrigger('TIME');
        }

        // Reset game state to setup
        setGameState('setup');
        isPlayingRef.current = false; // Ignore further game over events
        // Kept selected platform index as per user request
        isGameOverRef.current = false;
        hasTriggeredDeathRef.current = false;
        const e = buildEntities(false);
        setEntities(e);
        gameEngineRef.current?.swap(e);
    };


    const handleNext = async () => {
        setLastTrail([]);  // Clear trail when moving to next level
        setLiveTrail([]);
        isPlayingRef.current = false;

        // Simple transition to next world (popup shown on load of new world)
        if (levelId === 123) {
            navigation.navigate('Game', { levelId: 201 });
            return;
        }

        if (levelId === 223) {
            navigation.navigate('Game', { levelId: 301 });
            return;
        }

        const nextLevel = allLevels.find(l => l.id === levelId + 1);

        if (!nextLevel) {
            // No more levels, go to menu
            navigation.navigate('Menu');
            return;
        }

        // Check if next level has a star requirement
        if (nextLevel.requiredStars) {
            const progress = await getLevelProgress();
            const totalStars = getTotalStars(progress, bonusStars);

            if (totalStars < nextLevel.requiredStars) {
                // Player doesn't have enough stars
                const { levelId: quickPlayLevelId } = getNextLevelOrRedirect(levels, progress);
                setLockedLevelModal({
                    visible: true,
                    required: nextLevel.requiredStars,
                    current: totalStars,
                    quickPlayLevelId
                });
                return;
            }
        }

        // Check if we should show an ad before moving on
        // "Repeated completions of the same level count ONLY if the player exits... however, if the player clicks retry... their difficulty score should not change."
        // We handle score adding in the win effect above.
        // Screen transition trigger:
        // Check if we should show an ad before moving on
        // Screen transition trigger:
        const triggerReason = await shouldShowAd();
        if (triggerReason) {
            pauseMusic();
            await showInterstitialAd();
            resumeMusic();
            await resolveAdTrigger(triggerReason);
        }

        // Proceed to next level
        navigation.navigate('Game', { levelId: nextLevel.id });
    };

    const handleBack = async () => {
        isPlayingRef.current = false; // Stop listening to game events

        // Check if we should show an ad before exiting
        const triggerReason = await shouldShowAd();
        if (triggerReason) {
            pauseMusic();
            await showInterstitialAd();
            resumeMusic();
            await resolveAdTrigger(triggerReason);
        }

        navigation.navigate('LevelSelect', { worldId: currentWorldId });
    };

    const handleEvent = (e) => {
        if (e.type === 'game-over') {
            // CRITICAL FIX: Ignore game-over events if we are not "playing" (e.g. in setup mode with 0 balls)
            // or if game over was already handled.
            if (!isPlayingRef.current || isGameOverRef.current) return;
            isGameOverRef.current = true;
            isPlayingRef.current = false; // Stop further events (like concurrent wins/losses)

            // Save trail from this attempt before resetting
            if (entities?.trail?.points) {
                setLastTrail([...entities.trail.points]);
            }
            // Trigger Particles based on result
            if (e.result === 'win') {
                // Burst at goal position (approximate center of goal)
                // const goal = level.goal;
                // particleSystemRef.current?.emit(goal.x, goal.y, '#fbbf24', 20); // Gold burst
                // particleSystemRef.current?.emit(goal.x, goal.y, '#10b981', 20); // Green burst
            } else {
                // ... spike logic (placeholder) ...
            }

            if (e.result === 'lose') {
                // Delay showing "Try Again" screen by 0.6 seconds
                // Store timeout to clear it if user retries immediately
                levelFailedTimeoutRef.current = setTimeout(() => {
                    setGameState(e.result);
                    levelFailedTimeoutRef.current = null;
                }, 600);
            } else {
                setGameState(e.result);
            }
        } else if (e.type === 'ball-in-goal') {
            // Trigger particle burst for EACH ball entering the goal
            const { x, y } = e.position;
            particleSystemRef.current?.emit(x, y, '#fbbf24', 15); // Gold
            particleSystemRef.current?.emit(x, y, '#10b981', 15); // Green
            if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // playSound('sticky'); // Removed as per request to avoid "final sticky sound"
        } else if (e.type === 'spike-hit') {
            // Trigger particle burst on spike hit
            if (hasTriggeredDeathRef.current) return;
            hasTriggeredDeathRef.current = true;

            const { x, y } = e.position;
            particleSystemRef.current?.emit(x, y, e.color, 15);
            if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            playSound('death');
        }
    };

    const addPlatform = (type) => {
        if (getRemainingByType(type) > 0 && gameState === 'setup') {
            // Start near top middle
            let x = GAME.width / 2;
            let y = 100;
            const stepY = 6;
            const shiftX = 80;

            const maxAttempts = 300; // Prevent infinite loop, plenty of space coverage
            let found = false;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                // Check if valid placement (not in no-place zone)
                const isValid = isPlacementValid(x, y, 0, level.noPlaceZones);
                // Check for duplicate
                const isDuplicate = placedPlatforms.some(p => p.x === x && p.y === y);

                if (isValid && !isDuplicate) {
                    found = true;
                    const newIndex = placedPlatforms.length;
                    setPlacedPlatforms([...placedPlatforms, { x, y, angle: 0, type }]);
                    setSelectedPlatformIndex(newIndex);  // Select the newly placed platform
                    break;
                }

                // Step Down
                y += stepY;

                // Reset to top and shift right if reached bottom
                if (y > GAME.height - 50) {
                    y = 100; // Reset to top
                    x += shiftX; // Shift right

                    // Wrap X if too far right
                    if (x > GAME.width - PHYSICS.platformWidth / 2) {
                        x = PHYSICS.platformWidth / 2 + 20; // Reset to left
                    }
                }
            }
        }
    };

    // Add platform at specific position (for drag-to-place)
    const addPlatformAt = (type, x, y) => {
        if (getRemainingByType(type) > 0 && gameState === 'setup') {
            const newIndex = placedPlatforms.length;
            setPlacedPlatforms([...placedPlatforms, {
                x: Math.max(PHYSICS.platformWidth / 2, Math.min(GAME.width - PHYSICS.platformWidth / 2, x)),
                y: Math.max(PHYSICS.platformHeight / 2, Math.min(GAME.height - PHYSICS.platformHeight / 2, y)),
                angle: 0,
                type
            }]);
            setSelectedPlatformIndex(newIndex);  // Select the newly placed platform
        }
    };

    const updatePlatform = (i, u) => {
        setPlacedPlatforms(prev => {
            const next = [...prev];
            next[i] = { ...next[i], ...u };
            return next;
        });
    };

    const removePlatform = (i) => {
        setPlacedPlatforms(placedPlatforms.filter((_, j) => j !== i));
        setSelectedPlatformIndex(null);  // Clear selection when removing
    };

    const selectPlatform = (i) => {
        setSelectedPlatformIndex(i);
    };

    const clearSelection = () => {
        setSelectedPlatformIndex(null);
    };

    const Stars = ({ count, size = 16 }) => (
        <View style={{ flexDirection: 'row' }}>
            {[1, 2, 3].map(i => <Text key={i} style={{ fontSize: size, color: i <= count ? COLORS.ui.star : COLORS.ui.starEmpty }}>★</Text>)}
        </View>
    );


    const handleDragStart = React.useCallback((type, evt) => {
        const touchX = evt.nativeEvent.pageX;
        const touchY = evt.nativeEvent.pageY;
        const gamePos = screenToGameCoords(touchX, touchY, scale);

        // Add Y offset so platform appears ABOVE finger for better visibility
        const bankDragOffsetY = -50;
        const offsetGameY = Math.max(PHYSICS.platformHeight / 2, gamePos.gameY + bankDragOffsetY);

        // Reset drag ref to touch position (with offset) to start fresh
        // Also track maxY to know if we ever entered the game area
        // AND track moveCount to detect "tap" vs "drag" (hysteresis)
        dragPosRef.current = { x: gamePos.gameX, y: offsetGameY, maxY: offsetGameY, moveCount: 0 };

        // Bank drag always starts with 0 rotation
        const isValid = gamePos.isInBounds && isPlacementValid(gamePos.gameX, offsetGameY, 0, level.noPlaceZones);
        setDraggingPlatform({ type, gameX: gamePos.gameX, gameY: offsetGameY, isValid });
    }, [level, scale]);

    const handleDragMove = React.useCallback((type, evt) => {
        const touchX = evt.nativeEvent.pageX;
        const touchY = evt.nativeEvent.pageY;
        const targetPos = screenToGameCoords(touchX, touchY, scale);

        // Add Y offset so platform appears ABOVE finger for better visibility
        const bankDragOffsetY = -50;
        let targetX = targetPos.gameX;
        let targetY = targetPos.gameY + bankDragOffsetY;

        // NO CLAMPING during bank drag - let it go anywhere
        // but snap TARGET to 2px grid for smooth movement visual
        const snapTargetX = Math.round(targetX / 2) * 2;
        const snapTargetY = Math.round(targetY / 2) * 2;

        // LERP 0.7 (faster response for bank drag)
        const lerp = 0.7;
        const currentX = dragPosRef.current.x;
        const currentY = dragPosRef.current.y;

        const dx = snapTargetX - currentX;
        const dy = snapTargetY - currentY;

        const newX = currentX + dx * lerp;
        const newY = currentY + dy * lerp;

        // Update Ref with new pos and max experienced Y
        // Increment moveCount
        dragPosRef.current = {
            x: newX,
            y: newY,
            maxY: Math.max(dragPosRef.current.maxY || -Infinity, newY),
            moveCount: (dragPosRef.current.moveCount || 0) + 1
        };

        // Check if we are inside the game bounds (GameY > 0)
        // Actually, let's use a small buffer. Bank is 'above', so y < 0.
        // If Y > 0, we are in the game.
        const inBounds = newY > 0 && newY < GAME.height && newX > 0 && newX < GAME.width;

        setDraggingPlatform({
            type,
            gameX: newX,
            gameY: newY,
            isValid: inBounds && isPlacementValid(newX, newY, 0, level.noPlaceZones)
        });
    }, [level, scale]);

    const handleDragRelease = React.useCallback((type, evt) => {
        const gameX = dragPosRef.current.x;
        const gameY = dragPosRef.current.y;
        const maxY = dragPosRef.current.maxY || -Infinity;
        const moveCount = dragPosRef.current.moveCount || 0;

        // Check bounds again at release
        const inBounds = gameX > 0 && gameX < GAME.width && gameY > 0 && gameY < GAME.height;
        const enteredGameArea = maxY > 0; // Threshold 0 implies entered game area

        if (inBounds) {
            // RELEASED INSIDE GAME LAYOUT -> Normal Place
            const snappedX = Math.round(gameX / 2) * 2;
            const snappedY = Math.round(gameY / 2) * 2;

            if (isPlacementValid(snappedX, snappedY, 0, level.noPlaceZones)) {
                addPlatformAt(type, snappedX, snappedY);
            }
        } else {
            // RELEASED OUTSIDE

            // If never entered game area OR moved very little (tap), Auto-Place
            if (!enteredGameArea || moveCount < 10) {
                // TAP TO PLACE
                addPlatform(type);
            }
            // ELSE: We entered game area OR moved a lot and brought it back => CANCEL (Do nothing)
        }

        setDraggingPlatform(null);
    }, [placedPlatforms, gameState, level]);





    return (
        <View style={styles.safe}>
            {/* 1. Header Area - Three Columns: Back | Content | Refresh */}
            <View style={[styles.header, {
                paddingTop: insets.top + s(8),
                height: insets.top + headerReserved,
                flexDirection: 'row',
                alignItems: 'center',
            }]}>
                {/* LEFT: Back Arrow - Vertically centered across both rows */}
                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                    <Text style={styles.icon}>←</Text>
                </TouchableOpacity>

                {/* CENTER: Two rows of content */}
                <View style={{ flex: 1, paddingHorizontal: s(8) }}>
                    {/* Row 1: Level Title + Stars */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: s(8) }}>
                        {/* Level Title Box */}
                        <View style={styles.titleBox}>
                            <Text style={styles.title} numberOfLines={1}>
                                Level {level.id >= 300 ? level.id - 300 : level.id >= 200 ? level.id - 200 : level.id >= 100 ? level.id - 100 : level.id}: {level.name}
                            </Text>
                        </View>
                        {/* Stars Box */}
                        <View style={styles.starsBox}>
                            <Stars count={calculateStars()} size={s(16)} />
                        </View>
                    </View>

                    {/* Row 2: Platform Bank + DROP Button */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Platform Bank Box */}
                        <View style={styles.bankBox}>
                            <View style={styles.bank}>
                                {Object.keys(PLATFORM_TYPES).map(k => {
                                    const rem = getRemainingByType(k);
                                    if ((level.platforms[k] || 0) === 0) return null;
                                    return (
                                        <DraggableBankItem
                                            key={k}
                                            type={k}
                                            remaining={rem}
                                            disabled={rem === 0 || gameState !== 'setup'}
                                            isDragging={draggingPlatform?.type === k}
                                            onDragStart={handleDragStart}
                                            onDragMove={handleDragMove}
                                            onDragRelease={handleDragRelease}
                                            onDrop={() => addPlatform(k)}
                                        />
                                    );
                                })}
                            </View>
                        </View>

                        {/* DROP Button */}
                        <TouchableOpacity style={[styles.dropBtn, gameState !== 'setup' && { opacity: 0.4 }]} onPress={handleDrop}>
                            <Text style={styles.dropTxt}>DROP</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* RIGHT: Refresh/Retry Button - Vertically centered across both rows */}
                <TouchableOpacity style={styles.retryHeaderBtn} onPress={handleRetry}>
                    <Text style={styles.retryIcon}>↺</Text>
                </TouchableOpacity>
            </View>

            {/* 2. Body Area (Centers the Game board) */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View
                    ref={gameAreaRef}
                    style={[styles.gameWrap, { width: GAME.width * scale, height: GAME.height * scale }]}
                    onLayout={(event) => {
                        event.target.measureInWindow((x, y, width, height) => {
                            measuredGameAreaLayout = { x, y, width, height };
                        });
                    }}
                >
                    <Pressable
                        style={{ width: GAME.width, height: GAME.height, transform: [{ scale }], transformOrigin: 'top left', backgroundColor: '#0a0a18' }}
                        onPress={() => { if (gameState === 'setup') clearSelection(); }}
                    >
                        {entities && <GameEngine ref={gameEngineRef} style={{ width: GAME.width, height: GAME.height }} systems={[Physics]} entities={entities} running={gameState === 'playing' && isFocused} onEvent={handleEvent} />}

                        {gameState === 'setup' && lastTrail.length > 0 && <BallTrail points={lastTrail} />}
                        {gameState === 'playing' && liveTrail.length > 0 && <BallTrail points={liveTrail} />}

                        {gameState === 'setup' && (level.balls || []).map((b, i) => <StartArea key={i} position={b} />)}
                        {gameState === 'setup' && placedPlatforms.map((p, i) => (
                            <DraggablePlatform
                                key={i}
                                p={p}
                                i={i}
                                scale={scale}
                                onUpdate={updatePlatform}
                                onRemove={removePlatform}
                                zones={level.noPlaceZones}
                                isSelected={selectedPlatformIndex === i}
                                onSelect={() => selectPlatform(i)}
                            />
                        ))}

                        {draggingPlatform && draggingPlatform.gameX != null && draggingPlatform.gameY != null && (
                            <View
                                style={{
                                    position: 'absolute',
                                    left: draggingPlatform.gameX - PHYSICS.platformWidth / 2,
                                    top: draggingPlatform.gameY - PHYSICS.platformHeight / 2,
                                    width: PHYSICS.platformWidth,
                                    height: PHYSICS.platformHeight,
                                    backgroundColor: draggingPlatform.isValid ? (PLATFORM_TYPES[draggingPlatform.type]?.color || COLORS.platform) : 'rgba(239, 68, 68, 0.5)',
                                    opacity: 0.7,
                                    borderRadius: 4,
                                    borderWidth: 2,
                                    borderColor: draggingPlatform.isValid ? '#fff' : 'rgba(239, 68, 68, 1)',
                                    borderStyle: draggingPlatform.isValid ? 'dashed' : 'solid',
                                }}
                            />
                        )}
                        {(level.noPlaceZones || []).map((z, i) => (
                            <View
                                key={`npz-${i}`}
                                style={{
                                    position: 'absolute',
                                    left: z.x - z.width / 2,
                                    top: z.y - z.height / 2,
                                    width: z.width,
                                    height: z.height,
                                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                    borderColor: 'rgba(239, 68, 68, 0.5)',
                                    borderWidth: 1,
                                    borderStyle: 'dashed',
                                    zIndex: 0
                                }}
                            />
                        ))}

                        <ParticleSystem ref={particleSystemRef} />

                    </Pressable>
                </View>

                {/* 3. Level Complete / Overlay */}
                {(gameState === 'win' || gameState === 'lose') && (
                    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                        <View style={[styles.overlayBox, gameState === 'win' ? styles.winBox : styles.loseBox]}>
                            {gameState === 'win' ? <><Text style={styles.overlayTxt}>Level Complete!</Text><Stars count={stars} size={26} /></> : <Text style={styles.overlayTxt}>Level Failed</Text>}
                            <View style={{ flexDirection: 'row', marginTop: 12 }}>
                                <TouchableOpacity style={[styles.retryBtn, { marginRight: 10 }]} onPress={handleRetry}><Text style={styles.btnTxt}>Retry</Text></TouchableOpacity>
                                {gameState === 'win' && <TouchableOpacity style={[styles.nextBtn, { marginRight: 0 }]} onPress={handleNext}><Text style={styles.btnTxt}>Next →</Text></TouchableOpacity>}
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Tutorial Popup */}
                {showTutorial && (
                    <View style={[styles.overlay, { zIndex: 9999 }]}>
                        <View style={[styles.overlayBox, { backgroundColor: '#16213e', borderColor: '#3b82f6', borderWidth: 2, maxWidth: 300 }]}>
                            <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>How to Play</Text>
                            <Text style={{ color: '#e0e0e0', fontSize: 16, textAlign: 'center', marginBottom: 20, lineHeight: 22 }}>
                                Drag platforms from the top bar to guide the ball to the green goal.
                                {'\n\n'}
                                Press DROP and watch!
                            </Text>
                            <TouchableOpacity
                                style={{ backgroundColor: '#3b82f6', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 }}
                                onPress={() => setShowTutorial(false)}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Got it!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* 3. Footer Area */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + s(8), height: insets.bottom + footerReserved }]}>
                {/* Banner Ad Area */}
                <View style={{ width: '100%', alignItems: 'center', backgroundColor: 'transparent', marginTop: s(4) }}>
                    <BannerAd unitId={adUnitID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
                </View>
            </View>

            {/* World Welcome Modal */}
            <StyledModal
                visible={worldWelcomeModal.visible}
                title={`Welcome to World ${worldWelcomeModal.worldId}!`}
                message="Bonus stars cannot be transported to new worlds."
                icon="🌟"
                accentColor="#8b5cf6"
                buttons={[
                    { text: "Let's Go!", onPress: () => setWorldWelcomeModal({ ...worldWelcomeModal, visible: false }) }
                ]}
                onClose={() => setWorldWelcomeModal({ ...worldWelcomeModal, visible: false })}
            />

            {/* Locked Level Modal */}
            <StyledModal
                visible={lockedLevelModal.visible}
                title="Level Locked"
                message={`This bonus level requires ${lockedLevelModal.required} stars to unlock.\n\nYou currently have ${lockedLevelModal.current} stars.`}
                icon="🔒"
                accentColor="#f59e0b"
                buttons={[
                    { text: "Menu", style: 'cancel', onPress: () => { setLockedLevelModal({ ...lockedLevelModal, visible: false }); navigation.navigate('Menu'); } },
                    {
                        text: "Watch Ad", onPress: () => {
                            setLockedLevelModal({ ...lockedLevelModal, visible: false });
                            setTimeout(async () => {
                                const earned = await showRewardedAd();
                                if (earned) {
                                    const newBonus = bonusStars + 1;
                                    setBonusStars(newBonus);
                                    await saveBonusStars(newBonus);
                                }
                            }, 1000);
                        }
                    },
                ]}
                onClose={() => setLockedLevelModal({ ...lockedLevelModal, visible: false })}
            />
        </View>
    );
};

// Component that holds refs to latest p to prevent stale closures
const DraggablePlatform = ({ p, i, scale, onUpdate, onRemove, zones, isSelected, onSelect }) => {
    const type = PLATFORM_TYPES[p.type] || PLATFORM_TYPES.normal;
    // Match Physics Body W/H
    const W = PHYSICS.platformWidth;
    const H = PHYSICS.platformHeight;

    // Calculate bounding box half-extents for a rotated rectangle
    // Returns { halfW, halfH } - the half-width and half-height of the axis-aligned bounding box
    const getRotatedBounds = (angle) => {
        const cosA = Math.abs(Math.cos(angle));
        const sinA = Math.abs(Math.sin(angle));
        return {
            halfW: (W * cosA + H * sinA) / 2,
            halfH: (W * sinA + H * cosA) / 2
        };
    };

    // Layout: Handle(40) + Gap(5) + Body(70) + Gap(5) + Handle(40) = 160 Total Width
    const TOTAL_W = 160;
    const TOTAL_H = 50;

    const pRef = useRef(p);
    const onSelectRef = useRef(onSelect);
    useEffect(() => {
        pRef.current = p;
        onSelectRef.current = onSelect;
        // Sync local tracking refs when not dragging to stay in sync with props
        if (!isDragging.current) {
            posRef.current = { x: p.x, y: p.y };
            angleRef.current = p.angle || 0;
        }
    }, [p, onSelect]);

    // Local state for visual feedback during drag (Red overlay)
    // We can't easily rely on just props because we want immediate feedback
    // But we are updating parent state on drag, so props will update.
    // Let's check validity based on prop `p` or local ref?
    // Since we update parent, `p` comes back updated.

    // Check if current position is valid
    // Use Animated.Value for validity to sync perfectly with LERP'd position
    const validityAnim = useRef(new Animated.Value(1)).current; // 1 = valid, 0 = invalid
    const isDragging = useRef(false);

    // Initial validity from props (when not dragging)
    const isValidFromProps = isPlacementValid(p.x, p.y, p.angle || 0, zones);

    // Sync validity with props when not dragging
    useEffect(() => {
        if (!isDragging.current) {
            validityAnim.setValue(isValidFromProps ? 1 : 0);
        }
    }, [isValidFromProps]);

    // Use Animated Values for high-perf visuals
    // bodyPan: Lags behind with physics (shading)
    // widgetPan: Follows finger 1:1 (handles/remove btn)
    // rotationAnim: Handles smooth rotation without re-renders
    const bodyPan = useRef(new Animated.ValueXY({ x: p.x, y: p.y })).current;
    const widgetPan = useRef(new Animated.ValueXY({ x: p.x, y: p.y })).current;
    const rotationAnim = useRef(new Animated.Value(p.angle || 0)).current;

    // Sync Props to Animated Values (Only if not dragging)
    useEffect(() => {
        if (!isDragging.current) {
            bodyPan.setValue({ x: p.x, y: p.y });
            widgetPan.setValue({ x: p.x, y: p.y });
            rotationAnim.setValue(p.angle || 0);
        }
    }, [p.x, p.y, p.angle]);

    // Use local refs for real-time tracking during drag without re-renders
    const posRef = useRef({ x: p.x, y: p.y });
    const angleRef = useRef(p.angle || 0);

    // Center Drag (Move)
    const movePan = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                isDragging.current = true;
                const currentP = pRef.current;

                // Select this platform when it starts being dragged
                onSelectRef.current?.();

                posRef.current = { x: currentP.x, y: currentP.y };

                bodyPan.setOffset({ x: 0, y: 0 });
                bodyPan.setValue({ x: currentP.x, y: currentP.y });

                widgetPan.setOffset({ x: 0, y: 0 });
                widgetPan.setValue({ x: currentP.x, y: currentP.y });

                const touchX = evt.nativeEvent.pageX;
                const touchY = evt.nativeEvent.pageY;
                const gamePos = screenToGameCoords(touchX, touchY, scale);

                pRef.current.dragOffsetX = gamePos.gameX - currentP.x;
                pRef.current.dragOffsetY = gamePos.gameY - currentP.y;

                pRef.current.startX = currentP.x;
                pRef.current.startY = currentP.y;
                pRef.current.startPlatformAngle = currentP.angle || 0; // Store angle for revert
            },
            onPanResponderMove: (evt) => {
                const touchX = evt.nativeEvent.pageX;
                const touchY = evt.nativeEvent.pageY;
                const gamePos = screenToGameCoords(touchX, touchY, scale);

                // Target: Finger Pos - Initial Offset
                let targetX = gamePos.gameX - (pRef.current.dragOffsetX || 0);
                let targetY = gamePos.gameY - (pRef.current.dragOffsetY || 0);

                // Calculate rotation-aware bounds
                const { halfW, halfH } = getRotatedBounds(angleRef.current);

                // Bound using rotated bounding box
                targetX = Math.max(halfW, Math.min(GAME.width - halfW, targetX));
                targetY = Math.max(halfH, Math.min(GAME.height - halfH, targetY));

                // 1. Widgets follow finger directly (no LERP)
                widgetPan.setValue({ x: targetX, y: targetY });

                // 2. Snap Target to 2px grid for Body
                const snapTargetX = Math.round(targetX / 2) * 2;
                const snapTargetY = Math.round(targetY / 2) * 2;

                // 3. Physics Loop (LERP 0.25) - Body lags behind with heavier feel
                const currentX = posRef.current.x;
                const currentY = posRef.current.y;
                const lerp = 0.5;

                let dx = snapTargetX - currentX;
                let dy = snapTargetY - currentY;

                let newX = currentX + dx * lerp;
                let newY = currentY + dy * lerp;

                posRef.current = { x: newX, y: newY };

                // Update Body visual (lags with LERP)
                bodyPan.setValue({ x: newX, y: newY });

                // Update live validity for visual feedback (Animated for sync)
                // Note: using angleRef.current here for live rotation
                const nowValid = isPlacementValid(newX, newY, angleRef.current, zones);
                validityAnim.setValue(nowValid ? 1 : 0);

                // NO LONGER CALLING onUpdate(i, ...) HERE TO PREVENT RE-RENDERS
            },
            onPanResponderRelease: () => {
                isDragging.current = false;
                const { x, y } = posRef.current;
                const finalAngle = angleRef.current;

                if (!isPlacementValid(x, y, finalAngle, zones)) {
                    // Revert to start position and starting angle
                    onUpdate(i, { x: pRef.current.startX, y: pRef.current.startY, angle: pRef.current.startPlatformAngle });
                    bodyPan.setValue({ x: pRef.current.startX, y: pRef.current.startY });
                    widgetPan.setValue({ x: pRef.current.startX, y: pRef.current.startY });
                    rotationAnim.setValue(pRef.current.startPlatformAngle); // Reset rotation visual
                    angleRef.current = pRef.current.startPlatformAngle; // Reset angle ref
                } else {
                    // Commit the move and current angle
                    onUpdate(i, { x: Math.round(x), y: Math.round(y), angle: finalAngle });
                    widgetPan.setValue({ x: Math.round(x), y: Math.round(y) });
                }
                // Reset validity to match final position
                const finalValid = isPlacementValid(pRef.current.x, pRef.current.y, pRef.current.angle || 0, zones);
                validityAnim.setValue(finalValid ? 1 : 0);
            }
        })
    ).current;

    // Normalize angle to [-π, π] range to prevent jumps
    const normalizeAngle = (angle) => {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    };

    // Point-to-Finger Rotation Logic
    // The platform end closest to the touched handle points toward the finger
    // direction: 'left' means left end points at finger, 'right' means right end points at finger
    const createRotPan = (direction) => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            // Store starting platform angle for revert
            pRef.current.startPlatformAngle = pRef.current.angle || 0;
            // Also store starting position for revert (even if we don't move X/Y during rotation)
            pRef.current.startX = pRef.current.x;
            pRef.current.startY = pRef.current.y;
        },
        onPanResponderMove: (evt) => {
            // Get platform center in screen coordinates
            // We need to convert game coords to screen coords
            const platX = posRef.current.x;
            const platY = posRef.current.y;

            // Current touch position (screen coords)
            const touchX = evt.nativeEvent.pageX;
            const touchY = evt.nativeEvent.pageY;

            // Convert platform center to screen coords using reverse of screenToGameCoords
            // This is approximate but works for rotation
            const gameLayout = measuredGameAreaLayout || { x: 0, y: 140, width: GAME.width * scale, height: GAME.height * scale };
            const screenPlatX = gameLayout.x + platX * scale;
            const screenPlatY = gameLayout.y + platY * scale;

            // Calculate angle from platform center to finger
            const fingerAngle = Math.atan2(touchY - screenPlatY, touchX - screenPlatX);

            // For left handle: left end should point at finger
            // Platform's left end points at angle = platform.angle + PI (opposite of right end)
            // So we want: platform.angle + PI = fingerAngle
            // Therefore: platform.angle = fingerAngle - PI
            // For right handle: right end should point at finger
            // Platform's right end points at angle = platform.angle
            // So we want: platform.angle = fingerAngle

            let newAngle;
            if (direction === 'left') {
                newAngle = fingerAngle - Math.PI;
            } else {
                newAngle = fingerAngle;
            }

            // Normalize to [-PI, PI]
            newAngle = normalizeAngle(newAngle);

            // Snapping: 2 degrees
            const deg = newAngle * 180 / Math.PI;
            const snappedDeg = Math.round(deg / 2) * 2;
            newAngle = snappedDeg * Math.PI / 180;

            // Update live angle ref for validity check and visually
            angleRef.current = newAngle;
            rotationAnim.setValue(newAngle);

            // Update live validity for visual feedback
            const nowValid = isPlacementValid(posRef.current.x, posRef.current.y, newAngle, zones);
            validityAnim.setValue(nowValid ? 1 : 0);
        },
        onPanResponderRelease: () => {
            // Check final validity
            const { x, y } = posRef.current;
            const finalAngle = angleRef.current;
            if (!isPlacementValid(x, y, finalAngle, zones)) {
                // Revert rotation to start
                onUpdate(i, { x: pRef.current.startX, y: pRef.current.startY, angle: pRef.current.startPlatformAngle });
                bodyPan.setValue({ x: pRef.current.startX, y: pRef.current.startY });
                widgetPan.setValue({ x: pRef.current.startX, y: pRef.current.startY });
                rotationAnim.setValue(pRef.current.startPlatformAngle);
                angleRef.current = pRef.current.startPlatformAngle;
                // Force reset validity visual (since props won't change if reverted to original)
                validityAnim.setValue(1);
            } else {
                // Commit the final position and final angle
                onUpdate(i, { x: Math.round(x), y: Math.round(y), angle: finalAngle });
                widgetPan.setValue({ x: Math.round(x), y: Math.round(y) });
            }
            // Clean up
            pRef.current.startPlatformAngle = angleRef.current;
        }
    });

    const leftRotPan = useRef(createRotPan('left')).current;
    const rightRotPan = useRef(createRotPan('right')).current;

    // Interpolate rotation for smooth animated rotation without re-renders
    const rotationDeg = rotationAnim.interpolate({
        inputRange: [-Math.PI * 2, Math.PI * 2],
        outputRange: ['-360deg', '360deg']
    });

    return (
        <>
            {/* Platform Body - Lags with LERP via bodyPan, color changes based on validity */}
            <Animated.View
                style={[styles.dragPlat, {
                    transform: [
                        { translateX: bodyPan.x },
                        { translateY: bodyPan.y },
                        { rotate: rotationDeg }
                    ],
                    width: W,
                    height: H,
                    marginLeft: -W / 2,
                    marginTop: -H / 2,
                    zIndex: 9,
                    backgroundColor: validityAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                            // Invalid: red-tinted color
                            'rgba(200, 80, 80, 0.9)',
                            // Valid: normal platform color
                            type.color
                        ]
                    }),
                    borderRadius: 6,
                    // Glow effect when selected - uses platform type color
                    shadowColor: isSelected ? type.color : '#000',
                    shadowOffset: { width: 0, height: isSelected ? 0 : 2 },
                    shadowOpacity: isSelected ? 0.8 : 0.3,
                    shadowRadius: isSelected ? 10 : 4,
                    // iOS border glow simulation
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? type.color : 'transparent',
                }]}
                hitSlop={{ top: 30, bottom: 30, left: 10, right: 10 }}
                {...movePan.panHandlers}
            />

            {/* UI Widgets - Only show when selected */}
            {isSelected && (
                <Animated.View style={[styles.dragPlat, {
                    transform: [
                        { translateX: widgetPan.x },
                        { translateY: widgetPan.y },
                        { rotate: rotationDeg }
                    ],
                    width: TOTAL_W,
                    height: TOTAL_H,
                    marginLeft: -TOTAL_W / 2,
                    marginTop: -TOTAL_H / 2,
                    zIndex: 10,
                    pointerEvents: 'box-none', // Allow taps to pass through empty areas
                }]}>
                    {/* Left Handle */}
                    <View style={[styles.rotHandle, { marginRight: 5 }]} {...leftRotPan.panHandlers}>
                        <Text style={styles.handleTxt}>⟳</Text>
                    </View>

                    {/* Spacer for platform body (rendered separately) */}
                    <View style={{ width: W, height: H }} pointerEvents="none" />

                    {/* Right Handle */}
                    <View style={[styles.rotHandle, { marginLeft: 5 }]} {...rightRotPan.panHandlers}>
                        <Text style={styles.handleTxt}>⟲</Text>
                    </View>

                    {/* Remove Button */}
                    <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(i)}>
                        <Text style={styles.removeTxt}>×</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </>
    );
};

// Draggable Bank Item for drag-to-place functionality
// Defined OUTSIDE GameScreen to prevent unmounting/remounting on every state change
const DraggableBankItem = React.memo(({ type, remaining, disabled, isDragging, onDragStart, onDragMove, onDragRelease, onDrop }) => {
    const t = PLATFORM_TYPES[type];

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evt) => {
            onDragStart(type, evt);
        },
        onPanResponderMove: (evt) => {
            onDragMove(type, evt);
        },
        onPanResponderRelease: (evt) => {
            onDragRelease(type, evt);
        },
        onPanResponderTerminate: () => {
            // Reset logic if needed
        },
    }), [disabled, type, onDragStart, onDragMove, onDragRelease]);

    // Show remaining-1 while dragging this type
    const displayCount = isDragging ? remaining - 1 : remaining;

    return (
        <View
            style={[
                styles.bankItem,
                (disabled || displayCount < 0) && { opacity: 0.3 },
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity
                onPress={onDrop}
                disabled={disabled}
                style={{ flexDirection: 'row', alignItems: 'center' }}
            >
                <View style={[styles.bankPlat, { backgroundColor: t.color }]}>
                    <Text style={styles.bankIcon}>{t.icon}</Text>
                </View>
                <Text style={styles.bankCnt}>×{Math.max(0, displayCount)}</Text>
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: s(8), backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 1000, elevation: 50 },
    headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: s(6) },
    backBtn: { width: s(32), height: s(32), borderRadius: s(16), backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    icon: { color: '#fff', fontSize: s(18) },
    title: { color: '#fff', fontSize: s(12), fontWeight: '600', textAlign: 'center' },
    retryHeaderBtn: { width: s(32), height: s(32), borderRadius: s(16), backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    retryIcon: { color: '#fff', fontSize: s(20) },
    infoBox: {
        height: s(28),
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: s(6),
        justifyContent: 'center',
        paddingHorizontal: s(8),
    },
    dropBtn: { backgroundColor: '#7F00FF', paddingHorizontal: s(12), paddingVertical: s(6), borderRadius: s(8) },
    dropTxt: { color: '#fff', fontWeight: 'bold', fontSize: s(14) },
    titleBox: {
        width: s(216),
        height: s(28),
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: s(6),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: s(8),
        marginRight: s(6),
    },
    starsBox: {
        width: s(64),
        height: s(28),
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: s(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    bankBox: {
        width: s(216),
        height: s(28),
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: s(8),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: s(4),
        marginRight: s(6),
    },
    bank: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    bankItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: s(4), paddingHorizontal: s(8), borderRadius: s(6), margin: s(2) },
    bankPlat: { width: s(24), height: s(8), borderRadius: s(4), alignItems: 'center', justifyContent: 'center', marginRight: s(4) },
    bankIcon: { fontSize: s(6), color: '#fff' },
    bankCnt: { color: '#fff', fontSize: s(10), fontWeight: 'bold' },
    gameWrap: { alignSelf: 'center', backgroundColor: '#0f0f1b', borderRadius: 8, marginVertical: 4, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
    footer: { Padding: 10, alignItems: 'center', justifyContent: 'center', height: 50, zIndex: 1000, elevation: 50 },
    clearBtn: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    clearTxt: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
    dragPlat: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
    platBody: { flex: 1, height: 40, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    platIcon: { color: 'rgba(255,255,255,0.8)', fontSize: 10 },
    rotHandle: {
        width: 40,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 0,
    },
    handleTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
    removeBtn: { position: 'absolute', top: -20, right: -20, width: 30, height: 30, borderRadius: 15, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    removeTxt: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: -2 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    overlayBox: { padding: 20, borderRadius: 16, alignItems: 'center', minWidth: 200 },
    winBox: { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: '#22c55e' },
    loseBox: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: '#ef4444' },
    overlayTxt: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    nextBtn: { backgroundColor: '#22c55e', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
    retryBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    btnTxt: { color: '#fff', fontWeight: 'bold' },
});

export default GameScreen;
