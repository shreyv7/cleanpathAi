
import { Request, Response } from 'express';
import { query } from '../database/db';
import { WorkingMediaCalculator } from '../services/WorkingMediaCalculator';

const calculator = new WorkingMediaCalculator();

/**
 * Controller for Dashboard Aggregated Metrics
 */
export class DashboardController {

    /**
     * Get CTV Integrity Stats
     * Aggregated metrics on spoof detection, signal prevalence, and verdicts.
     */
    async getCTVStats(req: Request, res: Response) {
        // Mock data for now - in production this would query AuditLog aggregated tables
        const stats = {
            totalRequests: 15420,
            spoofRate: 4.8,
            verdictBreakdown: {
                clean: 14200,
                suspicious: 850,
                spoofed: 370
            },
            topSignals: [
                { signal: 'app_bundle_mismatch', count: 150 },
                { signal: 'emulator_detected', count: 95 },
                { signal: 'os_version_mismatch', count: 80 },
                { signal: 'geo_anomaly', count: 45 }
            ],
            recentAlerts: [
                { id: 'alert-1', severity: 'high', message: 'Spike in Emulator traffic from subnet 192.168.x.x', timestamp: Date.now() - 1000 * 60 * 5 },
                { id: 'alert-2', severity: 'medium', message: 'New unknown app bundle "com.fake.hulu"', timestamp: Date.now() - 1000 * 60 * 30 }
            ]
        };
        res.json(stats);
    }

    /**
     * Get ML Model Performance Metrics
     * Metrics on model accuracy, RL agent uplift, and feature importance.
     */
    async getMLMetrics(req: Request, res: Response) {
        // Mock data derived from Shadow Mode simulations
        const metrics = {
            modelAccuracy: 0.94,
            falsePositiveRate: 0.02,
            agentRewardLift: -2.04, // Reflecting current simulation result
            agreementRate: 94.0, // Rule Engine vs Agent
            featureImportance: [
                { feature: 'feat_app_risk_score', importance: 0.35 },
                { feature: 'feat_device_risk_score', importance: 0.25 },
                { feature: 'feat_is_emulator', importance: 0.15 },
                { feature: 'feat_hour_of_day', importance: 0.05 }
            ],
            confidenceDistribution: [
                { range: '0.0-0.1', count: 400 },
                { range: '0.1-0.2', count: 100 },
                { range: '0.2-0.3', count: 50 },
                { range: '0.8-0.9', count: 80 },
                { range: '0.9-1.0', count: 320 }
            ]
        };
        res.json(metrics);
    }

    /**
     * Get CTV Device Explorer Data
     * Paginated list of tracked devices.
     */
    async getCTVDevices(req: Request, res: Response) {
        // Mock device cache
        const devices = [
            { ifa: '8A9D...1234', make: 'Roku', model: 'Ultra', os: 'Roku OS 10.5', ip: '192.168.1.10', riskScore: 10, lastSeen: Date.now(), mutationCount: 0 },
            { ifa: 'B2C1...5678', make: 'Samsung', model: 'Tizen TV', os: 'Tizen 5.0', ip: '10.0.0.5', riskScore: 0, lastSeen: Date.now() - 5000, mutationCount: 0 },
            { ifa: 'FAIL...9999', make: 'Generic', model: 'Android Box', os: 'Android 7.1', ip: '45.32.1.1', riskScore: 95, lastSeen: Date.now() - 120000, mutationCount: 5 },
            { ifa: '7777...8888', make: 'Apple', model: 'Apple TV 4K', os: 'tvOS 15.1', ip: '192.168.1.50', riskScore: 5, lastSeen: Date.now() - 1000, mutationCount: 1 }
        ];
        res.json({
            data: devices,
            total: 4,
            page: 1,
            limit: 20
        });
    }

    /**
     * Get Budget Guardian Unified Data
     * Serves front-end Campaign shape by joining DB tables.
     */
    async getBudgetGuardianData(req: Request, res: Response) {
        try {
            const result = await query('SELECT * FROM campaign_budgets', []);
            const campaigns = result.rows.map((row: any) => ({
                id: row.campaign_id,
                name: 'Campaign ' + row.campaign_id,
                status: true,
                total_budget: Number(row.total_budget) || 0,
                spend: (Number(row.total_budget) || 0) - (Number(row.remaining_budget) || 0),
                committed: 0,
                daily_cap: Number(row.daily_cap) || 0,
                pacing_health: 'healthy',
                pacing_mode: row.pacing_mode || 'SMOOTH',
                flight_start: row.start_date ? row.start_date.toISOString().split('T')[0] : '2026-01-01',
                flight_end: row.end_date ? row.end_date.toISOString().split('T')[0] : '2026-12-31',
                velocity: 0,
                spend_history: Array.from({ length: 24 }, (_, i) => ({
                    hour: i,
                    spend: Math.round(((Number(row.total_budget) || 0) - (Number(row.remaining_budget) || 0)) / 24),
                    target: Math.round((Number(row.total_budget) || 0) / 30 / 24)
                }))
            }));
            
            // Enrich with real Working Media % and Waste Recovered
            for (const campaign of campaigns) {
                const wm = await calculator.computeForCampaign(campaign.id);
                const waste = await calculator.computeWasteRecovered(campaign.id);
                (campaign as any).working_media_percent = wm.workingMediaPercent;
                (campaign as any).waste_recovered = waste.totalRecovered;
            }

            res.json(campaigns);
        } catch (e) {
            console.error('getBudgetGuardianData error:', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Get Bid Genius Unified Data
     * Supplies BidDataPoint arrays and KPI stats.
     */
    async getBidGeniusData(req: Request, res: Response) {
        try {
            const summary = await calculator.getFinancialSummary();
            const waste = await calculator.computeWasteRecovered();

            const stats = {
                totalSavings: waste.totalRecovered,
                avgDiscount: summary.totalSavingsFromShading > 0 ? 15.4 : 0, // Simplified discount metric
                winRate: 78 // Default optimistic
            };

            // Derive 24H history from real decisions
            const historyRes = await query(`
                SELECT 
                    EXTRACT(HOUR FROM created_at) as hour,
                    AVG(bid_value_usd) as avg_market,
                    AVG(shaded_bid_usd) as avg_bid
                FROM decisions_financial
                GROUP BY EXTRACT(HOUR FROM created_at)
                ORDER BY hour
                LIMIT 24
            `, []);

            const historyRows = historyRes.rows;
            let data24H = historyRows.map((row: any) => ({
                time: `${row.hour.toString().padStart(2, "0")}:00`,
                market: parseFloat(Number(row.avg_market || 0).toFixed(2)),
                bid: parseFloat(Number(row.avg_bid || 0).toFixed(2))
            }));

            // Fallback gracefully if database is empty to prevent UI crashing completely, 
            // but log that we are falling back.
            if (data24H.length === 0) {
                console.warn('Bid Genius Data: DB is empty, returning zero-filled history shapes');
                data24H = Array.from({ length: 24 }, (_, i) => ({
                    time: `${i.toString().padStart(2, "0")}:00`, market: 0, bid: 0
                }));
            }
            
            const data1H = data24H.slice(-12); // Just mock 1H using 24H shape for now
            const data7D = [
                { time: 'Mon', market: waste.totalRecovered ? 5 : 0, bid: 4 },
                { time: 'Tue', market: waste.totalRecovered ? 6 : 0, bid: 5 },
                { time: 'Wed', market: waste.totalRecovered ? 5.5 : 0, bid: 4.8 },
            ];

            res.json({ data1H, data24H, data7D, stats });
        } catch (e) {
            console.error('getBidGeniusData error:', e);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
