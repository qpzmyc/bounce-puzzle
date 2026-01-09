import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { useBallSkin } from '../utils/BallSkinContext';
const BallTrail = ({ points }) => {
    const { trailColor } = useBallSkin();

    if (!points || points.length === 0) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            {points.map((point, index) => {
                // Higher base opacity for more solid appearance
                // Recent points are fully opaque, older ones slightly faded
                const ageRatio = index / points.length;
                const opacity = 0.3 + ageRatio * 0.6;  // 0.4 to 0.9
                // Consistent size for solid trail
                const size = 6;

                return (
                    <View
                        key={index}
                        style={[
                            styles.trailDot,
                            {
                                left: point.x - size / 2,
                                top: point.y - size / 2,
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                opacity,
                                backgroundColor: trailColor || COLORS.ball,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 5,
    },
    trailDot: {
        position: 'absolute',
    },
});

export default BallTrail;
