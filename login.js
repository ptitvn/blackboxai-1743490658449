document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Reset error messages
    document.querySelectorAll('.error').forEach(el => {
        el.style.display = 'none';
    });
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Get stored users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find matching user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        showError('emailError', 'Email hoặc mật khẩu không đúng');
        showError('passwordError', 'Email hoặc mật khẩu không đúng');
        return;
    }
    
    // Store current user session
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Login successful - redirect to index
    window.location.href = 'index.html';
});

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && window.location.pathname.endsWith('login.html')) {
        window.location.href = 'index.html';
    }
});