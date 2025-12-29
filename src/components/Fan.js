import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../utils/constants';

const Fan = ({ position, size, direction }) => {
    // Rotation mapping based on Right being 0deg
    const getRotation = () => {
        switch (direction) {
            case 'up': return '-90deg';
            case 'down': return '90deg';
            case 'left': return '180deg';
            case 'right': default: return '0deg';
        }
    };

    // The fan affects an area of 200px (visually) - physics is infinite
    // We keep visual trail somewhat long but maybe not infinite to avoid clutter?
    // User asked for "infinite range" in physics, visual can just be long.
    const WIND_RANGE = 300;

    // Create animated values
    const animatedValues = useMemo(() => ({
        wind1: new Animated.Value(0),
        wind2: new Animated.Value(0),
        wind3: new Animated.Value(0),
        wind4: new Animated.Value(0),
        wind5: new Animated.Value(0),
        spin: new Animated.Value(0), // New spin value
    }), []);

    useEffect(() => {
        // Create staggered wind particle animations
        const createWindAnimation = (animValue, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const animations = [
            createWindAnimation(animatedValues.wind1, 0),
            createWindAnimation(animatedValues.wind2, 240),
            createWindAnimation(animatedValues.wind3, 480),
            createWindAnimation(animatedValues.wind4, 720),
            createWindAnimation(animatedValues.wind5, 960),
        ];

        // Spin Animation (Clockwise: 0 -> 360)
        const spinAnim = Animated.loop(
            Animated.timing(animatedValues.spin, {
                toValue: 1,
                duration: 2000, // 2 seconds per rotation
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        animations.forEach(anim => anim.start());
        spinAnim.start();

        return () => {
            animations.forEach(anim => anim.stop());
            spinAnim.stop();
        };
    }, [animatedValues]);

    const spinInterpolate = animatedValues.spin.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    // Interpolate animation values for wind particles (Always moving RIGHT relative to container)
    const createWindStyle = (animValue, verticalOffset) => {
        const translateX = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, WIND_RANGE],
        });
        const opacity = animValue.interpolate({
            inputRange: [0, 0.1, 0.5, 0.9, 1],
            outputRange: [0, 0.7, 0.5, 0.2, 0],
        });
        const scaleX = animValue.interpolate({
            inputRange: [0, 0.3, 0.7, 1],
            outputRange: [0.3, 1.5, 1, 0.5],
        });

        return {
            transform: [
                { translateX },
                { translateY: verticalOffset },
                { scaleX },
            ],
            opacity,
        };
    };

    return (
        <View
            style={[
                styles.fan,
                {
                    left: position.x,
                    top: position.y,
                    width: size.width,
                    height: size.height,
                    transform: [{ rotate: getRotation() }]
                },
            ]}
        >
            {/* Fan Body with Spinning Arrows */}
            <View style={styles.fanBody}>
                {/* Spinning Container */}
                <Animated.View style={{
                    width: 30, height: 30,
                    alignItems: 'center', justifyContent: 'center',
                    transform: [{ rotate: spinInterpolate }]
                }}>
                    {/* 3 Arrows arranged in a circle */}
                    {[0, 120, 240].map((deg, i) => (
                        <View key={i} style={{
                            position: 'absolute',
                            height: 12,
                            transform: [
                                { rotate: `${deg}deg` },
                                { translateY: -8 } // Push out from center
                            ]
                        }}>
                            <Text style={{ fontSize: 10, color: '#fff', fontWeight: '900' }}>▲</Text>
                        </View>
                    ))}
                    {/* Center Dot */}
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', position: 'absolute' }} />
                </Animated.View>
            </View>

            {/* Animated Wind Particles - projected to the RIGHT (0deg) */}
            <View style={[
                styles.windContainer,
                styles.windContainerRight, // Always use Right logic, rotation handles direction
                { width: WIND_RANGE }
            ]}>
                <Animated.View style={[styles.windParticle, createWindStyle(animatedValues.wind1, -12)]} />
                <Animated.View style={[styles.windParticle, createWindStyle(animatedValues.wind2, -4)]} />
                <Animated.View style={[styles.windParticle, createWindStyle(animatedValues.wind3, 4)]} />
                <Animated.View style={[styles.windParticle, createWindStyle(animatedValues.wind4, 12)]} />
                <Animated.View style={[styles.windParticleLong, createWindStyle(animatedValues.wind5, 0)]} />
            </View>

            {/* Static dashed line showing full effect range */}
            <View style={[
                styles.rangeIndicator,
                { left: '100%', marginLeft: 4 },
                { width: WIND_RANGE }
            ]}>
                {Array.from({ length: 8 }).map((_, idx) => (
                    <View key={idx} style={styles.dashLine} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fan: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    fanBody: {
        backgroundColor: COLORS.fan,
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.fan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        zIndex: 2,
    },
    fanArrow: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    windContainer: {
        position: 'absolute',
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        zIndex: 1,
        overflow: 'visible',
    },
    windContainerLeft: {
        right: '100%',
        alignItems: 'flex-end',
    },
    windContainerRight: {
        left: '100%',
        alignItems: 'flex-start',
    },
    windParticle: {
        position: 'absolute',
        width: 25,
        height: 3,
        backgroundColor: COLORS.fan,
        borderRadius: 2,
    },
    windParticleLong: {
        position: 'absolute',
        width: 40,
        height: 2,
        backgroundColor: 'rgba(107, 114, 128, 0.6)',  // Grey
        borderRadius: 1,
    },
    rangeIndicator: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        height: 2,
        zIndex: 0,
    },
    dashLine: {
        width: 15,
        height: 1,
        backgroundColor: 'rgba(107, 114, 128, 0.25)',  // Grey
        borderRadius: 1,
    },
});

export default Fan;
