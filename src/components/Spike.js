import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const Spike = ({ position, size, direction = 'up' }) => {
    const isHorizontal = direction === 'up' || direction === 'down';
    // If horizontal (up/down), spikes runs along width. If vertical (left/right), runs along height.
    const length = isHorizontal ? size.width : size.height;
    const spikeCount = Math.max(1, Math.floor(length / 12));

    // Dynamic Styles based on direction
    const getContainerStyle = () => {
        switch (direction) {
            case 'up': return { flexDirection: 'column' };
            case 'down': return { flexDirection: 'column-reverse' };
            case 'left': return { flexDirection: 'row' };
            case 'right': return { flexDirection: 'row-reverse' };
            default: return { flexDirection: 'column' };
        }
    };

    const getSpikeRowStyle = () => {
        return {
            flexDirection: isHorizontal ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center' // Keep them centered in the cross axis
        };
    };

    const getSpikeStyle = () => {
        const base = {
            width: 0,
            height: 0,
            borderColor: 'transparent',
            margin: 1, // marginHorizontal/Vertical depending on dir? simple margin is safe
        };

        const size = 10; // Point length
        const halfBase = 5; // Half width of base

        switch (direction) {
            case 'up':
                return { ...base, borderBottomWidth: size, borderLeftWidth: halfBase, borderRightWidth: halfBase, borderBottomColor: COLORS.spike };
            case 'down':
                return { ...base, borderTopWidth: size, borderLeftWidth: halfBase, borderRightWidth: halfBase, borderTopColor: COLORS.spike };
            case 'left':
                return { ...base, borderRightWidth: size, borderTopWidth: halfBase, borderBottomWidth: halfBase, borderRightColor: COLORS.spike };
            case 'right':
                return { ...base, borderLeftWidth: size, borderTopWidth: halfBase, borderBottomWidth: halfBase, borderLeftColor: COLORS.spike };
            default:
                return base;
        }
    };

    const getBaseStyle = () => {
        const thickness = 4;
        if (isHorizontal) {
            return { height: thickness, width: '100%', backgroundColor: '#991b1b', borderRadius: 2 };
        } else {
            return { width: thickness, height: '100%', backgroundColor: '#991b1b', borderRadius: 2 };
        }
    };

    return (
        <View
            style={[
                styles.spikeContainer,
                getContainerStyle(),
                {
                    left: position.x,
                    top: position.y,
                    width: size.width,
                    height: size.height,
                },
            ]}
        >
            <View style={getSpikeRowStyle()}>
                {Array.from({ length: spikeCount }).map((_, i) => (
                    <View key={i} style={getSpikeStyle()} />
                ))}
            </View>
            <View style={getBaseStyle()} />
        </View>
    );
};

const styles = StyleSheet.create({
    spikeContainer: {
        position: 'absolute',
        zIndex: 1,
    },
});

export default Spike;
