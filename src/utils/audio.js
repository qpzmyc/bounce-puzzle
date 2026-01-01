import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Asset } from 'expo-asset';

const SOUND_FILES = {
    normal: require('../../assets/bounce_normal.mp3'),
    sticky: require('../../assets/bounce_sticky.mp3'),
    super: require('../../assets/bounce_super.mp3'),
    level_complete: require('../../assets/level_complete.mp3'),
};

const MAX_CONCURRENT = 5; // Reduced to 5 high-quality "warm" players
const soundPools = {};
let levelCompletePlayer = null;

let isSoundEnabled = true;
let isLoaded = false;
let isLoading = false;

export const setSoundEnabled = (enabled) => {
    isSoundEnabled = enabled;
};

const createPlayer = (key) => {
    try {
        const resource = SOUND_FILES[key];
        const player = createAudioPlayer(resource);
        if (key === 'sticky') player.volume = 0.5;
        if (key === 'normal') player.volume = 1.0;
        return player;
    } catch (error) {
        console.warn(`Failed to create player for: ${key}`, error);
        return null;
    }
};

const initializePool = (key) => {
    if (soundPools[key]) return;
    soundPools[key] = { players: [], currentIndex: 0 };
    for (let i = 0; i < MAX_CONCURRENT; i++) {
        const player = createPlayer(key);
        if (player) soundPools[key].players.push(player);
    }
};

export const loadSounds = async () => {
    if (isLoaded || isLoading) return;
    isLoading = true;
    try {
        // Pre-download assets
        await Promise.all(Object.values(SOUND_FILES).map(res => Asset.fromModule(res).downloadAsync()));

        await setAudioModeAsync({
            playsInSilentMode: true,
            staysActiveInBackground: false,
            interruptionMode: 'doNotMix', // Changed back to doNotMix as it sometimes has better priority
            shouldPlayInBackground: false,
        });

        initializePool('normal');
        initializePool('sticky');
        initializePool('super');
        levelCompletePlayer = createPlayer('level_complete');

        // WARM UP ALL PLAYERS
        // Playing a tiny bit of silence/zero-volume on every player
        // ensures the OS has pre-allocated the audio hardware for these instances.
        const allPoolPlayers = Object.values(soundPools).flatMap(p => p.players);
        if (levelCompletePlayer) allPoolPlayers.push(levelCompletePlayer);

        for (const player of allPoolPlayers) {
            const originalVolume = player.volume;
            player.volume = 0;
            player.play();
            // We don't reset yet, we'll do it after a short delay
        }

        setTimeout(() => {
            for (const player of allPoolPlayers) {
                try {
                    player.pause();
                    // Determine which sound to reset to
                    let soundKey = 'normal';
                    if (player === levelCompletePlayer) soundKey = 'level_complete';
                    else {
                        for (const [key, pool] of Object.entries(soundPools)) {
                            if (pool.players.includes(player)) { soundKey = key; break; }
                        }
                    }

                    player.replace(SOUND_FILES[soundKey]);
                    // Restore volume
                    if (soundKey === 'sticky') player.volume = 0.5;
                    else if (soundKey === 'normal' || soundKey === 'level_complete' || soundKey === 'super') player.volume = 1.0;
                } catch (e) { }
            }
        }, 300);

        isLoaded = true;
    } catch (e) {
        console.warn("Audio system failed to initialize", e);
    } finally {
        isLoading = false;
    }
};

const getNextPlayer = (key) => {
    const pool = soundPools[key];
    if (!pool || pool.players.length === 0) return null;
    const player = pool.players[pool.currentIndex];
    pool.currentIndex = (pool.currentIndex + 1) % pool.players.length;
    return player;
};

export const playSound = (type) => {
    if (!isSoundEnabled) return;

    if (type === 'level_complete') {
        if (levelCompletePlayer) {
            levelCompletePlayer.play();
            setTimeout(() => {
                try { levelCompletePlayer.replace(SOUND_FILES.level_complete); } catch (e) { }
            }, 2000);
        }
        return;
    }

    const player = getNextPlayer(type);
    if (player) {
        try {
            player.play();
            // Background reset
            setTimeout(() => {
                try { player.replace(SOUND_FILES[type]); } catch (e) { }
            }, 500);
        } catch (error) { }
    }
};

export const unloadSounds = async () => {
    for (const pool of Object.values(soundPools)) {
        for (const player of pool.players) {
            try { player.release(); } catch (e) { }
        }
    }
    if (levelCompletePlayer) {
        try { levelCompletePlayer.release(); } catch (e) { }
        levelCompletePlayer = null;
    }
    for (const key of Object.keys(soundPools)) delete soundPools[key];
};
