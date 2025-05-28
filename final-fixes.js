// Final fixes for the Location Tracker application
document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing session data on page load to ensure we always start from login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset global variables
    window.currentUser = null;
    window.token = null;
    
    // Hide all dashboards
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show login tab
    document.getElementById('login').classList.add('active');
    
    // Update tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelector('.tab[data-tab="login"]').classList.add('active');
    
    // Hide role-specific tabs
    hideRoleTabs();
    
    // Function to hide role-specific tabs
    function hideRoleTabs() {
        // Hide all role tabs
        document.querySelector('.tab[data-tab="customer"]').style.display = 'none';
        document.querySelector('.tab[data-tab="vendor"]').style.display = 'none';
        document.querySelector('.tab[data-tab="delivery"]').style.display = 'none';
        
        // Show auth tabs
        document.querySelector('.tab[data-tab="login"]').style.display = 'block';
        document.querySelector('.tab[data-tab="register"]').style.display = 'block';
    }
    
    // Add CSS for better styling of order items
    const style = document.createElement('style');
    style.textContent = `
        .order-item {
            cursor: pointer;
            transition: background-color 0.2s, border-left 0.2s;
            border-left: 3px solid transparent;
            padding-left: 12px;
        }
        
        .order-item:hover {
            background-color: #f5f5f5;
        }
        
        .order-item.selected {
            background-color: #e0e0e0;
            border-left: 3px solid #4a90e2;
        }
        
        /* Make buttons more visible */
        .btn {
            margin-top: 10px;
            margin-right: 5px;
        }
        
        /* Disable buttons */
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        /* Status badges */
        .status-badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .status-assigned {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-in_transit {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-delivered {
            background-color: #cce5ff;
            color: #004085;
        }
        
        .status-pending {
            background-color: #f8d7da;
            color: #721c24;
        }
    `;
    document.head.appendChild(style);
    
    // Fix for delivery orders click handling
    function enhanceDeliveryOrders() {
        console.log('Enhancing delivery orders...');
        const orderItems = document.querySelectorAll('#delivery-orders .order-item');
        
        orderItems.forEach(orderItem => {
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
                
                // Add click event
                newOrderItem.addEventListener('click', function() {
                    console.log('Delivery order clicked:', orderId);
                    
                    // Highlight selected order
                    document.querySelectorAll('#delivery-orders .order-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    // Call selectDeliveryOrder function
                    if (typeof window.selectDeliveryOrder === 'function') {
                        window.selectDeliveryOrder(orderId);
                    } else {
                        console.error('selectDeliveryOrder function not found');
                    }
                });
            }
        });
    }
    
    // Override fetchDeliveryOrders to enhance orders after rendering
    const originalFetchDeliveryOrders = window.fetchDeliveryOrders;
    if (typeof originalFetchDeliveryOrders === 'function') {
        window.fetchDeliveryOrders = function() {
            originalFetchDeliveryOrders.apply(this, arguments);
            setTimeout(enhanceDeliveryOrders, 300);
        };
    }
    
    // Add delivery order enhancement when delivery tab is shown
    document.querySelector('.tab[data-tab="delivery"]').addEventListener('click', function() {
        setTimeout(enhanceDeliveryOrders, 500);
    });
    
    // Make sure selectDeliveryOrder function exists and works
    if (!window.selectDeliveryOrder) {
        window.selectDeliveryOrder = function(orderId) {
            console.log('Selecting delivery order:', orderId);
            
            // Find the order (mock data for demo)
            const order = {
                _id: orderId,
                orderNumber: 'ORD-00' + orderId,
                status: 'assigned',
                customer: {
                    name: 'John Customer'
                },
                vendor: {
                    name: 'Restaurant A'
                },
                address: '123 Main St, New York'
            };
            
            window.selectedOrder = order;
            
            // Enable/disable buttons based on order status
            const startBtn = document.getElementById('start-delivery-btn');
            const updateBtn = document.getElementById('update-location-btn');
            const completeBtn = document.getElementById('complete-delivery-btn');
            
            if (startBtn) startBtn.disabled = order.status !== 'assigned';
            if (updateBtn) updateBtn.disabled = order.status !== 'in_transit';
            if (completeBtn) completeBtn.disabled = order.status !== 'in_transit';
            
            // Set destination marker on simulator map
            if (window.simulatorMap) {
                // Create a random location near NYC for demo
                const lat = 40.7128 + (Math.random() - 0.5) * 0.05;
                const lng = -74.006 + (Math.random() - 0.5) * 0.05;
                
                // Remove existing marker if it exists
                if (window.destinationMarker && window.simulatorMap.hasLayer(window.destinationMarker)) {
                    window.simulatorMap.removeLayer(window.destinationMarker);
                }
                
                // Create a new marker
                window.destinationMarker = L.marker([lat, lng]).addTo(window.simulatorMap);
                window.destinationMarker.bindPopup('Destination: ' + order.address).openPopup();
                
                window.simulatorMap.setView([lat, lng], 15);
            }
        };
    }
});
