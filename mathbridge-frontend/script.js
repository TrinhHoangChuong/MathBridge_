// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Global state
let currentUser = null;
let authToken = null;

// DOM Elements
const sections = {
    home: document.getElementById('home-section'),
    login: document.getElementById('login-section'),
    register: document.getElementById('register-section'),
    dashboard: document.getElementById('dashboard-section')
};

const forms = {
    login: document.getElementById('login-form'),
    register: document.getElementById('register-form')
};

const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const logoutBtn = document.getElementById('logout-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showDashboard();
    }
    
    // Add form event listeners
    forms.login.addEventListener('submit', handleLogin);
    forms.register.addEventListener('submit', handleRegister);
});

// Navigation functions
function showHome() {
    hideAllSections();
    sections.home.classList.add('active');
}

function showLogin() {
    hideAllSections();
    sections.login.classList.add('active');
}

function showRegister() {
    hideAllSections();
    sections.register.classList.add('active');
}

function showDashboard() {
    hideAllSections();
    sections.dashboard.classList.add('active');
    
    // Update dashboard with user info
    if (currentUser) {
        document.getElementById('dashboard-username').textContent = currentUser.username;
        document.getElementById('dashboard-email').textContent = currentUser.email;
        document.getElementById('dashboard-role').textContent = currentUser.role;
        
        // Show logout button
        logoutBtn.style.display = 'block';
    }
}

function hideAllSections() {
    Object.values(sections).forEach(section => {
        section.classList.remove('active');
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store authentication data
            authToken = data.token;
            currentUser = {
                id: data.id,
                username: data.username,
                email: data.email,
                role: data.role
            };
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('Login successful!', 'success');
            showDashboard();
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const registerData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phoneNumber: formData.get('phoneNumber'),
        role: formData.get('role')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            setTimeout(() => {
                showLogin();
            }, 2000);
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

function logout() {
    // Clear authentication data
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Hide logout button
    logoutBtn.style.display = 'none';
    
    // Show home page
    showHome();
    showNotification('Logged out successfully', 'success');
}

// Utility functions
function showNotification(message, type = 'success') {
    notificationMessage.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    notification.style.display = 'none';
}

// Demo functions for dashboard
function showProfile() {
    showNotification('Profile page coming soon!', 'warning');
}

function showSettings() {
    showNotification('Settings page coming soon!', 'warning');
}

// API helper function for authenticated requests
async function makeAuthenticatedRequest(url, options = {}) {
    if (!authToken) {
        showNotification('Please login first', 'error');
        return null;
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, finalOptions);
        
        if (response.status === 401) {
            // Token expired or invalid
            logout();
            showNotification('Session expired. Please login again.', 'error');
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('API request error:', error);
        showNotification('Network error. Please try again.', 'error');
        return null;
    }
}

// Test API connection
async function testApiConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/test`);
        if (response.ok) {
            console.log('API connection successful');
        } else {
            console.error('API connection failed');
        }
    } catch (error) {
        console.error('API connection error:', error);
    }
}

// Test API connection on load
testApiConnection();
