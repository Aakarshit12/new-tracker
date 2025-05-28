import { Request, Response } from 'express';
import Order, { OrderStatus } from '../models/order.model';
import Location from '../models/location.model';

// Get order details for a customer
export const getOrderDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customerId = (req as any).user.id;
    
    const order = await Order.findOne({ _id: id, customer: customerId })
      .populate('vendor', 'name email')
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

// Get customer orders
export const getCustomerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = (req as any).user.id;
    
    const orders = await Order.find({ customer: customerId })
      .populate('vendor', 'name')
      .populate('deliveryPartner', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get delivery partner location for an order
export const getDeliveryLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customerId = (req as any).user.id;
    
    // Check if order exists and belongs to the customer
    const order = await Order.findOne({ 
      _id: id, 
      customer: customerId,
      status: OrderStatus.IN_TRANSIT
    });
    
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or not in transit' });
      return;
    }
    
    // Get the latest location
    const location = await Location.findOne({ order: id })
      .sort({ timestamp: -1 });
    
    if (!location) {
      res.status(404).json({ success: false, message: 'Location not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Get delivery location error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new order (for demo purposes)
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = (req as any).user.id;
    const { vendorId, items, totalAmount, deliveryAddress } = req.body;
    
    const order = await Order.create({
      customer: customerId,
      vendor: vendorId,
      items,
      totalAmount,
      deliveryAddress,
      status: OrderStatus.PENDING
    });
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
