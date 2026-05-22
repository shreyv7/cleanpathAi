/**
 * CTV Device Fingerprint Consistency Checker
 * Detects inconsistencies between reported device attributes:
 * user-agent vs. declared device type, OS version vs. known firmware ranges,
 * screen resolution mismatches.
 */

import {
    CTVDeviceFingerprint,
    CTVFirmwareRange,
    CTVSpoofSignal,
    CTVValidationResult,
    CTVSignalDetail,
    Device,
} from '@cleanpath/types';

/**
 * Known CTV firmware ranges for major manufacturers.
 * Used to validate whether a reported OS version is plausible.
 */
const KNOWN_FIRMWARE_RANGES: CTVFirmwareRange[] = [
    {
        make: 'roku',
        os: 'roku os',
        minVersion: '9.0',
        maxVersion: '14.0',
        expectedResolutions: ['1920x1080', '3840x2160'],
    },
    {
        make: 'amazon',
        os: 'fire os',
        minVersion: '5.0',
        maxVersion: '9.0',
        expectedResolutions: ['1920x1080', '3840x2160', '1280x720'],
    },
    {
        make: 'samsung',
        os: 'tizen',
        minVersion: '4.0',
        maxVersion: '8.0',
        expectedResolutions: ['1920x1080', '3840x2160'],
    },
    {
        make: 'lg',
        os: 'webos',
        minVersion: '4.0',
        maxVersion: '24.0',
        expectedResolutions: ['1920x1080', '3840x2160'],
    },
    {
        make: 'apple',
        os: 'tvos',
        minVersion: '14.0',
        maxVersion: '18.0',
        expectedResolutions: ['1920x1080', '3840x2160'],
    },
    {
        make: 'google',
        os: 'android tv',
        minVersion: '10.0',
        maxVersion: '15.0',
        expectedResolutions: ['1920x1080', '3840x2160', '1280x720'],
    },
    {
        make: 'sony',
        os: 'android tv',
        minVersion: '10.0',
        maxVersion: '15.0',
        expectedResolutions: ['1920x1080', '3840x2160'],
    },
    {
        make: 'vizio',
        os: 'smartcast',
        minVersion: '4.0',
        maxVersion: '7.0',
        expectedResolutions: ['1920x1080', '3840x2160'],
    },
];

/**
 * User-agent patterns that indicate emulator or non-CTV environments.
 */
const EMULATOR_UA_PATTERNS = [
    /android.*sdk/i,
    /emulator/i,
    /genymotion/i,
    /bluestacks/i,
    /nox/i,
    /android simulator/i,
    /virtualbox/i,
    /vmware/i,
    /qemu/i,
    /chrome\/\d+.*mobile/i, // Mobile Chrome on CTV is suspicious
];

/**
 * User-agent patterns associated with CTV devices.
 */
const CTV_UA_PATTERNS = [
    /roku/i,
    /smarttv/i,
    /smart-tv/i,
    /tizen/i,
    /webos/i,
    /firetv/i,
    /fire tv/i,
    /apple\s?tv/i,
    /android\s?tv/i,
    /chromecast/i,
    /vizio/i,
    /hbbtv/i,
    /bravia/i,
];

export class CTVDeviceChecker {
    private firmwareRanges: CTVFirmwareRange[];

    constructor(customFirmwareRanges?: CTVFirmwareRange[]) {
        this.firmwareRanges = customFirmwareRanges ?? KNOWN_FIRMWARE_RANGES;
    }

    /**
     * Check device fingerprint consistency against known patterns.
     */
    public checkDeviceConsistency(
        fingerprint: CTVDeviceFingerprint,
        device: Device,
    ): CTVValidationResult {
        const startTime = Date.now();
        const signals: CTVSignalDetail[] = [];
        let riskScore = 0;

        // 1. Check for emulator patterns in user-agent
        const emulatorResult = this.checkEmulatorPatterns(device.ua);
        if (emulatorResult) {
            signals.push(emulatorResult);
            riskScore += emulatorResult.severity;
        }

        // 2. Check UA vs. declared device type consistency
        const uaResult = this.checkUAConsistency(fingerprint, device);
        if (uaResult) {
            signals.push(uaResult);
            riskScore += uaResult.severity;
        }

        // 3. Check OS version against known firmware ranges
        const osResult = this.checkOSVersion(fingerprint);
        if (osResult) {
            signals.push(osResult);
            riskScore += osResult.severity;
        }

        // 4. Check screen resolution plausibility
        const resolutionResult = this.checkResolution(fingerprint);
        if (resolutionResult) {
            signals.push(resolutionResult);
            riskScore += resolutionResult.severity;
        }

        // Cap risk score at 100
        riskScore = Math.min(riskScore, 100);

        return {
            passed: signals.length === 0,
            signals,
            riskScore,
            processingTimeMs: Date.now() - startTime,
        };
    }

    /**
     * Check user-agent for emulator/simulator patterns.
     */
    private checkEmulatorPatterns(ua: string): CTVSignalDetail | null {
        for (const pattern of EMULATOR_UA_PATTERNS) {
            if (pattern.test(ua)) {
                return {
                    signal: CTVSpoofSignal.EMULATOR_DETECTED,
                    severity: 90,
                    description: `Emulator pattern detected in user-agent: ${pattern.source}`,
                    evidence: { ua, matchedPattern: pattern.source },
                };
            }
        }
        return null;
    }

    /**
     * Check if user-agent is consistent with the declared CTV device make.
     */
    private checkUAConsistency(
        fingerprint: CTVDeviceFingerprint,
        device: Device,
    ): CTVSignalDetail | null {
        const ua = device.ua.toLowerCase();
        const make = fingerprint.make.toLowerCase();

        // If UA doesn't contain any CTV patterns, it's suspicious
        const hasCTVSignature = CTV_UA_PATTERNS.some(p => p.test(device.ua));
        if (!hasCTVSignature) {
            return {
                signal: CTVSpoofSignal.UA_INCONSISTENCY,
                severity: 50,
                description: `User-agent lacks CTV device signature for declared ${fingerprint.make} device`,
                evidence: { ua: device.ua, declaredMake: fingerprint.make },
            };
        }

        // If device claims to be a specific make, UA should match
        const makePatterns: Record<string, RegExp> = {
            roku: /roku/i,
            amazon: /firetv|fire tv|silk/i,
            samsung: /tizen|samsung/i,
            lg: /webos|lg/i,
            apple: /apple\s?tv/i,
            google: /android\s?tv|chromecast/i,
            sony: /bravia|sony/i,
            vizio: /vizio|smartcast/i,
        };

        const expectedPattern = makePatterns[make];
        if (expectedPattern && !expectedPattern.test(ua)) {
            return {
                signal: CTVSpoofSignal.UA_INCONSISTENCY,
                severity: 60,
                description: `User-agent doesn't match declared device make "${fingerprint.make}"`,
                evidence: {
                    ua: device.ua,
                    declaredMake: fingerprint.make,
                    expectedPattern: expectedPattern.source,
                },
            };
        }

        return null;
    }

    /**
     * Check if reported OS version falls within known firmware ranges.
     */
    private checkOSVersion(fingerprint: CTVDeviceFingerprint): CTVSignalDetail | null {
        const make = fingerprint.make.toLowerCase();
        const os = fingerprint.os.toLowerCase();

        const range = this.firmwareRanges.find(
            r => r.make === make && r.os === os,
        );

        if (!range) {
            // Unknown device/OS combination — not necessarily a spoof but noteworthy
            return null;
        }

        const version = this.parseVersion(fingerprint.osVersion);
        const minVersion = this.parseVersion(range.minVersion);
        const maxVersion = this.parseVersion(range.maxVersion);

        if (version !== null && minVersion !== null && maxVersion !== null) {
            if (version < minVersion || version > maxVersion) {
                return {
                    signal: CTVSpoofSignal.OS_MISMATCH,
                    severity: 55,
                    description: `OS version ${fingerprint.osVersion} outside known range [${range.minVersion}-${range.maxVersion}] for ${fingerprint.make} ${fingerprint.os}`,
                    evidence: {
                        reported: fingerprint.osVersion,
                        minVersion: range.minVersion,
                        maxVersion: range.maxVersion,
                    },
                };
            }
        }

        return null;
    }

    /**
     * Check screen resolution against expected values for the device family.
     */
    private checkResolution(fingerprint: CTVDeviceFingerprint): CTVSignalDetail | null {
        if (!fingerprint.screenResolution) {
            return null; // No resolution reported — can't validate
        }

        const make = fingerprint.make.toLowerCase();
        const os = fingerprint.os.toLowerCase();
        const range = this.firmwareRanges.find(
            r => r.make === make && r.os === os,
        );

        if (!range) {
            return null;
        }

        if (!range.expectedResolutions.includes(fingerprint.screenResolution)) {
            return {
                signal: CTVSpoofSignal.RESOLUTION_MISMATCH,
                severity: 40,
                description: `Screen resolution ${fingerprint.screenResolution} unexpected for ${fingerprint.make} (expected: ${range.expectedResolutions.join(', ')})`,
                evidence: {
                    reported: fingerprint.screenResolution,
                    expected: range.expectedResolutions,
                },
            };
        }

        return null;
    }

    /**
     * Parse a version string like "12.0.1" into a comparable number (12.0).
     * Uses only major.minor for comparison.
     */
    private parseVersion(version: string): number | null {
        const parts = version.split('.').map(Number);
        if (parts.length === 0 || isNaN(parts[0])) return null;
        const major = parts[0];
        const minor = parts.length > 1 && !isNaN(parts[1]) ? parts[1] : 0;
        return major + minor / 100;
    }
}
