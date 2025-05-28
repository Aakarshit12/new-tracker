import { Request, Response } from 'express';
import Order, { OrderStatus } from '../models/order.model';
import Location from '../models/location.model';

// Get assigned orders for a delivery partner
export const getAssignedOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const deliveryPartnerId = (req as any).user.id;
    
    const orders = await Order.find({ 
      deliveryPartner: deliveryPartnerId,
      status: { $in: [OrderStatus.ASSIGNED, OrderStatus.IN_TRANSIT] }
    })
      .populate('customer', 'name')
      .populate('vendor', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get assigned orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Start delivery for an order
export const startDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deliveryPartnerId = (req as any).user.id;
    const { coordinates } = req.body;
    
    // Check if order exists and is assigned to the delivery partner
    const order = await Order.findOne({ 
      _id: id, 
      deliveryPartner: deliveryPartnerId,
      status: OrderStatus.ASSIGNED
    });
    
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
      return;
    }
    
    // Update order status and start time
    order.status = OrderStatus.IN_TRANSIT;
    order.startTime = new Date();
    await order.save();
    
    // Create initial location entry
    if (coordinates) {
      await Location.create({
        user: deliveryPartnerId,
        order: id,
        coordinates,
        timestamp: new Date()
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Delivery started successfully',
      data: order
    });
  } catch (error) {
    console.error('Start delivery error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update delivery location
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deliveryPartnerId = (req as any).user.id;
    const { coordinates } = req.body;
    
    // Check if order exists and is in transit
    const order = await Order.findOne({ 
      _id: id, 
      deliveryPartner: deliveryPartnerId,
      status: OrderStatus.IN_TRANSIT
    });
    
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or not in transit' });
      return;
    }
    
    // Create new location entry
    const location = await Location.create({
      user: deliveryPartnerId,
      order: id,
      coordinates,
      timestamp: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: location
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Complete delivery
export const completeDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deliveryPartnerId = (req as any).user.id;
    
    // Check if order exists and is in transit
    const order = await Order.findOne({ 
      _id: id, 
      deliveryPartner: deliveryPartnerId,
      status: OrderStatus.IN_TRANSIT
    });
    
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or not in transit' });
      return;
    }
    
    // Update order status and delivery time
    order.status = OrderStatus.DELIVERED;
    order.deliveryTime = new Date();
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Delivery completed successfully',
      data: order
    });
  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
