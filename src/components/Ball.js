import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, PHYSICS } from '../utils/constants';
import { useBallSkin } from '../utils/BallSkinContext';

const Ball = ({ body, color: colorProp }) => {
    if (!body) return null;

    const { color: contextColor } = useBallSkin();
    const { position } = body;
    const radius = PHYSICS.ballRadius;

    // Use prop color if provided, otherwise use context color
    const ballColor = colorProp || contextColor || COLORS.ball;

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
                    backgroundColor: ballColor,
                    shadowColor: ballColor,
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
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
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
