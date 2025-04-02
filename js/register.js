document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Reset error messages
    document.querySelectorAll('.error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    let isValid = true;

    // Email validation
    if (!email) {
        showError('emailError', 'Email không được để trống');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('emailError', 'Email không đúng định dạng');
        isValid = false;
    }

    // Password validation
    if (!password) {
        showError('passwordError', 'Mật khẩu không được để trống');
        isValid = false;
    } else if (password.length < 6) {
        showError('passwordError', 'Mật khẩu phải có ít nhất 6 ký tự');
        isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
        showError('confirmPasswordError', 'Xác nhận mật khẩu không được để trống');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Mật khẩu xác nhận không khớp');
        isValid = false;
    }

    if (isValid) {
        registerUser(email, password);
    }
});

function registerUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        showError('emailError', 'Email đã được đăng ký');
        return;
    }

    // Add new user
    users.push({ 
        email, 
        password,
        createdAt: new Date().toISOString() 
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    window.location.href = 'login.html?registered=true';
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}