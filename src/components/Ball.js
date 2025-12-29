import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, PHYSICS } from '../utils/constants';

const Ball = ({ body }) => {
    if (!body) return null;

    const { position } = body;
    const radius = PHYSICS.ballRadius;

    return (
        <View
            style={[
                styles.ball,
                {
                    left: position.x - radius,
                    top: position.y - radius,
                    width: radius * 2,
                    height: radius * 2,
                    borderRadius: radius,
                },
            ]}
        >
            <View style={styles.highlight} />
        </View>
    );
};

const styles = StyleSheet.create({
    ball: {
        position: 'absolute',
        backgroundColor: COLORS.ball,
        shadowColor: COLORS.ball,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    highlight: {
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: '30%',
        height: '30%',
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
});

export default Ball;
