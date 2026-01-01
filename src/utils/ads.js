import React from 'react';
import { View, Text } from 'react-native';

let BannerAd, BannerAdSize, TestIds;

try {
    const Ads = require('react-native-google-mobile-ads');
    BannerAd = Ads.BannerAd;
    BannerAdSize = Ads.BannerAdSize;
    TestIds = Ads.TestIds;
} catch (e) {
    // Fallback for Expo Go or environments without the native module
    BannerAd = ({ unitId, size, style }) => (
        <View style={[{ height: 50, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }, style]}>
            <Text style={{ color: '#fff', fontSize: 10 }}>[ Ad Placeholder ]</Text>
        </View>
    );
    BannerAdSize = {
        ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
        BANNER: 'BANNER',
    };
    TestIds = {
        BANNER: 'ca-app-pub-3940256099942544/2934735716',
    };
}

export { BannerAd, BannerAdSize, TestIds };
