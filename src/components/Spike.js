import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const Spike = ({ position, size }) => {
    const spikeCount = Math.floor(size.width / 12);

    return (
        <View
            style={[
                styles.spikeContainer,
                {
                    left: position.x,
                    top: position.y,
                    width: size.width,
                    height: size.height,
                },
            ]}
        >
            <View style={styles.spikeRow}>
                {Array.from({ length: spikeCount }).map((_, i) => (
                    <View key={i} style={styles.spike} />
                ))}
            </View>
            <View style={styles.spikeBase} />
        </View>
    );
};

const styles = StyleSheet.create({
    spikeContainer: {
        position: 'absolute',
    },
    spikeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    spike: {
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: COLORS.spike,
        marginHorizontal: 1,
    },
    spikeBase: {
        height: 4,
        backgroundColor: '#991b1b',
        borderRadius: 2,
    },
});

export default Spike;
