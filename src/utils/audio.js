import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Asset } from 'expo-asset';

// Sound effects
const SOUND_FILES = {
    normal: require('../../assets/Sound effects/bounce_normal.mp3'),
    sticky: require('../../assets/Sound effects/bounce_sticky.mp3'),
    super: require('../../assets/Sound effects/bounce_super.mp3'),
    level_complete: require('../../assets/Sound effects/level_complete.mp3'),
    death: require('../../assets/Sound effects/death.mp3'),
};

// Background music tracks (Playlists for worlds)
const MUSIC_FILES = {
    menu: [
        require('../../assets/Music/music_menu_1.mp3'),
        require('../../assets/Music/music_menu_2.mp3'),
        require('../../assets/Music/music_menu_3.mp3'),
    ],
    world1: [
        require('../../assets/Music/music_world1_1.mp3'),
        require('../../assets/Music/music_world1_2.mp3'),
        require('../../assets/Music/music_world1_3.mp3'),
    ],
    world2: [
        require('../../assets/Music/music_world2_1.mp3'),
        require('../../assets/Music/music_world2_2.mp3'),
        require('../../assets/Music/music_world2_3.mp3'),
    ],
    world3: [
        require('../../assets/Music/music_world3_1.mp3'),
        require('../../assets/Music/music_world3_2.mp3'),
        require('../../assets/Music/music_world3_3.mp3'),
    ],
};

const MAX_CONCURRENT = 3; // Reduced back to 3 to save resources (Total pools: ~15 players)
const soundPools = {};
let levelCompletePlayer = null;
let deathPlayer = null;

// Music state
let currentMusicPlayer = null;
let fadingOutPlayerInstance = null; // Track fading out player
let currentTrackKey = null;
let pendingTrackKey = null; // Race condition fix: track what we're about to play
let currentPlaylistIndex = 0;
let isMusicEnabled = true;

// Timers
let fadeOutInterval = null;
let fadeInInterval = null;
let nextTrackTimer = null;

let isSoundEnabled = true;
let isLoaded = false;
let isLoading = false;

// VOLUME CONSTANTS
const BASE_MUSIC_VOL = 0.2; // 50% of original 0.4
const FADE_DURATION = 400; // ms (reduced from 1000 for snappier transitions)
const FADE_STEPS = 10; // fewer steps for faster fade

export const setSoundEnabled = (enabled) => {
    isSoundEnabled = enabled;
};

export const setMusicEnabled = (enabled) => {
    isMusicEnabled = enabled;
    if (enabled) {
        if (currentTrackKey) {
            playMusic(currentTrackKey);
            return true; // Resumed
        }
        return false; // Did not resume
    } else {
        // Stop music immediately, kill players.
        if (nextTrackTimer) clearTimeout(nextTrackTimer);
        clearFadeTimers();
        // Call stopMusic with instant=true to skip fade
        stopMusic(true, true);
        return false;
    }
};

export const getMusicEnabled = () => isMusicEnabled;
export const getSoundEnabled = () => isSoundEnabled;

const createPlayer = (key, fileMap = SOUND_FILES) => {
    try {
        const resource = fileMap[key];
        if (!resource) {
            console.warn(`No resource found for key: ${key}`);
            return null;
        }
        const player = createAudioPlayer(resource);
        if (key === 'sticky') player.volume = 0.5;
        if (key === 'normal') player.volume = 1.0;
        if (key === 'death') player.volume = 0.8;
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
        // Pre-download sound assets
        await Promise.all(Object.values(SOUND_FILES).map(res => Asset.fromModule(res).downloadAsync()));

        // Pre-download music assets
        const musicAssets = [];
        Object.values(MUSIC_FILES).forEach(res => {
            if (Array.isArray(res)) {
                res.forEach(r => musicAssets.push(Asset.fromModule(r).downloadAsync()));
            } else {
                musicAssets.push(Asset.fromModule(res).downloadAsync());
            }
        });
        Promise.all(musicAssets).catch(() => { });

        await setAudioModeAsync({
            playsInSilentMode: true,
            staysActiveInBackground: false,
            interruptionMode: 'doNotMix',
            shouldPlayInBackground: false,
        });

        initializePool('normal');
        initializePool('sticky');
        initializePool('super');
        initializePool('death');
        levelCompletePlayer = createPlayer('level_complete');

        // Set volumes directly - no warm-up needed with expo-audio
        // The warm-up was causing lag on older devices
        for (const [key, pool] of Object.entries(soundPools)) {
            for (const player of pool.players) {
                if (key === 'sticky') player.volume = 0.5;
                else if (key === 'death') player.volume = 0.8;
                else player.volume = 1.0;
            }
        }

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
            try {
                // Consistency fix: pause -> seek -> play
                levelCompletePlayer.pause();
                if (typeof levelCompletePlayer.seekTo === 'function') {
                    levelCompletePlayer.seekTo(0);
                }
                levelCompletePlayer.play();
            } catch (e) {
                console.warn("level_complete sound failed", e);
            }
        }
        return;
    }

    const player = getNextPlayer(type);
    if (player) {
        try {
            // Consistency fix: pause -> seek -> play
            player.pause();
            if (typeof player.seekTo === 'function') {
                player.seekTo(0);
            }
            player.play();
        } catch (error) {
            console.warn(`Sound ${type} failed`, error);
        }
    }
};

// ==================== MUSIC SYSTEM ====================

const clearFadeTimers = () => {
    // Stop timers
    if (fadeOutInterval) clearInterval(fadeOutInterval);
    if (fadeInInterval) clearInterval(fadeInInterval);
    fadeOutInterval = null;
    fadeInInterval = null;

    // CRITICAL: Force kill any player that was in the middle of fading out
    if (fadingOutPlayerInstance) {
        try {
            fadingOutPlayerInstance.pause();
            fadingOutPlayerInstance.release();
        } catch (e) { }
        fadingOutPlayerInstance = null;
    }
};

const startFadeOut = (player) => {
    if (!player) return;
    fadingOutPlayerInstance = player; // Track it globally

    try {
        let vol = player.volume;
        const step = vol / FADE_STEPS;

        fadeOutInterval = setInterval(() => {
            vol -= step;
            if (vol <= 0) {
                try {
                    player.pause();
                    player.release();
                } catch (e) { }
                clearInterval(fadeOutInterval);
                fadeOutInterval = null;
                // If this was the globally tracked player, clear it
                if (fadingOutPlayerInstance === player) {
                    fadingOutPlayerInstance = null;
                }
            } else {
                try { player.volume = vol; } catch (e) { }
            }
        }, FADE_DURATION / FADE_STEPS);
    } catch (e) {
        try { player.pause(); player.release(); } catch (err) { }
        fadingOutPlayerInstance = null;
    }
};

// Simplified Fade In - set volume immediately for guaranteed audibility
// Simplified Fade In - set volume immediately for guaranteed audibility
const startFadeIn = (player) => {
    if (!player) return;
    try {
        // Set volume immediately to ensure music is audible
        player.volume = BASE_MUSIC_VOL;

        // Small delay to ensure player is fully initialized before playing
        setTimeout(() => {
            try {
                player.play();
                player.play();

                // VERIFICATION: Check if it's actually playing after a short delay
                // VERIFICATION: Check if it's actually playing after a short delay
                setTimeout(() => {
                    if (player.isPlaying === false) {
                        try { player.play(); } catch (e) { }
                    }
                }, 500);

            } catch (e) {
                console.warn("Music play() failed", e);
            }
        }, 50);
    } catch (e) {
        console.warn("Music setup failed", e);
    }
};

export const playMusic = (trackKey) => {
    if (!isMusicEnabled) {
        if (!isMusicEnabled) {
            return;
        }
        return;
    }

    // Race Check: If same track already playing, skip.
    // Only check currentTrackKey AND player exists - don't block based on pending.
    // We clear pending after track starts, so checking it here was too aggressive.
    if (currentTrackKey === trackKey && currentMusicPlayer) {
        if (currentTrackKey === trackKey && currentMusicPlayer) {
            return;
        }
        return;
    }

    // If we're already setting up this exact track, skip duplicate calls.
    // But this is a narrow window - only blocks rapid-fire identical calls.
    if (pendingTrackKey === trackKey) {
        if (pendingTrackKey === trackKey) {
            return;
        }
        return;
    }



    // Mark this track as pending immediately to block duplicate calls
    pendingTrackKey = trackKey;

    clearFadeTimers();

    if (currentMusicPlayer) {
        startFadeOut(currentMusicPlayer);
        currentMusicPlayer = null;
    }

    currentTrackKey = trackKey;

    const resources = MUSIC_FILES[trackKey];
    if (Array.isArray(resources)) {
        currentPlaylistIndex = Math.floor(Math.random() * resources.length);
    } else {
        currentPlaylistIndex = 0;
    }

    playNextTrackInPlaylist(true);
};

const playNextTrackInPlaylist = (isFirstTrack = false) => {
    if (!isMusicEnabled || !currentTrackKey) {
        pendingTrackKey = null; // Clear pending if we can't play
        return;
    }



    const resources = MUSIC_FILES[currentTrackKey];
    let resource;

    if (Array.isArray(resources)) {
        resource = resources[currentPlaylistIndex];
        currentPlaylistIndex = (currentPlaylistIndex + 1) % resources.length;
    } else {
        resource = resources;
    }

    try {
        const player = createAudioPlayer(resource);
        if (player) {
            // Release previous player (if looping) to free resources
            // If called from playMusic, currentMusicPlayer is null (handled by fadeOut)
            // If called from listener, currentMusicPlayer is the finished player
            // FIX: Defer release to avoid crashing the native listener (current stack)
            if (currentMusicPlayer) {
                const oldPlayer = currentMusicPlayer;
                setTimeout(() => {
                    try { oldPlayer.release(); } catch (e) { }
                }, 1000); // 1s delay to be safe
            }

            currentMusicPlayer = player;

            // CRITICAL: Clear pendingTrackKey now that player is created
            // This allows future calls to the same track to work after stopping
            pendingTrackKey = null;

            if (Array.isArray(resources)) {
                player.loop = false;
                try {
                    player.progressUpdateIntervalMillis = 2000; // Heartbeat every 2s
                    player.addListener('playbackStatusUpdate', (status) => {
                        if (status.didJustFinish) {
                            playNextTrackInPlaylist();
                        } else if (status.isPlaying && status.positionMillis > 0 && status.positionMillis % 10000 < 200) {
                            // Log every ~10s effectively (rough check)
                        }
                    });
                } catch (e) {
                    console.warn("Playlist listener failed, fallback to loop", e);
                    player.loop = true;
                }
            } else {
                player.loop = true;
            }

            // Start playback first
            startFadeIn(player);

            // Then seek to random position AFTER playback starts (with delay)
            if (isFirstTrack && Array.isArray(resources)) {
                setTimeout(() => {
                    try {
                        const randomSeconds = Math.floor(Math.random() * 30);
                        // expo-audio seekTo expects SECONDS, not milliseconds
                        if (typeof player.seekTo === 'function') {
                            player.seekTo(randomSeconds);
                        } else if (typeof player.setPositionAsync === 'function') {
                            // setPositionAsync (if present) might expect ms
                            player.setPositionAsync(randomSeconds * 1000);
                        }
                    } catch (e) {
                        console.warn("Seek failed", e);
                    }
                }, 200); // Slightly longer delay for player readiness
            }
        } else {
            console.error("Failed to create music player");
            pendingTrackKey = null;
        }
    } catch (error) {
        console.warn(`Failed to play music track`, error);
        pendingTrackKey = null;
    }
};

export const stopMusic = (keepKey = false, instant = false) => {
    clearFadeTimers();

    // Clear pending track to prevent race conditions
    pendingTrackKey = null;

    if (currentMusicPlayer) {
        if (instant) {
            try {
                currentMusicPlayer.pause();
                currentMusicPlayer.release();
            } catch (e) { }
            currentMusicPlayer = null;
        } else {
            startFadeOut(currentMusicPlayer);
            currentMusicPlayer = null;
        }
    }

    if (!keepKey) currentTrackKey = null;
};

export const pauseMusic = () => {
    if (currentMusicPlayer) {
        try { currentMusicPlayer.pause(); } catch (e) { }
    }
};

export const resumeMusic = () => {
    if (!isMusicEnabled) return;
    // If player exists, just play.
    if (currentMusicPlayer) {
        try { currentMusicPlayer.play(); } catch (e) { }
    } else if (currentTrackKey) {
        // If no player (released), restart track
        playMusic(currentTrackKey);
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

    // NOTE: Do NOT stop music here! 
    // Music is managed independently by screen focus effects.
    // Stopping music here would kill music that another screen just started.
};
