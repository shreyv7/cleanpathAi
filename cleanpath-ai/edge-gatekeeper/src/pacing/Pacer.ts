
export interface Pacer {
    /**
     * persistent state initialization if needed
     */
    init(): Promise<void>;

    /**
     * Check if a request should be allowed based on pacing logic.
     * @param campaignId Unique identifier for the campaign
     * @param estimatedCost Estimated cost of the request (e.g. bid price)
     * @returns true if allowed, false if paced out
     */
    checkPacing(campaignId: string, estimatedCost?: number): Promise<boolean>;
}
