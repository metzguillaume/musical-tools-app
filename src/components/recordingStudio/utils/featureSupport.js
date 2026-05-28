// Centralized feature detection so the UI can show clear, actionable notices
// when a browser doesn't support what the studio needs.

export const isMobileUserAgent = () => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const supportsUserMedia = () =>
    !!(typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

export const supportsDisplayMedia = () =>
    !!(typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);

export const supportsMediaRecorder = () =>
    typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined';

export const supportsCrossOriginIsolation = () =>
    typeof window !== 'undefined' && window.crossOriginIsolated === true;

// Returns a concise list of capabilities the studio currently has.
export const detectCapabilities = () => ({
    mobile: isMobileUserAgent(),
    userMedia: supportsUserMedia(),
    displayMedia: supportsDisplayMedia(),
    mediaRecorder: supportsMediaRecorder(),
    crossOriginIsolated: supportsCrossOriginIsolation(),
});
