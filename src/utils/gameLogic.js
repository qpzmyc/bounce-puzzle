export const getTotalStars = (progress, bonusStars = 0) => {
    const earnedStars = Object.values(progress).reduce((acc, curr) => acc + (curr.stars || 0), 0);
    return earnedStars + bonusStars;
};

export const getNextLevelOrRedirect = (levels, progress) => {
    const totalStars = getTotalStars(progress);

    // Find the first level that is NOT completed
    const firstUncompleted = levels.find(l => !progress[l.id]?.completed);

    // If we finished everything, find the first level with < 3 stars
    if (!firstUncompleted) {
        const firstNotPerfect = levels.find(l => {
            const p = progress[l.id];
            return !p || (p.stars || 0) < 3;
        });
        if (firstNotPerfect) return { levelId: firstNotPerfect.id, locked: false };
        return { levelId: levels[levels.length - 1].id, locked: false };
    }

    // Check if this level is locked
    if (firstUncompleted.requiredStars && totalStars < firstUncompleted.requiredStars) {
        // Locked! Find earliest level with < 3 stars
        const earliestNonMax = levels.find(l => {
            const p = progress[l.id];
            return !p || (p.stars || 0) < 3;
        });

        // If found, redirect there. If literally all previous have 3 stars (unlikely if we are blocked), 
        // then... well, just let them see the lock message on the new one?
        // But the constraint says "if play does not have required stars... sent to earliest level they have not earned 3 stars".
        if (earliestNonMax) {
            return {
                levelId: earliestNonMax.id,
                locked: true,
                redirect: true,
                message: `Level ${firstUncompleted.id} is locked! Earn 3 stars on Level ${earliestNonMax.id} to progress.`
            };
        }
    }

    // Normal progression
    return { levelId: firstUncompleted.id, locked: false };
};
