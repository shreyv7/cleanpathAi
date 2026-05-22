
import { Router } from 'express';
import { GraphController } from '../controllers/GraphController';

const router = Router();
const controller = new GraphController();

/**
 * @route GET /api/graph/path/:publisher_id
 * @desc Fetch supply path topology for a publisher
 */
router.get('/path/:publisher_id', controller.getPublisherGraph);

/**
 * @route GET /api/graph/anomalies
 * @desc Get high-level summary of supply path anomalies across all publishers
 */
router.get('/anomalies', controller.getAnomalies);

export default router;
