const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to manually link react-native-game-center
 * This is necessary because the library's podspec is nested in a way that
 * autolinking often misses.
 */
const withGameCenter = (config) => {
    return withDangerousMod(config, [
        'ios',
        async (config) => {
            const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
            let podfileContent = fs.readFileSync(podfilePath, 'utf8');

            // The specific path to the podspec inside the node_modules
            const podEntry = "\n  pod 'RNGameCenter', :path => '../node_modules/react-native-game-center/RNGameCenter/ios'\n";

            if (!podfileContent.includes('RNGameCenter')) {
                // We find the main target block. In Expo, it usually starts with "target 'bouncepuzzle' do" (or whatever the slug is)
                // A safe place is right before the last 'end' of the file which closes the main target.
                const lastEndIndex = podfileContent.lastIndexOf('end');
                if (lastEndIndex !== -1) {
                    podfileContent = podfileContent.slice(0, lastEndIndex) + podEntry + podfileContent.slice(lastEndIndex);
                    fs.writeFileSync(podfilePath, podfileContent);
                    console.log('Successfully added RNGameCenter pod to Podfile');
                }
            }

            return config;
        },
    ]);
};

module.exports = withGameCenter;
