// Authentication fixes for the Location Tracker application

// Define API URLs as global variables
window.API_URL = 'http://localhost:5000/api';
window.SOCKET_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', function() {
    // Clear any error messages
    const loginMessage = document.getElementById('login-message');
    if (loginMessage) {
        loginMessage.textContent = '';
    }
    
    // Clear any pre-filled email
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
    
    // Add login functionality
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
    
    // Registration function
    async function register() {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
        
        if (!name || !email || !password) {
            document.getElementById('register-message').textContent = 'Please fill in all fields';
            return;
        }
        
        try {
            // For demo purposes, create a mock successful registration
            console.log('Registering user:', { name, email, role });
            
            // Show success message
            document.getElementById('register-message').textContent = 'Registration successful! You can now log in.';
            document.getElementById('register-message').style.color = 'green';
            
            // Clear form
            document.getElementById('reg-name').value = '';
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-password').value = '';
            
            // Switch to login tab after 2 seconds
            setTimeout(() => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                document.querySelector('.tab[data-tab="login"]').classList.add('active');
                document.getElementById('login').classList.add('active');
                
                // Pre-fill the login form with the registered email
                document.getElementById('email').value = email;
                document.getElementById('role').value = role;
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            document.getElementById('register-message').textContent = error.message || 'Registration failed';
        }
    }
    
    // Login function
    function login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        if (!email || !password || !role) {
            document.getElementById('login-message').textContent = 'Please fill in all fields';
            return;
        }
        
        try {
            // For demo purposes, we'll use hardcoded credentials with role validation
            if (email === 'customer@example.com' && password === 'password') {
                // Validate role
                if (role !== 'customer') {
                    document.getElementById('login-message').textContent = 'Invalid role for this account. Customer accounts must use the Customer role.';
                    return;
                }
                
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
                connectSocket();
                fetchCustomerOrders();
                return;
            }
            
            if (email === 'vendor@example.com' && password === 'password') {
                // Validate role
                if (role !== 'vendor') {
                    document.getElementById('login-message').textContent = 'Invalid role for this account. Vendor accounts must use the Vendor role.';
                    return;
                }
                
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
                connectSocket();
                fetchVendorOrders();
                return;
            }
            
            if (email === 'delivery@example.com' && password === 'password') {
                // Validate role
                if (role !== 'delivery') {
                    document.getElementById('login-message').textContent = 'Invalid role for this account. Delivery Partner accounts must use the Delivery Partner role.';
                    return;
                }
                
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
                connectSocket();
                fetchDeliveryOrders();
                return;
            }
            
            // If we get here, try the newly registered user (for demo purposes)
            if (document.getElementById('register-message') && 
                document.getElementById('register-message').textContent.includes('successful')) {
                
                window.currentUser = {
                    id: '4',
                    name: 'New User',
                    email: email,
                    role: role
                };
                window.token = 'demo_token';
                
                localStorage.setItem('token', window.token);
                localStorage.setItem('user', JSON.stringify(window.currentUser));
                
                showDashboard(role);
                connectSocket();
                
                if (role === 'customer') {
                    fetchCustomerOrders();
                } else if (role === 'vendor') {
                    fetchVendorOrders();
                } else if (role === 'delivery') {
                    fetchDeliveryOrders();
                }
                
                return;
            }
            
            document.getElementById('login-message').textContent = 'Invalid credentials. Try using the demo accounts: customer@example.com, vendor@example.com, or delivery@example.com with password: password';
        } catch (error) {
            console.error('Login error:', error);
            document.getElementById('login-message').textContent = 'Login failed';
        }
    }
});
