import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Alert,
} from 'react-native';
import StyledModal from '../components/StyledModal';
import { useFocusEffect } from '@react-navigation/native';
import { getLevelProgress } from '../utils/storage';
import { playMusic } from '../utils/audio';
import world1Levels from '../levels';
import world2Levels from '../levels/world2';
import { COLORS } from '../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BASE_WIDTH = 375;
const uiScale = SCREEN_WIDTH / BASE_WIDTH;
const s = (size) => Math.round(size * uiScale);

const WORLDS = [
    {
        id: 1,
        name: 'First World',
        subtitle: 'The Basics',
        color: '#22c52dff',
        icon: '1',
    },
    {
        id: 2,
        name: 'Fire World',
        subtitle: 'More Challenging',
        color: '#f6665cff',
        icon: '2',
    },
    {
        id: 3,
        name: 'Ice World',
        subtitle: 'Coming Soon',
        color: '#559ef7ff',
        icon: '3',
    },
];

const WorldSelectScreen = ({ navigation }) => {
    const [progress, setProgress] = React.useState({});
    const [lockedModal, setLockedModal] = React.useState({ visible: false });

    useFocusEffect(
        React.useCallback(() => {
            getLevelProgress().then(setProgress);
            playMusic('menu');
        }, [])
    );

    const isWorldUnlocked = (worldId) => {
        if (worldId === 1) return true;
        if (worldId === 2) {
            // W2 unlocked if last level of W1 is completed
            const lastLevelW1 = world1Levels[world1Levels.length - 1];
            return !!progress[lastLevelW1.id]?.completed;
        }
        if (worldId === 3) {
            // W3 unlocked if last level of W2 is completed
            const lastLevelW2 = world2Levels[world2Levels.length - 1];
            return !!progress[lastLevelW2.id]?.completed;
        }
        return false;
    };

    const handleWorldSelect = (worldId) => {
        if (!isWorldUnlocked(worldId)) {
            setLockedModal({ visible: true });
            return;
        }
        navigation.navigate('LevelSelect', { worldId });
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
                <Text style={styles.title}>Select World</Text>
            </View>

            <View style={styles.worldsContainer}>
                {WORLDS.map((world) => {
                    const unlocked = isWorldUnlocked(world.id);
                    return (
                        <TouchableOpacity
                            key={world.id}
                            style={[
                                styles.worldCard,
                                { borderColor: unlocked ? world.color : 'rgba(255,255,255,0.1)' },
                                !unlocked && { opacity: 0.5 }
                            ]}
                            onPress={() => handleWorldSelect(world.id)}
                        >
                            <View style={[styles.worldIcon, { backgroundColor: unlocked ? world.color : '#333' }]}>
                                <Text style={styles.worldIconText}>{unlocked ? world.icon : '🔒'}</Text>
                            </View>
                            <View style={styles.worldInfo}>
                                <Text style={styles.worldName}>{world.name}</Text>
                                <Text style={styles.worldSubtitle}>{unlocked ? world.subtitle : 'Locked'}</Text>
                            </View>
                            <View style={[styles.playIcon, { backgroundColor: unlocked ? world.color : '#333' }]}>
                                <Text style={styles.playIconText}>{unlocked ? '▶' : '🔒'}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <StyledModal
                visible={lockedModal.visible}
                title="World Locked"
                message="Complete all levels in the previous world to unlock this one!"
                icon="🔒"
                accentColor="#ef4444"
                buttons={[
                    { text: "Got it", onPress: () => setLockedModal({ visible: false }) }
                ]}
                onClose={() => setLockedModal({ visible: false })}
            />
        </View >
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
    worldsContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    worldCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: s(20),
        borderWidth: 2,
        marginBottom: s(20),
    },
    worldIcon: {
        width: s(70),
        height: s(70),
        borderRadius: s(35),
        justifyContent: 'center',
        alignItems: 'center',
    },
    worldIconText: {
        fontSize: s(32),
    },
    worldInfo: {
        flex: 1,
        marginLeft: s(20),
    },
    worldName: {
        color: COLORS.ui.text,
        fontSize: s(24),
        fontWeight: 'bold',
    },
    worldSubtitle: {
        color: COLORS.ui.textDim,
        fontSize: s(16),
        marginTop: s(4),
    },
    playIcon: {
        width: s(50),
        height: s(50),
        borderRadius: s(25),
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIconText: {
        color: '#fff',
        fontSize: s(20),
    },
});

export default WorldSelectScreen;
