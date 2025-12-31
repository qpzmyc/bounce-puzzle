import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    Switch
} from 'react-native';
import { COLORS } from '../utils/constants';
import { getLevelProgress, clearProgress, getSettings, saveSettings } from '../utils/storage';
import { getNextLevelOrRedirect } from '../utils/gameLogic';
import levels from '../levels';
import { Alert } from 'react-native';
import { setSoundEnabled } from '../utils/audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
        navigation.navigate('LevelSelect');
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
                        <Text style={styles.playButtonText}>▶  Quick Play</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.levelsButton} onPress={handlePlay}>
                        <Text style={styles.levelsButtonText}>Select Level</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsVisible(true)}>
                        <Text style={styles.settingsButtonText}>⚙ Settings</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.instructions}>
                    <Text style={styles.instructionTitle}>How to Play</Text>
                    <View style={styles.instructionItem}>
                        <Text style={styles.instructionText}>Place platforms in the game area</Text>
                    </View>
                    <View style={styles.instructionItem}>
                        <Text style={styles.instructionText}>Launch the ball and watch it bounce</Text>
                    </View>
                    <View style={styles.instructionItem}>
                        <Text style={styles.instructionText}>Guide the ball to the green goal!</Text>
                    </View>
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
        width: 300,
        height: 300,
        backgroundColor: COLORS.ui.primary,
        top: -100,
        right: -100,
    },
    bgCircle2: {
        width: 200,
        height: 200,
        backgroundColor: COLORS.platform,
        bottom: 100,
        left: -80,
    },
    bgCircle3: {
        width: 150,
        height: 150,
        backgroundColor: COLORS.goal,
        bottom: -50,
        right: 50,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    demoBall: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.ball,
        marginBottom: 20,
        shadowColor: COLORS.ball,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ballHighlight: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.4)',
        position: 'absolute',
        top: 10,
        left: 12,
    },
    title: {
        fontSize: 52,
        fontWeight: 'bold',
        color: COLORS.ui.text,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 52,
        fontWeight: '300',
        color: COLORS.ui.secondary,
        marginTop: -10,
        letterSpacing: 4,
    },
    tagline: {
        fontSize: 16,
        color: COLORS.ui.textDim,
        marginTop: 10,
        letterSpacing: 1,
    },
    demoPlatform: {
        width: 100,
        height: 18,
        backgroundColor: COLORS.platform,
        borderRadius: 9,
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.platform,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    platformGrip: {
        flexDirection: 'row',
    },
    gripLine: {
        width: 3,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 2,
    },
    buttons: {
        marginTop: 50,
        width: '100%',
    },
    playButton: {
        backgroundColor: COLORS.ui.primary,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: COLORS.ui.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    playButtonText: {
        color: COLORS.ui.text,
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    levelsButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginBottom: 10,
        marginTop: 15,
    },
    levelsButtonText: {
        color: COLORS.ui.text,
        fontSize: 18,
        letterSpacing: 1,
    },
    settingsButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    settingsButtonText: {
        color: COLORS.ui.textDim,
        fontSize: 14,
        fontWeight: '600',
    },
    instructions: {
        marginTop: 40,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 20,
    },
    instructionTitle: {
        color: COLORS.ui.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    instructionIcon: {
        fontSize: 16,
    },
    instructionText: {
        color: COLORS.ui.textDim,
        fontSize: 14,
        flex: 1,
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
        borderRadius: 20,
        padding: 25,
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 25,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    settingText: {
        fontSize: 18,
        color: '#fff',
    },
    modalResetBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    modalResetTxt: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeBtn: {
        backgroundColor: COLORS.ui.primary,
        borderRadius: 20,
        padding: 10,
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
