import React, { useState, useEffect } from 'react';
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
  deliveryPartner?: {
    _id: string;
    name: string;
  };
  status: string;
  totalAmount: number;
  createdAt: string;
};

type DeliveryPartner = {
  _id: string;
  name: string;
  email: string;
};

const VendorDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState<string>('');
  
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();

  // Check if user is authenticated and is a vendor
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'vendor') {
      router.push('/');
    }
  }, [user, router]);

  // Fetch orders and delivery partners
  useEffect(() => {
    const fetchData = async () => {
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
        
        // Fetch orders
        const ordersResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/vendors/orders`,
          config
        );
        
        // Fetch delivery partners
        const partnersResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/vendors/delivery-partners`,
          config
        );
        
        setOrders(ordersResponse.data.data);
        setDeliveryPartners(partnersResponse.data.data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Listen for delivery status updates
    socket.on('delivery:status', (data: { orderId: string, status: string }) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === data.orderId 
            ? { ...order, status: data.status } 
            : order
        )
      );
    });
    
    return () => {
      socket.off('delivery:status');
    };
  }, [socket]);

  // Handle assigning delivery partner to order
  const handleAssignDelivery = async () => {
    if (!selectedOrder || !selectedDeliveryPartner) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/vendors/orders/${selectedOrder._id}/assign`,
        { deliveryPartnerId: selectedDeliveryPartner },
        config
      );
      
      // Update orders state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === selectedOrder._id
            ? { 
                ...order, 
                status: 'assigned',
                deliveryPartner: deliveryPartners.find(dp => dp._id === selectedDeliveryPartner)
              }
            : order
        )
      );
      
      // Reset selection
      setSelectedOrder(null);
      setSelectedDeliveryPartner('');
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign delivery partner');
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

  if (!user || user.role !== 'vendor') {
    return null;
  }

  return (
    <Layout title="Vendor Dashboard">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Order Management */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Order Management</h2>
          </div>
          
          <div className="card-body overflow-x-auto">
            {loading ? (
              <p className="text-center py-4">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-center py-4">No orders found.</p>
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
                      Delivery Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
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
                          {order.deliveryPartner?.name || 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.status === 'pending' && (
                          <button
                            className="text-primary-600 hover:text-primary-900"
                            onClick={() => setSelectedOrder(order)}
                          >
                            Assign Delivery
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
        
        {/* Assign Delivery Partner Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">
                Assign Delivery Partner to Order #{selectedOrder.orderNumber}
              </h3>
              
              <div className="mb-4">
                <label htmlFor="deliveryPartner" className="form-label">
                  Select Delivery Partner
                </label>
                <select
                  id="deliveryPartner"
                  className="form-input"
                  value={selectedDeliveryPartner}
                  onChange={(e) => setSelectedDeliveryPartner(e.target.value)}
                  required
                >
                  <option value="">-- Select a delivery partner --</option>
                  {deliveryPartners.map((partner) => (
                    <option key={partner._id} value={partner._id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedOrder(null);
                    setSelectedDeliveryPartner('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAssignDelivery}
                  disabled={!selectedDeliveryPartner}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VendorDashboard;
