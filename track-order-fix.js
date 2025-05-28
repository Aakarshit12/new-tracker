// Fix for the track order functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add global trackOrder function
    window.trackOrder = function(orderId) {
        console.log('Tracking order:', orderId);
        
        // Find the order in the mock data
        const order = {
            _id: orderId,
            orderNumber: 'ORD-001',
            status: 'in_transit',
            deliveryPartner: {
                name: 'John Delivery'
            }
        };
        
        // Set as selected order
        window.selectedOrder = order;
        window.isTrackingActive = true;
        
        // Create random location near NYC for demo purposes
        const lat = 40.7128 + (Math.random() - 0.5) * 0.05;
        const lng = -74.006 + (Math.random() - 0.5) * 0.05;
        
        // Update the map
        if (window.map) {
            const latlng = [lat, lng];
            
            if (window.deliveryMarker) {
                window.deliveryMarker.setLatLng(latlng);
            } else {
                // Create a new marker if it doesn't exist
                window.deliveryMarker = L.marker(latlng).addTo(window.map);
                window.deliveryMarker.bindPopup('Delivery Partner').openPopup();
            }
            
            // Center the map on the marker
            window.map.setView(latlng, 15);
            
            // Update tracking info
            const trackingInfo = document.getElementById('tracking-info');
            if (trackingInfo) {
                trackingInfo.innerHTML = `
                    <h3>Tracking Order: ${order.orderNumber}</h3>
                    <p>Delivery Partner: ${order.deliveryPartner ? order.deliveryPartner.name : 'Not assigned'}</p>
                    <p>Status: <span class="status-badge status-${order.status}">${order.status}</span></p>
                    <p>Last updated: ${new Date().toLocaleTimeString()}</p>
                `;
            }
        } else {
            console.error('Map not initialized');
            
            // Try to initialize the map
            initCustomerMap();
            
            // Call trackOrder again after a short delay
            setTimeout(() => trackOrder(orderId), 500);
        }
    };
    
    // Add track order buttons to customer orders
    function addTrackOrderButtons() {
        // Find all customer orders with in_transit status
        const orderItems = document.querySelectorAll('.order-item');
        orderItems.forEach(orderItem => {
            const statusBadge = orderItem.querySelector('.status-badge');
            if (statusBadge && statusBadge.textContent.trim() === 'in_transit') {
                // Check if button already exists
                if (!orderItem.querySelector('.track-btn')) {
                    // Get order ID
                    const orderId = orderItem.dataset.orderId || '1';
                    
                    // Create track order button
                    const trackBtn = document.createElement('button');
                    trackBtn.className = 'btn track-btn';
                    trackBtn.textContent = 'Track Order';
                    trackBtn.onclick = function() {
                        trackOrder(orderId);
                    };
                    
                    // Add button to order item
                    orderItem.appendChild(trackBtn);
                }
            }
        });
    }
    
    // Initialize customer map if not already initialized
    function initCustomerMap() {
        if (!window.map && document.getElementById('map')) {
            window.map = L.map('map').setView([40.7128, -74.006], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(window.map);
            console.log('Customer map initialized');
        }
    }
    
    // Call these functions when the customer tab is shown
    document.querySelector('.tab[data-tab="customer"]').addEventListener('click', function() {
        setTimeout(() => {
            initCustomerMap();
            addTrackOrderButtons();
        }, 500);
    });
    
    // If customer tab is already active, initialize map and add buttons
    if (document.querySelector('.tab[data-tab="customer"]').classList.contains('active')) {
        setTimeout(() => {
            initCustomerMap();
            addTrackOrderButtons();
        }, 500);
    }
});
