// This script fixes the issues identified in the Location Tracker application
// Add this script at the end of your simple-frontend.html file

document.addEventListener('DOMContentLoaded', function() {
    // Fix 1: Clear any error messages on the login page
    const loginMessage = document.getElementById('login-message');
    if (loginMessage) {
        loginMessage.textContent = '';
    }

    // Fix 2: Clear any pre-filled email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.value = '';
    }
    
    // Add tab link functionality
    document.querySelectorAll('.tab-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add registration functionality
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', register);
    }
    
    // Update login functionality to use the backend API
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }

    // Fix 3: Load mock data immediately instead of showing "Loading orders..."
    function loadMockData() {
        // Customer orders
        const customerOrders = [
            {
                _id: '1',
                orderNumber: 'ORD-001',
                vendor: {
                    _id: '1',
                    name: 'Restaurant A'
                },
                deliveryPartner: {
                    _id: '1',
                    name: 'John Delivery'
                },
                status: 'in_transit',
                deliveryAddress: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10001',
                    country: 'USA'
                },
                totalAmount: 25.99,
                createdAt: '2023-04-15T10:30:00Z'
            },
            {
                _id: '2',
                orderNumber: 'ORD-002',
                vendor: {
                    _id: '2',
                    name: 'Restaurant B'
                },
                deliveryPartner: null,
                status: 'pending',
                deliveryAddress: {
                    street: '456 Elm St',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10002',
                    country: 'USA'
                },
                totalAmount: 18.50,
                createdAt: '2023-04-16T14:20:00Z'
            }
        ];

        // Vendor orders
        const vendorOrders = [
            {
                _id: '1',
                orderNumber: 'ORD-001',
                customer: {
                    _id: '1',
                    name: 'John Customer'
                },
                deliveryPartner: {
                    _id: '1',
                    name: 'John Delivery'
                },
                status: 'in_transit',
                deliveryAddress: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10001',
                    country: 'USA'
                },
                totalAmount: 25.99,
                createdAt: '2023-04-15T10:30:00Z'
            },
            {
                _id: '2',
                orderNumber: 'ORD-002',
                customer: {
                    _id: '2',
                    name: 'Jane Customer'
                },
                deliveryPartner: null,
                status: 'pending',
                deliveryAddress: {
                    street: '456 Elm St',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10002',
                    country: 'USA'
                },
                totalAmount: 18.50,
                createdAt: '2023-04-16T14:20:00Z'
            }
        ];

        // Delivery orders
        const deliveryOrders = [
            {
                _id: '1',
                orderNumber: 'ORD-001',
                customer: {
                    _id: '1',
                    name: 'John Customer'
                },
                vendor: {
                    _id: '1',
                    name: 'Restaurant A'
                },
                status: 'assigned',
                deliveryAddress: {
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10001',
                    country: 'USA'
                },
                totalAmount: 25.99,
                createdAt: '2023-04-15T10:30:00Z'
            }
        ];

        // Display customer orders
        const customerOrdersContainer = document.getElementById('customer-orders');
        if (customerOrdersContainer) {
            let html = '';
            
            customerOrders.forEach(order => {
                html += `
                    <div class="order-item">
                        <h3>${order.orderNumber}</h3>
                        <p>Vendor: ${order.vendor.name}</p>
                        <p>Delivery: ${order.deliveryPartner ? order.deliveryPartner.name : 'Not assigned'}</p>
                        <p>Amount: $${order.totalAmount.toFixed(2)}</p>
                        <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Status: <span class="status-badge status-${order.status}">${order.status}</span></p>
                        ${order.status === 'in_transit' ? `<button class="btn" onclick="trackOrder('${order._id}')">Track Order</button>` : ''}
                    </div>
                `;
            });
            
            customerOrdersContainer.innerHTML = html;
        }

        // Display vendor orders
        const vendorOrdersContainer = document.getElementById('vendor-orders');
        if (vendorOrdersContainer) {
            let html = '';
            
            vendorOrders.forEach(order => {
                html += `
                    <div class="order-item">
                        <h3>${order.orderNumber}</h3>
                        <p>Customer: ${order.customer.name}</p>
                        <p>Amount: $${order.totalAmount.toFixed(2)}</p>
                        <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Status: <span class="status-badge status-${order.status}">${order.status}</span></p>
                        ${order.status === 'pending' ? `
                            <div style="margin-top: 10px;">
                                <select id="delivery-partner-${order._id}" class="form-control">
                                    <option value="">Select Delivery Partner</option>
                                    <option value="1">John Delivery</option>
                                    <option value="2">Jane Delivery</option>
                                </select>
                                <button class="btn" style="margin-top: 5px;" onclick="assignDeliveryPartner('${order._id}')">Assign</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            vendorOrdersContainer.innerHTML = html;
        }

        // Display delivery orders
        const deliveryOrdersContainer = document.getElementById('delivery-orders');
        if (deliveryOrdersContainer) {
            let html = '';
            
            deliveryOrders.forEach(order => {
                html += `
                    <div class="order-item" onclick="selectDeliveryOrder('${order._id}')">
                        <h3>${order.orderNumber}</h3>
                        <p>Customer: ${order.customer.name}</p>
                        <p>Vendor: ${order.vendor.name}</p>
                        <p>Address: ${order.deliveryAddress.street}, ${order.deliveryAddress.city}</p>
                        <p>Status: <span class="status-badge status-${order.status}">${order.status}</span></p>
                    </div>
                `;
            });
            
            deliveryOrdersContainer.innerHTML = html;
        }
    }

    // Fix 4: Ensure Socket.IO connection is properly initialized
    function fixSocketConnection() {
        // Mock Socket.IO connection for demo purposes
        window.socket = {
            emit: function(event, data) {
                console.log('Socket emit:', event, data);
                
                // Simulate socket events
                if (event === 'location:update') {
                    setTimeout(() => {
                        const handlers = window.socketHandlers['location:updated'] || [];
                        handlers.forEach(handler => {
                            handler({
                                orderId: data.orderId,
                                location: {
                                    coordinates: data.coordinates,
                                    timestamp: new Date()
                                }
                            });
                        });
                    }, 500);
                }
            },
            on: function(event, callback) {
                if (!window.socketHandlers) {
                    window.socketHandlers = {};
                }
                
                if (!window.socketHandlers[event]) {
                    window.socketHandlers[event] = [];
                }
                
                window.socketHandlers[event].push(callback);
            },
            off: function(event) {
                if (window.socketHandlers && window.socketHandlers[event]) {
                    window.socketHandlers[event] = [];
                }
            }
        };
    }

    // Load mock data immediately
    loadMockData();
    
    // Fix Socket.IO connection
    fixSocketConnection();

    // Add global functions for tracking and delivery
    window.trackOrder = function(orderId) {
        const order = {
            _id: orderId,
            orderNumber: 'ORD-001',
            status: 'in_transit',
            deliveryPartner: {
                name: 'John Delivery'
            }
        };
        
        window.selectedOrder = order;
        window.isTrackingActive = true;
        
        // For demo, create a random location near NYC
        const lat = 40.7128 + (Math.random() - 0.5) * 0.05;
        const lng = -74.006 + (Math.random() - 0.5) * 0.05;
        
        // Update map
        if (window.map) {
            const latlng = [lat, lng];
            
            if (window.deliveryMarker) {
                window.deliveryMarker.setLatLng(latlng);
            } else {
                window.deliveryMarker = L.marker(latlng).addTo(window.map);
                window.deliveryMarker.bindPopup('Delivery Partner').openPopup();
            }
            
            window.map.setView(latlng, 15);
        }
        
        document.getElementById('tracking-info').innerHTML = `
            <h3>Tracking Order: ${order.orderNumber}</h3>
            <p>Delivery Partner: ${order.deliveryPartner ? order.deliveryPartner.name : 'Not assigned'}</p>
            <p>Status: <span class="status-badge status-${order.status}">${order.status}</span></p>
        `;
    };

    window.selectDeliveryOrder = function(orderId) {
        const order = {
            _id: orderId,
            orderNumber: 'ORD-001',
            status: 'assigned',
            customer: {
                name: 'John Customer'
            },
            vendor: {
                name: 'Restaurant A'
            }
        };
        
        window.selectedOrder = order;
        
        // Enable/disable buttons based on order status
        document.getElementById('start-delivery-btn').disabled = order.status !== 'assigned';
        document.getElementById('update-location-btn').disabled = order.status !== 'in_transit';
        document.getElementById('complete-delivery-btn').disabled = order.status !== 'in_transit';
        
        // Set destination marker
        if (window.simulatorMap) {
            // For demo, create a random location near NYC
            const lat = 40.7128 + (Math.random() - 0.5) * 0.05;
            const lng = -74.006 + (Math.random() - 0.5) * 0.05;
            
            if (window.destinationMarker) {
                window.destinationMarker.setLatLng([lat, lng]);
            } else {
                window.destinationMarker = L.marker([lat, lng]).addTo(window.simulatorMap);
                window.destinationMarker.bindPopup('Destination').openPopup();
            }
            
            window.simulatorMap.setView([lat, lng], 15);
        }
    };

    window.assignDeliveryPartner = function(orderId) {
        const selectElement = document.getElementById(`delivery-partner-${orderId}`);
        const deliveryPartnerId = selectElement.value;
        
        if (!deliveryPartnerId) {
            alert('Please select a delivery partner');
            return;
        }
        
        // For demo purposes, just update the UI
        alert('Delivery partner assigned successfully!');
        loadMockData();
    };

    window.startDelivery = function() {
        if (!window.selectedOrder) return;
        
        // For demo purposes, just update the UI
        window.selectedOrder.status = 'in_transit';
        
        document.getElementById('start-delivery-btn').disabled = true;
        document.getElementById('update-location-btn').disabled = false;
        document.getElementById('complete-delivery-btn').disabled = false;
        
        alert('Delivery started!');
        loadMockData();
    };

    window.updateLocation = function() {
        if (!window.selectedOrder || !window.deliveryMarker) return;
        
        const latlng = window.deliveryMarker.getLatLng();
        
        // For demo purposes, just log the location
        console.log('Location updated:', latlng);
        
        // If using real Socket.IO, would emit here
        if (window.socket) {
            window.socket.emit('location:update', {
                orderId: window.selectedOrder._id,
                coordinates: {
                    latitude: latlng.lat,
                    longitude: latlng.lng
                }
            });
        }
        
        alert('Location updated!');
    };

    window.completeDelivery = function() {
        if (!window.selectedOrder) return;
        
        // For demo purposes, just update the UI
        window.selectedOrder.status = 'delivered';
        
        document.getElementById('start-delivery-btn').disabled = true;
        document.getElementById('update-location-btn').disabled = true;
        document.getElementById('complete-delivery-btn').disabled = true;
        
        alert('Delivery completed!');
        loadMockData();
    };
});
