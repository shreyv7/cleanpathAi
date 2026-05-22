/**
 * CTV Device Registry Cache
 * In-memory LRU cache keyed on IFA for tracking recently seen device
 * fingerprints and flagging sudden attribute changes.
 */

import { CTVDeviceFingerprint, CTVSpoofSignal, CTVSignalDetail } from '@cleanpath/types';

/**
 * Cached device entry with historical attributes for mutation detection.
 */
export interface CachedDeviceEntry {
    ifa: string;
    fingerprint: CTVDeviceFingerprint;
    firstSeen: number;
    lastSeen: number;
    mutationCount: number;
    lastMutations: DeviceMutation[];
    riskScore: number;
}

/**
 * Record of a device attribute change.
 */
export interface DeviceMutation {
    field: string;
    previousValue: string;
    newValue: string;
    timestamp: number;
}

/**
 * Result of checking device mutation history.
 */
export interface MutationCheckResult {
    hasMutations: boolean;
    mutations: DeviceMutation[];
    signals: CTVSignalDetail[];
    riskIncrease: number;
}

export class CTVDeviceCache {
    private cache: Map<string, CachedDeviceEntry> = new Map();
    private accessOrder: string[] = []; // LRU tracking
    private maxSize: number;
    private ttlMs: number;

    constructor(maxSize: number = 10000, ttlMinutes: number = 30) {
        this.maxSize = maxSize;
        this.ttlMs = ttlMinutes * 60 * 1000;
    }

    /**
     * Get a cached device entry by IFA.
     * Returns null if not found or expired.
     */
    public get(ifa: string): CachedDeviceEntry | null {
        const entry = this.cache.get(ifa);
        if (!entry) return null;

        // Check TTL
        if (Date.now() - entry.lastSeen > this.ttlMs) {
            this.cache.delete(ifa);
            this.removeFromAccessOrder(ifa);
            return null;
        }

        // Update LRU order
        this.touchAccessOrder(ifa);
        return entry;
    }

    /**
     * Set/update a device entry. If the device already exists,
     * check for attribute mutations before updating.
     */
    public set(ifa: string, fingerprint: CTVDeviceFingerprint): MutationCheckResult {
        const now = Date.now();
        const existing = this.cache.get(ifa);

        if (existing) {
            // Check for mutations
            const mutationResult = this.flagMutation(existing, fingerprint);

            // Update entry
            existing.fingerprint = fingerprint;
            existing.lastSeen = now;
            existing.mutationCount += mutationResult.mutations.length;
            existing.riskScore = Math.min(100, existing.riskScore + mutationResult.riskIncrease);
            existing.lastMutations = [
                ...mutationResult.mutations,
                ...existing.lastMutations,
            ].slice(0, 10); // Keep last 10 mutations

            this.touchAccessOrder(ifa);
            return mutationResult;
        }

        // New entry — evict if at capacity
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        this.cache.set(ifa, {
            ifa,
            fingerprint,
            firstSeen: now,
            lastSeen: now,
            mutationCount: 0,
            lastMutations: [],
            riskScore: 0,
        });
        this.accessOrder.push(ifa);

        return {
            hasMutations: false,
            mutations: [],
            signals: [],
            riskIncrease: 0,
        };
    }

    /**
     * Compare a new fingerprint against the cached one and flag any
     * suspicious attribute changes (device type change, OS downgrade, etc.).
     */
    public flagMutation(
        existing: CachedDeviceEntry,
        incoming: CTVDeviceFingerprint,
    ): MutationCheckResult {
        const mutations: DeviceMutation[] = [];
        const signals: CTVSignalDetail[] = [];
        const now = Date.now();
        let riskIncrease = 0;

        const prev = existing.fingerprint;

        // Check make change (very suspicious — device hardware doesn't change)
        if (prev.make !== incoming.make) {
            const mutation: DeviceMutation = {
                field: 'make',
                previousValue: prev.make,
                newValue: incoming.make,
                timestamp: now,
            };
            mutations.push(mutation);
            signals.push({
                signal: CTVSpoofSignal.DEVICE_ATTRIBUTE_CHANGE,
                severity: 85,
                description: `Device manufacturer changed from "${prev.make}" to "${incoming.make}" for IFA ${existing.ifa}`,
                evidence: mutation as unknown as Record<string, unknown>,
            });
            riskIncrease += 40;
        }

        // Check model change (suspicious — shouldn't change for same IFA)
        if (prev.model !== incoming.model) {
            const mutation: DeviceMutation = {
                field: 'model',
                previousValue: prev.model,
                newValue: incoming.model,
                timestamp: now,
            };
            mutations.push(mutation);
            signals.push({
                signal: CTVSpoofSignal.DEVICE_ATTRIBUTE_CHANGE,
                severity: 75,
                description: `Device model changed from "${prev.model}" to "${incoming.model}" for IFA ${existing.ifa}`,
                evidence: mutation as unknown as Record<string, unknown>,
            });
            riskIncrease += 30;
        }

        // Check OS downgrade (suspicious — devices don't typically downgrade)
        if (prev.osVersion && incoming.osVersion) {
            const prevVer = this.parseVersion(prev.osVersion);
            const newVer = this.parseVersion(incoming.osVersion);
            if (prevVer !== null && newVer !== null && newVer < prevVer) {
                const mutation: DeviceMutation = {
                    field: 'osVersion',
                    previousValue: prev.osVersion,
                    newValue: incoming.osVersion,
                    timestamp: now,
                };
                mutations.push(mutation);
                signals.push({
                    signal: CTVSpoofSignal.DEVICE_ATTRIBUTE_CHANGE,
                    severity: 60,
                    description: `OS version downgraded from "${prev.osVersion}" to "${incoming.osVersion}" for IFA ${existing.ifa}`,
                    evidence: mutation as unknown as Record<string, unknown>,
                });
                riskIncrease += 20;
            }
        }

        // Check screen resolution change
        if (prev.screenResolution && incoming.screenResolution
            && prev.screenResolution !== incoming.screenResolution) {
            const mutation: DeviceMutation = {
                field: 'screenResolution',
                previousValue: prev.screenResolution,
                newValue: incoming.screenResolution,
                timestamp: now,
            };
            mutations.push(mutation);
            signals.push({
                signal: CTVSpoofSignal.RESOLUTION_MISMATCH,
                severity: 45,
                description: `Screen resolution changed from "${prev.screenResolution}" to "${incoming.screenResolution}" for IFA ${existing.ifa}`,
                evidence: mutation as unknown as Record<string, unknown>,
            });
            riskIncrease += 15;
        }

        return {
            hasMutations: mutations.length > 0,
            mutations,
            signals,
            riskIncrease: Math.min(riskIncrease, 100),
        };
    }

    /**
     * Get cache size (for diagnostics).
     */
    public size(): number {
        return this.cache.size;
    }

    /**
     * Clear the entire cache.
     */
    public clear(): void {
        this.cache.clear();
        this.accessOrder = [];
    }

    /**
     * Evict expired entries.
     */
    public evictExpired(): number {
        const now = Date.now();
        let evicted = 0;

        for (const [ifa, entry] of this.cache.entries()) {
            if (now - entry.lastSeen > this.ttlMs) {
                this.cache.delete(ifa);
                this.removeFromAccessOrder(ifa);
                evicted++;
            }
        }

        return evicted;
    }

    private evictLRU(): void {
        if (this.accessOrder.length > 0) {
            const oldest = this.accessOrder.shift()!;
            this.cache.delete(oldest);
        }
    }

    private touchAccessOrder(ifa: string): void {
        this.removeFromAccessOrder(ifa);
        this.accessOrder.push(ifa);
    }

    private removeFromAccessOrder(ifa: string): void {
        const idx = this.accessOrder.indexOf(ifa);
        if (idx !== -1) {
            this.accessOrder.splice(idx, 1);
        }
    }

    private parseVersion(version: string): number | null {
        const parts = version.split('.').map(Number);
        if (parts.length === 0 || isNaN(parts[0])) return null;
        const major = parts[0];
        const minor = parts.length > 1 && !isNaN(parts[1]) ? parts[1] : 0;
        return major + minor / 100;
    }
}
