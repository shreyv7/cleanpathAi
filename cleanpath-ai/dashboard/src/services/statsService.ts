import { DecisionStats } from './types';
import { fetchWasteRecovered } from './financialService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-change-in-production';

export async function fetchDecisionStats(): Promise<DecisionStats> {
    const response = await fetch(`${API_BASE_URL}/decisions/stats`, {
        headers: { 'X-API-Key': API_KEY }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch decision stats');
    }
    const data = await response.json() as DecisionStats;

    // Fetch real waste recovered from financial API instead of fake formula
    let wasteSaved = 0;
    try {
        const wasteData = await fetchWasteRecovered();
        wasteSaved = wasteData.totalRecovered;
    } catch {
        // Graceful fallback: estimate from block count if financial API unavailable
        wasteSaved = (data.blocked_requests / 1000) * 2.50;
    }

    return {
        ...data,
        estimated_waste_saved: wasteSaved
    };
}

export async function fetchDecisionLog(page = 1, limit = 50, decision?: string): Promise<any> {
    let url = `${API_BASE_URL}/decisions?page=${page}&limit=${limit}`;
    if (decision) url += `&decision=${decision}`;

    const response = await fetch(url, {
        headers: { 'X-API-Key': API_KEY }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch decision log');
    }
    return response.json();
}

