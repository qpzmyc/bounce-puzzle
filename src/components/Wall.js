import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const Wall = React.memo(({ body, size, color }) => {
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
                    backgroundColor: color || COLORS.wall,
                },
            ]}
        />
    );
});

const styles = StyleSheet.create({
    wall: {
        position: 'absolute',
        borderRadius: 4,
        zIndex: 0,
    },
});

export default Wall;
