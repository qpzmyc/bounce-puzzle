import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS, PLATFORM_TYPES } from '../utils/constants';

const Platform = ({ body, size, platformType }) => {
    const type = PLATFORM_TYPES[platformType] || PLATFORM_TYPES.normal;

    // For walls (no platformType)
    if (!platformType) {
        return (
            <View style={[styles.wall, {
                left: body.position.x - size.width / 2,
                top: body.position.y - size.height / 2,
                width: size.width,
                height: size.height,
            }]} />
        );
    }

    // For placed platforms with physics body
    const angleDeg = body.angle * (180 / Math.PI);

    return (
        <View style={[styles.platform, {
            left: body.position.x - size.width / 2,
            top: body.position.y - size.height / 2,
            width: size.width,
            height: size.height,
            backgroundColor: type.color,
            transform: [{ rotate: `${angleDeg}deg` }],
        }]}>
            <Text style={styles.icon}>{type.icon}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    wall: {
        position: 'absolute',
        backgroundColor: COLORS.wall,
        borderRadius: 2,
    },
    platform: {
        position: 'absolute',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    icon: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
    },
});

export default Platform;
