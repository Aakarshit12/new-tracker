// Consolidated map fixes for the Location Tracker application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing maps...');
    
    // Clear any existing maps to prevent "already initialized" errors
    window.map = null;
    window.simulatorMap = null;
    window.deliveryMarker = null;
    window.destinationMarker = null;
    window.selectedOrder = null;
    window.isTrackingActive = false;
    
    // Store persistent locations for orders
    window.orderLocations = {
        // Order 1 locations
        '1': {
            delivery: {
                lat: 40.7128 + 0.02,
                lng: -74.006 - 0.01
            },
            destination: {
                lat: 40.7128 + 0.04,
                lng: -74.006 - 0.03
            }
        },
        // Order 2 locations
        '2': {
            delivery: {
                lat: 40.7128 - 0.015,
                lng: -74.006 + 0.02
            },
            destination: {
                lat: 40.7128 - 0.035,
                lng: -74.006 + 0.04
            }
        }
    };
    
    // Make sure Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded! Adding it dynamically...');
        
        // Add Leaflet CSS if not present
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const leafletCSS = document.createElement('link');
            leafletCSS.rel = 'stylesheet';
            leafletCSS.href = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css';
            document.head.appendChild(leafletCSS);
        }
        
        // Add Leaflet JS if not present
        if (!document.querySelector('script[src*="leaflet.js"]')) {
            const leafletScript = document.createElement('script');
            leafletScript.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js';
            leafletScript.onload = initializeMaps;
            document.body.appendChild(leafletScript);
        }
    } else {
        // Leaflet is already loaded, initialize maps
        initializeMaps();
    }
    
    function initializeMaps() {
        console.log('Initializing maps...');
        
        // Set up tab switching
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active class to current tab and content
                this.classList.add('active');
                const content = document.getElementById(tabId);
                if (content) content.classList.add('active');
                
                // Initialize maps when switching to tabs
                if (tabId === 'customer') {
                    setTimeout(initCustomerMap, 300);
                } else if (tabId === 'delivery') {
                    setTimeout(initSimulatorMap, 300);
                }
            });
        });
        
        // Initialize customer map if already on customer tab
        if (document.querySelector('.tab[data-tab="customer"]')?.classList.contains('active')) {
            setTimeout(initCustomerMap, 300);
        }
        
        // Initialize simulator map if already on delivery tab
        if (document.querySelector('.tab[data-tab="delivery"]')?.classList.contains('active')) {
            setTimeout(initSimulatorMap, 300);
        }
    }
    
    // Initialize customer map
    window.initCustomerMap = function() {
        console.log('Initializing customer map...');
        let mapContainer = document.getElementById('map');
        console.log('Map container found:', mapContainer);
        
        if (!mapContainer) {
            console.log('Map container not found, creating it...');
            
            // Find the tracking info div
            const trackingInfo = document.getElementById('tracking-info');
            if (trackingInfo) {
                // Create map container before tracking info
                mapContainer = document.createElement('div');
                mapContainer.id = 'map';
                mapContainer.style.height = '400px';
                mapContainer.style.width = '100%';
                mapContainer.style.marginBottom = '15px';
                
                trackingInfo.parentNode.insertBefore(mapContainer, trackingInfo);
            } else {
                // Try to find the customer tab content
                const customerTab = document.getElementById('customer');
                if (customerTab) {
                    // Find the card body in the customer tab
                    const cardBody = customerTab.querySelector('.card-body');
                    if (cardBody) {
                        // Create map container in the card body
                        mapContainer = document.createElement('div');
                        mapContainer.id = 'map';
                        mapContainer.style.height = '400px';
                        mapContainer.style.width = '100%';
                        mapContainer.style.marginBottom = '15px';
                        
                        cardBody.appendChild(mapContainer);
                    }
                }
            }
        }
        
        if (!mapContainer) {
            console.error('Could not create map container');
            return;
        }
        
        // Clear existing map if it exists
        if (window.map) {
            window.map.remove();
            window.map = null;
        }
        
        try {
            // Ensure the map container is visible before initializing
            mapContainer.style.display = 'block';
            mapContainer.style.height = '400px';
            mapContainer.style.width = '100%';
            
            // Force a reflow to ensure the container dimensions are applied
            void mapContainer.offsetWidth;
            
            // Initialize the map with a slight delay to ensure the container is ready
            setTimeout(function() {
                try {
                    window.map = L.map('map').setView([40.7128, -74.006], 13);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(window.map);
                    
                    console.log('Customer map initialized successfully');
                    
                    // Add track order buttons to customer orders
                    addTrackOrderButtons();
                    
                    // Invalidate size to handle any container size issues
                    window.map.invalidateSize();
                } catch (innerError) {
                    console.error('Error in delayed map initialization:', innerError);
                }
            }, 500);
        } catch (error) {
            console.error('Error initializing customer map:', error);
        }
    };
    
    // Initialize simulator map
    window.initSimulatorMap = function() {
        console.log('Initializing simulator map...');
        let mapContainer = document.getElementById('simulator-map');
        console.log('Simulator map container found:', mapContainer);
        
        if (!mapContainer) {
            console.log('Simulator map container not found, creating it...');
            
            // Try to find the delivery tab content
            const deliveryTab = document.getElementById('delivery');
            if (deliveryTab) {
                // Find the card body in the delivery tab
                const cardBody = deliveryTab.querySelector('.card-body');
                if (cardBody) {
                    // Create map container in the card body
                    mapContainer = document.createElement('div');
                    mapContainer.id = 'simulator-map';
                    mapContainer.style.height = '400px';
                    mapContainer.style.width = '100%';
                    mapContainer.style.marginBottom = '15px';
                    
                    cardBody.appendChild(mapContainer);
                }
            }
        }
        
        if (!mapContainer) {
            console.error('Could not create simulator map container');
            return;
        }
        
        // Clear existing map if it exists
        if (window.simulatorMap) {
            window.simulatorMap.remove();
            window.simulatorMap = null;
        }
        
        try {
            // Ensure the map container is visible before initializing
            mapContainer.style.display = 'block';
            mapContainer.style.height = '400px';
            mapContainer.style.width = '100%';
            
            // Force a reflow to ensure the container dimensions are applied
            void mapContainer.offsetWidth;
            
            // Initialize the map with a slight delay to ensure the container is ready
            setTimeout(function() {
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
                        
                        const updateLocationBtn = document.getElementById('update-location-btn');
                        if (updateLocationBtn) {
                            updateLocationBtn.disabled = !window.selectedOrder || window.selectedOrder.status !== 'in_transit';
                        }
                    });
                    
                    console.log('Simulator map initialized successfully');
                    
                    // Invalidate size to handle any container size issues
                    window.simulatorMap.invalidateSize();
                } catch (innerError) {
                    console.error('Error in delayed simulator map initialization:', innerError);
                }
            }, 500);
        } catch (error) {
            console.error('Error initializing simulator map:', error);
        }
    };
    
    // Add track order buttons to customer orders
    function addTrackOrderButtons() {
        const orderItems = document.querySelectorAll('.order-item');
        
        orderItems.forEach(orderItem => {
            // Check if order is in transit
            const statusBadge = orderItem.querySelector('.status-badge');
            if (statusBadge && statusBadge.textContent.trim().includes('in_transit')) {
                // Add track order button if not already present
                if (!orderItem.querySelector('.track-btn')) {
                    const orderId = orderItem.dataset.orderId || '1';
                    const trackBtn = document.createElement('button');
                    trackBtn.className = 'btn track-btn';
                    trackBtn.textContent = 'Track Order';
                    trackBtn.onclick = function() {
                        window.trackOrder(orderId);
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
            window.initCustomerMap();
            // Try again after map is initialized
            setTimeout(function() {
                window.trackOrder(orderId);
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
        
        // Get consistent location for this order
        const orderLocation = window.orderLocations[orderId] || {
            delivery: {
                lat: 40.7128,
                lng: -74.006
            },
            destination: {
                lat: 40.7128 + 0.02,
                lng: -74.006 + 0.02
            }
        };
        
        const deliveryLat = orderLocation.delivery.lat;
        const deliveryLng = orderLocation.delivery.lng;
        const destinationLat = orderLocation.destination.lat;
        const destinationLng = orderLocation.destination.lng;
        
        // Update the map
        if (window.map) {
            // Remove existing markers if they exist
            if (window.deliveryMarker && window.map.hasLayer(window.deliveryMarker)) {
                window.map.removeLayer(window.deliveryMarker);
            }
            
            if (window.destinationMarker && window.map.hasLayer(window.destinationMarker)) {
                window.map.removeLayer(window.destinationMarker);
            }
            
            // Remove any existing polylines
            window.map.eachLayer(layer => {
                if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
                    window.map.removeLayer(layer);
                }
            });
            
            // Create delivery marker
            window.deliveryMarker = L.marker([deliveryLat, deliveryLng]).addTo(window.map);
            window.deliveryMarker.bindPopup('Delivery Partner: ' + order.deliveryPartner.name).openPopup();
            
            // Create destination marker
            window.destinationMarker = L.marker([destinationLat, destinationLng]).addTo(window.map);
            window.destinationMarker.bindPopup('Destination').openPopup();
            
            // Create a line between delivery and destination
            const line = L.polyline([
                [deliveryLat, deliveryLng],
                [destinationLat, destinationLng]
            ], {color: 'blue', dashArray: '5, 10'}).addTo(window.map);
            
            // Fit map to show both markers
            const bounds = L.latLngBounds([
                [deliveryLat, deliveryLng],
                [destinationLat, destinationLng]
            ]);
            window.map.fitBounds(bounds, {padding: [50, 50]});
            
            // Update tracking info
            const trackingInfo = document.getElementById('tracking-info');
            if (trackingInfo) {
                // Calculate ETA based on the order ID to keep it consistent
                const eta = orderId === '1' ? 12 : 18;
                
                trackingInfo.innerHTML = `
                    <h3>Tracking Order: ${order.orderNumber}</h3>
                    <p>Delivery Partner: ${order.deliveryPartner ? order.deliveryPartner.name : 'Not assigned'}</p>
                    <p>Status: <span class="status-badge status-in-transit">in_transit</span></p>
                    <p>Last updated: ${new Date().toLocaleTimeString()}</p>
                    <p>ETA: ${eta} minutes</p>
                `;
            }
        } else {
            console.error('Map not initialized');
        }
    };
});
