// Authentication flow fix for the Location Tracker application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthState();
    
    // Add event listener to logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Function to check authentication state
    function checkAuthState() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            try {
                // Parse user data
                window.currentUser = JSON.parse(user);
                window.token = token;
                
                // Show appropriate dashboard based on user role
                showDashboard(window.currentUser.role);
                
                // Connect to socket
                if (typeof window.connectSocket === 'function') {
                    window.connectSocket();
                }
                
                // Load appropriate data
                if (window.currentUser.role === 'customer') {
                    if (typeof window.fetchCustomerOrders === 'function') {
                        window.fetchCustomerOrders();
                    }
                } else if (window.currentUser.role === 'vendor') {
                    if (typeof window.fetchVendorOrders === 'function') {
                        window.fetchVendorOrders();
                    }
                } else if (window.currentUser.role === 'delivery') {
                    if (typeof window.fetchDeliveryOrders === 'function') {
                        window.fetchDeliveryOrders();
                    }
                }
                
                console.log('User authenticated:', window.currentUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                resetAuthState();
            }
        } else {
            resetAuthState();
        }
    }
    
    // Function to reset authentication state
    function resetAuthState() {
        // Clear local storage
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
        
        // Disable role-specific tabs
        hideRoleTabs();
    }
    
    // Function to show dashboard based on role
    window.showDashboard = function(role) {
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show appropriate dashboard
        document.getElementById(role).classList.add('active');
        
        // Update tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`.tab[data-tab="${role}"]`).classList.add('active');
        
        // Show role-specific tabs
        showRoleTabs(role);
    };
    
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
    
    // Function to show role-specific tabs
    function showRoleTabs(role) {
        // Hide auth tabs
        document.querySelector('.tab[data-tab="login"]').style.display = 'none';
        document.querySelector('.tab[data-tab="register"]').style.display = 'none';
        
        // Show only the tab for the current role
        document.querySelector('.tab[data-tab="customer"]').style.display = role === 'customer' ? 'block' : 'none';
        document.querySelector('.tab[data-tab="vendor"]').style.display = role === 'vendor' ? 'block' : 'none';
        document.querySelector('.tab[data-tab="delivery"]').style.display = role === 'delivery' ? 'block' : 'none';
        
        // Add logout button if not present
        addLogoutButton();
    }
    
    // Function to add logout button
    function addLogoutButton() {
        // Check if logout button already exists
        if (!document.getElementById('logout-btn')) {
            // Create logout button
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logout-btn';
            logoutBtn.className = 'btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.style.position = 'absolute';
            logoutBtn.style.top = '20px';
            logoutBtn.style.right = '20px';
            logoutBtn.addEventListener('click', logout);
            
            // Add to document
            document.body.appendChild(logoutBtn);
        }
    }
    
    // Function to handle logout
    function logout() {
        console.log('Logging out...');
        
        // Disconnect socket if connected
        if (window.socket) {
            window.socket.disconnect();
        }
        
        // Reset auth state
        resetAuthState();
        
        // Show message
        alert('You have been logged out successfully.');
    }
    
    // Override the original login function
    window.login = function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            document.getElementById('login-message').textContent = 'Please enter email and password';
            return;
        }
        
        try {
            // For demo purposes, we'll use hardcoded credentials
            if (email === 'customer@example.com' && password === 'password') {
                window.currentUser = {
                    id: '1',
                    name: 'Demo Customer',
                    email: 'customer@example.com',
                    role: 'customer'
                };
                window.token = 'demo_token';
                
                localStorage.setItem('token', window.token);
                localStorage.setItem('user', JSON.stringify(window.currentUser));
                
                showDashboard('customer');
                if (typeof window.connectSocket === 'function') {
                    window.connectSocket();
                }
                if (typeof window.fetchCustomerOrders === 'function') {
                    window.fetchCustomerOrders();
                }
                return;
            }
            
            if (email === 'vendor@example.com' && password === 'password') {
                window.currentUser = {
                    id: '2',
                    name: 'Demo Vendor',
                    email: 'vendor@example.com',
                    role: 'vendor'
                };
                window.token = 'demo_token';
                
                localStorage.setItem('token', window.token);
                localStorage.setItem('user', JSON.stringify(window.currentUser));
                
                showDashboard('vendor');
                if (typeof window.connectSocket === 'function') {
                    window.connectSocket();
                }
                if (typeof window.fetchVendorOrders === 'function') {
                    window.fetchVendorOrders();
                }
                return;
            }
            
            if (email === 'delivery@example.com' && password === 'password') {
                window.currentUser = {
                    id: '3',
                    name: 'Demo Delivery',
                    email: 'delivery@example.com',
                    role: 'delivery'
                };
                window.token = 'demo_token';
                
                localStorage.setItem('token', window.token);
                localStorage.setItem('user', JSON.stringify(window.currentUser));
                
                showDashboard('delivery');
                if (typeof window.connectSocket === 'function') {
                    window.connectSocket();
                }
                if (typeof window.fetchDeliveryOrders === 'function') {
                    window.fetchDeliveryOrders();
                }
                return;
            }
            
            document.getElementById('login-message').textContent = 'Invalid credentials';
        } catch (error) {
            console.error('Login error:', error);
            document.getElementById('login-message').textContent = 'Login failed';
        }
    };
    
    // Override the register function
    window.register = function() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        
        if (!name || !email || !password || !role) {
            document.getElementById('register-message').textContent = 'Please fill in all fields';
            return;
        }
        
        try {
            // For demo purposes, we'll just show a success message
            document.getElementById('register-message').textContent = 'Registration successful! You can now login.';
            document.getElementById('register-message').style.color = 'green';
            
            // Clear form
            document.getElementById('register-name').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
            
            // Switch to login tab after a delay
            setTimeout(() => {
                document.querySelector('.tab-link[data-tab="login"]').click();
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            document.getElementById('register-message').textContent = 'Registration failed';
        }
    };
    
    // Initialize by hiding role tabs
    hideRoleTabs();
});
