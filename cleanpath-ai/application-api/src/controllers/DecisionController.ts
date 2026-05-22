
import { Request, Response } from 'express';
import { query } from '../database/db';

export class DecisionController {

    // GET /api/decisions - Paginated decision log
    getDecisions = async (req: Request, res: Response) => {
        try {
            const {
                publisher_id,
                decision,
                start_date,
                end_date,
                page = 1,
                limit = 50
            } = req.query;

            let whereClause = 'WHERE 1=1';
            const params: any[] = [];
            let paramCount = 1;

            if (publisher_id) {
                whereClause += ` AND publisher_id = $${paramCount}`;
                params.push(publisher_id);
                paramCount++;
            }

            if (decision) {
                whereClause += ` AND decision = $${paramCount}`;
                params.push(decision);
                paramCount++;
            }

            if (start_date) {
                whereClause += ` AND timestamp >= $${paramCount}`;
                params.push(start_date);
                paramCount++;
            }

            if (end_date) {
                whereClause += ` AND timestamp <= $${paramCount}`;
                params.push(end_date);
                paramCount++;
            }

            const offset = (Number(page) - 1) * Number(limit);

            const countResult = await query(
                `SELECT COUNT(*) FROM decisions ${whereClause}`,
                params
            );

            const total = parseInt(countResult.rows[0].count);

            const result = await query(
                `SELECT * FROM decisions 
         ${whereClause} 
         ORDER BY timestamp DESC 
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
                [...params, limit, offset]
            );

            res.json({
                data: result.rows,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Error fetching decisions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // GET /api/decisions/stats - Aggregate metrics
    getStats = async (req: Request, res: Response) => {
        try {
            // Basic stats: total, block rate, avg thermal score
            // For a real app, this might be optimized or cached

            const result = await query(`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN decision = 'BLOCK' THEN 1 END) as blocked_requests,
          AVG(thermal_score) as avg_thermal_score,
          AVG(latency_ms) as avg_latency
        FROM decisions
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `);

            const stats = result.rows[0];
            const blockRate = stats.total_requests > 0
                ? (parseInt(stats.blocked_requests) / parseInt(stats.total_requests)) * 100
                : 0;

            res.json({
                period: '24h',
                total_requests: parseInt(stats.total_requests),
                blocked_requests: parseInt(stats.blocked_requests),
                block_rate: parseFloat(blockRate.toFixed(2)),
                avg_thermal_score: parseFloat(parseFloat(stats.avg_thermal_score || '0').toFixed(1)),
                avg_latency: parseFloat(parseFloat(stats.avg_latency || '0').toFixed(1))
            });
        } catch (error) {
            console.error('Error fetching decision stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST /api/decisions - Record a single decision
    recordDecision = async (req: Request, res: Response) => {
        try {
            const {
                request_id,
                publisher_id,
                domain,
                decision,
                thermal_score,
                risk_level,
                latency_ms,
                block_reason,
                signals
            } = req.body;

            const result = await query(
                `INSERT INTO decisions (
                    request_id, publisher_id, domain, decision, 
                    thermal_score, risk_level, latency_ms, 
                    block_reason, signals, timestamp
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
                RETURNING id`,
                [
                    request_id,
                    publisher_id,
                    domain,
                    decision,
                    thermal_score,
                    risk_level,
                    latency_ms,
                    block_reason,
                    JSON.stringify(signals || [])
                ]
            );

            res.status(201).json({ id: result.rows[0].id });
        } catch (error) {
            console.error('Error recording decision:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
