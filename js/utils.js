/**
 * Utilitários e funções auxiliares
 */

const Utils = {
    /**
     * Formatar telefone brasileiro
     */
    formatTelefone(telefone) {
        const cleaned = telefone.replace(/\D/g, '');
        
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        
        return telefone;
    },

    /**
     * Limpar formatação do telefone
     */
    cleanTelefone(telefone) {
        return telefone.replace(/\D/g, '');
    },

    /**
     * Validar telefone brasileiro
     */
    validarTelefone(telefone) {
        const cleaned = this.cleanTelefone(telefone);
        return cleaned.length >= 10 && cleaned.length <= 11;
    },

    /**
     * Validar email
     */
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Formatar data para exibição (DD/MM/AAAA)
     */
    formatarData(data) {
        if (!data) return '';
        
        const date = new Date(data + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    },

    /**
     * Formatar data para API (AAAA-MM-DD)
     */
    formatarDataAPI(data) {
        if (!data) return '';
        
        const date = new Date(data);
        return date.toISOString().split('T')[0];
    },

    /**
     * Formatar valor monetário
     */
    formatarValor(valor) {
        if (!valor) return 'R$ 0,00';
        
        const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
        return numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    },

    /**
     * Converter valor monetário para número
     */
    parseValor(valorString) {
        if (!valorString) return 0;
        
        return parseFloat(valorString.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    },

    /**
     * Formatar horário
     */
    formatarHorario(hora) {
        if (!hora) return '';
        
        const [h, m] = hora.split(':');
        return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    },

    /**
     * Obter data mínima para agendamento (hoje)
     */
    getDataMinima() {
        const hoje = new Date();
        return hoje.toISOString().split('T')[0];
    },

    /**
     * Obter data máxima para agendamento (3 meses à frente)
     */
    getDataMaxima() {
        const hoje = new Date();
        hoje.setMonth(hoje.getMonth() + 3);
        return hoje.toISOString().split('T')[0];
    },

    /**
     * Verificar se uma data é válida para agendamento
     */
    isDataValida(data) {
        const dataVerificacao = new Date(data);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const maxima = new Date();
        maxima.setMonth(maxima.getMonth() + 3);
        
        return dataVerificacao >= hoje && dataVerificacao <= maxima;
    },

    /**
     * Obter nome do dia da semana
     */
    getDiaSemana(data) {
        const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
        const date = new Date(data + 'T00:00:00');
        return dias[date.getDay()];
    },

    /**
     * Capitalizar primeira letra
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Gerar ID único simples
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Debounce para otimizar chamadas de função
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Verificar se é dispositivo móvel
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Scroll suave para elemento
     */
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    /**
     * Copiar texto para clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Erro ao copiar texto:', err);
            return false;
        }
    },

    /**
     * Gerar URL do WhatsApp
     */
    generateWhatsAppURL(numero, mensagem) {
        const numeroLimpo = this.cleanTelefone(numero);
        const mensagemEncoded = encodeURIComponent(mensagem);
        return `https://wa.me/55${numeroLimpo}?text=${mensagemEncoded}`;
    },

    /**
     * Formatar mensagem para WhatsApp
     */
    formatarMensagemWhatsApp(agendamento) {
        return `🗓️ *Confirmação de Agendamento*

👤 *Cliente:* ${agendamento.nome}
📞 *Telefone:* ${this.formatTelefone(agendamento.telefone)}
📧 *Email:* ${agendamento.email}

💼 *Serviço:* ${agendamento.servico}
👨‍💼 *Profissional:* ${agendamento.profissional}
💰 *Valor:* ${this.formatarValor(agendamento.valor)}

📅 *Data:* ${this.formatarData(agendamento.data)}
🕐 *Horário:* ${agendamento.hora}

✅ Agendamento confirmado com sucesso!`;
    },

    /**
     * Validar campos obrigatórios
     */
    validarCamposObrigatorios(dados, campos) {
        const erros = [];
        
        campos.forEach(campo => {
            if (!dados[campo] || dados[campo].toString().trim() === '') {
                erros.push(`O campo ${campo} é obrigatório`);
            }
        });
        
        return erros;
    },

    /**
     * Sanitizar string para evitar XSS
     */
    sanitizeString(str) {
        if (!str) return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Formatar duração em minutos para texto legível
     */
    formatarDuracao(minutos) {
        if (minutos < 60) {
            return `${minutos} min`;
        } else {
            const horas = Math.floor(minutos / 60);
            const minutosRestantes = minutos % 60;
            
            if (minutosRestantes === 0) {
                return `${horas}h`;
            } else {
                return `${horas}h ${minutosRestantes}min`;
            }
        }
    },

    /**
     * Calcular idade a partir da data de nascimento
     */
    calcularIdade(dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        
        const mesAtual = hoje.getMonth();
        const mesNascimento = nascimento.getMonth();
        
        if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        
        return idade;
    },

    /**
     * Verificar se horário está no passado
     */
    isHorarioPassado(data, hora) {
        const agora = new Date();
        const dataHora = new Date(`${data}T${hora}:00`);
        
        return dataHora < agora;
    },

    /**
     * Obter próximos dias úteis
     */
    getProximosDiasUteis(quantidade = 30) {
        const dias = [];
        const hoje = new Date();
        
        for (let i = 0; i < quantidade; i++) {
            const data = new Date(hoje);
            data.setDate(hoje.getDate() + i);
            
            // Pular domingos (0)
            if (data.getDay() !== 0) {
                dias.push(data.toISOString().split('T')[0]);
            }
        }
        
        return dias;
    },

    /**
     * Converter minutos para horário
     */
    minutosParaHorario(minutos) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    },

    /**
     * Converter horário para minutos
     */
    horarioParaMinutos(horario) {
        const [horas, minutos] = horario.split(':').map(Number);
        return horas * 60 + minutos;
    }
};

// Máscara para telefone
function aplicarMascaraTelefone(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
        }
        
        e.target.value = value;
    });
}

// Aplicar máscara automaticamente em campos de telefone
document.addEventListener('DOMContentLoaded', function() {
    const telefoneInputs = document.querySelectorAll('input[type="tel"]');
    telefoneInputs.forEach(aplicarMascaraTelefone);
});

