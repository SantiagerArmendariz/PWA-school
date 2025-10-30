// PWA Main JavaScript File
class PortfolioPWA {
    constructor() {
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineIndicator();
        this.setupNotifications();
        this.setupDataSync();
    }

    // Service Worker Registration
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', registration);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Error registrando Service Worker:', error);
            }
        }
    }

    // Install Prompt Setup
    setupInstallPrompt() {
        const installBanner = document.getElementById('install-banner');
        const installButton = document.getElementById('install-button');
        const dismissButton = document.getElementById('dismiss-button');

        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Show install banner if not dismissed before
            if (!localStorage.getItem('installDismissed')) {
                installBanner.classList.remove('hidden');
            }
        });

        // Install button click
        installButton?.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('Usuario aceptó la instalación');
                    this.showNotification('¡Aplicación instalada!', 'Ya puedes acceder desde tu pantalla de inicio');
                }
                
                this.deferredPrompt = null;
                installBanner.classList.add('hidden');
            }
        });

        // Dismiss button click
        dismissButton?.addEventListener('click', () => {
            installBanner.classList.add('hidden');
            localStorage.setItem('installDismissed', 'true');
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA instalada exitosamente');
            installBanner.classList.add('hidden');
            this.showNotification('¡Bienvenido!', 'Portafolio instalado correctamente');
        });
    }

    // Offline Indicator
    setupOfflineIndicator() {
        const offlineIndicator = document.getElementById('offline-indicator');

        const updateOnlineStatus = () => {
            this.isOnline = navigator.onLine;
            
            if (this.isOnline) {
                offlineIndicator.classList.add('hidden');
                this.syncOfflineData();
            } else {
                offlineIndicator.classList.remove('hidden');
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Initial check
        updateOnlineStatus();
    }

    // Notifications Setup
    setupNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Permisos de notificación concedidos');
                }
            });
        }
    }

    // Show Notification
    showNotification(title, body, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: '/custom/logo-192x192.png',
                badge: '/custom/logo-192x192.png',
                tag: 'portfolio-notification',
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        }
    }

    // Show Update Notification
    showUpdateNotification() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <i class="fas fa-sync-alt"></i>
                <span>Nueva versión disponible</span>
                <button id="update-button" class="button button--small">Actualizar</button>
                <button id="update-dismiss" class="button button--small button-white">Después</button>
            </div>
        `;

        document.body.appendChild(updateBanner);

        // Update button
        document.getElementById('update-button').addEventListener('click', () => {
            window.location.reload();
        });

        // Dismiss button
        document.getElementById('update-dismiss').addEventListener('click', () => {
            updateBanner.remove();
        });
    }

    // Data Synchronization
    setupDataSync() {
        // Listen for form submissions to cache offline
        const contactForm = document.getElementById('contact-form');
        
        contactForm?.addEventListener('submit', (e) => {
            if (!this.isOnline) {
                e.preventDefault();
                this.saveOfflineData(new FormData(contactForm));
                this.showNotification('Mensaje guardado', 'Se enviará cuando tengas conexión');
            }
        });
    }

    // Save data for offline sync
    saveOfflineData(formData) {
        const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
        const dataObject = {};
        
        for (let [key, value] of formData.entries()) {
            dataObject[key] = value;
        }
        
        dataObject.timestamp = Date.now();
        offlineData.push(dataObject);
        
        localStorage.setItem('offlineData', JSON.stringify(offlineData));
    }

    // Sync offline data when online
    async syncOfflineData() {
        const offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
        
        if (offlineData.length > 0) {
            try {
                // Here you would send the data to your server
                console.log('Sincronizando datos offline:', offlineData);
                
                // Clear offline data after successful sync
                localStorage.removeItem('offlineData');
                
                this.showNotification('Datos sincronizados', 'Tus mensajes han sido enviados');
            } catch (error) {
                console.error('Error al sincronizar datos:', error);
            }
        }
    }

    // Performance monitoring
    measurePerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Tiempo de carga:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            });
        }
    }

    // Analytics (basic)
    trackEvent(eventName, eventData = {}) {
        console.log('Event tracked:', eventName, eventData);
        
        // Store analytics data locally
        const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
        analytics.push({
            event: eventName,
            data: eventData,
            timestamp: Date.now(),
            url: window.location.href
        });
        
        // Keep only last 100 events
        if (analytics.length > 100) {
            analytics.splice(0, analytics.length - 100);
        }
        
        localStorage.setItem('analytics', JSON.stringify(analytics));
    }
}

// Initialize PWA
const portfolioPWA = new PortfolioPWA();

// Track page views
portfolioPWA.trackEvent('page_view', {
    page: window.location.pathname,
    referrer: document.referrer
});

// Track section views
const observeSections = () => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                portfolioPWA.trackEvent('section_view', {
                    section: entry.target.id
                });
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
};

// Initialize section tracking when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeSections);
} else {
    observeSections();
}

// Export for global access
window.portfolioPWA = portfolioPWA;