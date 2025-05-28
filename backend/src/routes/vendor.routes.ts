import { Router } from 'express';
import { getVendorOrders, getOrderDetails, assignDeliveryPartner, getDeliveryPartners } from '../controllers/vendor.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(authorize(UserRole.VENDOR));

// Get all orders for a vendor
router.get('/orders', getVendorOrders);

// Get specific order details
router.get('/orders/:id', getOrderDetails);

// Assign delivery partner to an order
router.put('/orders/:id/assign', assignDeliveryPartner);

// Get all available delivery partners
router.get('/delivery-partners', getDeliveryPartners);

export default router;
