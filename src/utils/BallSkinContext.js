import React, { createContext, useContext, useState, useEffect } from 'react';
import { BALL_SKINS, TRAIL_SKINS } from './constants';
import { getSelectedBallSkin, saveSelectedBallSkin, getSelectedTrailSkin, saveSelectedTrailSkin } from './storage';

const BallSkinContext = createContext();

export const BallSkinProvider = ({ children }) => {
    const [skinId, setSkinId] = useState('red');
    const [trailSkinId, setTrailSkinId] = useState('red');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load saved skins on mount
        Promise.all([getSelectedBallSkin(), getSelectedTrailSkin()]).then(([savedSkin, savedTrail]) => {
            if (BALL_SKINS[savedSkin]) setSkinId(savedSkin);
            if (TRAIL_SKINS[savedTrail]) setTrailSkinId(savedTrail);
            setIsLoaded(true);
        });
    }, []);

    const setBallSkin = async (newSkinId) => {
        if (BALL_SKINS[newSkinId]) {
            setSkinId(newSkinId);
            await saveSelectedBallSkin(newSkinId);
        }
    };

    const setTrailSkin = async (newSkinId) => {
        if (TRAIL_SKINS[newSkinId]) {
            setTrailSkinId(newSkinId);
            await saveSelectedTrailSkin(newSkinId);
        }
    };

    const currentSkin = BALL_SKINS[skinId] || BALL_SKINS.red;
    const currentTrail = TRAIL_SKINS[trailSkinId] || TRAIL_SKINS.red;

    return (
        <BallSkinContext.Provider value={{
            skinId,
            skin: currentSkin,
            color: currentSkin.color,
            setBallSkin,
            trailSkinId,
            trailSkin: currentTrail,
            trailColor: currentTrail.color,
            setTrailSkin,
            isLoaded
        }}>
            {children}
        </BallSkinContext.Provider>
    );
};

export const useBallSkin = () => {
    const context = useContext(BallSkinContext);
    if (!context) {
        // Return default if used outside provider (shouldn't happen but safe fallback)
        return {
            skinId: 'red',
            skin: BALL_SKINS.red,
            color: BALL_SKINS.red.color,
            setBallSkin: () => { },
            trailSkinId: 'red',
            trailSkin: TRAIL_SKINS.red,
            trailColor: TRAIL_SKINS.red.color,
            setTrailSkin: () => { },
            isLoaded: true
        };
    }
    return context;
};


export default BallSkinContext;
