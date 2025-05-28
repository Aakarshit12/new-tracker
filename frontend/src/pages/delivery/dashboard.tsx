import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

type Order = {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
  };
  vendor: {
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

const DeliveryDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const router = useRouter();

  // Check if user is authenticated and is a delivery partner
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'delivery') {
      router.push('/');
    }
  }, [user, router]);

  // Fetch assigned orders
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
          `${process.env.NEXT_PUBLIC_API_URL}/delivery/orders`,
          config
        );
        
        setOrders(response.data.data);
        
        // Check if there's an active order (in transit)
        const activeOrder = response.data.data.find((order: Order) => order.status === 'in_transit');
        if (activeOrder) {
          setActiveOrder(activeOrder);
          setLocationTrackingEnabled(true);
          startLocationTracking(activeOrder._id);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);

  // Cleanup location tracking on unmount
  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);

  // Get the current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // If geolocation fails, use a simulated location
          simulateLocation();
        }
      );
    } else {
      // If geolocation is not supported, use a simulated location
      simulateLocation();
    }
  };

  // Simulate a location (for demo purposes)
  const simulateLocation = () => {
    // Generate a random location near a city center (e.g., New York City)
    const baseLatitude = 40.7128;
    const baseLongitude = -74.006;
    
    // Add some random variation (within about 5km)
    const latVariation = (Math.random() - 0.5) * 0.05;
    const lngVariation = (Math.random() - 0.5) * 0.05;
    
    setCurrentLocation({
      latitude: baseLatitude + latVariation,
      longitude: baseLongitude + lngVariation
    });
  };

  // Start location tracking for an order
  const startLocationTracking = (orderId: string) => {
    // Get initial location
    getCurrentLocation();
    
    // Setup interval to update location every few seconds
    locationIntervalRef.current = setInterval(() => {
      getCurrentLocation();
      
      // Send location update to server via Socket.IO if we have a location
      if (socket && connected && currentLocation) {
        socket.emit('location:update', {
          orderId,
          coordinates: currentLocation
        });
      }
    }, 3000); // Update every 3 seconds
  };

  // Start delivery for an order
  const handleStartDelivery = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Get current location
      getCurrentLocation();
      
      // Start delivery API call
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/orders/${orderId}/start`,
        { coordinates: currentLocation },
        config
      );
      
      // Update order status locally
      const order = orders.find(o => o._id === orderId);
      if (order) {
        order.status = 'in_transit';
        setActiveOrder(order);
        
        // Update orders state
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'in_transit' } : o));
        
        // Start location tracking
        setLocationTrackingEnabled(true);
        startLocationTracking(orderId);
        
        // Emit status update via socket
        if (socket && connected) {
          socket.emit('delivery:status', {
            orderId,
            status: 'in_transit'
          });
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to start delivery');
    }
  };

  // Complete delivery for an order
  const handleCompleteDelivery = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Complete delivery API call
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/delivery/orders/${orderId}/complete`,
        {},
        config
      );
      
      // Update order status locally
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'delivered' } : o));
      
      // Stop location tracking
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
      
      setLocationTrackingEnabled(false);
      setActiveOrder(null);
      
      // Emit status update via socket
      if (socket && connected) {
        socket.emit('delivery:status', {
          orderId,
          status: 'delivered'
        });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to complete delivery');
    }
  };

  // Update location manually (for demo purposes)
  const handleManualLocationUpdate = () => {
    simulateLocation();
    
    if (activeOrder && socket && connected && currentLocation) {
      socket.emit('location:update', {
        orderId: activeOrder._id,
        coordinates: currentLocation
      });
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.role !== 'delivery') {
    return null;
  }

  return (
    <Layout title="Delivery Dashboard">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Delivery Partner Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Active Delivery Section */}
        {activeOrder && (
          <div className="card mb-8">
            <div className="card-header bg-primary-100">
              <h2 className="text-xl font-semibold text-primary-800">Active Delivery</h2>
            </div>
            
            <div className="card-body">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Order #{activeOrder.orderNumber}</h3>
                <p className="text-gray-600">
                  Customer: {activeOrder.customer.name}
                </p>
                <p className="text-gray-600">
                  Vendor: {activeOrder.vendor.name}
                </p>
                <div className="mt-2">
                  <h4 className="font-medium">Delivery Address:</h4>
                  <p className="text-gray-600">
                    {activeOrder.deliveryAddress.street}, {activeOrder.deliveryAddress.city}, {activeOrder.deliveryAddress.state} {activeOrder.deliveryAddress.postalCode}, {activeOrder.deliveryAddress.country}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Your Current Location:</h4>
                {currentLocation ? (
                  <p className="text-gray-600">
                    Latitude: {currentLocation.latitude.toFixed(6)}, Longitude: {currentLocation.longitude.toFixed(6)}
                  </p>
                ) : (
                  <p className="text-gray-600">Acquiring location...</p>
                )}
                
                <div className="mt-2">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleManualLocationUpdate}
                  >
                    Simulate Location Update
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <button 
                  className="btn btn-success"
                  onClick={() => handleCompleteDelivery(activeOrder._id)}
                >
                  Complete Delivery
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Assigned Orders */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Assigned Orders</h2>
          </div>
          
          <div className="card-body overflow-x-auto">
            {loading ? (
              <p className="text-center py-4">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-center py-4">No orders assigned to you.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.customer?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.vendor?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.deliveryAddress.city}, {order.deliveryAddress.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.status === 'assigned' && (
                          <button
                            className="text-primary-600 hover:text-primary-900"
                            onClick={() => handleStartDelivery(order._id)}
                          >
                            Start Delivery
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryDashboard;
