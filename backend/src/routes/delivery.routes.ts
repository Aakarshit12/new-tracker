import { Router } from 'express';
import { getAssignedOrders, startDelivery, updateLocation, completeDelivery } from '../controllers/delivery.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(authorize(UserRole.DELIVERY));

// Get assigned orders for a delivery partner
router.get('/orders', getAssignedOrders);

// Start delivery for an order
router.put('/orders/:id/start', startDelivery);

// Update delivery location
router.post('/orders/:id/location', updateLocation);

// Complete delivery
router.put('/orders/:id/complete', completeDelivery);

export default router;
