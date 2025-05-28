import { Request, Response } from 'express';
import Order, { OrderStatus } from '../models/order.model';
import User, { UserRole } from '../models/user.model';

// Get all orders for a vendor
export const getVendorOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req as any).user.id;
    
    const orders = await Order.find({ vendor: vendorId })
      .populate('customer', 'name email')
      .populate('deliveryPartner', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get specific order details
export const getOrderDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vendorId = (req as any).user.id;
    
    const order = await Order.findOne({ _id: id, vendor: vendorId })
      .populate('customer', 'name email')
      .populate('deliveryPartner', 'name email');
    
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Assign delivery partner to an order
export const assignDeliveryPartner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { deliveryPartnerId } = req.body;
    const vendorId = (req as any).user.id;
    
    // Check if order exists and belongs to the vendor
    const order = await Order.findOne({ _id: id, vendor: vendorId });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    
    // Check if delivery partner exists
    const deliveryPartner = await User.findOne({ _id: deliveryPartnerId, role: UserRole.DELIVERY });
    if (!deliveryPartner) {
      res.status(404).json({ success: false, message: 'Delivery partner not found' });
      return;
    }
    
    // Update order with delivery partner
    order.deliveryPartner = deliveryPartnerId;
    order.status = OrderStatus.ASSIGNED;
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Delivery partner assigned successfully',
      data: order
    });
  } catch (error) {
    console.error('Assign delivery partner error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all available delivery partners
export const getDeliveryPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const deliveryPartners = await User.find({ role: UserRole.DELIVERY }).select('-password');
    
    res.status(200).json({
      success: true,
      count: deliveryPartners.length,
      data: deliveryPartners
    });
  } catch (error) {
    console.error('Get delivery partners error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
