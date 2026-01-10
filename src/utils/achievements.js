import GameCenter from 'react-native-game-center';
import { NativeModules } from 'react-native';
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
    DEATH_1000: 'death_1000',
    AD_1: 'ad_1',
    AD_3: 'ad_3',
    AD_10: 'ad_10',
};

let isInitialized = false;

const initGameCenter = async () => {
    console.log('[Achievements] initGameCenter called. isInitialized:', isInitialized);
    if (isInitialized) return; // Prevent double-init
    if (!NativeModules.RNGameCenter) {
        console.log('[Achievements] Game Center module not found - standard for simulators or Expo Go.');
        return;
    }

    console.log('[Achievements] Attempting to call GameCenter.init...');
    isInitialized = true;

    try {
        const result = await GameCenter.init({
            leaderboardIdentifier: 'bounces_leaderboard',
            achievementIdentifier: ACHIEVEMENTS.BOUNCE_100,
        });
        console.log('[Achievements] Game Center Initialized successfully:', result);
    } catch (e) {
        console.log('[Achievements] Game Center Init Failed:', e);
    }
};

const openAchievements = async () => {
    if (!NativeModules.RNGameCenter) return;
    try {
        await GameCenter.openAchievementModal({});
    } catch (e) {
        console.log('[Achievements] Failed to open achievements modal:', e);
    }
};

const openLeaderboard = async () => {
    if (!NativeModules.RNGameCenter) return;
    try {
        await GameCenter.openLeaderboardModal({
            leaderboardIdentifier: 'bounces_leaderboard'
        });
    } catch (e) {
        console.log('[Achievements] Failed to open leaderboard modal:', e);
    }
};

const submitAchievement = async (id, percent) => {
    if (!GameCenter || !GameCenter.submitAchievementScore) {
        console.log('[Achievements] Game Center or submitAchievementScore missing');
        return;
    }

    console.log(`[Achievements] Submitting ${id}: ${percent}%`);
    try {
        // Native code expects these keys AT THE TOP LEVEL, not nested in 'ios'
        await GameCenter.submitAchievementScore({
            achievementIdentifier: id,
            percentComplete: percent,
            showsCompletionBanner: true,
        });
        console.log(`[Achievements] Successfully reported ${id}`);
    } catch (error) {
        console.log(`[Achievements] Error reporting ${id}:`, error);
    }
};

const incrementBounceCount = async (amount = 1) => {
    const newTotal = await addBounceCount(amount);
    console.log(`[Achievements] Bounce Count Updated: ${newTotal}`);

    // Report to Leaderboard (using helper for correct structure)
    reportLeaderboardScore('bounces_leaderboard', newTotal);

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

const reportLeaderboardScore = async (id, score) => {
    if (NativeModules.RNGameCenter && GameCenter.submitLeaderboardScore) {
        try {
            // JS Wrapper expects a single object with 'score' and 'leaderboardIdentifier'
            await GameCenter.submitLeaderboardScore({
                score: score,
                leaderboardIdentifier: id
            });
            console.log(`[Achievements] Leaderboard ${id} score reported: ${score}`);
        } catch (e) {
            console.log(`[Achievements] Leaderboard ${id} report failed:`, e);
        }
    }
};

const incrementDeathCount = async (amount = 1) => {
    const newTotal = await addDeathCount(amount);
    console.log(`[Achievements] Death Count Updated: ${newTotal}`);

    // Report to Deaths Leaderboard
    reportLeaderboardScore('deaths_leaderboard', newTotal);

    if (newTotal >= 20) submitAchievement(ACHIEVEMENTS.DEATH_20, 100);
    else submitAchievement(ACHIEVEMENTS.DEATH_20, (newTotal / 20) * 100);

    if (newTotal >= 100) submitAchievement(ACHIEVEMENTS.DEATH_100, 100);
    else submitAchievement(ACHIEVEMENTS.DEATH_100, (newTotal / 100) * 100);

    if (newTotal >= 200) submitAchievement(ACHIEVEMENTS.DEATH_200, 100);
    else submitAchievement(ACHIEVEMENTS.DEATH_200, (newTotal / 200) * 100);

    if (newTotal >= 500) submitAchievement(ACHIEVEMENTS.DEATH_500, 100);
    else submitAchievement(ACHIEVEMENTS.DEATH_500, (newTotal / 500) * 100);

    if (newTotal >= 1000) submitAchievement(ACHIEVEMENTS.DEATH_1000, 100);
    else submitAchievement(ACHIEVEMENTS.DEATH_1000, (newTotal / 1000) * 100);
};

const incrementAdCount = async (amount = 1) => {
    const newTotal = await addBonusAdCount(amount);
    console.log(`[Achievements] Ad Count Updated: ${newTotal}`);

    // Report to Ads Leaderboard
    reportLeaderboardScore('ads_leaderboard', newTotal);

    if (newTotal >= 1) submitAchievement(ACHIEVEMENTS.AD_1, 100);
    else submitAchievement(ACHIEVEMENTS.AD_1, (newTotal / 1) * 100);

    if (newTotal >= 3) submitAchievement(ACHIEVEMENTS.AD_3, 100);
    else submitAchievement(ACHIEVEMENTS.AD_3, (newTotal / 3) * 100);

    if (newTotal >= 10) submitAchievement(ACHIEVEMENTS.AD_10, 100);
    else submitAchievement(ACHIEVEMENTS.AD_10, (newTotal / 10) * 100);
};

const checkCompletion = async (worldId, allWorldLevels) => {
    if (!allWorldLevels || allWorldLevels.length === 0) return;

    const progress = await getLevelProgress();

    // Check World Completion (Any stars on all levels)
    const allCompleted = allWorldLevels.every(l => progress[l.id] && progress[l.id].completed);

    // Calculate Total Stars (excluding bonus stars)
    // Sum up 'stars' property from all level progress entries
    const totalStars = Object.values(progress).reduce((acc, curr) => acc + (curr.stars || 0), 0);
    console.log(`[Achievements] Total Stars Earned: ${totalStars}`);

    // Report to Stars Leaderboard
    reportLeaderboardScore('stars_leaderboard', totalStars);

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

const resetGameCenterAchievements = async () => {
    if (!NativeModules.RNGameCenter) return;
    try {
        await GameCenter.resetAchievements({});
        console.log('[Achievements] Game Center achievements reset successfully');
    } catch (e) {
        console.log('[Achievements] Failed to reset achievements:', e);
    }
};

export {
    initGameCenter,
    openAchievements,
    openLeaderboard,
    incrementBounceCount,
    incrementDeathCount,
    incrementAdCount,
    checkCompletion,
    resetGameCenterAchievements
};
