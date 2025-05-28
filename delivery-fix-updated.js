// Updated fix for delivery partner functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to delivery buttons
    const startDeliveryBtn = document.getElementById('start-delivery-btn');
    const updateLocationBtn = document.getElementById('update-location-btn');
    const completeDeliveryBtn = document.getElementById('complete-delivery-btn');
    
    if (startDeliveryBtn) {
        startDeliveryBtn.addEventListener('click', startDelivery);
    }
    
    if (updateLocationBtn) {
        updateLocationBtn.addEventListener('click', updateLocation);
    }
    
    if (completeDeliveryBtn) {
        completeDeliveryBtn.addEventListener('click', completeDelivery);
    }
    
    // Function to select a delivery order
    window.selectDeliveryOrder = function(orderId) {
        console.log('Selected delivery order:', orderId);
        
        // Find the order in the mock data (for demo purposes)
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
        if (startDeliveryBtn) {
            startDeliveryBtn.disabled = order.status !== 'assigned';
        }
        
        if (updateLocationBtn) {
            updateLocationBtn.disabled = order.status !== 'in_transit';
        }
        
        if (completeDeliveryBtn) {
            completeDeliveryBtn.disabled = order.status !== 'in_transit';
        }
        
        // Set destination marker on simulator map
        if (window.simulatorMap) {
            // For demo, create a random location near NYC
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
        
        // Highlight the selected order
        document.querySelectorAll('.order-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const orderElement = document.querySelector(`.order-item[data-order-id="${orderId}"]`);
        if (orderElement) {
            orderElement.classList.add('selected');
        }
    };
    
    // Start delivery function
    function startDelivery() {
        if (!window.selectedOrder) {
            alert('Please select an order first');
            return;
        }
        
        console.log('Starting delivery for order:', window.selectedOrder._id);
        
        // Update order status
        window.selectedOrder.status = 'in_transit';
        
        // Update UI
        if (startDeliveryBtn) {
            startDeliveryBtn.disabled = true;
        }
        
        if (updateLocationBtn) {
            updateLocationBtn.disabled = false;
        }
        
        if (completeDeliveryBtn) {
            completeDeliveryBtn.disabled = false;
        }
        
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
    }
    
    // Update location function
    function updateLocation() {
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
        
        // In a real app, this would send the location to the server
        // For demo purposes, we'll just show an alert
        alert(`Location updated to: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
    }
    
    // Complete delivery function
    function completeDelivery() {
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
        if (startDeliveryBtn) {
            startDeliveryBtn.disabled = true;
        }
        
        if (updateLocationBtn) {
            updateLocationBtn.disabled = true;
        }
        
        if (completeDeliveryBtn) {
            completeDeliveryBtn.disabled = true;
        }
        
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
    }
    
    // Add click handler to delivery orders
    function addDeliveryOrderClickHandlers() {
        document.querySelectorAll('#delivery-orders .order-item').forEach(orderItem => {
            const orderId = orderItem.dataset.orderId;
            orderItem.addEventListener('click', function() {
                selectDeliveryOrder(orderId);
            });
        });
    }
});
