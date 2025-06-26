/**
 * Arquivo principal - Coordena funcionalidades gerais
 */

// Configurações globais
const CONFIG = {
    WHATSAPP_NUMBER: '77999757808',
    MAX_AGENDAMENTOS_FUTURO: 30,
    DURACAO_PADRAO_SERVICO: 60,
    INTERVALO_ATUALIZACAO: 30000, // 30 segundos
    DEBUG: false
};

// Estado global da aplicação
const AppState = {
    isLoading: false,
    currentUser: null,
    lastUpdate: null,
    networkStatus: 'online'
};

/**
 * Classe principal da aplicação
 */
class App {
    constructor() {
        this.init();
    }

    /**
     * Inicializar aplicação
     */
    init() {
        this.setupGlobalErrorHandling();
        this.setupNetworkMonitoring();
        this.setupPerformanceMonitoring();
        this.setupAccessibility();
        this.setupPWAFeatures();
        
        // Log de inicialização
        if (CONFIG.DEBUG) {
            console.log('App inicializado:', {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            });
        }
    }

    /**
     * Configurar tratamento global de erros
     */
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Erro global capturado:', event.error);
            
            if (!CONFIG.DEBUG) {
                showError('Ocorreu um erro inesperado. Tente recarregar a página.');
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejeitada não tratada:', event.reason);
            
            if (!CONFIG.DEBUG) {
                showError('Erro de conexão. Verifique sua internet e tente novamente.');
            }
        });
    }

    /**
     * Monitorar status da rede
     */
    setupNetworkMonitoring() {
        const updateNetworkStatus = () => {
            const wasOffline = AppState.networkStatus === 'offline';
            AppState.networkStatus = navigator.onLine ? 'online' : 'offline';
            
            if (navigator.onLine && wasOffline) {
                showSuccess('Conexão restaurada!');
                this.syncWhenOnline();
            } else if (!navigator.onLine) {
                showWarning('Você está offline. Algumas funcionalidades podem não funcionar.');
            }
        };

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        
        // Verificação inicial
        updateNetworkStatus();
    }

    /**
     * Sincronizar dados quando voltar online
     */
    async syncWhenOnline() {
        try {
            // Recarregar dados essenciais
            if (window.agendamentoManager) {
                await window.agendamentoManager.carregarDados();
            }
        } catch (error) {
            console.error('Erro na sincronização:', error);
        }
    }

    /**
     * Monitorar performance
     */
    setupPerformanceMonitoring() {
        // Monitorar tempo de carregamento
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            
            if (CONFIG.DEBUG) {
                console.log(`Página carregada em ${loadTime.toFixed(2)}ms`);
            }
            
            // Alertar se carregamento for muito lento
            if (loadTime > 5000) {
                showWarning('Carregamento lento detectado. Verifique sua conexão.');
            }
        });

        // Monitorar uso de memória (se disponível)
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1048576;
                
                if (CONFIG.DEBUG) {
                    console.log(`Memória utilizada: ${usedMB.toFixed(2)}MB`);
                }
                
                // Alertar sobre alto uso de memória
                if (usedMB > 100) {
                    console.warn('Alto uso de memória detectado');
                }
            }, 60000); // Verificar a cada minuto
        }
    }

    /**
     * Configurar recursos de acessibilidade
     */
    setupAccessibility() {
        // Suporte a navegação por teclado
        document.addEventListener('keydown', (e) => {
            // ESC para fechar modais
            if (e.key === 'Escape') {
                const modaisAbertos = document.querySelectorAll('.modal[style*="block"]');
                modaisAbertos.forEach(modal => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                });
            }
            
            // Enter para confirmar em botões focados
            if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
                e.target.click();
            }
        });

        // Melhorar contraste em modo de alto contraste
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Respeitar preferência de movimento reduzido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    }

    /**
     * Configurar recursos PWA
     */
    setupPWAFeatures() {
        // Detectar se é PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.body.classList.add('pwa-mode');
        }

        // Prompt de instalação
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Mostrar botão de instalação personalizado
            this.showInstallPrompt(deferredPrompt);
        });

        // Detectar instalação
        window.addEventListener('appinstalled', () => {
            showSuccess('App instalado com sucesso!');
            deferredPrompt = null;
        });
    }

    /**
     * Mostrar prompt de instalação
     */
    showInstallPrompt(deferredPrompt) {
        const installToast = toast.action(
            'Instale nosso app para uma experiência melhor!',
            'Instalar',
            async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        showSuccess('Instalação iniciada...');
                    }
                    
                    deferredPrompt = null;
                }
            },
            'Instalar App',
            8000
        );
    }
}

/**
 * Utilitários globais adicionais
 */
const GlobalUtils = {
    /**
     * Verificar se dispositivo suporta recursos específicos
     */
    checkFeatureSupport() {
        return {
            serviceWorker: 'serviceWorker' in navigator,
            notifications: 'Notification' in window,
            geolocation: 'geolocation' in navigator,
            camera: 'mediaDevices' in navigator,
            clipboard: 'clipboard' in navigator,
            share: 'share' in navigator
        };
    },

    /**
     * Obter informações do dispositivo
     */
    getDeviceInfo() {
        return {
            isMobile: Utils.isMobile(),
            isTablet: window.innerWidth >= 768 && window.innerWidth <= 1024,
            isDesktop: window.innerWidth > 1024,
            touchSupport: 'ontouchstart' in window,
            orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
            pixelRatio: window.devicePixelRatio || 1
        };
    },

    /**
     * Configurar meta tags dinâmicas
     */
    setupDynamicMeta() {
        // Cor da barra de status no mobile
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = '#3b82f6';
            document.head.appendChild(meta);
        }

        // Configurar viewport para PWA
        const metaViewport = document.querySelector('meta[name="viewport"]');
        if (metaViewport) {
            metaViewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover';
        }
    },

    /**
     * Configurar cache inteligente
     */
    setupSmartCaching() {
        // Cache de dados da API por 5 minutos
        const apiCache = new Map();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

        window.getCachedData = (key, fetchFunction) => {
            const cached = apiCache.get(key);
            
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return Promise.resolve(cached.data);
            }
            
            return fetchFunction().then(data => {
                apiCache.set(key, {
                    data,
                    timestamp: Date.now()
                });
                return data;
            });
        };

        // Limpar cache periodicamente
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of apiCache.entries()) {
                if (now - value.timestamp > CACHE_DURATION) {
                    apiCache.delete(key);
                }
            }
        }, CACHE_DURATION);
    },

    /**
     * Configurar analytics simples
     */
    setupAnalytics() {
        const analytics = {
            pageViews: 0,
            interactions: 0,
            errors: 0,
            startTime: Date.now()
        };

        // Contar page views
        analytics.pageViews++;

        // Contar interações
        document.addEventListener('click', () => {
            analytics.interactions++;
        });

        // Contar erros
        window.addEventListener('error', () => {
            analytics.errors++;
        });

        // Log de estatísticas a cada 5 minutos
        if (CONFIG.DEBUG) {
            setInterval(() => {
                console.log('Analytics:', {
                    ...analytics,
                    sessionDuration: Date.now() - analytics.startTime
                });
            }, 300000);
        }

        window.getAnalytics = () => analytics;
    }
};

/**
 * Inicialização da aplicação
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar app principal
    window.app = new App();
    
    // Configurar utilitários globais
    GlobalUtils.setupDynamicMeta();
    GlobalUtils.setupSmartCaching();
    GlobalUtils.setupAnalytics();
    
    // Log de recursos suportados
    if (CONFIG.DEBUG) {
        console.log('Recursos suportados:', GlobalUtils.checkFeatureSupport());
        console.log('Informações do dispositivo:', GlobalUtils.getDeviceInfo());
    }
    
    // Mostrar toast de boas-vindas
    setTimeout(() => {
        showInfo('Bem-vindo ao sistema de agendamento!', 'Sistema carregado');
    }, 1000);
});

/**
 * Configurar Service Worker (se disponível)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                if (CONFIG.DEBUG) {
                    console.log('Service Worker registrado:', registration);
                }
            })
            .catch(error => {
                if (CONFIG.DEBUG) {
                    console.log('Falha ao registrar Service Worker:', error);
                }
            });
    });
}

/**
 * Exportar para uso global
 */
window.CONFIG = CONFIG;
window.AppState = AppState;
window.GlobalUtils = GlobalUtils;

