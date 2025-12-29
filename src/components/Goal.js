import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../utils/constants';

const Goal = ({ position, size }) => {
    return (
        <View
            style={[
                styles.goal,
                {
                    left: position.x,
                    top: position.y,
                    width: size.width,
                    height: size.height,
                },
            ]}
        >
            <View style={styles.glow} />
            <View style={styles.inner}>
                {/* Text Removed */}
            </View>
            <View style={styles.chevrons}>
                <View style={styles.chevron} />
                <View style={[styles.chevron, styles.chevronDelayed]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    goal: {
        position: 'absolute',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: COLORS.goal,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        backgroundColor: COLORS.goalGlow,
        borderRadius: 20,
    },
    inner: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 5,
    },
    text: {
        color: '#1a1a2e',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    chevrons: {
        position: 'absolute',
        top: -20,
        flexDirection: 'column',
        alignItems: 'center',
    },
    chevron: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: COLORS.goal,
        opacity: 0.6,
    },
    chevronDelayed: {
        marginTop: -4,
        opacity: 0.3,
    },
});

export default Goal;
