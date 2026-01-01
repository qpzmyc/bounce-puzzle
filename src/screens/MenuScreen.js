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
    Alert // Added Alert
} from 'react-native';
import { COLORS } from '../utils/constants';
import { getLevelProgress, clearProgress, getSettings, saveSettings, unlockAllLevels } from '../utils/storage'; // Added unlockAllLevels
import { getNextLevelOrRedirect } from '../utils/gameLogic';
import levels from '../levels'; // This is likely world1Levels
import world2Levels from '../levels/world2'; // Added for unlock all
import { setSoundEnabled } from '../utils/audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Screen-based scaling (same as GameScreen)
const BASE_WIDTH = 375;
const uiScale = SCREEN_WIDTH / BASE_WIDTH;
const s = (size) => Math.round(size * uiScale);

const MenuScreen = ({ navigation }) => {
    const [progress, setProgress] = React.useState({});
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [settings, setSettings] = useState({ sound: true, haptics: true });

    useEffect(() => {
        getLevelProgress().then(setProgress);
        getSettings().then(s => {
            setSettings(s);
            setSoundEnabled(s.sound);
        });

        // Add navigation listener to refresh progress when coming back
        const unsubscribe = navigation.addListener('focus', () => {
            getLevelProgress().then(setProgress);
            getSettings().then(s => {
                setSettings(s);
                setSoundEnabled(s.sound);
            });
        });
        return unsubscribe;
    }, [navigation]);

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
        navigation.navigate('WorldSelect');
    };

    const handleQuickPlay = () => {
        const { levelId, locked, redirect, message } = getNextLevelOrRedirect(levels, progress);

        if (redirect && message) {
            Alert.alert("Locked", message, [
                { text: "Go to Level", onPress: () => navigation.navigate('Game', { levelId }) }
            ]);
        } else {
            navigation.navigate('Game', { levelId });
        }
    };

    const toggleSetting = (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        saveSettings(newSettings);
        if (key === 'sound') setSoundEnabled(newSettings.sound);
    };

    const handleReset = () => {
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
                        setSettingsVisible(false);
                        Alert.alert("Reset Complete", "All progress has been cleared.");
                    }
                }
            ]
        );
    };

    const handleUnlockAll = async () => {
        Alert.alert(
            "Unlock All Levels",
            "This will mark all levels as completed with 3 stars. Great for testing!",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Unlock Everything",
                    style: "default",
                    onPress: async () => {
                        // Assuming 'levels' is world1Levels
                        const allLevels = [...levels, ...world2Levels];
                        await unlockAllLevels(allLevels);
                        // Refresh progress after unlocking
                        getLevelProgress().then(setProgress);
                        Alert.alert("Success", "All levels unlocked!");
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* ... background ... */}
            {/* Background decoration */}
            <View style={styles.bgDecoration}>
                <View style={[styles.bgCircle, styles.bgCircle1]} />
                <View style={[styles.bgCircle, styles.bgCircle2]} />
                <View style={[styles.bgCircle, styles.bgCircle3]} />
            </View>

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {/* Animated Ball */}
                <Animated.View
                    style={[
                        styles.demoBall,
                        { transform: [{ translateY: ballBounceAnim }] }
                    ]}
                >
                    <View style={styles.ballHighlight} />
                </Animated.View>

                {/* Title */}
                <Text style={styles.title}>Bounce</Text>
                <Text style={styles.subtitle}>Puzzle</Text>
                <Text style={styles.tagline}>Guide the ball to victory</Text>

                {/* Demo platform */}
                <View style={styles.demoPlatform}>
                    <View style={styles.platformGrip}>
                        <View style={styles.gripLine} />
                        <View style={styles.gripLine} />
                        <View style={styles.gripLine} />
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.playButton} onPress={handleQuickPlay}>
                        <Text style={styles.playButtonText}>▶</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.levelsButton} onPress={handlePlay}>
                        <Text style={styles.levelsButtonText}>Select World</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
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
                <View style={styles.modalCentered}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Settings</Text>

                        {/* Sound Toggle */}
                        <View style={styles.settingRow}>
                            <Text style={styles.settingText}>Sound Effects</Text>
                            <Switch
                                trackColor={{ false: "#767577", true: COLORS.ui.primary }}
                                thumbColor={settings.sound ? "#f4f3f4" : "#f4f3f4"}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={() => toggleSetting('sound')}
                                value={settings.sound}
                            />
                        </View>

                        {/* Haptics Toggle */}
                        <View style={styles.settingRow}>
                            <Text style={styles.settingText}>Haptic Feedback</Text>
                            <Switch
                                trackColor={{ false: "#767577", true: COLORS.ui.primary }}
                                thumbColor={settings.haptics ? "#f4f3f4" : "#f4f3f4"}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={() => toggleSetting('haptics')}
                                value={settings.haptics}
                            />
                        </View>

                        {/* Reset Progress */}
                        <TouchableOpacity style={styles.modalResetBtn} onPress={handleReset}>
                            <Text style={styles.modalResetTxt}>Reset All Progress</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0, marginTop: s(20) }]} onPress={handleUnlockAll}>
                            <Text style={[styles.settingText, { color: COLORS.ui.accent }]}>Unlock All Levels (Dev)</Text>
                            <Text style={styles.settingSubtext}>Complete everything</Text>
                        </TouchableOpacity>

                        {/* Close */}
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setSettingsVisible(false)}>
                            <Text style={styles.closeBtnTxt}>Close</Text>
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
    }
});

export default MenuScreen;
