// Updated map functionality fixes for the Location Tracker application
document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing maps to prevent "already initialized" errors
    window.map = null;
    window.simulatorMap = null;
    window.deliveryMarker = null;
    window.destinationMarker = null;
    
    // Initialize maps when customer or delivery tabs are shown
    document.querySelector('.tab[data-tab="customer"]').addEventListener('click', function() {
        setTimeout(initCustomerMap, 300);
    });
    
    document.querySelector('.tab[data-tab="delivery"]').addEventListener('click', function() {
        setTimeout(initSimulatorMap, 300);
    });
    
    // Initialize customer map if already on customer tab
    if (document.querySelector('.tab[data-tab="customer"]').classList.contains('active')) {
        setTimeout(initCustomerMap, 300);
    }
    
    // Initialize simulator map if already on delivery tab
    if (document.querySelector('.tab[data-tab="delivery"]').classList.contains('active')) {
        setTimeout(initSimulatorMap, 300);
    }
    
    // Initialize customer map
    function initCustomerMap() {
        console.log('Initializing customer map...');
        const mapContainer = document.getElementById('map');
        
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }
        
        // Clear existing map if it exists
        if (window.map) {
            window.map.remove();
            window.map = null;
        }
        
        try {
            window.map = L.map('map').setView([40.7128, -74.006], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(window.map);
            
            console.log('Customer map initialized successfully');
            
            // Add track order buttons to customer orders
            addTrackOrderButtons();
        } catch (error) {
            console.error('Error initializing customer map:', error);
        }
    }
    
    // Initialize simulator map
    function initSimulatorMap() {
        console.log('Initializing simulator map...');
        const mapContainer = document.getElementById('simulator-map');
        
        if (!mapContainer) {
            console.error('Simulator map container not found');
            return;
        }
        
        // Clear existing map if it exists
        if (window.simulatorMap) {
            window.simulatorMap.remove();
            window.simulatorMap = null;
        }
        
        try {
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
                }
                
                document.getElementById('update-location-btn').disabled = !window.selectedOrder || window.selectedOrder.status !== 'in_transit';
            });
            
            console.log('Simulator map initialized successfully');
        } catch (error) {
            console.error('Error initializing simulator map:', error);
        }
    }
    
    // Add track order buttons to customer orders
    function addTrackOrderButtons() {
        const orderItems = document.querySelectorAll('.order-item');
        
        orderItems.forEach(orderItem => {
            // Check if order is in transit
            const statusBadge = orderItem.querySelector('.status-badge');
            if (statusBadge && statusBadge.textContent.trim() === 'in_transit') {
                // Add track order button if not already present
                if (!orderItem.querySelector('.track-btn')) {
                    const orderId = orderItem.dataset.orderId || '1';
                    const trackBtn = document.createElement('button');
                    trackBtn.className = 'btn track-btn';
                    trackBtn.textContent = 'Track Order';
                    trackBtn.onclick = function() {
                        trackOrder(orderId);
                    };
                    
                    orderItem.appendChild(trackBtn);
                }
            }
        });
    }
    
    // Track order function
    window.trackOrder = function(orderId) {
        console.log('Tracking order:', orderId);
        
        // Initialize map if not already initialized
        if (!window.map) {
            initCustomerMap();
            // Try again after map is initialized
            setTimeout(function() {
                trackOrder(orderId);
            }, 500);
            return;
        }
        
        // Find the order in the mock data
        const order = {
            _id: orderId,
            orderNumber: 'ORD-00' + orderId,
            status: 'in_transit',
            deliveryPartner: {
                name: orderId === '1' ? 'John Delivery' : 'Jane Delivery'
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
            
            // Remove existing marker if it exists
            if (window.deliveryMarker && window.map.hasLayer(window.deliveryMarker)) {
                window.map.removeLayer(window.deliveryMarker);
            }
            
            // Create a new marker
            window.deliveryMarker = L.marker(latlng).addTo(window.map);
            window.deliveryMarker.bindPopup('Delivery Partner: ' + order.deliveryPartner.name).openPopup();
            
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
        }
    };
});
