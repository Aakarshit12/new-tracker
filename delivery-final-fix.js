// Final comprehensive fix for delivery functionality
document.addEventListener('DOMContentLoaded', function() {
    // Store order locations to keep them consistent
    window.orderLocations = {};
    
    // Override the selectDeliveryOrder function to fix issues
    window.selectDeliveryOrder = function(orderId) {
        console.log('Selecting delivery order:', orderId);
        
        // Find the order in the mock data
        const orderElement = document.querySelector(`.order-item[data-order-id="${orderId}"]`);
        if (!orderElement) {
            console.error('Order element not found for ID:', orderId);
            return;
        }
        
        // Create order object from the element data
        const order = {
            _id: orderId,
            orderNumber: orderElement.querySelector('h3').textContent || 'ORD-00' + orderId,
            status: 'assigned',
            customer: {
                name: (orderElement.querySelector('p:nth-child(2)') || {}).textContent?.replace('Customer: ', '') || 'John Customer'
            },
            vendor: {
                name: (orderElement.querySelector('p:nth-child(3)') || {}).textContent?.replace('Vendor: ', '') || 'Restaurant A'
            },
            address: (orderElement.querySelector('p:nth-child(4)') || {}).textContent?.replace('Address: ', '') || '123 Main St, New York'
        };
        
        // Set as selected order
        window.selectedOrder = order;
        
        // Highlight the selected order
        document.querySelectorAll('#delivery-orders .order-item').forEach(item => {
            item.classList.remove('selected');
        });
        orderElement.classList.add('selected');
        
        // Enable/disable buttons based on order status
        const statusBadge = orderElement.querySelector('.status-badge');
        const orderStatus = statusBadge ? statusBadge.textContent.trim() : 'assigned';
        
        const startBtn = document.getElementById('start-delivery-btn');
        const updateBtn = document.getElementById('update-location-btn');
        const completeBtn = document.getElementById('complete-delivery-btn');
        
        if (startBtn) startBtn.disabled = orderStatus !== 'assigned';
        if (updateBtn) updateBtn.disabled = orderStatus !== 'in_transit';
        if (completeBtn) completeBtn.disabled = orderStatus !== 'in_transit';
        
        // Set destination marker on simulator map
        if (window.simulatorMap) {
            // Use consistent location for each order
            if (!window.orderLocations[orderId]) {
                // Create a random location near NYC for demo
                window.orderLocations[orderId] = {
                    lat: 40.7128 + (Math.random() - 0.5) * 0.05,
                    lng: -74.006 + (Math.random() - 0.5) * 0.05
                };
            }
            
            const location = window.orderLocations[orderId];
            
            // Remove existing marker if it exists
            if (window.destinationMarker && window.simulatorMap.hasLayer(window.destinationMarker)) {
                window.simulatorMap.removeLayer(window.destinationMarker);
            }
            
            // Create a new marker
            window.destinationMarker = L.marker([location.lat, location.lng]).addTo(window.simulatorMap);
            window.destinationMarker.bindPopup('Destination: ' + order.address).openPopup();
            
            window.simulatorMap.setView([location.lat, location.lng], 15);
        }
    };
    
    // Override the startDelivery function
    window.startDelivery = function() {
        if (!window.selectedOrder) {
            alert('Please select an order first');
            return;
        }
        
        console.log('Starting delivery for order:', window.selectedOrder._id);
        
        // Update order status
        window.selectedOrder.status = 'in_transit';
        
        // Update UI
        const startBtn = document.getElementById('start-delivery-btn');
        const updateBtn = document.getElementById('update-location-btn');
        const completeBtn = document.getElementById('complete-delivery-btn');
        
        if (startBtn) startBtn.disabled = true;
        if (updateBtn) updateBtn.disabled = false;
        if (completeBtn) completeBtn.disabled = false;
        
        // Update order status in the list
        const orderElement = document.querySelector(`.order-item[data-order-id="${window.selectedOrder._id}"]`);
        if (orderElement) {
            const statusBadge = orderElement.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = 'in_transit';
                statusBadge.className = 'status-badge status-in_transit';
            }
        }
        
        alert('Delivery started! Click on the map to set your current location.');
    };
    
    // Override the updateLocation function
    window.updateLocation = function() {
        if (!window.selectedOrder) {
            alert('Please select an order first');
            return;
        }
        
        if (window.selectedOrder.status !== 'in_transit') {
            alert('You can only update location for orders in transit');
            return;
        }
        
        if (!window.deliveryMarker) {
            alert('Please click on the map to set your location first');
            return;
        }
        
        const latlng = window.deliveryMarker.getLatLng();
        console.log('Updating location:', latlng);
        
        // For demo purposes, just show an alert
        alert(`Location updated to: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
        
        // Simulate sending location to customer
        if (window.socket) {
            const locationUpdate = {
                orderId: window.selectedOrder._id,
                location: {
                    lat: latlng.lat,
                    lng: latlng.lng
                },
                timestamp: new Date().toISOString()
            };
            
            console.log('Emitting location update:', locationUpdate);
            // In a real app with Socket.IO: socket.emit('location_update', locationUpdate);
        }
    };
    
    // Override the completeDelivery function
    window.completeDelivery = function() {
        if (!window.selectedOrder) {
            alert('Please select an order first');
            return;
        }
        
        if (window.selectedOrder.status !== 'in_transit') {
            alert('You can only complete orders that are in transit');
            return;
        }
        
        console.log('Completing delivery for order:', window.selectedOrder._id);
        
        // Update order status
        window.selectedOrder.status = 'delivered';
        
        // Update UI
        const startBtn = document.getElementById('start-delivery-btn');
        const updateBtn = document.getElementById('update-location-btn');
        const completeBtn = document.getElementById('complete-delivery-btn');
        
        if (startBtn) startBtn.disabled = true;
        if (updateBtn) updateBtn.disabled = true;
        if (completeBtn) completeBtn.disabled = true;
        
        // Update order status in the list
        const orderElement = document.querySelector(`.order-item[data-order-id="${window.selectedOrder._id}"]`);
        if (orderElement) {
            const statusBadge = orderElement.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = 'delivered';
                statusBadge.className = 'status-badge status-delivered';
            }
        }
        
        // Remove markers from map
        if (window.simulatorMap) {
            if (window.deliveryMarker && window.simulatorMap.hasLayer(window.deliveryMarker)) {
                window.simulatorMap.removeLayer(window.deliveryMarker);
                window.deliveryMarker = null;
            }
            
            if (window.destinationMarker && window.simulatorMap.hasLayer(window.destinationMarker)) {
                window.simulatorMap.removeLayer(window.destinationMarker);
                window.destinationMarker = null;
            }
        }
        
        alert('Delivery completed successfully!');
    };
    
    // Override fetchDeliveryOrders to add new orders
    const originalFetchDeliveryOrders = window.fetchDeliveryOrders;
    window.fetchDeliveryOrders = function() {
        // Create mock orders including a new one
        const mockOrders = [
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
            },
            {
                _id: '2',
                orderNumber: 'ORD-002',
                customer: {
                    _id: '2',
                    name: 'Jane Customer'
                },
                vendor: {
                    _id: '2',
                    name: 'Restaurant B'
                },
                status: 'assigned',
                deliveryAddress: {
                    street: '456 Elm St',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10002',
                    country: 'USA'
                },
                totalAmount: 18.50,
                createdAt: '2023-04-16T14:20:00Z'
            },
            {
                _id: '3',
                orderNumber: 'ORD-003',
                customer: {
                    _id: '3',
                    name: 'New Customer'
                },
                vendor: {
                    _id: '3',
                    name: 'Restaurant C'
                },
                status: 'assigned',
                deliveryAddress: {
                    street: '789 Oak St',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10003',
                    country: 'USA'
                },
                totalAmount: 32.75,
                createdAt: new Date().toISOString()
            }
        ];
        
        // Render the orders
        renderDeliveryOrders(mockOrders);
        
        // Add click handlers to the orders
        setTimeout(addDeliveryOrderClickHandlers, 300);
    };
    
    // Function to add click handlers to delivery orders
    function addDeliveryOrderClickHandlers() {
        const orderItems = document.querySelectorAll('#delivery-orders .order-item');
        console.log('Adding click handlers to', orderItems.length, 'delivery orders');
        
        orderItems.forEach(orderItem => {
            // Make the order item look clickable
            orderItem.style.cursor = 'pointer';
            
            // Get the order ID
            let orderId = orderItem.dataset.orderId;
            if (!orderId) {
                // Try to extract from onclick attribute
                const onclickAttr = orderItem.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/selectDeliveryOrder\(['"]([^'"]+)['"]\)/);
                    if (match && match[1]) {
                        orderId = match[1];
                        orderItem.dataset.orderId = orderId;
                    }
                }
            }
            
            if (orderId) {
                // Remove inline onclick to prevent conflicts
                orderItem.removeAttribute('onclick');
                
                // Clear existing event listeners by cloning and replacing
                const newOrderItem = orderItem.cloneNode(true);
                orderItem.parentNode.replaceChild(newOrderItem, orderItem);
                
                // Store the order ID as a data attribute
                newOrderItem.dataset.orderId = orderId;
                
                // Add click event
                newOrderItem.addEventListener('click', function() {
                    console.log('Delivery order clicked:', orderId);
                    window.selectDeliveryOrder(orderId);
                });
            }
        });
    }
    
    // Override renderDeliveryOrders to ensure orders have data-order-id attribute
    window.renderDeliveryOrders = function(orders) {
        const container = document.getElementById('delivery-orders');
        
        if (!orders || orders.length === 0) {
            container.innerHTML = '<p>No orders assigned to you.</p>';
            const startBtn = document.getElementById('start-delivery-btn');
            const updateBtn = document.getElementById('update-location-btn');
            const completeBtn = document.getElementById('complete-delivery-btn');
            
            if (startBtn) startBtn.disabled = true;
            if (updateBtn) updateBtn.disabled = true;
            if (completeBtn) completeBtn.disabled = true;
            return;
        }
        
        let html = '';
        
        orders.forEach(order => {
            html += `
                <div class="order-item" data-order-id="${order._id}">
                    <h3>${order.orderNumber}</h3>
                    <p>Customer: ${order.customer.name}</p>
                    <p>Vendor: ${order.vendor.name}</p>
                    <p>Address: ${order.deliveryAddress.street}, ${order.deliveryAddress.city}</p>
                    <p>Status: <span class="status-badge status-${order.status}">${order.status}</span></p>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Add click handlers after a short delay
        setTimeout(addDeliveryOrderClickHandlers, 300);
    };
    
    // Add delivery order enhancement when delivery tab is shown
    document.querySelector('.tab[data-tab="delivery"]').addEventListener('click', function() {
        setTimeout(function() {
            // Initialize simulator map if not already initialized
            if (!window.simulatorMap && document.getElementById('simulator-map')) {
                window.simulatorMap = L.map('simulator-map').setView([40.7128, -74.006], 13);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(window.simulatorMap);
                
                // Add click event to simulator map
                window.simulatorMap.on('click', function(e) {
                    if (window.deliveryMarker) {
                        window.deliveryMarker.setLatLng(e.latlng);
                    } else {
                        window.deliveryMarker = L.marker(e.latlng).addTo(window.simulatorMap);
                        window.deliveryMarker.bindPopup('Your Current Location').openPopup();
                    }
                    
                    const updateBtn = document.getElementById('update-location-btn');
                    if (updateBtn) {
                        updateBtn.disabled = !window.selectedOrder || window.selectedOrder.status !== 'in_transit';
                    }
                });
            }
            
            // Fetch delivery orders
            window.fetchDeliveryOrders();
        }, 500);
    });
});
