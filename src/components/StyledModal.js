import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { playButtonClick } from '../utils/audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const uiScale = SCREEN_WIDTH / BASE_WIDTH;
const s = (size) => Math.round(size * uiScale);

/**
 * A styled modal popup component.
 * 
 * Props:
 * - visible: boolean
 * - title: string
 * - message: string
 * - icon: string (emoji, optional)
 * - accentColor: string (for icon/button theming, default purple)
 * - buttons: [{ text: string, onPress: function, style?: 'cancel' | 'default' }]
 * - onClose: function (called when modal is dismissed)
 */
const StyledModal = ({
    visible,
    title,
    message,
    icon = '⭐',
    accentColor = '#8b5cf6',
    buttons = [],
    onClose
}) => {
    const handleButtonPress = (btn) => {
        playButtonClick();
        btn.onPress?.();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Icon */}
                    <View style={[styles.iconCircle, { backgroundColor: accentColor + '20' }]}>
                        <Text style={styles.icon}>{icon}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Message */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        {buttons.map((btn, idx) => {
                            const isCancel = btn.style === 'cancel';
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.button,
                                        isCancel ? styles.cancelButton : { backgroundColor: accentColor },
                                        buttons.length === 1 && styles.singleButton
                                    ]}
                                    onPress={() => handleButtonPress(btn)}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        isCancel && styles.cancelButtonText
                                    ]}>
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: s(20),
    },
    container: {
        backgroundColor: '#1e1e2e',
        borderRadius: s(20),
        padding: s(24),
        width: '100%',
        maxWidth: s(320),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconCircle: {
        width: s(60),
        height: s(60),
        borderRadius: s(30),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: s(16),
    },
    icon: {
        fontSize: s(32),
    },
    title: {
        fontSize: s(20),
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: s(8),
    },
    message: {
        fontSize: s(14),
        color: '#a0a0a0',
        textAlign: 'center',
        lineHeight: s(20),
        marginBottom: s(20),
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: s(10),
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: s(12),
        borderRadius: s(12),
        alignItems: 'center',
    },
    singleButton: {
        flex: 0,
        paddingHorizontal: s(40),
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    buttonText: {
        fontSize: s(14),
        fontWeight: '600',
        color: '#fff',
    },
    cancelButtonText: {
        color: '#a0a0a0',
    },
});

export default StyledModal;
