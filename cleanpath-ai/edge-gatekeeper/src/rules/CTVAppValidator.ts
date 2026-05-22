/**
 * CTV App Bundle Validator
 * Validates CTV app bundles against a curated allowlist and
 * verifies bundle-to-store-URL consistency.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    CTVAppBundle,
    CTVSpoofSignal,
    CTVValidationResult,
    CTVSignalDetail,
} from '@cleanpath/types';

/**
 * Shape of entries in the ctv-app-allowlist.json file.
 */
interface AllowlistEntry {
    bundleId: string;
    name: string;
    storeUrl?: string;
    publisher?: string;
    expectedDeviceTypes?: string[];
}

export class CTVAppValidator {
    private allowlist: Map<string, AllowlistEntry> = new Map();

    constructor(allowlistPath?: string) {
        const resolvedPath = allowlistPath
            ?? path.resolve(__dirname, '../../data/ctv-app-allowlist.json');
        this.loadAllowlist(resolvedPath);
    }

    /**
     * Load the app allowlist from JSON file into a Map keyed by bundleId.
     */
    private loadAllowlist(filePath: string): void {
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const entries: AllowlistEntry[] = JSON.parse(raw);
            for (const entry of entries) {
                this.allowlist.set(entry.bundleId, entry);
            }
        } catch (error) {
            console.error(`Failed to load CTV app allowlist from ${filePath}:`, error);
            // fail-open: empty allowlist means all bundles pass allowlist check
        }
    }

    /**
     * Validate an app bundle against the allowlist and check for consistency.
     * Returns a CTVValidationResult with any detected signals.
     */
    public validateAppBundle(bundle: CTVAppBundle): CTVValidationResult {
        const startTime = Date.now();
        const signals: CTVSignalDetail[] = [];
        let riskScore = 0;

        // 1. Check if bundle is in allowlist
        const allowlistEntry = this.allowlist.get(bundle.bundleId);

        if (this.allowlist.size > 0 && !allowlistEntry) {
            // Bundle not in allowlist — suspicious but not conclusive
            signals.push({
                signal: CTVSpoofSignal.BUNDLE_MISMATCH,
                severity: 40,
                description: `App bundle "${bundle.bundleId}" not found in allowlist`,
                evidence: { bundleId: bundle.bundleId, name: bundle.name },
            });
            riskScore += 40;
        }

        // 2. If in allowlist, verify store URL consistency
        if (allowlistEntry && bundle.storeUrl && allowlistEntry.storeUrl) {
            const storeDomain = this.extractDomain(allowlistEntry.storeUrl);
            const reportedDomain = this.extractDomain(bundle.storeUrl);

            if (storeDomain && reportedDomain && storeDomain !== reportedDomain) {
                signals.push({
                    signal: CTVSpoofSignal.STORE_URL_MISMATCH,
                    severity: 70,
                    description: `Store URL domain mismatch: expected "${storeDomain}", got "${reportedDomain}"`,
                    evidence: {
                        expected: allowlistEntry.storeUrl,
                        reported: bundle.storeUrl,
                    },
                });
                riskScore += 30;
            }
        }

        // 3. If in allowlist, verify device type compatibility
        if (allowlistEntry?.expectedDeviceTypes && bundle.expectedDeviceTypes) {
            const expectedSet = new Set(allowlistEntry.expectedDeviceTypes.map(t => t.toLowerCase()));
            const reportedTypes = bundle.expectedDeviceTypes.map(t => t.toLowerCase());
            const invalidTypes = reportedTypes.filter(t => !expectedSet.has(t));

            if (invalidTypes.length > 0) {
                signals.push({
                    signal: CTVSpoofSignal.BUNDLE_MISMATCH,
                    severity: 30,
                    description: `App "${bundle.name}" reported on unexpected device types: ${invalidTypes.join(', ')}`,
                    evidence: {
                        expected: allowlistEntry.expectedDeviceTypes,
                        reported: bundle.expectedDeviceTypes,
                    },
                });
                riskScore += 15;
            }
        }

        // 4. Name consistency check
        if (allowlistEntry && bundle.name) {
            const nameSimilarity = this.checkNameSimilarity(allowlistEntry.name, bundle.name);
            if (!nameSimilarity) {
                signals.push({
                    signal: CTVSpoofSignal.BUNDLE_MISMATCH,
                    severity: 25,
                    description: `App name mismatch: allowlist has "${allowlistEntry.name}", request reports "${bundle.name}"`,
                    evidence: {
                        expected: allowlistEntry.name,
                        reported: bundle.name,
                    },
                });
                riskScore += 10;
            }
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
     * Check if a bundle ID exists in the allowlist.
     */
    public isAllowlisted(bundleId: string): boolean {
        return this.allowlist.has(bundleId);
    }

    /**
     * Get allowlist size (for diagnostics/testing).
     */
    public getAllowlistSize(): number {
        return this.allowlist.size;
    }

    /**
     * Extract domain from a URL string.
     */
    private extractDomain(url: string): string | null {
        try {
            const parsed = new URL(url);
            return parsed.hostname;
        } catch {
            return null;
        }
    }

    /**
     * Simple name similarity check: case-insensitive containment.
     * Returns true if names are considered "similar enough".
     */
    private checkNameSimilarity(expected: string, reported: string): boolean {
        const normExpected = expected.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normReported = reported.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normExpected === normReported
            || normExpected.includes(normReported)
            || normReported.includes(normExpected);
    }
}
