import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../utils/constants';
import levels from '../levels';
import { getLevelProgress } from '../utils/storage';
import { getNextLevelOrRedirect, getTotalStars } from '../utils/gameLogic';
import { Alert } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LevelSelectScreen = ({ navigation }) => {
    const [progress, setProgress] = useState({});

    useFocusEffect(
        useCallback(() => {
            getLevelProgress().then(setProgress);
        }, [])
    );

    const handleLevelSelect = (levelId) => {
        const level = levels.find(l => l.id === levelId);
        const totalStars = getTotalStars(progress);

        if (level.requiredStars && totalStars < level.requiredStars) {
            Alert.alert(
                "Level Locked",
                `This level requires ${level.requiredStars} stars to unlock.\nYou currently have ${totalStars} stars.`
            );
            return;
        }
        navigation.navigate('Game', { levelId });
    };


    // Determine card style based on state
    // Green: Next level to play (First uncompleted)
    // Purple: Completed
    // Grey: Locked/Future (Uncompleted but not the very next one)
    const getLevelStatus = (levelId, nextId) => {
        const isCompleted = progress[levelId]?.completed;
        const isNext = levelId === nextId;

        if (isNext) return 'next';
        if (isCompleted) return 'completed';
        return 'locked';
    };

    const { levelId: nextId } = getNextLevelOrRedirect(levels, progress);

    const getCardColor = (status) => {
        switch (status) {
            case 'next': return 'rgba(34, 197, 94, 0.2)'; // Green tint
            case 'completed': return 'rgba(139, 92, 246, 0.2)'; // Purple tint
            case 'locked': default: return 'rgba(255,255,255,0.05)'; // Grey/Default
        }
    };

    const getIconBg = (status) => {
        switch (status) {
            case 'next': return '#22c55e'; // Green
            case 'completed': return '#8b5cf6'; // Purple
            case 'locked': default: return '#4b5563'; // Grey
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Menu')}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Select Level</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.levelsContainer}
            >
                {levels.map((level, index) => {
                    const stars = progress[level.id]?.stars || 0;
                    const status = getLevelStatus(level.id, nextId);
                    const cardBg = getCardColor(status);
                    const iconBg = getIconBg(status);
                    const borderColor = status === 'next' ? '#22c55e' : (status === 'completed' ? '#8b5cf6' : 'rgba(255,255,255,0.1)');

                    return (
                        <TouchableOpacity
                            key={level.id}
                            style={[styles.levelCard, { backgroundColor: cardBg, borderColor }]}
                            onPress={() => handleLevelSelect(level.id)}
                        >
                            <View style={[styles.levelNumber, { backgroundColor: iconBg }]}>
                                <Text style={styles.levelNumberText}>{level.id}</Text>
                            </View>
                            <View style={styles.levelInfo}>
                                <Text style={styles.levelName}>
                                    {level.name}
                                    {level.requiredStars ? ` (🔒 ${level.requiredStars})` : ''}
                                </Text>
                                {/* Stars instead of Description */}
                                <View style={styles.starsRow}>
                                    {[1, 2, 3].map(i => (
                                        <Text key={i} style={{ fontSize: 16, color: i <= stars ? COLORS.ui.star : COLORS.ui.starEmpty }}>★</Text>
                                    ))}
                                </View>
                                <View style={styles.levelMeta}>
                                    <View style={styles.platformBadge}>
                                        <Text style={styles.platformBadgeText}>
                                            {(level.platforms.normal || 0) + (level.platforms.sticky || 0) + (level.platforms.super || 0)} platforms
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.playIcon, { backgroundColor: iconBg }]}>
                                <Text style={styles.playIconText}>▶</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: COLORS.ui.text,
        fontSize: 24,
    },
    title: {
        color: COLORS.ui.text,
        fontSize: 28,
        fontWeight: 'bold',
        marginLeft: 20,
        flex: 1,
    },

    scrollView: {
        flex: 1,
    },
    levelsContainer: {
        padding: 20,
    },
    levelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        marginBottom: 10,
    },
    levelNumber: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    levelNumberText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    levelInfo: {
        flex: 1,
        marginLeft: 15,
    },
    levelName: {
        color: COLORS.ui.text,
        fontSize: 18,
        fontWeight: '600',
    },
    starsRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    levelMeta: {
        flexDirection: 'row',
        marginTop: 8,
    },
    platformBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    platformBadgeText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '500',
    },
    playIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIconText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default LevelSelectScreen;
