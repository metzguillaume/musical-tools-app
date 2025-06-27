import React, { useState, useEffect } from 'react';

const SilentSwitchNotification = () => {
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if the user agent string indicates an iPhone, iPad, or iPod.
        const isAppleDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
        setIsIOS(isAppleDevice);
    }, []);

    // Only render the component if the user is on an iOS device.
    if (!isIOS) {
        return null;
    }

    return (
        <div className="bg-indigo-900/50 border border-indigo-700 text-indigo-200 text-sm rounded-lg p-3 my-3 text-center">
            <p className="font-bold">No Sound on iPhone / iPad?</p>
            <p>If you don't hear audio, please ensure your device's Ring/Silent switch is turned ON (not showing orange).</p>
        </div>
    );
};

export default SilentSwitchNotification;