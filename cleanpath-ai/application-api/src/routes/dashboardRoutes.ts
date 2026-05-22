
import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();
const controller = new DashboardController();

// CTV Integrity Stats
router.get('/ctv/stats', controller.getCTVStats.bind(controller));

// ML Model Performance
router.get('/ml/metrics', controller.getMLMetrics.bind(controller));

// CTV Device Explorer
router.get('/ctv/devices', controller.getCTVDevices.bind(controller));

// Budget Guardian Aggregator
router.get('/budget-guardian', controller.getBudgetGuardianData.bind(controller));

// Bid Genius Aggregator
router.get('/bid-genius', controller.getBidGeniusData.bind(controller));

export default router;
