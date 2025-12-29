import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { COLORS } from '../utils/constants';
import { getLevelProgress, clearProgress } from '../utils/storage';
import { getNextLevelOrRedirect } from '../utils/gameLogic';
import levels from '../levels';
import { Alert } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MenuScreen = ({ navigation }) => {
    const [progress, setProgress] = React.useState({});

    useEffect(() => {
        getLevelProgress().then(setProgress);
        // Add navigation listener to refresh progress when coming back
        const unsubscribe = navigation.addListener('focus', () => {
            getLevelProgress().then(setProgress);
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

    const handleReset = async () => {
        await clearProgress();
        setProgress({});
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

                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                        <Text style={styles.resetButtonText}>Reset Progress</Text>
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
    },
    levelsButtonText: {
        color: COLORS.ui.text,
        fontSize: 18,
        letterSpacing: 1,
    },
    resetButton: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    instructions: {
        marginTop: 50,
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
});

export default MenuScreen;
