/**
 * Lógica principal da página de agendamento
 */

class AgendamentoManager {
    constructor() {
        this.form = document.getElementById('agendamento-form');
        this.campos = {
            telefone: document.getElementById('telefone'),
            nome: document.getElementById('nome'),
            email: document.getElementById('email'),
            profissional: document.getElementById('profissional'),
            servico: document.getElementById('servico'),
            valor: document.getElementById('valor'),
            data: document.getElementById('data'),
            hora: document.getElementById('hora')
        };
        
        this.modais = {
            confirmacao: document.getElementById('modal-confirmacao'),
            agendamentos: document.getElementById('modal-agendamentos'),
            sucesso: document.getElementById('modal-sucesso')
        };
        
        this.dadosAgendamento = null;
        this.clienteExistente = null;
        
        this.init();
    }

    /**
     * Inicializar eventos e configurações
     */
    init() {
        this.configurarEventos();
        this.configurarValidacoes();
        this.carregarDados();
        this.configurarDatasMinMax();
    }

    /**
     * Configurar eventos dos elementos
     */
    configurarEventos() {
        // Evento do formulário
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Eventos dos campos
        this.campos.telefone.addEventListener('blur', () => this.verificarClienteExistente());
        this.campos.profissional.addEventListener('change', () => this.atualizarHorariosDisponiveis());
        this.campos.servico.addEventListener('change', () => this.atualizarValorServico());
        this.campos.data.addEventListener('change', () => this.atualizarHorariosDisponiveis());
        
        // Eventos dos modais
        this.configurarEventosModais();
        
        // Botão administrativo
        document.getElementById('admin-btn').addEventListener('click', () => {
            window.location.href = 'admin/index.html';
        });
    }

    /**
     * Configurar eventos dos modais
     */
    configurarEventosModais() {
        // Modal de confirmação
        document.getElementById('btn-confirmar').addEventListener('click', () => this.confirmarAgendamento());
        document.getElementById('btn-cancelar').addEventListener('click', () => this.fecharModal('confirmacao'));
        
        // Modal de agendamentos existentes
        document.getElementById('btn-fechar-agendamentos').addEventListener('click', () => this.fecharModal('agendamentos'));
        
        // Modal de sucesso
        document.getElementById('btn-whatsapp').addEventListener('click', () => this.enviarWhatsApp());
        document.getElementById('btn-fechar-sucesso').addEventListener('click', () => this.fecharModal('sucesso'));
        
        // Fechar modal ao clicar fora
        Object.values(this.modais).forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.fecharModal(Object.keys(this.modais).find(key => this.modais[key] === modal));
                }
            });
        });
    }

    /**
     * Configurar validações em tempo real
     */
    configurarValidacoes() {
        // Validação de telefone
        this.campos.telefone.addEventListener('input', (e) => {
            const valor = Utils.cleanTelefone(e.target.value);
            if (valor.length > 11) {
                e.target.value = Utils.formatTelefone(valor.substring(0, 11));
            }
        });
        
        // Validação de email
        this.campos.email.addEventListener('blur', (e) => {
            if (e.target.value && !Utils.validarEmail(e.target.value)) {
                this.mostrarErro(e.target, 'Email inválido');
            } else {
                this.limparErro(e.target);
            }
        });
        
        // Validação de nome
        this.campos.nome.addEventListener('blur', (e) => {
            if (e.target.value.trim().length < 2) {
                this.mostrarErro(e.target, 'Nome deve ter pelo menos 2 caracteres');
            } else {
                this.limparErro(e.target);
            }
        });
    }

    /**
     * Configurar datas mínima e máxima
     */
    configurarDatasMinMax() {
        this.campos.data.min = Utils.getDataMinima();
        this.campos.data.max = Utils.getDataMaxima();
    }

    /**
     * Carregar dados iniciais
     */
    async carregarDados() {
        try {
            showLoading('Carregando dados...');
            
            await Promise.all([
                this.carregarProfissionais(),
                this.carregarServicos()
            ]);
            
            toast.remove(document.querySelector('.toast'));
            showSuccess('Dados carregados com sucesso!');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showError('Erro ao carregar dados. Tente recarregar a página.');
        }
    }

    /**
     * Carregar lista de profissionais
     */
    async carregarProfissionais() {
        try {
            const profissionais = await api.getProfissionais();
            const select = this.campos.profissional;
            
            // Limpar opções existentes
            select.innerHTML = '<option value="">Selecione um profissional</option>';
            
            // Adicionar profissionais ativos
            profissionais.forEach(prof => {
                if (prof.profissional) {
                    const option = document.createElement('option');
                    option.value = prof.profissional;
                    option.textContent = prof.profissional;
                    select.appendChild(option);
                }
            });
        } catch (error) {
            console.error('Erro ao carregar profissionais:', error);
            showError('Erro ao carregar lista de profissionais');
        }
    }

    /**
     * Carregar lista de serviços
     */
    async carregarServicos() {
        try {
            const servicos = await api.getServicos();
            const select = this.campos.servico;
            
            // Limpar opções existentes
            select.innerHTML = '<option value="">Selecione um serviço</option>';
            
            // Adicionar serviços
            servicos.forEach(servico => {
                if (servico.servico) {
                    const option = document.createElement('option');
                    option.value = servico.servico;
                    option.textContent = `${servico.servico} - ${Utils.formatarValor(servico.valor)} (${Utils.formatarDuracao(servico.duracao)})`;
                    option.dataset.valor = servico.valor;
                    option.dataset.duracao = servico.duracao;
                    select.appendChild(option);
                }
            });
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            showError('Erro ao carregar lista de serviços');
        }
    }

    /**
     * Verificar se cliente já existe
     */
    async verificarClienteExistente() {
        const telefone = Utils.cleanTelefone(this.campos.telefone.value);
        
        if (!Utils.validarTelefone(telefone)) {
            this.clienteExistente = null;
            return;
        }

        try {
            const agendamentos = await api.getAgendamentosByTelefone(telefone);
            
            if (agendamentos.length > 0) {
                // Cliente existente - preencher dados
                const ultimoAgendamento = agendamentos[0];
                this.clienteExistente = ultimoAgendamento;
                
                if (ultimoAgendamento.nome && !this.campos.nome.value) {
                    this.campos.nome.value = ultimoAgendamento.nome;
                }
                
                if (ultimoAgendamento.email && !this.campos.email.value) {
                    this.campos.email.value = ultimoAgendamento.email;
                }
                
                // Mostrar agendamentos futuros
                this.mostrarAgendamentosExistentes(agendamentos);
            } else {
                this.clienteExistente = null;
            }
        } catch (error) {
            console.error('Erro ao verificar cliente:', error);
        }
    }

    /**
     * Mostrar agendamentos existentes do cliente
     */
    mostrarAgendamentosExistentes(agendamentos) {
        const lista = document.getElementById('lista-agendamentos');
        
        if (agendamentos.length === 0) {
            lista.innerHTML = '<p>Nenhum agendamento futuro encontrado.</p>';
        } else {
            lista.innerHTML = agendamentos.map(agendamento => `
                <div class="agendamento-item">
                    <h4>${agendamento.servico}</h4>
                    <p><strong>Data:</strong> ${Utils.formatarData(agendamento.data)}</p>
                    <p><strong>Horário:</strong> ${agendamento.hora}</p>
                    <p><strong>Profissional:</strong> ${agendamento.profissional}</p>
                    <p><strong>Valor:</strong> ${Utils.formatarValor(agendamento.valor)}</p>
                </div>
            `).join('');
        }
        
        this.abrirModal('agendamentos');
    }

    /**
     * Atualizar valor do serviço selecionado
     */
    atualizarValorServico() {
        const servicoSelecionado = this.campos.servico.selectedOptions[0];
        
        if (servicoSelecionado && servicoSelecionado.dataset.valor) {
            this.campos.valor.value = Utils.formatarValor(servicoSelecionado.dataset.valor);
        } else {
            this.campos.valor.value = '';
        }
        
        // Atualizar horários disponíveis se data e profissional estão selecionados
        if (this.campos.data.value && this.campos.profissional.value) {
            this.atualizarHorariosDisponiveis();
        }
    }

    /**
     * Atualizar horários disponíveis
     */
    async atualizarHorariosDisponiveis() {
        const data = this.campos.data.value;
        const profissional = this.campos.profissional.value;
        const servicoSelecionado = this.campos.servico.selectedOptions[0];
        
        if (!data || !profissional) {
            this.campos.hora.disabled = true;
            this.campos.hora.innerHTML = '<option value="">Selecione primeiro a data e profissional</option>';
            return;
        }

        try {
            // Verificar se profissional está disponível na data
            const profissionalDisponivel = await api.isProfissionalDisponivel(profissional, data);
            
            if (!profissionalDisponivel) {
                this.campos.hora.disabled = true;
                this.campos.hora.innerHTML = '<option value="">Profissional não disponível nesta data</option>';
                showWarning('Profissional não está disponível na data selecionada');
                return;
            }

            // Obter duração do serviço
            let duracao = 60; // padrão
            if (servicoSelecionado && servicoSelecionado.dataset.duracao) {
                duracao = parseInt(servicoSelecionado.dataset.duracao);
            }

            showLoading('Verificando horários disponíveis...');
            
            const horariosDisponiveis = await api.getHorariosDisponiveis(data, profissional, duracao);
            
            toast.remove(document.querySelector('.toast'));
            
            this.campos.hora.disabled = false;
            
            if (horariosDisponiveis.length === 0) {
                this.campos.hora.innerHTML = '<option value="">Nenhum horário disponível</option>';
                showWarning('Não há horários disponíveis para esta data e profissional');
            } else {
                this.campos.hora.innerHTML = '<option value="">Selecione um horário</option>' +
                    horariosDisponiveis.map(hora => 
                        `<option value="${hora}">${hora}</option>`
                    ).join('');
                
                showSuccess(`${horariosDisponiveis.length} horários disponíveis encontrados`);
            }
        } catch (error) {
            console.error('Erro ao carregar horários:', error);
            showError('Erro ao carregar horários disponíveis');
            this.campos.hora.disabled = true;
            this.campos.hora.innerHTML = '<option value="">Erro ao carregar horários</option>';
        }
    }

    /**
     * Validar formulário
     */
    validarFormulario() {
        const erros = [];
        
        // Campos obrigatórios
        const camposObrigatorios = ['telefone', 'nome', 'email', 'profissional', 'servico', 'data', 'hora'];
        
        camposObrigatorios.forEach(campo => {
            const elemento = this.campos[campo];
            if (!elemento.value.trim()) {
                erros.push(`O campo ${campo} é obrigatório`);
                this.mostrarErro(elemento, 'Campo obrigatório');
            } else {
                this.limparErro(elemento);
            }
        });
        
        // Validações específicas
        if (this.campos.telefone.value && !Utils.validarTelefone(this.campos.telefone.value)) {
            erros.push('Telefone inválido');
            this.mostrarErro(this.campos.telefone, 'Telefone inválido');
        }
        
        if (this.campos.email.value && !Utils.validarEmail(this.campos.email.value)) {
            erros.push('Email inválido');
            this.mostrarErro(this.campos.email, 'Email inválido');
        }
        
        if (this.campos.data.value && !Utils.isDataValida(this.campos.data.value)) {
            erros.push('Data inválida');
            this.mostrarErro(this.campos.data, 'Data inválida');
        }
        
        return erros;
    }

    /**
     * Mostrar erro em campo
     */
    mostrarErro(campo, mensagem) {
        campo.classList.add('error');
        
        // Remover mensagem de erro anterior
        const erroAnterior = campo.parentElement.querySelector('.error-message');
        if (erroAnterior) {
            erroAnterior.remove();
        }
        
        // Adicionar nova mensagem de erro
        const spanErro = document.createElement('span');
        spanErro.className = 'error-message';
        spanErro.textContent = mensagem;
        campo.parentElement.appendChild(spanErro);
    }

    /**
     * Limpar erro de campo
     */
    limparErro(campo) {
        campo.classList.remove('error');
        const erroExistente = campo.parentElement.querySelector('.error-message');
        if (erroExistente) {
            erroExistente.remove();
        }
    }

    /**
     * Limpar todos os erros
     */
    limparTodosErros() {
        Object.values(this.campos).forEach(campo => {
            this.limparErro(campo);
        });
    }

    /**
     * Handle submit do formulário
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        this.limparTodosErros();
        
        const erros = this.validarFormulario();
        
        if (erros.length > 0) {
            showError('Por favor, corrija os erros no formulário');
            return;
        }

        // Preparar dados do agendamento
        this.dadosAgendamento = {
            telefone: Utils.cleanTelefone(this.campos.telefone.value),
            nome: this.campos.nome.value.trim(),
            email: this.campos.email.value.trim(),
            profissional: this.campos.profissional.value,
            servico: this.campos.servico.value,
            valor: this.campos.servico.selectedOptions[0].dataset.valor,
            data: this.campos.data.value,
            hora: this.campos.hora.value
        };

        // Verificar disponibilidade final
        const servicoSelecionado = this.campos.servico.selectedOptions[0];
        const duracao = servicoSelecionado ? parseInt(servicoSelecionado.dataset.duracao) : 60;
        
        const disponivel = await api.verificarDisponibilidade(
            this.dadosAgendamento.data,
            this.dadosAgendamento.hora,
            this.dadosAgendamento.profissional,
            duracao
        );

        if (!disponivel) {
            showError('Horário não está mais disponível. Por favor, selecione outro horário.');
            this.atualizarHorariosDisponiveis();
            return;
        }

        // Mostrar modal de confirmação
        this.mostrarConfirmacao();
    }

    /**
     * Mostrar modal de confirmação
     */
    mostrarConfirmacao() {
        const dadosDiv = document.getElementById('dados-agendamento');
        
        dadosDiv.innerHTML = `
            <p><strong>Nome:</strong> ${this.dadosAgendamento.nome}</p>
            <p><strong>Telefone:</strong> ${Utils.formatTelefone(this.dadosAgendamento.telefone)}</p>
            <p><strong>Email:</strong> ${this.dadosAgendamento.email}</p>
            <p><strong>Serviço:</strong> ${this.dadosAgendamento.servico}</p>
            <p><strong>Profissional:</strong> ${this.dadosAgendamento.profissional}</p>
            <p><strong>Data:</strong> ${Utils.formatarData(this.dadosAgendamento.data)}</p>
            <p><strong>Horário:</strong> ${this.dadosAgendamento.hora}</p>
            <p><strong>Valor:</strong> ${Utils.formatarValor(this.dadosAgendamento.valor)}</p>
        `;
        
        this.abrirModal('confirmacao');
    }

    /**
     * Confirmar agendamento
     */
    async confirmarAgendamento() {
        try {
            const btnConfirmar = document.getElementById('btn-confirmar');
            const textoOriginal = btnConfirmar.textContent;
            
            btnConfirmar.disabled = true;
            btnConfirmar.innerHTML = '<div class="spinner"></div> Confirmando...';
            
            // Criar agendamento via API
            await api.createAgendamento(this.dadosAgendamento);
            
            btnConfirmar.textContent = '✅ Agendado!';
            
            setTimeout(() => {
                this.fecharModal('confirmacao');
                this.abrirModal('sucesso');
                this.limparFormulario();
                
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = textoOriginal;
            }, 1500);
            
            showSuccess('Agendamento realizado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao confirmar agendamento:', error);
            showError('Erro ao confirmar agendamento. Tente novamente.');
            
            const btnConfirmar = document.getElementById('btn-confirmar');
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = 'Confirmar';
        }
    }

    /**
     * Enviar dados pelo WhatsApp
     */
    enviarWhatsApp() {
        if (!this.dadosAgendamento) return;
        
        const mensagem = Utils.formatarMensagemWhatsApp(this.dadosAgendamento);
        const url = Utils.generateWhatsAppURL('77999757808', mensagem);
        
        window.open(url, '_blank');
        
        showSuccess('Redirecionando para o WhatsApp...');
    }

    /**
     * Limpar formulário
     */
    limparFormulario() {
        this.form.reset();
        this.campos.hora.disabled = true;
        this.campos.hora.innerHTML = '<option value="">Selecione primeiro a data e profissional</option>';
        this.campos.valor.value = '';
        this.dadosAgendamento = null;
        this.clienteExistente = null;
        this.limparTodosErros();
    }

    /**
     * Abrir modal
     */
    abrirModal(tipo) {
        if (this.modais[tipo]) {
            this.modais[tipo].style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Fechar modal
     */
    fecharModal(tipo) {
        if (this.modais[tipo]) {
            this.modais[tipo].style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new AgendamentoManager();
});

