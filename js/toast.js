/**
 * Sistema de Notificações Toast
 * Exibe notificações flutuantes no topo da tela
 */

class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = [];
        this.maxToasts = 5;
        
        // Criar container se não existir
        if (!this.container) {
            this.createContainer();
        }
    }

    /**
     * Criar container de toasts
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);
    }

    /**
     * Mostrar toast
     */
    show(message, type = 'success', duration = 4000, title = null) {
        // Limitar número de toasts
        if (this.toasts.length >= this.maxToasts) {
            this.remove(this.toasts[0]);
        }

        const toast = this.createToast(message, type, title);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Animar entrada
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Auto remover
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    }

    /**
     * Criar elemento toast
     */
    createToast(message, type, title) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const toastId = Utils.generateId();
        toast.setAttribute('data-toast-id', toastId);

        let titleHtml = '';
        if (title) {
            titleHtml = `<div class="toast-title">${Utils.sanitizeString(title)}</div>`;
        }

        toast.innerHTML = `
            ${titleHtml}
            <div class="toast-message">${Utils.sanitizeString(message)}</div>
            <button class="toast-close" onclick="toast.remove(this.parentElement)">×</button>
        `;

        // Adicionar evento de clique para fechar
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.remove(toast);
        });

        // Fechar ao clicar no toast
        toast.addEventListener('click', () => {
            this.remove(toast);
        });

        return toast;
    }

    /**
     * Remover toast
     */
    remove(toast) {
        if (!toast || !toast.parentElement) return;

        toast.classList.remove('show');
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    /**
     * Limpar todos os toasts
     */
    clear() {
        this.toasts.forEach(toast => {
            this.remove(toast);
        });
    }

    /**
     * Métodos de conveniência
     */
    success(message, title = null, duration = 4000) {
        return this.show(message, 'success', duration, title);
    }

    error(message, title = null, duration = 6000) {
        return this.show(message, 'error', duration, title);
    }

    warning(message, title = null, duration = 5000) {
        return this.show(message, 'warning', duration, title);
    }

    info(message, title = null, duration = 4000) {
        return this.show(message, 'info', duration, title);
    }

    /**
     * Toast de loading
     */
    loading(message, title = 'Carregando...') {
        const toast = this.show(message, 'info', 0, title);
        
        // Adicionar spinner
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        toast.querySelector('.toast-message').prepend(spinner);
        
        return toast;
    }

    /**
     * Toast de progresso
     */
    progress(message, percentage = 0, title = null) {
        const toast = this.show(message, 'info', 0, title);
        
        // Adicionar barra de progresso
        const progressBar = document.createElement('div');
        progressBar.className = 'toast-progress';
        progressBar.innerHTML = `
            <div class="toast-progress-bar" style="width: ${percentage}%"></div>
        `;
        
        toast.appendChild(progressBar);
        
        // Método para atualizar progresso
        toast.updateProgress = (newPercentage, newMessage = null) => {
            const bar = toast.querySelector('.toast-progress-bar');
            if (bar) {
                bar.style.width = `${newPercentage}%`;
            }
            
            if (newMessage) {
                const messageEl = toast.querySelector('.toast-message');
                if (messageEl) {
                    messageEl.textContent = newMessage;
                }
            }
            
            // Auto remover quando completo
            if (newPercentage >= 100) {
                setTimeout(() => {
                    this.remove(toast);
                }, 2000);
            }
        };
        
        return toast;
    }

    /**
     * Toast de confirmação com botões
     */
    confirm(message, title = 'Confirmação', onConfirm = null, onCancel = null) {
        const toast = this.show(message, 'warning', 0, title);
        
        // Remover botão de fechar padrão
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.remove();
        }
        
        // Adicionar botões de confirmação
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'toast-buttons';
        buttonsDiv.innerHTML = `
            <button class="toast-btn toast-btn-confirm">Confirmar</button>
            <button class="toast-btn toast-btn-cancel">Cancelar</button>
        `;
        
        toast.appendChild(buttonsDiv);
        
        // Eventos dos botões
        const confirmBtn = buttonsDiv.querySelector('.toast-btn-confirm');
        const cancelBtn = buttonsDiv.querySelector('.toast-btn-cancel');
        
        confirmBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            this.remove(toast);
        });
        
        cancelBtn.addEventListener('click', () => {
            if (onCancel) onCancel();
            this.remove(toast);
        });
        
        return toast;
    }

    /**
     * Toast de ação com botão personalizado
     */
    action(message, actionText, onAction, title = null, duration = 8000) {
        const toast = this.show(message, 'info', duration, title);
        
        // Adicionar botão de ação
        const actionBtn = document.createElement('button');
        actionBtn.className = 'toast-action-btn';
        actionBtn.textContent = actionText;
        
        actionBtn.addEventListener('click', () => {
            if (onAction) onAction();
            this.remove(toast);
        });
        
        toast.appendChild(actionBtn);
        
        return toast;
    }
}

// CSS adicional para toasts especiais
const toastStyles = `
<style>
.toast-close {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #9ca3af;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
}

.toast-close:hover {
    background: #f3f4f6;
    color: #374151;
}

.toast-progress {
    margin-top: 8px;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.toast-progress-bar {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
    border-radius: 2px;
}

.toast-buttons {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    justify-content: flex-end;
}

.toast-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.toast-btn-confirm {
    background: #10b981;
    color: white;
}

.toast-btn-confirm:hover {
    background: #059669;
}

.toast-btn-cancel {
    background: #6b7280;
    color: white;
}

.toast-btn-cancel:hover {
    background: #4b5563;
}

.toast-action-btn {
    margin-top: 8px;
    padding: 6px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
}

.toast-action-btn:hover {
    background: #2563eb;
}

.toast .spinner {
    margin-right: 8px;
}

@media (max-width: 480px) {
    #toast-container {
        left: 10px;
        right: 10px;
        top: 10px;
        max-width: none;
    }
    
    .toast {
        margin-bottom: 8px;
    }
}
</style>
`;

// Adicionar estilos ao head
document.head.insertAdjacentHTML('beforeend', toastStyles);

// Instância global do toast manager
const toast = new ToastManager();

// Métodos globais para facilitar o uso
window.showToast = (message, type = 'success', duration = 4000, title = null) => {
    return toast.show(message, type, duration, title);
};

window.showSuccess = (message, title = null) => {
    return toast.success(message, title);
};

window.showError = (message, title = null) => {
    return toast.error(message, title);
};

window.showWarning = (message, title = null) => {
    return toast.warning(message, title);
};

window.showInfo = (message, title = null) => {
    return toast.info(message, title);
};

window.showLoading = (message, title = 'Carregando...') => {
    return toast.loading(message, title);
};

window.showConfirm = (message, title, onConfirm, onCancel) => {
    return toast.confirm(message, title, onConfirm, onCancel);
};

