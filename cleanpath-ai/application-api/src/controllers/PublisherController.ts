import { Request, Response } from 'express';
import { query } from '../database/db';

export class PublisherController {

    // POST /api/publishers
    createPublisher = async (req: Request, res: Response): Promise<void> => {
        try {
            const { domain, status, thermal_score, risk_level } = req.body;

            const result = await query(
                `INSERT INTO publishers (domain, status, thermal_score, risk_level) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
                [domain, status || 'active', thermal_score || 0, risk_level || 'low']
            );

            res.status(201).json(result.rows[0]);
        } catch (error: any) {
            console.error('Error creating publisher:', error);
            if (error.code === '23505') { // Unique constraint violation implementation detail for pg
                res.status(409).json({ error: 'Publisher with this domain already exists' });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // GET /api/publishers/:id
    getPublisher = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await query('SELECT * FROM publishers WHERE id = $1', [id]);

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Publisher not found' });
                return;
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching publisher:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // PUT /api/publishers/:id - Update thermal overrides or status
    updatePublisher = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { status, thermal_score, risk_level, domain } = req.body;

            // Dynamic update query builder could be better, but for MVP:
            const result = await query(
                `UPDATE publishers 
         SET status = COALESCE($1, status),
             thermal_score = COALESCE($2, thermal_score),
             risk_level = COALESCE($3, risk_level),
             domain = COALESCE($4, domain),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
                [status, thermal_score, risk_level, domain, id]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Publisher not found' });
                return;
            }

            res.json(result.rows[0]);
        } catch (error: any) {
            console.error('Error updating publisher:', error);
            if (error.code === '23505') {
                res.status(409).json({ error: 'Publisher domain conflict' });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // DELETE /api/publishers/:id
    deletePublisher = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await query('DELETE FROM publishers WHERE id = $1 RETURNING id', [id]);

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Publisher not found' });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting publisher:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
