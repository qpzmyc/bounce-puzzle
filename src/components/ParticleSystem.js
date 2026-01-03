import React, { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const ParticleSystem = forwardRef((props, ref) => {
    const [particles, setParticles] = useState([]);
    const nextId = useRef(0);

    useImperativeHandle(ref, () => ({
        emit: (x, y, color, count = 10) => {
            const newParticles = [];
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                newParticles.push({
                    id: nextId.current++,
                    x,
                    y,
                    color,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    opacity: new Animated.Value(1),
                    scale: new Animated.Value(1),
                    life: 1.0 // Normalized life
                });
            }
            setParticles(prev => [...prev, ...newParticles]);
        }
    }));

    useEffect(() => {
        if (particles.length === 0) return;

        // Run animation logic
        const interval = setInterval(() => {
            setParticles(prev => {
                const next = prev.map(p => ({
                    ...p,
                    x: p.x + p.vx,
                    y: p.y + p.vy,
                    life: p.life - 0.05
                })).filter(p => p.life > 0);

                // Update animated values (imperatively for performance? No, use state-driven LERP is hard here without individual anims)
                // Actually, let's keep it simple: Pure JS position updates + simple opacity/scale mapping
                return next;
            });
        }, 16); // 60 FPS

        return () => clearInterval(interval);
    }, [particles.length > 0]); // Only run if particles exist

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map(p => (
                <View
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        width: 12,
                        height: 12,
                        borderRadius: 4,
                        backgroundColor: p.color,
                        opacity: p.life,
                        transform: [{ scale: p.life }]
                    }}
                />
            ))}
        </View>
    );
});

export default ParticleSystem;
