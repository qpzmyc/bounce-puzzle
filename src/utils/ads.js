import { Alert } from 'react-native';
import { getAdState, saveAdState } from './storage';

// Safe Import for AdMob to prevent crashes if native module is missing (pre-rebuild)
let InterstitialAd, AdEventType, RewardedAd, RewardedAdEventType;
let TestIds = { BANNER: 'mock', INTERSTITIAL: 'mock', REWARDED: 'mock' }; // Default mock to prevent crashes
let isAdMobAvailable = false;
try {
    const AdMob = require('react-native-google-mobile-ads');
    InterstitialAd = AdMob.InterstitialAd;
    AdEventType = AdMob.AdEventType;
    RewardedAd = AdMob.RewardedAd;
    RewardedAdEventType = AdMob.RewardedAdEventType;
    TestIds = AdMob.TestIds;
    isAdMobAvailable = true;
} catch (e) {
    console.warn("AdMob module not found. Please rebuild the native client.", e);
}



const DIFFICULTY_THRESHOLD = 20;
const TIME_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
const productionInterstitialId = 'ca-app-pub-9298010065130394/1850829130';
const productionRewardedId = 'ca-app-pub-9298010065130394/3934066999';

// Note: We'll use TestIds.REWARDED in dev, and for now reuse the interstitial ID or a separate one if provided.
// Since user didn't provide a Rewarded ID, we'll use a placeholder or the same one for now (though AdMob usually wants separate).
// Better to use TestIds for now.
const interstitialUnitId = isAdMobAvailable ? (__DEV__ ? TestIds.INTERSTITIAL : productionInterstitialId) : null;
const rewardedUnitId = isAdMobAvailable ? (__DEV__ ? TestIds.REWARDED : productionRewardedId) : null;

let interstitial = null;
let rewarded = null;

const loadInterstitial = () => {
    if (!isAdMobAvailable || interstitial) return;

    try {
        interstitial = InterstitialAd.createForAdRequest(interstitialUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });



        interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            interstitial = null;
            setTimeout(loadInterstitial, 2000); // Preload next
        });

        interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error("Interstitial Ad Error", error);
            interstitial = null;
            setTimeout(loadInterstitial, 2000); // Try again
        });

        interstitial.load();
    } catch (e) {
        console.error("AdMob Load Error:", e);
    }
};

const loadRewarded = () => {
    if (!isAdMobAvailable || rewarded) return;

    try {
        rewarded = RewardedAd.createForAdRequest(rewardedUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });



        rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error("Rewarded Ad Error", error);
            rewarded = null;
            setTimeout(loadRewarded, 2000); // Try again
        });

        rewarded.load();
    } catch (e) {
        console.error("Rewarded Load Error:", e);
    }
};

// Preload if available
if (isAdMobAvailable) {
    setTimeout(loadInterstitial, 5000);
    setTimeout(loadRewarded, 7000);
}

/**
 * Increases the difficulty score after a level completion.
 * @param {number} difficultyPoints - Standard difficulty points for the level
 */
export const recordLevelCompletion = async (difficultyPoints) => {
    try {
        const state = await getAdState();
        const newState = {
            ...state,
            difficultyScore: (state.difficultyScore || 0) + difficultyPoints
        };
        await saveAdState(newState);
        await saveAdState(newState);
    } catch (e) {
        console.error("Error recording level completion for ads", e);
    }
};

/**
 * Checks if an ad should be triggered based on thresholds.
 * @returns {Promise<'SCORE' | 'TIME' | null>} Returns the reason for triggering, or null.
 */
export const shouldShowAd = async () => {
    try {
        const state = await getAdState();
        const now = Date.now();
        const timeElapsed = now - (state.lastAdTimestamp || 0);

        const scoreTrigger = (state.difficultyScore || 0) >= DIFFICULTY_THRESHOLD;
        const timeTrigger = timeElapsed >= TIME_THRESHOLD_MS;



        if (scoreTrigger) return 'SCORE';
        if (timeTrigger) return 'TIME';
        return null;
    } catch (e) {
        console.error("Error checking ad triggers", e);
        return null;
    }
};

/**
 * Resolves the ad trigger (updates score/time based on what triggered the ad).
 * @param {'SCORE' | 'TIME'} reason 
 */
export const resolveAdTrigger = async (reason) => {
    try {
        const state = await getAdState();
        let newScore = state.difficultyScore || 0;

        // If triggered by score, subtract 20 (don't reset to 0 unless it was exactly 20)
        // User request: "subtract 20 instead of resetting to 0 ONLY IF the ad happens from the score reaching 20"
        if (reason === 'SCORE') {
            newScore = Math.max(0, newScore - DIFFICULTY_THRESHOLD);
        } else if (reason === 'TIME') {
            // User request: "make the difficulty score subtract 10 after a time ad"
            newScore = Math.max(0, newScore - 10);
        }

        // Time always resets
        const newState = {
            difficultyScore: newScore,
            lastAdTimestamp: Date.now()
        };
        await saveAdState(newState);
    } catch (e) {
        console.error("Error resolving ad trigger", e);
    }
};

/**
 * Shows an interstitial ad if loaded.
 * Returns true if ad was shown/closed, false if failed/skipped.
 */
export const showInterstitialAd = async () => {
    return new Promise((resolve) => {
        if (!isAdMobAvailable) {
            resolve(true); // Treat as "shown/skipped" so game continues
            return;
        }

        if (!interstitial || !interstitial.loaded) {
            loadInterstitial(); // Attempt to load for next time
            resolve(false);
            return;
        }

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            unsubscribeClosed();
            resolve(true);
            // loadInterstitial is already called in its own event listener (recursively)
        });

        const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
            unsubscribeError();
            resolve(false);
            // loadInterstitial is already called in its own event listener
        });

        try {
            interstitial.show();
        } catch (e) {
            console.error("Interstitial Show Failed", e);
            resolve(false);
        }
    });
};

/**
 * Shows a rewarded ad.
 * Returns true if the user earned the reward, false otherwise.
 */
export const showRewardedAd = async () => {
    return new Promise((resolve) => {
        if (!isAdMobAvailable) {
            Alert.alert("Rewarded Ad (Simulation)", "Watch this ad for +1 Star?", [
                { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
                { text: "Watch", onPress: () => setTimeout(() => resolve(true), 1500) }
            ]);
            return;
        }

        if (!rewarded || !rewarded.loaded) {
            loadRewarded();
            Alert.alert("Ad Not Ready", "Check back in a moment!");
            resolve(false);
            return;
        }

        let earnedReward = false;
        let resolved = false;

        const cleanup = () => {
            if (resolved) return;
            resolved = true;
            unsubscribeClosed?.();
            unsubscribeEarned?.();
            unsubscribeError?.();
            clearTimeout(timeoutId);
        };

        const unsubscribeEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
            earnedReward = true;
        });

        const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
            cleanup();
            resolve(earnedReward);
            rewarded = null;
            setTimeout(loadRewarded, 2000);
        });

        const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error("Rewarded Ad Error during show:", error);
            cleanup();
            resolve(false);
            rewarded = null;
            setTimeout(loadRewarded, 2000);
        });

        // Timeout fallback - if ad fails to respond within 10 seconds (common on simulator)
        // If we are in DEV mode, we resolve to TRUE so the user/dev still gets the reward even if the test ad fails.
        const timeoutId = setTimeout(() => {
            if (!resolved) {
                console.warn("Rewarded ad timed out - resolving to allow user interaction");
                cleanup();
                // In development/simulator, treat timeout as success so we can test the reward flow
                const shouldGrantReward = __DEV__;
                resolve(shouldGrantReward);
                rewarded = null;
                setTimeout(loadRewarded, 2000);
            }
        }, 10000);

        try {
            rewarded.show();
        } catch (e) {
            console.error("Rewarded Show Failed", e);
            cleanup();
            resolve(false);
        }
    });
};

// Safe Exports for GameScreen
export { TestIds };

export const BannerAd = isAdMobAvailable ? require('react-native-google-mobile-ads').BannerAd : () => null;
export const BannerAdSize = isAdMobAvailable ? require('react-native-google-mobile-ads').BannerAdSize : { ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER' };
