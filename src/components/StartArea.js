import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/constants';

const StartArea = ({ position }) => {
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

    return (
        <View style={[styles.container, { left: position.x - 15, top: position.y - 15 }]}>
            {/* Outer Glow (Pulsing) */}
            <Animated.View style={[styles.glow, { opacity }]} />
            {/* The Ball Itself (Static Visual) */}
            <View style={styles.ball} />
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
    },
    glow: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.ballGlow,
    },
    ball: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.ball,
        // Add exact ball styling (maybe inner shadow or border if Ball.js has it?)
        // Ball.js has: width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.ball
        // And a highlight: width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', top: 4, left: 4
    },
});

export default StartArea;
