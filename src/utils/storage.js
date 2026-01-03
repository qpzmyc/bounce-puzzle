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
        // Default: { difficultyScore: 0, lastAdTimestamp: Date.now() }
        if (jsonValue != null) {
            return JSON.parse(jsonValue);
        }
        const initial = { difficultyScore: 0, lastAdTimestamp: Date.now() };
        await AsyncStorage.setItem(ADS_KEY, JSON.stringify(initial));
        return initial;
    } catch (e) {
        console.error("Failed to load ad state", e);
        return { difficultyScore: 0, lastAdTimestamp: Date.now() };
    }
};

export const saveAdState = async (state) => {
    try {
        await AsyncStorage.setItem(ADS_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save ad state", e);
    }
};
