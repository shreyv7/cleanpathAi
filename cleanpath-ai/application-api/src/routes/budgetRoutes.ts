
import { Router, Request, Response } from 'express';
import { query } from '../database/db';

const router = Router();

// GET /api/budgets?campaign_id=X
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { campaign_id } = req.query;

        if (!campaign_id) {
            // If no campaign_id, fetch all budgets
            const result = await query('SELECT * FROM campaign_budgets', []);
            res.json(result.rows);
            return;
        }

        const result = await query(
            'SELECT * FROM campaign_budgets WHERE campaign_id = $1',
            [campaign_id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Budget not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
});

// POST /api/budgets
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            campaign_id,
            total_budget,
            remaining_budget,
            start_date,
            end_date,
            daily_cap,
            pacing_mode
        } = req.body;

        const result = await query(
            `INSERT INTO campaign_budgets 
            (campaign_id, total_budget, remaining_budget, start_date, end_date, daily_cap, pacing_mode)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (campaign_id) DO UPDATE SET
                total_budget = EXCLUDED.total_budget,
                daily_cap = EXCLUDED.daily_cap,
                pacing_mode = EXCLUDED.pacing_mode,
                updated_at = NOW()
            RETURNING *`,
            [campaign_id, total_budget, remaining_budget || total_budget, start_date, end_date, daily_cap, pacing_mode || 'ASAP']
        );

        res.status(201).json(result.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal error' });
    }
});

export default router;
