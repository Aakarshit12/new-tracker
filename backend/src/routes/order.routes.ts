import { Router } from 'express';
import { getOrderDetails, getCustomerOrders, getDeliveryLocation, createOrder } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Routes for customers
router.get('/customer', authorize(UserRole.CUSTOMER), getCustomerOrders);
router.get('/customer/:id', authorize(UserRole.CUSTOMER), getOrderDetails);
router.get('/customer/:id/location', authorize(UserRole.CUSTOMER), getDeliveryLocation);
router.post('/customer', authorize(UserRole.CUSTOMER), createOrder);

export default router;
