import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/user.model';
import Location from '../models/location.model';

interface JwtPayload {
  id: string;
  role: UserRole;
}

// Setup Socket.IO event handlers
export const setupSocketHandlers = (io: Server): void => {
  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_jwt_secret_key'
      ) as JwtPayload;
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user data to socket
      socket.data.user = {
        id: user._id.toString(),
        role: user.role
      };
      
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Handle connection
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);
    
    // Join room based on user role
    if (socket.data.user) {
      const { id, role } = socket.data.user;
      
      if (role === UserRole.DELIVERY) {
        socket.join(`delivery:${id}`);
      } else if (role === UserRole.CUSTOMER) {
        socket.join(`customer:${id}`);
      } else if (role === UserRole.VENDOR) {
        socket.join(`vendor:${id}`);
      }
    }
    
    // Handle location update
    socket.on('location:update', async (data: { orderId: string, coordinates: { latitude: number, longitude: number } }) => {
      try {
        if (!socket.data.user || socket.data.user.role !== UserRole.DELIVERY) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }
        
        const { orderId, coordinates } = data;
        const deliveryPartnerId = socket.data.user.id;
        
        // Save location to database
        const location = await Location.create({
          user: deliveryPartnerId,
          order: orderId,
          coordinates,
          timestamp: new Date()
        });
        
        // Get order details to find customer
        const order = await require('../models/order.model').default.findById(orderId);
        if (order) {
          // Emit to customer tracking this order
          io.to(`customer:${order.customer.toString()}`).emit('location:updated', {
            orderId,
            location: {
              coordinates,
              timestamp: location.timestamp
            }
          });
          
          // Emit to vendor
          io.to(`vendor:${order.vendor.toString()}`).emit('location:updated', {
            orderId,
            location: {
              coordinates,
              timestamp: location.timestamp
            }
          });
        }
        
      } catch (error) {
        console.error('Socket location update error:', error);
        socket.emit('error', { message: 'Error updating location' });
      }
    });
    
    // Handle delivery status update
    socket.on('delivery:status', async (data: { orderId: string, status: string }) => {
      try {
        if (!socket.data.user || socket.data.user.role !== UserRole.DELIVERY) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }
        
        const { orderId, status } = data;
        
        // Get order details to find customer
        const order = await require('../models/order.model').default.findById(orderId);
        if (order) {
          // Emit to customer tracking this order
          io.to(`customer:${order.customer.toString()}`).emit('delivery:status', {
            orderId,
            status
          });
          
          // Emit to vendor
          io.to(`vendor:${order.vendor.toString()}`).emit('delivery:status', {
            orderId,
            status
          });
        }
        
      } catch (error) {
        console.error('Socket delivery status error:', error);
        socket.emit('error', { message: 'Error updating delivery status' });
      }
    });
    
    // Handle join order room
    socket.on('order:join', (data: { orderId: string }) => {
      const { orderId } = data;
      socket.join(`order:${orderId}`);
    });
    
    // Handle leave order room
    socket.on('order:leave', (data: { orderId: string }) => {
      const { orderId } = data;
      socket.leave(`order:${orderId}`);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
