import { Audio } from 'expo-av';

const SOUND_FILES = {
    normal: require('../../assets/bounce_normal.mp3'),
    sticky: require('../../assets/bounce_sticky.mp3'),
    super: require('../../assets/bounce_super.mp3'),
    level_complete: require('../../assets/level_complete.mp3'),
};

// Cache loaded sounds
// Structure: { key: { pool: [Sound, Sound, ...], index: 0 } }
const soundCache = {};
let isSoundEnabled = true;

const POOL_SIZE = 5; // Number of overlapping sounds allowed per type

export const setSoundEnabled = (enabled) => {
    isSoundEnabled = enabled;
};

export const loadSounds = async () => {
    try {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });

        // We attempt to load all sounds upfront
        for (const [key, resource] of Object.entries(SOUND_FILES)) {
            try {
                // Determine if this sound needs a pool (FX) or single instance (Music/Long)
                // For now, we pool everything for simplicity as they are all short FX
                const pool = [];

                let initialStatus = {};
                if (key === 'sticky') initialStatus = { volume: 0.5 };
                if (key === 'normal') initialStatus = { volume: 1.0 }; // Explicit Max Volume

                for (let i = 0; i < POOL_SIZE; i++) {
                    const { sound } = await Audio.Sound.createAsync(resource, initialStatus);
                    pool.push(sound);
                }

                soundCache[key] = { pool, index: 0 };
            } catch (error) {
                console.warn(`Failed to preload sound: ${key}. Make sure the file exists in assets/.`, error);
            }
        }
    } catch (e) {
        console.warn("Audio system failed to initialize", e);
    }
};

export const playSound = async (type) => {
    if (!isSoundEnabled) return;

    const cacheItem = soundCache[type];
    if (cacheItem && cacheItem.pool.length > 0) {
        try {
            // Get current sound instance from pool
            const sound = cacheItem.pool[cacheItem.index];

            // Advance index for next time (Round Robin)
            cacheItem.index = (cacheItem.index + 1) % cacheItem.pool.length;

            // Play
            await sound.playFromPositionAsync(0);
        } catch (error) {
            // Ignore replay errors
        }
    }
};

export const unloadSounds = async () => {
    for (const cacheItem of Object.values(soundCache)) {
        if (cacheItem && cacheItem.pool) {
            for (const sound of cacheItem.pool) {
                try {
                    await sound.unloadAsync();
                } catch (e) { }
            }
        }
    }
};
