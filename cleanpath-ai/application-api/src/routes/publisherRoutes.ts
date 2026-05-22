
import { Router } from 'express';
import { PublisherController } from '../controllers/PublisherController';

const router = Router();
const controller = new PublisherController();

// Basic CRUD routes
router.post('/', controller.createPublisher);
router.get('/:id', controller.getPublisher);
router.put('/:id', controller.updatePublisher); // Or PATCH
router.delete('/:id', controller.deletePublisher);

export default router;
