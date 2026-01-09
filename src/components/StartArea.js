import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/constants';
import { useBallSkin } from '../utils/BallSkinContext';

const StartArea = ({ position }) => {
    const { color: ballColor } = useBallSkin();

    // Pulsing animation for visibility
    const opacity = React.useRef(new Animated.Value(0.4)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // Create glow color with alpha from current ball color
    const glowColor = ballColor + '4D'; // ~30% opacity hex

    return (
        <View style={[styles.container, { left: position.x - 15, top: position.y - 15 }]}>
            {/* Outer Glow (Pulsing) */}
            <Animated.View style={[styles.glow, { opacity, backgroundColor: glowColor }]} />
            {/* The Ball Itself (Static Visual) */}
            <View style={[styles.ball, { backgroundColor: ballColor }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    glow: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    ball: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
});

export default StartArea;
