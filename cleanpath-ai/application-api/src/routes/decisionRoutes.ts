
import { Router } from 'express';
import { DecisionController } from '../controllers/DecisionController';

const router = Router();
const controller = new DecisionController();

// Decision routes
router.get('/', controller.getDecisions);
router.get('/stats', controller.getStats);
router.post('/', controller.recordDecision);

export default router;
