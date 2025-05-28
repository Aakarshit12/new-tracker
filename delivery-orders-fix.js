// Fix for the delivery orders selection issue
document.addEventListener('DOMContentLoaded', function() {
    // Add click handler to delivery orders after they're rendered
    function addDeliveryOrderClickHandlers() {
        console.log('Adding click handlers to delivery orders');
        const orderItems = document.querySelectorAll('#delivery-orders .order-item');
        console.log('Found', orderItems.length, 'delivery order items');
        
        orderItems.forEach(orderItem => {
            // Make the order item look clickable
            orderItem.style.cursor = 'pointer';
            orderItem.style.transition = 'background-color 0.2s';
            
            // Add hover effect
            orderItem.addEventListener('mouseover', function() {
                this.style.backgroundColor = '#f0f0f0';
            });
            
            orderItem.addEventListener('mouseout', function() {
                if (!this.classList.contains('selected')) {
                    this.style.backgroundColor = '';
                }
            });
            
            // Get the order ID from the data attribute or from the onclick attribute
            let orderId = orderItem.dataset.orderId;
            if (!orderId) {
                // Try to extract from onclick attribute
                const onclickAttr = orderItem.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/selectDeliveryOrder\(['"]([^'"]+)['"]\)/);
                    if (match && match[1]) {
                        orderId = match[1];
                        // Store it as a data attribute for easier access
                        orderItem.dataset.orderId = orderId;
                    }
                }
            }
            
            if (orderId) {
                // Remove the inline onclick attribute to prevent conflicts
                orderItem.removeAttribute('onclick');
                
                // Add a clean click event listener
                orderItem.addEventListener('click', function() {
                    console.log('Order item clicked:', orderId);
                    if (typeof window.selectDeliveryOrder === 'function') {
                        window.selectDeliveryOrder(orderId);
                        
                        // Highlight the selected order
                        document.querySelectorAll('#delivery-orders .order-item').forEach(item => {
                            item.classList.remove('selected');
                            item.style.backgroundColor = '';
                        });
                        this.classList.add('selected');
                        this.style.backgroundColor = '#e0e0e0';
                    } else {
                        console.error('selectDeliveryOrder function not found');
                    }
                });
            }
        });
    }
    
    // Override the fetchDeliveryOrders function to add click handlers after rendering
    const originalFetchDeliveryOrders = window.fetchDeliveryOrders;
    if (typeof originalFetchDeliveryOrders === 'function') {
        window.fetchDeliveryOrders = function() {
            // Call the original function
            originalFetchDeliveryOrders.apply(this, arguments);
            
            // Add click handlers after a short delay to ensure the DOM is updated
            setTimeout(addDeliveryOrderClickHandlers, 300);
        };
    }
    
    // Add CSS for selected orders
    const style = document.createElement('style');
    style.textContent = `
        .order-item.selected {
            background-color: #e0e0e0;
            border-left: 3px solid #4a90e2;
        }
    `;
    document.head.appendChild(style);
    
    // Add click handlers to delivery tab to ensure they're added when the tab is shown
    document.querySelector('.tab[data-tab="delivery"]').addEventListener('click', function() {
        setTimeout(addDeliveryOrderClickHandlers, 500);
    });
    
    // Add click handlers on page load if delivery tab is active
    if (document.querySelector('.tab[data-tab="delivery"]').classList.contains('active')) {
        setTimeout(addDeliveryOrderClickHandlers, 500);
    }
});
