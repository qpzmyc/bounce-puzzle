import GameCenter from 'react-native-game-center';
import { getBounceCount, addBounceCount, getLevelProgress, addDeathCount, addBonusAdCount } from './storage';

// Achievement IDs mapped to iOS Game Center IDs
const ACHIEVEMENTS = {
    WORLD_1: 'world_1_complete',
    WORLD_2: 'world_2_complete',
    BOUNCE_100: 'bounce_100',
    BOUNCE_500: 'bounce_500',
    BOUNCE_1000: 'bounce_1000',
    BOUNCE_2000: 'bounce_2000',
    BOUNCE_5000: 'bounce_5000',
    DEATH_20: 'death_20',
    DEATH_100: 'death_100',
    DEATH_200: 'death_200',
    DEATH_500: 'death_500',
    AD_1: 'ad_1',
    AD_5: 'ad_5',
    AD_10: 'ad_10',
};

export const initGameCenter = async () => {
    if (!GameCenter) {
        console.log('Game Center module not found - standard for simulators or Expo Go. Use a development build on a physical device for full testing.');
        return;
    }

    try {
        await GameCenter.init({
            ios: {
                showWelcomeBanner: true,
            }
            // Android not supported by this specific lib or Game Center
        });
        console.log('Game Center Initialized');
    } catch (e) {
        console.log('Game Center Init Failed (likely not signed in):', e);
    }
};

const submitAchievement = async (id, percent) => {
    if (!GameCenter) return; // Silent fail if module missing

    try {
        await GameCenter.submitAchievement({
            ios: {
                achievementIdentifier: id,
                percentComplete: percent,
                showsCompletionBanner: true,
            }
        });
    } catch (error) {
        // Silent fail - standard for GC offline/sim
    }
};

export const incrementBounceCount = async (amount = 1) => {
    const newTotal = await addBounceCount(amount);
    console.log(`[Achievements] Bounce Count Updated: ${newTotal}`);

    // Check bounce milestones
    if (newTotal >= 100) submitAchievement(ACHIEVEMENTS.BOUNCE_100, 100);
    else submitAchievement(ACHIEVEMENTS.BOUNCE_100, (newTotal / 100) * 100);

    if (newTotal >= 500) submitAchievement(ACHIEVEMENTS.BOUNCE_500, 100);
    else submitAchievement(ACHIEVEMENTS.BOUNCE_500, (newTotal / 500) * 100);

    if (newTotal >= 1000) submitAchievement(ACHIEVEMENTS.BOUNCE_1000, 100);
    else submitAchievement(ACHIEVEMENTS.BOUNCE_1000, (newTotal / 1000) * 100);

    if (newTotal >= 2000) submitAchievement(ACHIEVEMENTS.BOUNCE_2000, 100);
    else submitAchievement(ACHIEVEMENTS.BOUNCE_2000, (newTotal / 2000) * 100);

    if (newTotal >= 5000) submitAchievement(ACHIEVEMENTS.BOUNCE_5000, 100);
    else submitAchievement(ACHIEVEMENTS.BOUNCE_5000, (newTotal / 5000) * 100);
};

export const incrementDeathCount = async (amount = 1) => {
    const newTotal = await addDeathCount(amount);
    console.log(`[Achievements] Death Count Updated: ${newTotal}`);

    if (newTotal >= 20) submitAchievement(ACHIEVEMENTS.DEATH_20, 100);
    else submitAchievement(ACHIEVEMENTS.DEATH_20, (newTotal / 20) * 100);

    if (newTotal >= 100) submitAchievement(ACHIEVEMENTS.DEATH_100, 100);
    else submitAchievement(ACHIEVEMENTS.DEATH_100, (newTotal / 100) * 100);

    if (newTotal >= 200) submitAchievement(ACHIEVEMENTS.DEATH_200, 100);
    else submitAchievement(ACHIEVEMENTS.DEATH_200, (newTotal / 200) * 100);

    if (newTotal >= 500) submitAchievement(ACHIEVEMENTS.DEATH_500, 100);
    else submitAchievement(ACHIEVEMENTS.DEATH_500, (newTotal / 500) * 100);
};

export const incrementAdCount = async (amount = 1) => {
    const newTotal = await addBonusAdCount(amount);
    console.log(`[Achievements] Ad Count Updated: ${newTotal}`);

    if (newTotal >= 1) submitAchievement(ACHIEVEMENTS.AD_1, 100);
    else submitAchievement(ACHIEVEMENTS.AD_1, (newTotal / 1) * 100);

    if (newTotal >= 5) submitAchievement(ACHIEVEMENTS.AD_5, 100);
    else submitAchievement(ACHIEVEMENTS.AD_5, (newTotal / 5) * 100);

    if (newTotal >= 10) submitAchievement(ACHIEVEMENTS.AD_10, 100);
    else submitAchievement(ACHIEVEMENTS.AD_10, (newTotal / 10) * 100);
};

export const checkCompletion = async (worldId, allWorldLevels) => {
    if (!allWorldLevels || allWorldLevels.length === 0) return;

    const progress = await getLevelProgress();

    // Check World Completion (Any stars on all levels)
    const allCompleted = allWorldLevels.every(l => progress[l.id] && progress[l.id].completed);

    // Debug Logging
    const completedCount = allWorldLevels.filter(l => progress[l.id] && progress[l.id].completed).length;
    console.log(`[Achievements] World ${worldId} Check: ${completedCount}/${allWorldLevels.length} levels completed.`);

    if (allWorldLevels.length !== 23) {
        console.warn(`[Achievements] Warning: World ${worldId} has ${allWorldLevels.length} levels defined, but expected 23.`);
    }

    if (worldId === 1) {
        if (allCompleted) {
            console.log(`[Achievements] Complete World 1 Achievement!`);
            submitAchievement(ACHIEVEMENTS.WORLD_1, 100);
        }
    } else if (worldId === 2) {
        if (allCompleted) {
            console.log(`[Achievements] Complete World 2 Achievement!`);
            submitAchievement(ACHIEVEMENTS.WORLD_2, 100);
        }
    }
};
