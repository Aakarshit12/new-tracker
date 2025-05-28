import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import dynamic from 'next/dynamic';

// Dynamically import the MapComponent with no SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 flex items-center justify-center">Loading map...</div>
});

type Order = {
  _id: string;
  orderNumber: string;
  vendor: {
    _id: string;
    name: string;
  };
  deliveryPartner?: {
    _id: string;
    name: string;
  };
  status: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  totalAmount: number;
  createdAt: string;
};

type Location = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
};

const CustomerDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<Location | null>(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  // Check if user is authenticated and is a customer
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'customer') {
      router.push('/');
    }
  }, [user, router]);

  // Fetch customer orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/customer`,
          config
        );
        
        setOrders(response.data.data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);

  // Setup socket event listeners for location updates
  useEffect(() => {
    if (!socket || !selectedOrder) return;
    
    // Join the order room
    socket.emit('order:join', { orderId: selectedOrder._id });
    
    // Listen for location updates
    socket.on('location:updated', (data: { orderId: string, location: Location }) => {
      if (data.orderId === selectedOrder._id) {
        setDeliveryLocation(data.location);
      }
    });
    
    // Listen for delivery status updates
    socket.on('delivery:status', (data: { orderId: string, status: string }) => {
      if (data.orderId === selectedOrder._id) {
        // Update order status
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === data.orderId
              ? { ...order, status: data.status }
              : order
          )
        );
        
        // Update selected order if it's the current one
        setSelectedOrder(prev =>
          prev && prev._id === data.orderId
            ? { ...prev, status: data.status }
            : prev
        );
        
        // If the order is delivered, stop tracking
        if (data.status === 'delivered') {
          setIsTrackingActive(false);
        }
      }
    });
    
    return () => {
      // Leave the order room and remove listeners
      socket.emit('order:leave', { orderId: selectedOrder._id });
      socket.off('location:updated');
      socket.off('delivery:status');
    };
  }, [socket, selectedOrder]);

  // Get delivery location for selected order
  const fetchDeliveryLocation = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/customer/${orderId}/location`,
        config
      );
      
      if (response.data.success) {
        setDeliveryLocation(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching delivery location:', error);
    }
  };

  // Handle track order button click
  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    
    if (order.status === 'in_transit') {
      setIsTrackingActive(true);
      fetchDeliveryLocation(order._id);
    } else {
      setIsTrackingActive(false);
      setDeliveryLocation(null);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'customer') {
    return null;
  }

  return (
    <Layout title="Customer Dashboard">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Customer Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Your Orders</h2>
              </div>
              
              <div className="card-body">
                {loading ? (
                  <p className="text-center py-4">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-center py-4">No orders found.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className={`p-4 border rounded-lg ${
                          selectedOrder?._id === order._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{order.orderNumber}</h3>
                            <p className="text-sm text-gray-600">
                              Vendor: {order.vendor?.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Delivery: {order.deliveryPartner?.name || 'Not assigned'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Amount: ${order.totalAmount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Date: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        
                        {order.status === 'in_transit' && (
                          <button
                            className="mt-3 w-full btn btn-primary text-sm"
                            onClick={() => handleTrackOrder(order)}
                          >
                            Track Delivery
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Map Section */}
          <div className="lg:col-span-2">
            {isTrackingActive && selectedOrder ? (
              <div className="card">
                <div className="card-header bg-primary-100">
                  <h2 className="text-xl font-semibold text-primary-800">
                    Tracking Order #{selectedOrder.orderNumber}
                  </h2>
                </div>
                
                <div className="card-body p-0">
                  <div className="h-96">
                    <MapComponent 
                      deliveryLocation={deliveryLocation ? 
                        [deliveryLocation.coordinates.latitude, deliveryLocation.coordinates.longitude] : 
                        undefined
                      }
                      destinationLocation={[40.7128, -74.006]} // Example destination (should be geocoded from the address)
                    />
                  </div>
                  
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Delivery Status</h3>
                        <p className="text-sm text-gray-600">
                          {selectedOrder.deliveryPartner?.name || 'Driver'} is on the way
                        </p>
                        {deliveryLocation && (
                          <p className="text-xs text-gray-500">
                            Last updated: {new Date(deliveryLocation.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Active Tracking</h3>
                  <p className="text-gray-500 mb-4">
                    Select an order in transit to track its delivery in real-time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;
