import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User, { UserRole } from '../models/user.model';
import Order, { OrderStatus } from '../models/order.model';

/**
 * Seed database with initial demo data
 */
export const seedData = async (): Promise<void> => {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded. Skipping seed process.');
      return;
    }

    console.log('Seeding database with demo data...');

    // Create demo users
    const password = await bcrypt.hash('password123', 10);

    // Vendor
    const vendor = await User.create({
      name: 'Demo Vendor',
      email: 'vendor@example.com',
      password,
      role: UserRole.VENDOR
    });

    // Delivery Partner
    const deliveryPartner = await User.create({
      name: 'Demo Delivery',
      email: 'delivery@example.com',
      password,
      role: UserRole.DELIVERY
    });

    // Customer
    const customer = await User.create({
      name: 'Demo Customer',
      email: 'customer@example.com',
      password,
      role: UserRole.CUSTOMER
    });

    // Create demo orders
    await Order.create({
      customer: customer._id,
      vendor: vendor._id,
      status: OrderStatus.PENDING,
      items: [
        {
          name: 'Pizza',
          quantity: 1,
          price: 15.99
        },
        {
          name: 'Soda',
          quantity: 2,
          price: 2.49
        }
      ],
      totalAmount: 20.97,
      deliveryAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA'
      }
    });

    await Order.create({
      customer: customer._id,
      vendor: vendor._id,
      deliveryPartner: deliveryPartner._id,
      status: OrderStatus.ASSIGNED,
      items: [
        {
          name: 'Burger',
          quantity: 2,
          price: 12.99
        },
        {
          name: 'Fries',
          quantity: 1,
          price: 4.49
        }
      ],
      totalAmount: 30.47,
      deliveryAddress: {
        street: '456 Park Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10002',
        country: 'USA'
      }
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

export default seedData;
