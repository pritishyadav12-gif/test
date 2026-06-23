// =============================================
// LICENSE KEYS - Load from external file
// =============================================
let VALID_KEYS = [];

async function loadLicenses() {
    try {
        const response = await fetch('data/licenses.json');
        const data = await response.json();
        VALID_KEYS = data.validKeys;
        console.log('✅ Licenses loaded:', VALID_KEYS.length, 'keys');
    } catch (error) {
        console.error('❌ Failed to load licenses:', error);
        VALID_KEYS = [
            "8B3PDW-D8QW0P-666Q6M-O9V5MR-K9JHO8-C7NO9X",
            "2NFUOM-AIMVIL-NRHHWR-1G6AUM-1K3UEA-TXURZG",
            "CZXHDG-HBOY75-G8YBRJ-1N43CB-K0U7CS-M6WXWA",
            "53GH1W-2T67P7-ELZKE8-G28WSD-GR6KJE-O9Y16V",
            "QHLMKL-W0OCGU-WKJHL3-OMHFSL-YR6LG6-ZWOCRX"
        ];
    }
}

// =============================================
// USER DATABASE (LocalStorage)
// =============================================
let users = JSON.parse(localStorage.getItem('users')) || [];
let usedKeys = JSON.parse(localStorage.getItem('usedKeys')) || {};

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function userHasLicense() {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    const user = users.find(u => u.email === currentUser.email);
    return user ? user.hasLicense === true : false;
}

// =============================================
// DOM Elements
// =============================================
const pages = {
    home: document.getElementById('home'),
    products: document.getElementById('products'),
    download: document.getElementById('download'),
    webgui: document.getElementById('webgui'),
    faq: document.getElementById('faq'),
    auth: document.getElementById('auth'),
    license: document.getElementById('license')
};

const navLinks = {
    home: document.getElementById('homeLink'),
    products: document.getElementById('productsLink'),
    download: document.getElementById('downloadLink'),
    webgui: document.getElementById('webguiLink'),
    faq: document.getElementById('faqLink'),
    auth: document.getElementById('authLink'),
    license: document.getElementById('licenseLink')
};

const toast = document.getElementById('toast');

// =============================================
// Payment Modal Functions
// =============================================
let currentProduct = 'monthly';

window.openPaymentModal = function(product) {
    currentProduct = product;
    const modal = document.getElementById('paymentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalProduct = document.getElementById('modalProduct');
    
    modalTitle.textContent = 'Choose Payment Method';
    modalProduct.textContent = product === 'monthly' ? 'Pika Monthly - $5.00' : 'Pika Lifetime - $15.00';
    
    document.getElementById('paymentOptions').style.display = 'block';
    document.getElementById('paymentDetails').style.display = 'none';
    document.getElementById('litecoinDetails').style.display = 'none';
    document.getElementById('upiDetails').style.display = 'none';
    
    modal.style.display = 'block';
};

window.closePaymentModal = function() {
    document.getElementById('paymentModal').style.display = 'none';
};

window.showLitecoinPayment = function() {
    document.getElementById('paymentOptions').style.display = 'none';
    document.getElementById('paymentDetails').style.display = 'block';
    document.getElementById('litecoinDetails').style.display = 'block';
    document.getElementById('upiDetails').style.display = 'none';
};

window.showUPIPayment = function() {
    document.getElementById('paymentOptions').style.display = 'none';
    document.getElementById('paymentDetails').style.display = 'block';
    document.getElementById('litecoinDetails').style.display = 'none';
    document.getElementById('upiDetails').style.display = 'block';
};

window.backToPaymentOptions = function() {
    document.getElementById('paymentOptions').style.display = 'block';
    document.getElementById('paymentDetails').style.display = 'none';
};

window.onclick = function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// =============================================
// Helper Functions
// =============================================
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showLicenseStatus(message, type) {
    const status = document.getElementById('licenseStatus');
    if (status) {
        status.className = `license-status ${type}`;
        status.textContent = message;
        status.style.display = 'block';
    }
}

function updateUserEmail() {
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const userEmailText = document.getElementById('userEmailText');
    const currentUser = getCurrentUser();
    
    if (userEmailDisplay && userEmailText) {
        if (currentUser && currentUser.email) {
            userEmailText.textContent = currentUser.email;
            userEmailDisplay.style.display = 'inline-flex';
        } else {
            userEmailDisplay.style.display = 'none';
        }
    }
}

function checkLicenseAccess() {
    if (userHasLicense()) {
        navLinks.download.classList.remove('hidden');
        navLinks.webgui.classList.remove('hidden');
    } else {
        navLinks.download.classList.add('hidden');
        navLinks.webgui.classList.add('hidden');
    }
}

function showDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    
    const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('memberSince').textContent = memberSince;

    document.getElementById('dashboard').classList.remove('hidden');
    document.querySelector('.auth-container').style.display = 'none';
}

function hideDashboard() {
    document.getElementById('dashboard').classList.add('hidden');
    document.querySelector('.auth-container').style.display = 'block';
    document.querySelector('.login-form').classList.add('active-form');
    document.querySelector('.register-form').classList.remove('active-form');
}

// =============================================
// Page Navigation
// =============================================
function showPage(pageId) {
    Object.values(pages).forEach(page => {
        if (page) page.classList.remove('active-page');
    });
    
    Object.values(navLinks).forEach(link => {
        if (link) link.classList.remove('active');
    });

    if (pages[pageId]) {
        pages[pageId].classList.add('active-page');
    }
    
    if (navLinks[pageId]) {
        navLinks[pageId].classList.add('active');
    }

    if (pageId === 'auth') {
        if (isLoggedIn()) {
            showDashboard();
        } else {
            hideDashboard();
        }
    }

    document.querySelector('.nav-links')?.classList.remove('active');
    document.querySelector('.hamburger')?.classList.remove('active');
}

// =============================================
// Auth Functions
// =============================================
function toggleForms() {
    document.querySelector('.login-form').classList.toggle('active-form');
    document.querySelector('.register-form').classList.toggle('active-form');
}

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;

    if (!name || !email || !password || !confirm) {
        showToast('Please fill in all fields!', 'error');
        return;
    }

    if (password !== confirm) {
        showToast('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters!', 'error');
        return;
    }

    if (users.find(u => u.email === email)) {
        showToast('User already exists!', 'error');
        return;
    }

    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        hasLicense: false
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast('Registration successful!', 'success');
    e.target.reset();
    setTimeout(() => toggleForms(), 2000);
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Please fill in all fields!', 'error');
        return;
    }

    const user = users.find(u => u.email === email && u.password === hashPassword(password));
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        }));
        
        showToast('Login successful!', 'success');
        e.target.reset();
        updateUserEmail();
        showPage('auth');
        checkLicenseAccess();
    } else {
        showToast('Invalid email or password!', 'error');
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully!', 'success');
    updateUserEmail();
    hideDashboard();
    checkLicenseAccess();
});

document.getElementById('registerLink').addEventListener('click', (e) => {
    e.preventDefault();
    toggleForms();
});

document.getElementById('loginLink').addEventListener('click', (e) => {
    e.preventDefault();
    toggleForms();
});

// =============================================
// License Redemption - FIXED
// =============================================
document.getElementById('redeemBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const licenseKey = document.getElementById('licenseKey').value.trim();

    if (!licenseKey) {
        showLicenseStatus('Please enter a license key.', 'error');
        return;
    }

    if (!isLoggedIn()) {
        showLicenseStatus('You must be logged in to redeem a license.', 'error');
        return;
    }

    if (!VALID_KEYS.includes(licenseKey)) {
        showLicenseStatus('Invalid license key.', 'error');
        return;
    }

    if (usedKeys[licenseKey]) {
        showLicenseStatus('This license has already been redeemed.', 'error');
        return;
    }

    const currentUser = getCurrentUser();

    usedKeys[licenseKey] = {
        usedBy: currentUser.email,
        usedAt: new Date().toISOString()
    };
    localStorage.setItem('usedKeys', JSON.stringify(usedKeys));

    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].hasLicense = true;
        localStorage.setItem('users', JSON.stringify(users));
    }

    currentUser.hasLicense = true;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    showLicenseStatus('License verified! Download and WebGui unlocked.', 'success');
    checkLicenseAccess();
    document.getElementById('licenseKey').value = '';
    showToast('Download and WebGui access granted!', 'success');
});

// =============================================
// Navigation Setup
// =============================================
document.getElementById('homeLink').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('home');
});

document.getElementById('productsLink').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('products');
});

document.getElementById('webguiLink').addEventListener('click', (e) => {
    e.preventDefault();
    if (userHasLicense()) {
        showPage('webgui');
    } else {
        showToast('You need a valid license to access WebGui!', 'error');
        showPage('license');
    }
});

document.getElementById('downloadLink').addEventListener('click', (e) => {
    e.preventDefault();
    if (userHasLicense()) {
        showPage('download');
    } else {
        showToast('You need a valid license to access downloads!', 'error');
        showPage('license');
    }
});

document.getElementById('faqLink').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('faq');
});

document.getElementById('authLink').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('auth');
});

document.getElementById('licenseLink').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('license');
});

document.getElementById('heroProductsBtn').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('products');
});

document.getElementById('heroDownloadBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (userHasLicense()) {
        showPage('download');
    } else {
        showToast('You need a valid license!', 'error');
        showPage('license');
    }
});

// =============================================
// Hamburger Menu
// =============================================
window.toggleMenu = function() {
    document.querySelector(".hamburger").classList.toggle("active");
    document.querySelector(".nav-links").classList.toggle("active");
};

// =============================================
// Initialize
// =============================================
loadLicenses().then(() => {
    updateUserEmail();
    checkLicenseAccess();
    showPage('home');
});
