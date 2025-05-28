// Authentication fixes for the Location Tracker application

// Use window variables for API URLs
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
            const response = await fetch(`${window.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            // Registration successful
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
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            document.getElementById('register-message').textContent = error.message || 'Registration failed';
        }
    }
    
    // Login function
    async function login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        if (!email || !password) {
            document.getElementById('login-message').textContent = 'Please enter email and password';
            return;
        }
        
        try {
            // First try the backend API
            try {
                const response = await fetch(`${window.API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Login successful
                    window.currentUser = data.data.user;
                    window.token = data.data.token;
                    
                    localStorage.setItem('token', window.token);
                    localStorage.setItem('user', JSON.stringify(window.currentUser));
                    
                    showDashboard(window.currentUser.role);
                    connectSocket();
                    
                    if (window.currentUser.role === 'customer') {
                        fetchCustomerOrders();
                    } else if (window.currentUser.role === 'vendor') {
                        fetchVendorOrders();
                    } else if (window.currentUser.role === 'delivery') {
                        fetchDeliveryOrders();
                    }
                    
                    return;
                }
            } catch (apiError) {
                console.error('API login error:', apiError);
                // If API login fails, fall back to demo login
            }
            
            // Fallback to demo login
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
                connectSocket();
                fetchCustomerOrders();
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
                connectSocket();
                fetchVendorOrders();
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
                connectSocket();
                fetchDeliveryOrders();
                return;
            }
            
            document.getElementById('login-message').textContent = 'Invalid credentials';
        } catch (error) {
            console.error('Login error:', error);
            document.getElementById('login-message').textContent = 'Login failed';
        }
    }
});
