// Configuration for the external web interface
const CONFIG = {
    // Your local server endpoint
    LOCAL_SERVER: 'http://localhost:3001',
    
    // Your GitHub Pages domain (backup)
    GITHUB_PAGES: 'https://ihatediscordq-dotcom.github.io',
    
    // Your new custom domain
    CUSTOM_DOMAIN: 'https://pikainjection.xyz',
    
    // List of allowed origins for CORS
    ALLOWED_ORIGINS: [
        'https://ihatediscordq-dotcom.github.io',
        'http://pikainjection.xyz',
        'https://pikainjection.xyz',
        'http://www.pikainjection.xyz',
        'https://www.pikainjection.xyz',
        'http://localhost:3001',
        'http://127.0.0.1:3001'
    ],
    
    // No tunnel by default
    TUNNEL_SERVER: null,
    
    // API endpoints
    API: {
        MODULES: '/api/modules',
        SETTINGS: '/api/settings',
        TOGGLE: '/api/toggle',
        UPDATE_SETTING: '/api/update-setting',
        UPDATE_KEYBIND_MODE: '/api/update-keybind-mode',
        STATUS: '/api/status',
        HARDWARE_STATUS: '/api/hardware-status',
        SAVE_CONFIG: '/api/save-config',
        LOAD_CONFIG: '/api/load-config',
        LIST_CONFIGS: '/api/list-configs',
        DELETE_CONFIG: '/api/delete-config',
        CURRENT_CONFIG: '/api/current-config',
        LOGOUT: '/api/logout',
        CONFIG_HUB_LIST: '/api/config-hub/list',
        CONFIG_HUB_DOWNLOAD: '/api/config-hub/download'
    },
    
    // Authentication (same as your local server)
    CREDENTIALS: {
        username: '3Qi',
        password: 'Admin3Qi'
    },
    
    // UI Configuration
    UI: {
        REFRESH_INTERVAL: 10000,
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 3000
    }
};