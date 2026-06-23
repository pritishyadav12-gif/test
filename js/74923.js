// =============================================
// ApiService Definition (MUST be defined BEFORE WebGUIApp)
// =============================================
class ApiService {
    constructor() {
        this.baseUrl = null;
        this.sessionCookie = null;
        this.connectionCallbacks = [];
        this.themes = {
            default: { name: 'Pika Glass', bg: '#050611', headerBg: 'rgba(21, 18, 47, 0.72)', text: '#f6f3ff', moduleEnabled: '#ffffff', moduleDisabled: '#8d86a8', moduleEnabledBg: 'rgba(128, 89, 255, 0.28)', moduleDisabledBg: 'rgba(255, 255, 255, 0.08)', grad1: '#9b6dff', grad2: '#6ee7ff' },
            halloween: { name: 'Halloween', bg: '#1a0f0f', headerBg: '#2a1515', text: '#ff7518', moduleEnabled: '#ff7518', moduleDisabled: '#8b4513', moduleEnabledBg: '#3a1f1f', moduleDisabledBg: '#2a1515', grad1: '#ff7518', grad2: '#ff4500' },
            dark: { name: 'Dark', bg: '#151515', headerBg: '#1f1f1f', text: '#00aaaa', moduleEnabled: '#00aaaa', moduleDisabled: '#808080', moduleEnabledBg: '#505050', moduleDisabledBg: '#353535', grad1: '#00aaaa', grad2: '#00ffff' },
            light: { name: 'Light', bg: '#f5f5f5', headerBg: '#e0e0e0', text: '#0080ff', moduleEnabled: '#0080ff', moduleDisabled: '#505050', moduleEnabledBg: '#c8c8c8', moduleDisabledBg: '#b4b4b4', grad1: '#0080ff', grad2: '#50aaff' },
            slate: { name: 'Slate', bg: '#1a1f2c', headerBg: '#252a3a', text: '#4fc3f7', moduleEnabled: '#4fc3f7', moduleDisabled: '#78909c', moduleEnabledBg: '#37474f', moduleDisabledBg: '#2a2f3f', grad1: '#4fc3f7', grad2: '#80deea' },
            espresso: { name: 'Espresso', bg: '#3e2723', headerBg: '#5d4037', text: '#d7ccc8', moduleEnabled: '#d7ccc8', moduleDisabled: '#8d6e63', moduleEnabledBg: '#4e342e', moduleDisabledBg: '#3e2a24', grad1: '#a1887f', grad2: '#bcaaa4' },
            arctic: { name: 'Arctic', bg: '#0d1b2a', headerBg: '#1b263b', text: '#90e0ef', moduleEnabled: '#90e0ef', moduleDisabled: '#48cae4', moduleEnabledBg: '#415a77', moduleDisabledBg: '#1b2a3a', grad1: '#90e0ef', grad2: '#caf0f8' },
            midnight: { name: 'Midnight', bg: '#000814', headerBg: '#001d3d', text: '#ffd60a', moduleEnabled: '#ffd60a', moduleDisabled: '#8e9aaf', moduleEnabledBg: '#003566', moduleDisabledBg: '#001a30', grad1: '#ffd60a', grad2: '#ffea00' },
            dracula: { name: 'Dracula', bg: '#282a36', headerBg: '#44475a', text: '#f8f8f2', moduleEnabled: '#bd93f9', moduleDisabled: '#6272a4', moduleEnabledBg: '#44475a', moduleDisabledBg: '#2d2f3d', grad1: '#bd93f9', grad2: '#ffb86c' },
            obsidian: { name: 'Obsidian', bg: '#0a0a0a', headerBg: '#1a1a1a', text: '#ffd700', moduleEnabled: '#ffd700', moduleDisabled: '#8b7355', moduleEnabledBg: '#2a2a2a', moduleDisabledBg: '#151515', grad1: '#ffd700', grad2: '#daa520' },
            abyss: { name: 'Abyss', bg: '#00072d', headerBg: '#0a2472', text: '#00b4d8', moduleEnabled: '#00b4d8', moduleDisabled: '#006994', moduleEnabledBg: '#001c55', moduleDisabledBg: '#001440', grad1: '#00b4d8', grad2: '#90e0ef' }
        };
        this.currentTheme = 'default';
        
        const savedTheme = localStorage.getItem('webgui_theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }
    }

    onConnectionChange(callback) {
        this.connectionCallbacks.push(callback);
    }

    notifyConnectionChange(status) {
        this.connectionCallbacks.forEach(cb => cb(status));
    }

    async detectServer() {
        try {
            console.log('Attempting to connect to localhost:3001...');
            
            const response = await fetch('http://localhost:3001/api/status', {
                method: 'GET',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                console.log('✅ Connected to localhost:3001');
                this.baseUrl = 'http://localhost:3001';
                this.notifyConnectionChange('connected');
                return true;
            }
        } catch (e) {
            console.log('localhost connection error:', e.message);
        }

        if (window.CONFIG && CONFIG.TUNNEL_SERVER) {
            try {
                const response = await fetch(CONFIG.TUNNEL_SERVER + '/api/status', {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    console.log('✅ Connected to tunnel');
                    this.baseUrl = CONFIG.TUNNEL_SERVER;
                    this.notifyConnectionChange('connected');
                    return true;
                }
            } catch (e) {
                console.log('Tunnel connection failed');
            }
        }

        console.log('❌ No server connection available');
        this.notifyConnectionChange('disconnected');
        return false;
    }

    async request(endpoint, options = {}) {
        if (!this.baseUrl) {
            throw new Error('No server connection');
        }

        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            return response;
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }

    applyTheme(theme) {
        if (!theme) return;
        
        const root = document.documentElement;
        root.style.setProperty('--bg-color', theme.bg);
        root.style.setProperty('--header-bg', theme.headerBg);
        root.style.setProperty('--text-color', theme.text);
        root.style.setProperty('--module-enabled', theme.moduleEnabled);
        root.style.setProperty('--module-disabled', theme.moduleDisabled);
        root.style.setProperty('--module-enabled-bg', theme.moduleEnabledBg);
        root.style.setProperty('--module-disabled-bg', theme.moduleDisabledBg);
        root.style.setProperty('--accent-color', theme.grad1);
        root.style.setProperty('--secondary-accent', theme.grad2);
        
        const indicator = document.querySelector('#webgui #currentThemeIndicator');
        if (indicator) indicator.textContent = `Theme: ${theme.name || 'Default'}`;
    }

    async setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.applyTheme(this.themes[themeName]);
            localStorage.setItem('webgui_theme', themeName);
            
            const themeCards = document.querySelectorAll('#webgui .theme-card');
            themeCards.forEach(card => {
                if (card.getAttribute('onclick')?.includes(themeName)) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
            
            return true;
        }
        return false;
    }
}

// =============================================
// WebGUI Application
// =============================================
class WebGUIApp {
    constructor() {
        this.api = new ApiService();
        this.currentCategory = 'all';
        this.expandedModules = new Set();
        this.activeKeybindInput = null;
        this.activeModePopup = null;
        this.configDropdownVisible = false;
        this.isAuthenticated = false;
        this.moduleStates = {};
        this.settingStates = {};
        this.lastUsedConfig = null;
        this.init();
    }

    async init() {
        this.bindEvents();
        this.setupConnectionListener();
        this.renderThemeGrid();
        
        this.api.applyTheme(this.api.themes[this.api.currentTheme]);
        
        await this.checkConnection();
    }

    setupConnectionListener() {
        this.api.onConnectionChange((status) => {
            this.updateConnectionStatus(status);
        });
    }

    updateConnectionStatus(status) {
        const statusEl = document.querySelector('#webgui .connection-pill');
        const dot = statusEl?.querySelector('.connection-dot');
        const text = statusEl?.querySelector('.connection-text');
        
        if (!statusEl || !dot || !text) return;
        
        switch(status) {
            case 'connected':
                dot.className = 'connection-dot connected';
                text.textContent = 'Connected';
                break;
            case 'disconnected':
                dot.className = 'connection-dot disconnected';
                text.textContent = 'Disconnected';
                break;
            default:
                dot.className = 'connection-dot';
                text.textContent = 'Connecting...';
        }
    }

    bindEvents() {
        const loginForm = document.querySelector('#webgui #login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }

        document.querySelectorAll('#webgui .category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabButton = e.target.closest('.category-tab');
                if (!tabButton) return;
                document.querySelectorAll('#webgui .category-tab').forEach(t => t.classList.remove('active'));
                tabButton.classList.add('active');
                this.currentCategory = tabButton.dataset.category;
                this.filterModules();
            });
        });

        const searchInput = document.querySelector('#webgui #searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterModules());
        }

        document.querySelector('#webgui #refresh-connection')?.addEventListener('click', () => {
            this.checkConnection();
        });

        document.addEventListener('click', (e) => {
            if (this.configDropdownVisible && !e.target.closest('#webgui .config-controls')) {
                const dropdown = document.querySelector('#webgui #configDropdown');
                if (dropdown) dropdown.style.display = 'none';
                this.configDropdownVisible = false;
            }
            
            if (this.activeModePopup && !e.target.closest('.mode-popup') && !e.target.closest('.keybind-mode')) {
                if (document.body.contains(this.activeModePopup)) {
                    document.body.removeChild(this.activeModePopup);
                }
                this.activeModePopup = null;
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.activeKeybindInput) {
                e.preventDefault();
                e.stopPropagation();
                
                if (e.key === 'Escape') {
                    this.cancelKeybindListening();
                    return;
                }
                
                this.setKeybind(this.activeKeybindInput.module, this.activeKeybindInput.setting, e.keyCode);
            }
        });
    }

    async checkConnection() {
        this.updateConnectionStatus('checking');
        
        const connected = await this.api.detectServer();
        
        if (connected) {
            try {
                const response = await this.api.request('/api/status');
                const data = await response.json();
                console.log('Status response:', data);
                
                const hasSession = document.cookie.includes('session=valid');
                
                if (hasSession && data.hardwareAuthorized) {
                    this.isAuthenticated = true;
                    this.showMainScreen();
                    
                    localStorage.removeItem('moduleStates');
                    localStorage.removeItem('settingStates');
                    
                    await this.loadModules();
                    await this.loadCurrentConfig();
                    await this.loadConfigsList();
                    
                    this.updateHardwareInfo(data);
                    this.startPeriodicUpdates();
                    this.showNotification('Welcome back!', 'success');
                } else {
                    this.showLoginScreen();
                    this.updateHardwareStatus();
                }
            } catch (e) {
                console.error('Error getting status:', e);
                this.showLoginScreen();
            }
        } else {
            this.showLoginScreen();
            this.showNotification('Cannot connect to local server', 'error');
        }
    }

    async login() {
        const username = document.querySelector('#webgui #username').value;
        const password = document.querySelector('#webgui #password').value;
        
        if (username !== CONFIG.CREDENTIALS.username || password !== CONFIG.CREDENTIALS.password) {
            this.showLoginError('Invalid credentials');
            return;
        }

        try {
            const hwResponse = await this.api.request('/api/hardware-status');
            const hwData = await hwResponse.json();
            
            if (!hwData.authorized) {
                this.showLoginError('Hardware not authorized');
                return;
            }

            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${this.api.baseUrl}/`, {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString(),
                redirect: 'manual'
            });

            if (response.type === 'opaqueredirect' || response.status === 302 || response.redirected) {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                let retries = 3;
                let statusData = null;
                
                while (retries > 0) {
                    try {
                        const statusResponse = await this.api.request('/api/status');
                        statusData = await statusResponse.json();
                        
                        if (statusData.authenticated) {
                            break;
                        }
                    } catch (e) {
                        console.log('Status check failed, retrying...', retries);
                    }
                    
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                if (statusData && statusData.authenticated && statusData.hardwareAuthorized) {
                    this.isAuthenticated = true;
                    this.showMainScreen();
                    
                    localStorage.removeItem('moduleStates');
                    localStorage.removeItem('settingStates');
                    
                    await this.loadModules();
                    await this.loadConfigsList();
                    this.updateHardwareInfo(statusData);
                    this.startPeriodicUpdates();
                    this.showNotification('Login successful', 'success');
                } else {
                    this.showLoginError('Login failed - session not established');
                    this.showLoginScreen();
                }
            } else {
                this.showLoginError('Login failed - server returned: ' + response.status);
            }
        } catch (e) {
            console.error('Login error:', e);
            this.showLoginError('Connection error');
        }
    }

    showLoginScreen() {
        document.querySelector('#webgui #login-screen').classList.remove('hidden');
        document.querySelector('#webgui #main-screen').classList.add('hidden');
        this.updateHardwareStatus();
    }

    showMainScreen() {
        document.querySelector('#webgui #login-screen').classList.add('hidden');
        document.querySelector('#webgui #main-screen').classList.remove('hidden');
    }

    showLoginError(message) {
        const errorEl = document.querySelector('#webgui #login-error');
        if (!errorEl) return;
        
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        setTimeout(() => {
            errorEl.classList.add('hidden');
        }, 3000);
    }

    async updateHardwareStatus() {
        try {
            const response = await this.api.request('/api/hardware-status');
            const data = await response.json();
            
            const hwStatus = document.querySelector('#webgui #hwStatus');
            const hwId = document.querySelector('#webgui #hwId');
            const loginBtn = document.querySelector('#webgui #loginBtn');
            
            if (hwStatus) {
                hwStatus.textContent = data.authorized ? 'AUTHORIZED' : 'UNAUTHORIZED';
                hwStatus.className = data.authorized ? 'hardware-badge' : 'hardware-badge unauthorized';
            }
            
            if (hwId) {
                hwId.textContent = data.hardwareId || 'Unknown';
            }
            
            if (loginBtn) {
                loginBtn.disabled = !data.authorized;
            }
        } catch (e) {
            console.error('Error fetching hardware status:', e);
        }
    }

    updateHardwareInfo(data) {
        const sidebarHwId = document.querySelector('#webgui #sidebarHwId');
        if (sidebarHwId) sidebarHwId.textContent = data.hardwareId;
        
        const statusDot = document.querySelector('#webgui .status-dot');
        const statusText = document.querySelector('#webgui .status-text');
        
        if (data.hardwareAuthorized) {
            statusDot.className = 'status-dot authorized';
            statusText.textContent = 'Authorized';
        } else {
            statusDot.className = 'status-dot unauthorized';
            statusText.textContent = 'Unauthorized';
        }
    }

    async loadModules() {
        try {
            const response = await this.api.request('/api/modules');
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.log('Not authorized to load modules');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const modules = await response.json();
            console.log('Modules loaded from server:', modules);
            
            this.moduleStates = {};
            modules.forEach(module => {
                this.moduleStates[module.name] = module.enabled;
            });
            
            this.renderModules(modules);
            this.updateStats(modules);
        } catch (e) {
            console.error('Error loading modules:', e);
            document.querySelector('#webgui #modulesContainer').innerHTML = '<div class="loading-state error">Failed to load modules</div>';
        }
    }

    renderModules(modules) {
        const container = document.querySelector('#webgui #modulesContainer');
        if (!container) return;
        
        if (!modules || modules.length === 0) {
            container.innerHTML = '<div class="loading-state">No modules found</div>';
            return;
        }
        
        let html = '';
        
        modules.forEach(module => {
            const category = module.category ? module.category.toLowerCase() : 'misc';
            const isEnabled = this.moduleStates[module.name];
            const isExpanded = this.expandedModules.has(module.name);
            const arrowClass = isExpanded ? 'arrow-icon expanded' : 'arrow-icon';
            
            html += `
                <div class="module-card ${isEnabled ? 'enabled' : ''}" data-category="${category}" data-name="${module.name.toLowerCase()}">
                    <div class="module-header" onclick="webguiApp.toggleModuleSettings('${module.name.replace(/'/g, "\\'")}')">
                        <div class="module-title-container">
                            <span class="${arrowClass}">▶</span>
                            <div style="flex: 1;">
                                <div class="module-title">${module.name}</div>
                                <div class="module-category">${module.category || 'Misc'}</div>
                            </div>
                        </div>
                        <label class="toggle-switch" onclick="event.stopPropagation()">
                            <input type="checkbox" ${isEnabled ? 'checked' : ''} 
                                onchange="webguiApp.toggleModule('${module.name.replace(/'/g, "\\'")}', this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="module-description">${module.description || 'No description'}</div>
                    <div class="settings-container ${isExpanded ? 'expanded' : ''}" id="settings-${module.name.replace(/\s+/g, '-').replace(/'/g, '')}">
                        ${isExpanded ? '<div class="loading-state">Loading settings...</div>' : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        this.expandedModules.forEach(moduleName => {
            this.loadModuleSettings(moduleName);
        });
        
        this.filterModules();
    }

    async toggleModule(moduleName, enabled) {
        this.moduleStates[moduleName] = enabled;
        
        try {
            const formData = new URLSearchParams();
            formData.append('module', moduleName);
            formData.append('enabled', enabled);

            const response = await this.api.request('/api/toggle', {
                method: 'POST',
                body: formData.toString()
            });
            
            const result = await response.json();
            this.showNotification(result.message, result.success ? 'success' : 'error');
            
            if (result.success) {
                const checkboxes = document.querySelectorAll(`#webgui .module-card[data-name="${moduleName.toLowerCase()}"] input[type="checkbox"]`);
                checkboxes.forEach(cb => {
                    cb.checked = enabled;
                    cb.closest('.module-card')?.classList.toggle('enabled', enabled);
                });
            }
        } catch (e) {
            console.error('Error toggling module:', e);
            this.showNotification('Failed to toggle module', 'error');
        }
    }

    async toggleModuleSettings(moduleName) {
        if (this.expandedModules.has(moduleName)) {
            this.expandedModules.delete(moduleName);
        } else {
            this.expandedModules.add(moduleName);
            await this.loadModuleSettings(moduleName);
        }
        await this.loadModules();
    }

    async loadModuleSettings(moduleName) {
        const container = document.querySelector(`#webgui #settings-${moduleName.replace(/\s+/g, '-').replace(/'/g, '')}`);
        if (!container) return;
        
        try {
            const response = await this.api.request(`/api/settings?module=${encodeURIComponent(moduleName)}`);
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.log('Not authorized to load settings');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const settings = await response.json();
            console.log(`Settings for ${moduleName} from server:`, settings);
            
            settings.forEach(setting => {
                const settingKey = `${moduleName}_${setting.name}`;
                this.settingStates[settingKey] = setting.value;
            });
            
            if (settings && settings.length > 0) {
                this.renderSettings(settings, moduleName, container);
            } else {
                container.innerHTML = '<div class="no-settings">No settings available</div>';
            }
        } catch (e) {
            console.error('Error loading settings:', e);
            container.innerHTML = '<div class="error-message">Failed to load settings</div>';
        }
    }

    renderSettings(settings, moduleName, container) {
        let html = '<div class="settings-list">';
        settings.forEach(setting => {
            const settingKey = `${moduleName}_${setting.name}`;
            const value = this.settingStates[settingKey] || setting.value;
            
            html += `
                <div class="setting-item">
                    <div class="setting-label">${setting.name}</div>
                    <div class="setting-description">${setting.description || ''}</div>
                    <div class="setting-control">
                        ${this.generateSettingControl(setting, moduleName, value)}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    generateSettingControl(setting, moduleName, value) {
        switch(setting.type) {
            case 'bool':
                const boolValue = value === 'true' || value === true;
                return `
                    <label class="toggle-switch">
                        <input type="checkbox" ${boolValue ? 'checked' : ''}
                            onchange="webguiApp.updateSetting('${moduleName.replace(/'/g, "\\'")}', '${setting.name.replace(/'/g, "\\'")}', '${setting.type}', this.checked ? 'true' : 'false')">
                        <span class="toggle-slider"></span>
                    </label>
                `;
                
            case 'float':
            case 'int':
                const numValue = parseFloat(value);
                const step = setting.type === 'int' ? '1' : '0.01';
                return `
                    <div class="slider-container">
                        <input type="range" class="slider-input" min="${setting.min || 0}" max="${setting.max || 100}" 
                            value="${numValue}" step="${step}"
                            oninput="webguiApp.updateSliderValue(this, '${moduleName.replace(/'/g, "\\'")}', '${setting.name.replace(/'/g, "\\'")}', '${setting.type}')">
                        <span class="slider-value" id="value-${moduleName.replace(/\s+/g, '-')}-${setting.name.replace(/\s+/g, '-')}">
                            ${setting.type === 'int' ? Math.round(numValue) : numValue.toFixed(2)}
                        </span>
                    </div>
                `;
                
            case 'keybind':
                const isListening = this.activeKeybindInput && 
                                   this.activeKeybindInput.module === moduleName && 
                                   this.activeKeybindInput.setting === setting.name;
                
                const currentMode = setting.keybindMode !== undefined ? setting.keybindMode : 1;
                const modeNames = ['Hold', 'Toggle', 'Always'];
                
                return `
                    <div class="keybind-container">
                        <div class="keybind-display ${isListening ? 'listening' : ''}" 
                             onclick="webguiApp.startKeybindCapture(this, '${moduleName.replace(/'/g, "\\'")}', '${setting.name.replace(/'/g, "\\'")}')">
                            ${isListening ? 'Press any key...' : (setting.keyName || 'None')}
                        </div>
                        <div class="keybind-mode" onclick="webguiApp.showKeybindModePopup(event, this, '${moduleName.replace(/'/g, "\\'")}', '${setting.name.replace(/'/g, "\\'")}', ${currentMode})">
                            ${modeNames[currentMode] || 'Toggle'}
                        </div>
                    </div>
                `;
                
            case 'dropdown':
                let options = '';
                if (setting.modes) {
                    setting.modes.forEach((mode, index) => {
                        const selected = index === parseInt(value) ? 'selected' : '';
                        options += `<option value="${index}" ${selected}>${mode}</option>`;
                    });
                }
                return `
                    <div class="select-wrapper">
                        <select onchange="webguiApp.updateSetting('${moduleName.replace(/'/g, "\\'")}', '${setting.name.replace(/'/g, "\\'")}', '${setting.type}', this.value)">
                            ${options}
                        </select>
                        <svg class="select-arrow" viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </div>
                `;
                
            case 'multidropdown':
                const values = value.split(',');
                let multidropdown = '<div class="multidropdown-container">';
                if (setting.modes) {
                    setting.modes.forEach((mode, index) => {
                        const checked = values[index] === '1';
                        multidropdown += `
                            <div class="multidropdown-option" onclick="webguiApp.toggleMultiDropdown('${moduleName.replace(/'/g, "\\'")}', '${setting.name.replace(/'/g, "\\'")}', ${index})">
                                <div class="multidropdown-checkbox ${checked ? 'checked' : ''}">
                                    ${checked ? '<span>✓</span>' : ''}
                                </div>
                                <span>${mode}</span>
                            </div>
                        `;
                    });
                }
                multidropdown += '</div>';
                return multidropdown;
                
            default:
                return '';
        }
    }

    updateSliderValue(slider, moduleName, settingName, type) {
        const valueDisplay = document.querySelector(`#webgui #value-${moduleName.replace(/\s+/g, '-')}-${settingName.replace(/\s+/g, '-')}`);
        if (valueDisplay) {
            const value = parseFloat(slider.value);
            valueDisplay.textContent = type === 'int' ? Math.round(value) : value.toFixed(2);
        }
        this.updateSetting(moduleName, settingName, type, slider.value);
    }

    async updateSetting(moduleName, settingName, type, value) {
        const settingKey = `${moduleName}_${settingName}`;
        
        try {
            const formData = new URLSearchParams();
            formData.append('module', moduleName);
            formData.append('setting', settingName);
            formData.append('value', value);
            formData.append('type', type);

            const response = await this.api.request('/api/update-setting', {
                method: 'POST',
                body: formData.toString()
            });
            
            const result = await response.json();
            if (result.success) {
                this.settingStates[settingKey] = value;
            } else {
                this.showNotification(result.message || 'Failed to update setting', 'error');
            }
        } catch (e) {
            console.error('Error updating setting:', e);
            this.showNotification('Failed to update setting', 'error');
        }
    }

    toggleMultiDropdown(moduleName, settingName, index) {
        const container = event.target.closest('.multidropdown-container');
        const checkboxes = container.querySelectorAll('.multidropdown-checkbox');
        const values = [];
        
        checkboxes.forEach((checkbox, i) => {
            if (i === index) {
                checkbox.classList.toggle('checked');
                if (checkbox.classList.contains('checked')) {
                    checkbox.innerHTML = '<span>✓</span>';
                } else {
                    checkbox.innerHTML = '';
                }
            }
            values.push(checkbox.classList.contains('checked') ? '1' : '0');
        });
        
        this.updateSetting(moduleName, settingName, 'multidropdown', values.join(','));
    }

    startKeybindCapture(element, moduleName, settingName) {
        if (this.activeKeybindInput) {
            this.activeKeybindInput.textContent = this.activeKeybindInput.dataset.originalText || 'None';
            this.activeKeybindInput.style.color = '#e0e0e0';
            document.removeEventListener('keydown', this.keybindCaptureHandler);
        }
        
        this.activeKeybindInput = element;
        this.activeKeybindInput.dataset.originalText = element.textContent;
        this.activeKeybindInput.textContent = 'Press a key...';
        this.activeKeybindInput.style.color = '#4ecdc4';
        
        this.keybindCaptureHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (e.key === 'Escape') {
                this.activeKeybindInput.textContent = this.activeKeybindInput.dataset.originalText || 'None';
                this.activeKeybindInput.style.color = '#e0e0e0';
                this.activeKeybindInput = null;
                document.removeEventListener('keydown', this.keybindCaptureHandler);
            } else {
                const keyName = this.getKeyName(e.keyCode);
                this.activeKeybindInput.textContent = keyName;
                this.activeKeybindInput.style.color = '#e0e0e0';
                this.updateSetting(moduleName, settingName, 'keybind', e.keyCode.toString());
                document.removeEventListener('keydown', this.keybindCaptureHandler);
                this.activeKeybindInput = null;
            }
        };
        
        document.addEventListener('keydown', this.keybindCaptureHandler);
    }

    showKeybindModePopup(event, element, moduleName, settingName, currentMode) {
        event.stopPropagation();
        
        if (this.activeModePopup) {
            if (document.body.contains(this.activeModePopup)) {
                document.body.removeChild(this.activeModePopup);
            }
            this.activeModePopup = null;
        }
        
        const rect = element.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'mode-popup';
        popup.style.top = (rect.bottom + 5) + 'px';
        popup.style.left = (rect.left) + 'px';
        popup.style.position = 'fixed';
        popup.style.zIndex = '10000';
        
        const modes = ['Hold', 'Toggle', 'Always'];
        modes.forEach((mode, index) => {
            const option = document.createElement('div');
            option.className = 'mode-option';
            if (index === currentMode) option.classList.add('selected');
            option.textContent = mode;
            option.onclick = (e) => {
                e.stopPropagation();
                this.updateKeybindMode(moduleName, settingName, index);
                element.textContent = mode;
                if (document.body.contains(popup)) {
                    document.body.removeChild(popup);
                }
                this.activeModePopup = null;
            };
            popup.appendChild(option);
        });
        
        document.body.appendChild(popup);
        this.activeModePopup = popup;
        
        const closePopup = (e) => {
            if (!popup.contains(e.target) && e.target !== element) {
                if (document.body.contains(popup)) {
                    document.body.removeChild(popup);
                }
                document.removeEventListener('click', closePopup);
                this.activeModePopup = null;
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closePopup);
        }, 0);
    }

    async updateKeybindMode(moduleName, settingName, mode) {
        try {
            const formData = new URLSearchParams();
            formData.append('module', moduleName);
            formData.append('setting', settingName);
            formData.append('mode', mode);

            const response = await this.api.request('/api/update-keybind-mode', {
                method: 'POST',
                body: formData.toString()
            });
            
            const result = await response.json();
            if (!result.success) {
                this.showNotification('Failed to update keybind mode', 'error');
            }
            
            this.loadModuleSettings(moduleName);
        } catch (e) {
            console.error('Error updating keybind mode:', e);
            this.showNotification('Failed to update keybind mode', 'error');
        }
    }

    getKeyName(keyCode) {
        if (keyCode >= 65 && keyCode <= 90) return String.fromCharCode(keyCode);
        if (keyCode >= 48 && keyCode <= 57) return String.fromCharCode(keyCode);
        switch(keyCode) {
            case 1: return 'LMB';
            case 2: return 'RMB';
            case 4: return 'MMB';
            case 5: return 'Mouse4';
            case 6: return 'Mouse5';
            case 32: return 'Space';
            case 9: return 'Tab';
            case 16: return 'Shift';
            case 17: return 'Ctrl';
            case 18: return 'Alt';
            case 27: return 'Esc';
            case 20: return 'CapsLock';
            case 13: return 'Enter';
            case 8: return 'Backspace';
            case 46: return 'Delete';
            case 45: return 'Insert';
            case 36: return 'Home';
            case 35: return 'End';
            case 33: return 'PgUp';
            case 34: return 'PgDn';
            case 38: return 'Up';
            case 40: return 'Down';
            case 37: return 'Left';
            case 39: return 'Right';
            default: return '[' + keyCode + ']';
        }
    }

    filterModules() {
        const searchTerm = document.querySelector('#webgui #searchInput')?.value.toLowerCase() || '';
        
        document.querySelectorAll('#webgui .module-card').forEach(card => {
            const category = card.dataset.category;
            const name = card.dataset.name;
            const matchesCategory = this.currentCategory === 'all' || category === this.currentCategory;
            const matchesSearch = !searchTerm || name.includes(searchTerm);
            
            card.style.display = matchesCategory && matchesSearch ? 'block' : 'none';
        });
    }

    updateStats(modules) {
        const total = modules.length;
        const enabled = modules.filter(m => m.enabled).length;
        
        document.querySelector('#webgui #moduleCount').textContent = `${total} modules`;
        document.querySelector('#webgui #enabledCount').textContent = `${enabled} enabled`;

        document.querySelectorAll('#webgui .category-tab').forEach(tab => {
            const category = tab.dataset.category;
            const count = category === 'all'
                ? total
                : modules.filter(m => (m.category || 'misc').toLowerCase() === category).length;
            let badge = tab.querySelector('.category-count');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'category-count';
                tab.appendChild(badge);
            }
            badge.textContent = count;
        });
    }

    renderThemeGrid() {
        const grid = document.querySelector('#webgui #themeGrid');
        if (!grid) return;
        
        let html = '';
        for (const [key, theme] of Object.entries(this.api.themes)) {
            html += `
                <div class="theme-card ${key === this.api.currentTheme ? 'active' : ''}" onclick="webguiApp.selectTheme('${key}')">
                    <div class="theme-preview">
                        <div class="preview-header" style="background: ${theme.headerBg};"></div>
                        <div class="preview-content" style="background: ${theme.bg};">
                            <div class="preview-module" style="background: ${theme.moduleDisabledBg};"></div>
                            <div class="preview-module enabled" style="background: ${theme.grad1};"></div>
                        </div>
                    </div>
                    <div class="theme-info">
                        <h3>${theme.name}</h3>
                        <p>${this.getThemeDescription(key)}</p>
                    </div>
                </div>
            `;
        }
        grid.innerHTML = html;
    }

    getThemeDescription(theme) {
        const descriptions = {
            default: 'Clean dark theme',
            halloween: 'Spooky orange theme',
            dark: 'Simple dark theme',
            light: 'Bright light theme',
            slate: 'Blue-gray professional',
            espresso: 'Warm brown coffee theme',
            arctic: 'Cool blue ice theme',
            midnight: 'Deep space darkness',
            dracula: 'Legendary vampire theme',
            obsidian: 'Premium black & gold',
            abyss: 'Deep ocean depths'
        };
        return descriptions[theme] || 'Custom theme';
    }

    async selectTheme(themeName) {
        const success = await this.api.setTheme(themeName);
        if (success) {
            this.renderThemeGrid();
            this.showNotification(`Theme changed to: ${themeName}`, 'success');
        }
    }

    // ==================== CONFIG HUB METHODS ====================
    
    showConfigHub() {
        const modulesContainer = document.querySelector('#webgui #modulesContainer');
        const configManagerContainer = document.querySelector('#webgui #configmanagerContainer');
        const themesContainer = document.querySelector('#webgui #themesContainer');
        let configHubContainer = document.querySelector('#webgui #confighubContainer');
        
        // Create container if it doesn't exist
        if (!configHubContainer) {
            const contentArea = document.querySelector('#webgui .content-area');
            configHubContainer = document.createElement('div');
            configHubContainer.id = 'confighubContainer';
            configHubContainer.className = 'confighub-container hidden';
            configHubContainer.innerHTML = `
                <div class="confighub-section">
                    <div class="confighub-header">
                        <h2><i class="fas fa-cloud-download-alt"></i> Config Hub</h2>
                        <p class="section-description">Download community-shared configurations directly to your client</p>
                    </div>
                    <div id="configHubList" class="config-hub-grid">
                        <div class="loading-state">
                            <div class="loader"></div>
                            <p>Loading available configs...</p>
                        </div>
                    </div>
                </div>
            `;
            contentArea.appendChild(configHubContainer);
        }
        
        if (modulesContainer) modulesContainer.style.display = 'none';
        if (configManagerContainer) configManagerContainer.style.display = 'none';
        if (themesContainer) themesContainer.style.display = 'none';
        if (configHubContainer) {
            configHubContainer.style.display = 'block';
            this.loadConfigHubList();
        }
    }

    async loadConfigHubList() {
        const container = document.querySelector('#webgui #configHubList');
        if (!container) return;
        
        try {
            const response = await this.api.request('/api/config-hub/list');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const configs = await response.json();
            console.log('Config Hub configs:', configs);
            
            if (!configs || configs.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-cloud-download-alt"></i>
                        <p>No community configs available yet.</p>
                        <p style="font-size: 0.8rem; margin-top: 10px;">Check back later!</p>
                    </div>
                `;
                return;
            }
            
            let html = '<div class="config-hub-grid">';
            for (const config of configs) {
                const tagsHtml = (config.tags || []).map(tag => 
                    `<span class="config-hub-tag">${this.escapeHtml(tag)}</span>`
                ).join('');
                
                html += `
                    <div class="config-hub-card">
                        <div class="config-hub-card-header">
                            <h3>${this.escapeHtml(config.name)}</h3>
                            <span class="config-hub-version">v${this.escapeHtml(config.version)}</span>
                        </div>
                        <div class="config-hub-card-body">
                            <div class="config-hub-description">${this.escapeHtml(config.description)}</div>
                            <div class="config-hub-meta">
                                <div class="config-hub-author">
                                    <i class="fas fa-user"></i> ${this.escapeHtml(config.author)}
                                </div>
                                <div class="config-hub-downloads">
                                    <i class="fas fa-download"></i> ${config.downloads || 0} downloads
                                </div>
                            </div>
                            <div class="config-hub-tags">
                                ${tagsHtml}
                            </div>
                            <div class="config-hub-actions">
                                <button class="config-hub-btn config-hub-btn-download" 
                                        onclick="webguiApp.downloadAndLoadConfig('${this.escapeHtml(config.url)}', '${this.escapeHtml(config.name)}')">
                                    <i class="fas fa-download"></i> Download & Load
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
            html += '</div>';
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Failed to load config hub:', error);
            container.innerHTML = `
                <div class="empty-state error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load community configs</p>
                    <button class="config-btn" onclick="webguiApp.loadConfigHubList()">Retry</button>
                </div>
            `;
        }
    }

    async downloadAndLoadConfig(url, name) {
        this.showNotification(`Downloading ${name}...`, 'success');
        
        try {
            const formData = new URLSearchParams();
            formData.append('url', url);
            formData.append('name', name);

            const response = await this.api.request('/api/config-hub/download', {
                method: 'POST',
                body: formData.toString()
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(result.message, 'success');
                
                this.moduleStates = {};
                this.settingStates = {};
                this.expandedModules.clear();
                
                await this.loadModules();
                await this.loadCurrentConfig();
                await this.loadConfigsList();
                
                this.showModules();
            } else {
                this.showNotification(result.message || 'Failed to download config', 'error');
            }
        } catch (error) {
            console.error('Error downloading config:', error);
            this.showNotification('Failed to download config: ' + error.message, 'error');
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // ==================== OVERRIDDEN METHODS ====================
    
    showModules() {
        const modulesContainer = document.querySelector('#webgui #modulesContainer');
        const configManagerContainer = document.querySelector('#webgui #configmanagerContainer');
        const themesContainer = document.querySelector('#webgui #themesContainer');
        const configHubContainer = document.querySelector('#webgui #confighubContainer');
        
        if (modulesContainer) modulesContainer.style.display = 'grid';
        if (configManagerContainer) configManagerContainer.style.display = 'none';
        if (themesContainer) themesContainer.style.display = 'none';
        if (configHubContainer) configHubContainer.style.display = 'none';
    }

    showConfigManager() {
        const modulesContainer = document.querySelector('#webgui #modulesContainer');
        const configManagerContainer = document.querySelector('#webgui #configmanagerContainer');
        const themesContainer = document.querySelector('#webgui #themesContainer');
        const configHubContainer = document.querySelector('#webgui #confighubContainer');
        
        if (modulesContainer) modulesContainer.style.display = 'none';
        if (configManagerContainer) configManagerContainer.style.display = 'block';
        if (themesContainer) themesContainer.style.display = 'none';
        if (configHubContainer) configHubContainer.style.display = 'none';
        this.loadConfigsList();
    }

    showThemeManager() {
        const modulesContainer = document.querySelector('#webgui #modulesContainer');
        const configManagerContainer = document.querySelector('#webgui #configmanagerContainer');
        const themesContainer = document.querySelector('#webgui #themesContainer');
        const configHubContainer = document.querySelector('#webgui #confighubContainer');
        
        if (modulesContainer) modulesContainer.style.display = 'none';
        if (configManagerContainer) configManagerContainer.style.display = 'none';
        if (themesContainer) themesContainer.style.display = 'block';
        if (configHubContainer) configHubContainer.style.display = 'none';
        this.renderThemeGrid();
    }

    // ==================== CONFIG MANAGEMENT METHODS ====================
    
    async loadCurrentConfig() {
        try {
            const response = await this.api.request('/api/current-config');
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.log('Not authorized to load current config');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const display = document.querySelector('#webgui #currentConfigDisplay .config-value');
            if (display) {
                display.textContent = data.currentConfig + (data.hasLastUsed ? '' : ' (default)');
            }
        } catch (e) {
            console.error('Error loading current config:', e);
        }
    }

    toggleConfigDropdown() {
        const dropdown = document.querySelector('#webgui #configDropdown');
        if (!dropdown) {
            console.error('Config dropdown element not found');
            return;
        }
        
        if (dropdown.style.display === 'none' || dropdown.style.display === '') {
            dropdown.style.display = 'block';
            this.loadConfigsList();
        } else {
            dropdown.style.display = 'none';
        }
        this.configDropdownVisible = !this.configDropdownVisible;
    }

    async loadConfigsList() {
        const dropdown = document.querySelector('#webgui #configDropdown');
        if (!dropdown) {
            console.error('Config dropdown element not found');
            return;
        }
        
        try {
            const response = await this.api.request('/api/list-configs');
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    dropdown.innerHTML = '<div class="dropdown-header">Saved Configurations</div><div class="error-message">Session expired</div>';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const configs = await response.json();
            console.log('Loaded configs:', configs);
            
            let html = '<div class="dropdown-header">Saved Configurations</div>';
            if (configs.length === 0) {
                html += '<div class="no-configs">No saved configs</div>';
            } else {
                configs.forEach(config => {
                    const badges = [];
                    if (config.isLastUsed) badges.push('<span class="config-badge">Current</span>');
                    if (config.isDefault) badges.push('<span class="config-badge">Default</span>');
                    
                    html += `
                        <div class="config-item" onclick="webguiApp.loadConfig('${config.name.replace(/'/g, "\\'")}')">
                            <div class="config-item-header">
                                <div class="config-item-name">
                                    <span>📄 ${config.name}</span>
                                    ${badges.join('')}
                                </div>
                                <span class="config-delete" onclick="event.stopPropagation(); webguiApp.deleteConfig('${config.filename.replace(/'/g, "\\'")}')">🗑️</span>
                            </div>
                            <div class="config-item-footer">
                                <span class="config-item-time">${config.timestamp}</span>
                                <span class="config-item-size">${config.size} bytes</span>
                            </div>
                        </div>
                    `;
                });
            }
            dropdown.innerHTML = html;
        } catch (e) {
            console.error('Failed to load configs:', e);
            dropdown.innerHTML = '<div class="dropdown-header">Saved Configurations</div><div class="error-message">Failed to load configs</div>';
        }
    }

    async loadConfig(configName) {
        console.log('Loading config:', configName);
        
        try {
            const formData = new URLSearchParams();
            formData.append('name', configName);

            const response = await this.api.request('/api/load-config', {
                method: 'POST',
                body: formData.toString()
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    this.showNotification('Session expired', 'error');
                    this.showLoginScreen();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Load config result:', result);
            
            this.showNotification(result.message, result.success ? 'success' : 'error');
            
            if (result.success) {
                const dropdown = document.querySelector('#webgui #configDropdown');
                if (dropdown) dropdown.style.display = 'none';
                this.configDropdownVisible = false;
                
                this.moduleStates = {};
                this.settingStates = {};
                this.expandedModules.clear();
                
                await this.loadModules();
                await this.loadCurrentConfig();
                await this.loadConfigsList();
            }
        } catch (e) {
            console.error('Error loading config:', e);
            this.showNotification('Failed to load config: ' + e.message, 'error');
        }
    }

    async deleteConfig(filename) {
        if (!confirm('Are you sure you want to delete this config?')) return;
        
        try {
            const formData = new URLSearchParams();
            formData.append('filename', filename);

            const response = await this.api.request('/api/delete-config', {
                method: 'POST',
                body: formData.toString()
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    this.showNotification('Session expired', 'error');
                    this.showLoginScreen();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            this.showNotification(result.message, result.success ? 'success' : 'error');
            
            if (result.success) {
                this.loadConfigsList();
                await this.loadCurrentConfig();
            }
        } catch (e) {
            this.showNotification('Failed to delete config', 'error');
        }
    }

    showConfigNameModal() {
        document.querySelector('#webgui #configNameModal').classList.remove('hidden');
        document.querySelector('#webgui #configNameInput').focus();
    }

    hideConfigNameModal() {
        document.querySelector('#webgui #configNameModal').classList.add('hidden');
        document.querySelector('#webgui #configNameInput').value = '';
    }

    async saveNamedConfig() {
        const configName = document.querySelector('#webgui #configNameInput').value.trim();
        if (!configName) {
            this.showNotification('Please enter a config name', 'error');
            return;
        }
        
        try {
            const formData = new URLSearchParams();
            formData.append('name', configName);

            const response = await this.api.request('/api/save-config', {
                method: 'POST',
                body: formData.toString()
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    this.showNotification('Session expired', 'error');
                    this.showLoginScreen();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            this.showNotification(result.message, result.success ? 'success' : 'error');
            
            if (result.success) {
                this.hideConfigNameModal();
                await this.loadCurrentConfig();
                await this.loadConfigsList();
            }
        } catch (e) {
            this.showNotification('Failed to save config', 'error');
        }
    }

    async generateConfigKey() {
        const name = prompt('Enter a name for this config:');
        if (!name) return;
        
        document.querySelector('#webgui #configNameInput').value = name;
        await this.saveNamedConfig();
        
        const key = name.substring(0, 6).toUpperCase().padEnd(6, 'X');
        document.querySelector('#webgui #configKeyText').textContent = key;
        document.querySelector('#webgui #keyDisplay').style.display = 'block';
        this.showNotification('Config saved! Key: ' + key, 'success');
    }

    copyConfigKey() {
        const key = document.querySelector('#webgui #configKeyText').textContent;
        navigator.clipboard.writeText(key);
        this.showNotification('Key copied to clipboard', 'success');
    }

    async importConfig() {
        const key = document.querySelector('#webgui #importKey').value.trim().toUpperCase();
        if (!key) {
            this.showNotification('Please enter a config key', 'error');
            return;
        }
        
        try {
            const formData = new URLSearchParams();
            formData.append('name', key);
            
            const response = await this.api.request('/api/load-config', {
                method: 'POST',
                body: formData.toString()
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    this.showNotification('Session expired', 'error');
                    this.showLoginScreen();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            const resultDiv = document.querySelector('#webgui #importResult');
            if (result.success) {
                resultDiv.className = 'import-result success';
                resultDiv.textContent = 'Config imported successfully!';
                resultDiv.classList.remove('hidden');
                
                this.moduleStates = {};
                this.settingStates = {};
                this.expandedModules.clear();
                
                await this.loadModules();
                await this.loadCurrentConfig();
                this.showNotification('Config loaded successfully', 'success');
            } else {
                resultDiv.className = 'import-result error';
                resultDiv.textContent = result.message || 'Config not found';
                resultDiv.classList.remove('hidden');
            }
        } catch (e) {
            this.showNotification('Import failed', 'error');
        }
    }

    async logout() {
        try {
            await this.api.request('/api/logout');
        } catch (e) {}
        
        localStorage.removeItem('moduleStates');
        localStorage.removeItem('settingStates');
        localStorage.removeItem('lastUsedConfig');
        
        window.location.reload();
    }

    showNotification(message, type) {
        const notification = document.querySelector('#webgui #notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, CONFIG.UI.NOTIFICATION_DURATION || 3000);
    }

    startPeriodicUpdates() {
        setInterval(() => {
            if (this.isAuthenticated) {
                this.loadModules();
                this.loadCurrentConfig();
            }
        }, CONFIG.UI.REFRESH_INTERVAL || 10000);
        
        setInterval(() => {
            if (!this.isAuthenticated) {
                this.checkConnection();
            }
        }, 30000);
    }
}

// Initialize the WebGUI app when the page is loaded
const webguiApp = new WebGUIApp();
window.webguiApp = webguiApp;
