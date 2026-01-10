import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    Switch,
    Alert, // Added Alert
    NativeModules
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { initGameCenter, incrementAdCount, openAchievements, openLeaderboard, resetGameCenterAchievements } from '../utils/achievements';
import { COLORS, BALL_SKINS, TRAIL_SKINS } from '../utils/constants';
import { useBallSkin } from '../utils/BallSkinContext';
import { getLevelProgress, clearProgress, getSettings, saveSettings, unlockAllLevels, getBonusStars, saveBonusStars, getBounceCount, getDeathCount, getBonusAdCount } from '../utils/storage';
import { getNextLevelOrRedirect, getTotalStars } from '../utils/gameLogic';
import levels from '../levels'; // This is likely world1Levels
import world2Levels from '../levels/world2';
import world3Levels from '../levels/world3';
import { setSoundEnabled, setMusicEnabled, playMusic, stopMusic, pauseMusic, resumeMusic, playButtonClick } from '../utils/audio';
import { showRewardedAd } from '../utils/ads';
import StyledModal from '../components/StyledModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Screen-based scaling (same as GameScreen)
const BASE_WIDTH = 375;
const uiScale = SCREEN_WIDTH / BASE_WIDTH;
const s = (size) => Math.round(size * uiScale);

const MenuScreen = ({ navigation }) => {
    const [progress, setProgress] = React.useState({});
    const [bonusStars, setBonusStars] = useState(0);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [settings, setSettings] = useState({ sound: true, haptics: true, music: true });
    const [bonusAdModal, setBonusAdModal] = useState(false);
    const [rewardModal, setRewardModal] = useState(false);
    const [skinModalVisible, setSkinModalVisible] = useState(false);
    const { skinId, color: ballColor, setBallSkin, trailSkinId, setTrailSkin } = useBallSkin();
    const [activeTab, setActiveTab] = useState('ball'); // 'ball' or 'trail'
    const [totalBounces, setTotalBounces] = useState(0);
    const [totalDeaths, setTotalDeaths] = useState(0);
    const [totalAds, setTotalAds] = useState(0);

    // Use useFocusEffect to handle focus events (runs on mount AND on every focus)
    // This replaces the double-call pattern of useEffect + navigation.addListener
    // Use useFocusEffect to handle focus events (runs on mount AND on every focus)
    // This replaces the double-call pattern of useEffect + navigation.addListener
    useFocusEffect(
        React.useCallback(() => {
            getLevelProgress().then(setProgress);
            getBonusStars().then(setBonusStars);
            getBounceCount().then(setTotalBounces);
            getDeathCount().then(setTotalDeaths);
            getBonusAdCount().then(setTotalAds);
            getSettings().then(s => {
                setSettings(s);
                setSoundEnabled(s.sound);
                setMusicEnabled(s.music);
                if (s.music) playMusic('menu');
            });
        }, [])
    );

    // Initialize Game Center ONLY ONCE when app opens
    useEffect(() => {
        initGameCenter();
    }, []);

    const earnedStars = getTotalStars(progress, 0); // Stars from completed levels only
    const totalStars = getTotalStars(progress, bonusStars); // Used for unlock checks
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const ballBounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous ball bounce animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(ballBounceAnim, {
                    toValue: -20,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(ballBounceAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handlePlay = () => {
        playButtonClick();
        navigation.navigate('WorldSelect');
    };

    const handleQuickPlay = () => {
        playButtonClick();
        // Determine the "furthest" unlocked world
        const lastLevelW1 = levels[levels.length - 1];
        const lastLevelW2 = world2Levels[world2Levels.length - 1];
        const isWorld2Unlocked = !!progress[lastLevelW1.id]?.completed;
        const isWorld3Unlocked = !!progress[lastLevelW2.id]?.completed;

        // Prioritize furthest unlocked world
        let activeLevels;
        if (isWorld3Unlocked) {
            activeLevels = world3Levels;
        } else if (isWorld2Unlocked) {
            activeLevels = world2Levels;
        } else {
            activeLevels = levels;
        }

        const { levelId, locked, redirect, message } = getNextLevelOrRedirect(activeLevels, progress);

        if (redirect && message) {
            Alert.alert("Locked", message, [
                { text: "Go to Level", onPress: () => navigation.navigate('Game', { levelId }) }
            ]);
        } else {
            navigation.navigate('Game', { levelId });
        }
    };

    const toggleSetting = (key) => {
        playButtonClick();
        const newValue = !settings[key];
        const newSettings = { ...settings, [key]: newValue };
        setSettings(newSettings);

        // Manual Haptics: Only trigger if Haptics are ENABLED in settings (before toggle?) 
        // OR: User wants "Turn off haptic feedback of other switches" -> implied: if haptics is ON, we feel it.
        // If we just turned Haptics OFF, we might still feel the "off" click? Usually yes.
        // But if Haptics is OFF, and we toggle Sound, we should FEEL NOTHING.
        if (settings.haptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Delay heavy work 
        requestAnimationFrame(() => {
            saveSettings(newSettings);
            if (key === 'sound') setSoundEnabled(newSettings.sound);
            if (key === 'music') {
                const resumed = setMusicEnabled(newSettings.music);
                if (newSettings.music && !resumed && settingsVisible) {
                    playMusic('menu');
                }
            }
        });
    };

    const CustomSwitch = ({ value, onValueChange }) => {
        // Animation for the thumb
        const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

        useEffect(() => {
            Animated.timing(anim, {
                toValue: value ? 1 : 0,
                duration: 200,
                useNativeDriver: false, // backgroundColor doesn't support native driver
            }).start();
        }, [value]);

        const translateX = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 22] // Move from left (2) to right (22) (Total width 50, thumb 26 -> 50-26-2 = 22)
        });

        const backgroundColor = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#767577', COLORS.ui.primary]
        });

        return (
            <TouchableOpacity activeOpacity={0.8} onPress={onValueChange}>
                <Animated.View style={[styles.switchTrack, { backgroundColor }]}>
                    <Animated.View style={[styles.switchThumb, { transform: [{ translateX }] }]} />
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const handleReset = () => {
        playButtonClick();
        Alert.alert(
            "Reset Progress",
            "Are you sure you want to delete all progress? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        await clearProgress();
                        setProgress({});
                        setBonusStars(0);
                        setTotalBounces(0); // Reset local stats
                        setTotalDeaths(0);
                        setTotalAds(0);
                        setBallSkin('red'); // Reset Skins in Context
                        setTrailSkin('red');
                        setSettingsVisible(false);
                        Alert.alert("Reset Complete", "All progress and bonus stars have been cleared.");
                    }
                }
            ]
        );
    };

    const handleUnlockAll = async () => {
        playButtonClick();
        Alert.alert(
            "Unlock All Levels",
            "This will mark all levels as completed with 3 stars. Great for testing!",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Unlock Everything",
                    style: "default",
                    onPress: async () => {
                        const allLevels = [...levels, ...world2Levels, ...world3Levels];
                        await unlockAllLevels(allLevels);
                        // Refresh progress after unlocking
                        getLevelProgress().then(setProgress);
                        Alert.alert("Success", "All levels unlocked!");
                    }
                }
            ]
        );
    };

    const handleWatchAdReward = async () => {
        playButtonClick();
        // Pause music before showing ad
        pauseMusic();

        const earned = await showRewardedAd();

        // Resume music immediately after ad closes/fails/completes
        // This ensures the music is back when the "Reward Earned" modal (or failure state) is shown
        resumeMusic();

        if (earned) {
            const newBonus = bonusStars + 1;
            setBonusStars(newBonus);
            await saveBonusStars(newBonus);

            // Track Ad Watch
            incrementAdCount(1);
            setTotalAds(prev => prev + 1);

            setRewardModal(true);
        }
    };

    return (
        <View style={styles.container}>
            {/* ... background ... */}
            <View style={styles.bgDecoration}>
                <View style={[styles.bgCircle, styles.bgCircle1]} />
                <View style={[styles.bgCircle, styles.bgCircle2]} />
                <View style={[styles.bgCircle, styles.bgCircle3]} />
            </View>

            {/* Achievements Trophy (Top Left) */}
            {/* Game Center Buttons (Top Left) */}
            {NativeModules.RNGameCenter && (
                <View style={styles.gameCenterButtons}>
                    <TouchableOpacity
                        style={styles.gameCenterBtn}
                        onPress={() => { playButtonClick(); openAchievements(); }}
                    >
                        <Text style={styles.gcIcon}>🏆</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.gameCenterBtn, { marginTop: s(10) }]}
                        onPress={() => { playButtonClick(); openLeaderboard(); }}
                    >
                        <Text style={styles.gcIcon}>📊</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Earned Stars Counter (Gold - Display Only) */}
            <View style={styles.starCounter}>
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.starText}>{earnedStars}</Text>
            </View>

            {/* Bonus Stars Counter (Purple - Clickable for Ad) */}
            <TouchableOpacity
                style={styles.bonusStarCounter}
                onPress={() => { playButtonClick(); setBonusAdModal(true); }}
            >
                <Text style={styles.bonusStarIcon}>★</Text>
                <Text style={styles.starText}>{bonusStars}</Text>
            </TouchableOpacity>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {/* Animated Ball - Tappable to change skin */}
                <TouchableOpacity onPress={() => { playButtonClick(); setSkinModalVisible(true); }}>
                    <Animated.View
                        style={[
                            styles.demoBall,
                            {
                                transform: [{ translateY: ballBounceAnim }],
                                backgroundColor: ballColor,
                                shadowColor: ballColor,
                            }
                        ]}
                    >
                        <View style={styles.ballHighlight} />
                    </Animated.View>
                </TouchableOpacity>
                <Text style={styles.skinHint}>Tap the ball to switch colors</Text>

                {/* Title */}
                <Text style={styles.title}>Bounce</Text>
                <Text style={styles.subtitle}>Puzzle</Text>

                {/* Buttons */}
                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.playButton} onPress={handleQuickPlay}>
                        <Text style={styles.playButtonText}>▶</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.levelsButton} onPress={handlePlay}>
                        <Text style={styles.levelsButtonText}>Select World</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsButton} onPress={() => { playButtonClick(); setSettingsVisible(true); }}>
                        <Text style={styles.settingsButtonText}>Settings</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Settings Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={settingsVisible}
                onRequestClose={() => setSettingsVisible(false)}
            >
                <View style={styles.modalCentered} key={settingsVisible ? 'open' : 'closed'}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Settings</Text>

                        {/* Sound Toggle */}
                        <View style={styles.settingRow}>
                            <Text style={styles.settingText}>Sound Effects</Text>
                            <CustomSwitch
                                value={!!settings.sound}
                                onValueChange={() => toggleSetting('sound')}
                            />
                        </View>

                        {/* Music Toggle */}
                        <View style={styles.settingRow}>
                            <Text style={styles.settingText}>Music</Text>
                            <CustomSwitch
                                value={!!settings.music}
                                onValueChange={() => toggleSetting('music')}
                            />
                        </View>

                        {/* Haptics Toggle */}
                        <View style={styles.settingRow}>
                            <Text style={styles.settingText}>Haptic Feedback</Text>
                            <CustomSwitch
                                value={!!settings.haptics}
                                onValueChange={() => toggleSetting('haptics')}
                            />
                        </View>

                        {/* Reset Progress */}
                        <TouchableOpacity style={styles.modalResetBtn} onPress={handleReset}>
                            <Text style={styles.modalResetTxt}>Reset All Progress</Text>
                        </TouchableOpacity>

                        {__DEV__ && NativeModules.RNGameCenter && (
                            <TouchableOpacity
                                style={[styles.modalResetBtn, { backgroundColor: '#ef4444', marginTop: s(10) }]}
                                onPress={() => {
                                    playButtonClick();
                                    Alert.alert(
                                        "Reset Achievements (Dev)",
                                        "This will permanently clear all Game Center achievements for this account. This cannot be undone. Proceed?",
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            { text: "Reset", style: "destructive", onPress: resetGameCenterAchievements }
                                        ]
                                    );
                                }}
                            >
                                <Text style={styles.modalResetTxt}>Reset Game Center Achievements (Dev)</Text>
                            </TouchableOpacity>
                        )}

                        {__DEV__ && (
                            <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0, marginTop: s(20) }]} onPress={handleUnlockAll}>
                                <Text style={[styles.settingText, { color: COLORS.ui.accent }]}>Unlock All Levels (Dev)</Text>
                                <Text style={styles.settingSubtext}>Complete everything</Text>
                            </TouchableOpacity>
                        )}

                        {/* Close */}
                        <TouchableOpacity style={styles.closeBtn} onPress={() => { playButtonClick(); setSettingsVisible(false); }}>
                            <Text style={styles.closeBtnTxt}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Bonus Star Ad Modal */}
            <StyledModal
                visible={bonusAdModal}
                title="Bonus Stars"
                message="Would you like to watch an ad to earn 1 Bonus Star?"
                icon="✨"
                accentColor="#a855f7"
                buttons={[
                    { text: "Later", style: 'cancel', onPress: () => { setBonusAdModal(false); } },
                    {
                        text: "Watch Ad", onPress: () => {
                            setBonusAdModal(false);
                            // Add delay to let modal close before showing ad
                            // Increased to 1000ms to ensure view controller is free
                            setTimeout(async () => {
                                await handleWatchAdReward();
                            }, 1000);
                        }
                    },
                ]}
                onClose={() => setBonusAdModal(false)}
            />

            {/* Reward Earned Modal */}
            <StyledModal
                visible={rewardModal}
                title="Reward Earned!"
                message="You've earned 1 Bonus Star! Keep playing to unlock more levels."
                icon="🎉"
                accentColor="#22c55e"
                buttons={[
                    { text: "Awesome!", onPress: () => { playButtonClick(); setRewardModal(false); } }
                ]}
                onClose={() => setRewardModal(false)}
            />

            {/* Ball Skin Selector Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={skinModalVisible}
                onRequestClose={() => setSkinModalVisible(false)}
            >
                <View style={styles.modalCentered}>
                    <View style={styles.skinModalView}>
                        <Text style={styles.modalTitle}>Customization</Text>

                        <View style={styles.tabContainer}>
                            <TouchableOpacity style={[styles.tabButton, activeTab === 'ball' && styles.tabButtonActive]} onPress={() => { playButtonClick(); setActiveTab('ball'); }}>
                                <Text style={[styles.tabText, activeTab === 'ball' && styles.tabTextActive]}>Ball</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.tabButton, activeTab === 'trail' && styles.tabButtonActive]} onPress={() => { playButtonClick(); setActiveTab('trail'); }}>
                                <Text style={[styles.tabText, activeTab === 'trail' && styles.tabTextActive]}>Trail</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.skinModalSubtitle}>Select your {activeTab} color</Text>

                        <View style={styles.skinGrid}>
                            {Object.values(activeTab === 'ball' ? BALL_SKINS : TRAIL_SKINS).map((skin) => {
                                // Check if skin is unlocked
                                let isUnlocked = true;

                                if (activeTab === 'ball') {
                                    const lastLevelW1 = levels[levels.length - 1];
                                    const lastLevelW2 = world2Levels[world2Levels.length - 1];
                                    const isWorld1Complete = !!progress[lastLevelW1?.id]?.completed;
                                    const isWorld2Complete = !!progress[lastLevelW2?.id]?.completed;

                                    if (skin.id === 'cyan') isUnlocked = isWorld1Complete;
                                    if (skin.id === 'orange') isUnlocked = isWorld2Complete;
                                    if (skin.id === 'yellow') isUnlocked = totalBounces >= 100;
                                    if (skin.id === 'violet') isUnlocked = totalBounces >= 1000;
                                    if (skin.id === 'green') isUnlocked = totalAds >= 1;
                                } else {
                                    // Trail Skins
                                    if (skin.id === 'orange') isUnlocked = totalDeaths >= 20;
                                    if (skin.id === 'green') isUnlocked = totalDeaths >= 200;
                                    if (skin.id === 'white') isUnlocked = totalBounces >= 2000;
                                    if (skin.id === 'violet') isUnlocked = totalDeaths >= 500;
                                    if (skin.id === 'cyan') isUnlocked = totalAds >= 5;
                                }

                                const isSelected = (activeTab === 'ball' ? skinId : trailSkinId) === skin.id;

                                return (
                                    <TouchableOpacity
                                        key={skin.id}
                                        style={[
                                            styles.skinOption,
                                            isSelected && styles.skinOptionSelected,
                                            !isUnlocked && styles.skinOptionLocked,
                                        ]}
                                        onPress={() => {
                                            playButtonClick();
                                            if (isUnlocked) {
                                                if (activeTab === 'ball') setBallSkin(skin.id);
                                                else setTrailSkin(skin.id);
                                            } else {
                                                Alert.alert("Locked", skin.unlockText);
                                            }
                                        }}
                                    >
                                        <View style={[styles.skinBall, { backgroundColor: skin.color }]}>
                                            {!isUnlocked && (
                                                <View style={styles.lockOverlay}>
                                                    <Text style={styles.lockIcon}>🔒</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={[
                                            styles.skinName,
                                            !isUnlocked && styles.skinNameLocked
                                        ]}>
                                            {skin.name}
                                        </Text>
                                        {isSelected && <Text style={styles.selectedBadge}>✓</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={() => { playButtonClick(); setSkinModalVisible(false); }}
                        >
                            <Text style={styles.closeBtnTxt}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    bgDecoration: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    bgCircle: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.1,
    },
    bgCircle1: {
        width: s(300),
        height: s(300),
        backgroundColor: COLORS.ui.primary,
        top: s(-100),
        right: s(-100),
    },
    bgCircle2: {
        width: s(200),
        height: s(200),
        backgroundColor: COLORS.platform,
        bottom: s(100),
        left: s(-80),
    },
    bgCircle3: {
        width: s(150),
        height: s(150),
        backgroundColor: COLORS.goal,
        bottom: s(-50),
        right: s(50),
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: s(30),
    },
    demoBall: {
        width: s(60),
        height: s(60),
        borderRadius: s(30),
        backgroundColor: COLORS.ball,
        marginBottom: s(20),
        shadowColor: COLORS.ball,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: s(15),
        justifyContent: 'center',
        alignItems: 'center',
    },
    ballHighlight: {
        width: s(20),
        height: s(20),
        borderRadius: s(10),
        backgroundColor: 'rgba(255,255,255,0.4)',
        position: 'absolute',
        top: s(10),
        left: s(12),
    },
    title: {
        fontSize: s(52),
        fontWeight: 'bold',
        color: COLORS.ui.text,
        letterSpacing: s(2),
    },
    subtitle: {
        fontSize: s(52),
        fontWeight: '300',
        color: COLORS.ui.secondary,
        marginTop: s(-10),
        letterSpacing: s(4),
    },
    tagline: {
        fontSize: s(16),
        color: COLORS.ui.textDim,
        marginTop: s(10),
        letterSpacing: s(1),
    },
    demoPlatform: {
        width: s(100),
        height: s(18),
        backgroundColor: COLORS.platform,
        borderRadius: s(9),
        marginTop: s(30),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.platform,
        shadowOffset: { width: 0, height: s(4) },
        shadowOpacity: 0.4,
        shadowRadius: s(8),
    },
    platformGrip: {
        flexDirection: 'row',
    },
    gripLine: {
        width: s(3),
        height: s(8),
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: s(2),
    },
    buttons: {
        marginTop: s(50),
        width: '100%',
    },
    playButton: {
        backgroundColor: COLORS.ui.primary,
        paddingVertical: s(18),
        borderRadius: s(30),
        alignItems: 'center',
        shadowColor: COLORS.ui.primary,
        shadowOffset: { width: 0, height: s(4) },
        shadowOpacity: 0.4,
        shadowRadius: s(10),
    },
    playButtonText: {
        color: COLORS.ui.text,
        fontSize: s(20),
        fontWeight: 'bold',
        letterSpacing: s(1),
    },
    levelsButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: s(16),
        borderRadius: s(30),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginBottom: s(12),
        marginTop: s(12),
    },
    levelsButtonText: {
        color: COLORS.ui.text,
        fontSize: s(18),
        letterSpacing: s(1),
    },
    settingsButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: s(16),
        borderRadius: s(30),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    settingsButtonText: {
        color: COLORS.ui.text,
        fontSize: s(18),
        letterSpacing: s(1),
    },

    // Modal Styles
    modalCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalView: {
        width: '85%',
        backgroundColor: '#1e1e2e',
        borderRadius: s(20),
        padding: s(25),
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    modalTitle: {
        fontSize: s(24),
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: s(25),
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: s(20),
        paddingBottom: s(10),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    settingText: {
        fontSize: s(18),
        color: '#fff',
    },
    modalResetBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingVertical: s(12),
        paddingHorizontal: s(20),
        borderRadius: s(10),
        width: '100%',
        alignItems: 'center',
        marginBottom: s(15),
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    modalResetTxt: {
        color: '#ef4444',
        fontSize: s(16),
        fontWeight: 'bold',
    },
    closeBtn: {
        backgroundColor: COLORS.ui.primary,
        borderRadius: s(20),
        padding: s(10),
        elevation: 2,
        width: '100%',
        alignItems: 'center',
    },
    closeBtnTxt: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },

    // Custom Switch Styles
    switchTrack: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        backgroundColor: '#767577' // Default, overridden by animation
    },
    switchThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#ffffff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
        elevation: 1.5,
        // transform logic handles position
    },

    // Star Counter
    starCounter: {
        position: 'absolute',
        top: s(50),
        right: s(20),
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingVertical: s(8),
        paddingHorizontal: s(14),
        borderRadius: s(20),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 10,
    },
    starIcon: {
        fontSize: s(24),
        color: '#fbbf24', // Gold
        marginRight: s(5),
    },
    starText: {
        fontSize: s(20),
        fontWeight: 'bold',
        color: '#fff',
    },
    bonusStarCounter: {
        position: 'absolute',
        top: s(105),
        right: s(20),
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingVertical: s(8),
        paddingHorizontal: s(14),
        borderRadius: s(20),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        zIndex: 10,
    },
    bonusStarIcon: {
        fontSize: s(24),
        color: '#a855f7', // Purple
        marginRight: s(5),
    },

    // Ball Skin Selector Styles
    skinHint: {
        fontSize: s(12),
        color: COLORS.ui.textDim,
        marginTop: s(8),
        marginBottom: s(10),
    },
    skinModalView: {
        width: '85%',
        backgroundColor: '#1e1e2e',
        borderRadius: s(20),
        padding: s(25),
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    skinModalSubtitle: {
        fontSize: s(14),
        color: COLORS.ui.textDim,
        marginBottom: s(20),
    },
    skinGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: s(20),
    },
    skinOption: {
        width: '30%',
        alignItems: 'center',
        padding: s(10),
        marginBottom: s(15),
        borderRadius: s(12),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    skinOptionSelected: {
        borderColor: COLORS.ui.primary,
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
    },
    skinOptionLocked: {
        opacity: 0.6,
    },
    skinBall: {
        width: s(50),
        height: s(50),
        borderRadius: s(25),
        marginBottom: s(8),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: s(25),
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockIcon: {
        fontSize: s(20),
    },
    skinName: {
        fontSize: s(12),
        color: '#fff',
        textAlign: 'center',
    },
    skinNameLocked: {
        color: COLORS.ui.textDim,
    },
    selectedBadge: {
        fontSize: s(16),
        color: COLORS.ui.primary,
        marginTop: s(4),
    },

    tabContainer: {
        flexDirection: 'row',
        marginBottom: s(20),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
    tabButton: {
        flex: 1,
        paddingVertical: s(10),
        alignItems: 'center',
    },
    tabButtonActive: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.ui.primary,
    },
    tabText: {
        color: COLORS.ui.textDim,
        fontSize: s(16),
        fontWeight: 'bold',
    },
    tabTextActive: {
        color: COLORS.ui.text,
    },
    gameCenterButtons: {
        position: 'absolute',
        top: s(50),
        left: s(20),
        zIndex: 10,
    },
    gameCenterBtn: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: s(8),
        borderRadius: s(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    gcIcon: {
        fontSize: s(24),
    },
});

export default MenuScreen;
