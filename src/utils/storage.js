import AsyncStorage from '@react-native-async-storage/async-storage';

const LEVEL_PROGRESS_KEY = '@bounce_puzzle_progress';

// Progress schema: { [levelId]: { stars: number, completed: boolean } }

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
