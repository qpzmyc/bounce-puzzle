import AsyncStorage from '@react-native-async-storage/async-storage';

const LEVEL_PROGRESS_KEY = '@bounce_puzzle_progress';
const SETTINGS_KEY = '@bounce_puzzle_settings';

// Progress schema: { [levelId]: { stars: number, completed: boolean } }

export const getSettings = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
        // Default: { sound: true, haptics: true, music: true }
        const defaults = { sound: true, haptics: true, music: true };
        if (jsonValue != null) {
            return { ...defaults, ...JSON.parse(jsonValue) };
        }
        return defaults;
    } catch (e) {
        console.error("Failed to load settings", e);
        return { sound: true, haptics: true, music: true };
    }
};

export const saveSettings = async (settings) => {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save settings", e);
    }
};

export const getLevelProgress = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(LEVEL_PROGRESS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
        console.error("Failed to load progress", e);
        return {};
    }
};

export const saveLevelProgress = async (levelId, stars) => {
    try {
        const currentProgress = await getLevelProgress();
        const existing = currentProgress[levelId] || { stars: 0, completed: false };

        // Only update if better result or first completion
        if (stars > existing.stars) {
            const newProgress = {
                ...currentProgress,
                [levelId]: {
                    stars: Math.max(stars, existing.stars),
                    completed: true,
                },
            };
            await AsyncStorage.setItem(LEVEL_PROGRESS_KEY, JSON.stringify(newProgress));
            return newProgress;
        }

        // Even if stars aren't better, mark as completed if not already done (though getting stars usually implies completion)
        if (!existing.completed) {
            const newProgress = {
                ...currentProgress,
                [levelId]: { ...existing, completed: true }
            };
            await AsyncStorage.setItem(LEVEL_PROGRESS_KEY, JSON.stringify(newProgress));
            return newProgress;
        }

        return currentProgress;
    } catch (e) {
        console.error("Failed to save progress", e);
        return {};
    }
};

export const clearProgress = async () => {
    try {
        await AsyncStorage.removeItem(LEVEL_PROGRESS_KEY);
        await AsyncStorage.removeItem(WORLD_ENTERED_KEY);
        // also clear bonus stars if "clearing all progress" implies it
        await AsyncStorage.removeItem(BONUS_STARS_KEY);
        await AsyncStorage.removeItem(UNLOCKED_LEVELS_KEY);
        await AsyncStorage.removeItem(UNLOCKED_WORLDS_KEY);
    } catch (e) {
        console.error("Failed to clear progress", e);
    }
};

export const unlockAllLevels = async (allLevels) => {
    try {
        const progress = {};
        allLevels.forEach(level => {
            progress[level.id] = { stars: 3, completed: true };
        });
        await AsyncStorage.setItem(LEVEL_PROGRESS_KEY, JSON.stringify(progress));
        return progress;
    } catch (e) {
        console.error("Failed to unlock all levels", e);
        return {};
    }
};

// Ad System Storage
const ADS_KEY = '@bounce_puzzle_ads';
const BONUS_STARS_KEY = '@bounce_puzzle_bonus_stars';

export const getBonusStars = async () => {
    try {
        const value = await AsyncStorage.getItem(BONUS_STARS_KEY);
        return value != null ? parseInt(value) : 0;
    } catch (e) {
        console.error("Failed to load bonus stars", e);
        return 0;
    }
};

export const saveBonusStars = async (count) => {
    try {
        await AsyncStorage.setItem(BONUS_STARS_KEY, count.toString());
    } catch (e) {
        console.error("Failed to save bonus stars", e);
    }
};

export const getAdState = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(ADS_KEY);
        // Schema: { difficultyScore: 0, elapsedPlayTimeMs: 0, lastActiveTimestamp: Date.now() }
        // elapsedPlayTimeMs accumulates only while app is in foreground
        if (jsonValue != null) {
            const parsed = JSON.parse(jsonValue);
            // Migration: if old schema had lastAdTimestamp, convert to new schema
            if ('lastAdTimestamp' in parsed && !('elapsedPlayTimeMs' in parsed)) {
                const migrated = {
                    difficultyScore: parsed.difficultyScore || 0,
                    elapsedPlayTimeMs: 0,
                    lastActiveTimestamp: Date.now()
                };
                await AsyncStorage.setItem(ADS_KEY, JSON.stringify(migrated));
                return migrated;
            }
            return parsed;
        }
        const initial = { difficultyScore: 0, elapsedPlayTimeMs: 0, lastActiveTimestamp: Date.now() };
        await AsyncStorage.setItem(ADS_KEY, JSON.stringify(initial));
        return initial;
    } catch (e) {
        console.error("Failed to load ad state", e);
        return { difficultyScore: 0, elapsedPlayTimeMs: 0, lastActiveTimestamp: Date.now() };
    }
};

export const saveAdState = async (state) => {
    try {
        await AsyncStorage.setItem(ADS_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save ad state", e);
    }
};

// World Entry Tracking (for first-time welcome popups)
const WORLD_ENTERED_KEY = '@bounce_puzzle_world_entered';

export const hasEnteredWorld = async (worldId) => {
    try {
        const jsonValue = await AsyncStorage.getItem(WORLD_ENTERED_KEY);
        const entered = jsonValue != null ? JSON.parse(jsonValue) : {};
        return !!entered[worldId];
    } catch (e) {
        console.error("Failed to check world entry", e);
        return false;
    }
};

export const markWorldEntered = async (worldId) => {
    try {
        const jsonValue = await AsyncStorage.getItem(WORLD_ENTERED_KEY);
        const entered = jsonValue != null ? JSON.parse(jsonValue) : {};
        entered[worldId] = true;
        await AsyncStorage.setItem(WORLD_ENTERED_KEY, JSON.stringify(entered));
    } catch (e) {
        console.error("Failed to mark world entry", e);
    }
};

// Persistent Unlock Keys
const UNLOCKED_LEVELS_KEY = '@bounce_puzzle_unlocked_levels';
const UNLOCKED_WORLDS_KEY = '@bounce_puzzle_unlocked_worlds';

export const getUnlockedLevels = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(UNLOCKED_LEVELS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
        return {};
    }
};

export const saveUnlockedLevel = async (levelId) => {
    try {
        const current = await getUnlockedLevels();
        if (!current[levelId]) {
            current[levelId] = true;
            await AsyncStorage.setItem(UNLOCKED_LEVELS_KEY, JSON.stringify(current));
        }
    } catch (e) { }
};

export const getUnlockedWorlds = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(UNLOCKED_WORLDS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
        return {};
    }
};

export const saveUnlockedWorld = async (worldId) => {
    try {
        const current = await getUnlockedWorlds();
        if (!current[worldId]) {
            current[worldId] = true;
            await AsyncStorage.setItem(UNLOCKED_WORLDS_KEY, JSON.stringify(current));
        }
    } catch (e) { }
};

