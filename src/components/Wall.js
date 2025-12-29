import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const Wall = ({ body, size }) => {
    if (!body) return null;

    return (
        <View
            style={[
                styles.wall,
                {
                    left: body.position.x - size.width / 2,
                    top: body.position.y - size.height / 2,
                    width: size.width,
                    height: size.height,
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    wall: {
        position: 'absolute',
        backgroundColor: COLORS.wall,
        borderRadius: 4,
    },
});

export default Wall;
