/**
 * JavaScript da Área Administrativa
 */

class AdminManager {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'overview';
        this.charts = {};
        this.data = {
            agendamentos: [],
            servicos: [],
            profissionais: [],
            horarios: []
        };
        
        this.init();
    }

    /**
     * Inicializar área administrativa
     */
    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Login
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('btn-voltar').addEventListener('click', () => {
            window.location.href = '../index.html';
        });

        // Logout
        document.getElementById('btn-logout').addEventListener('click', () => this.logout());

        // Navegação
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchSection(e.target.dataset.section));
        });

        // Botões de ação
        document.getElementById('btn-refresh-agendamentos').addEventListener('click', () => this.loadAgendamentos());
        document.getElementById('btn-add-servico').addEventListener('click', () => this.openModal('modal-add-servico'));
        document.getElementById('btn-add-profissional').addEventListener('click', () => this.openModal('modal-add-profissional'));
        document.getElementById('btn-gerar-relatorio').addEventListener('click', () => this.gerarRelatorio());

        // Filtros
        document.getElementById('filtro-periodo').addEventListener('change', (e) => {
            const personalizadas = document.getElementById('datas-personalizadas');
            personalizadas.style.display = e.target.value === 'personalizado' ? 'flex' : 'none';
        });

        document.getElementById('filtro-data').addEventListener('change', () => this.filtrarAgendamentos());
        document.getElementById('filtro-profissional').addEventListener('change', () => this.filtrarAgendamentos());

        // Formulários
        document.getElementById('form-add-servico').addEventListener('submit', (e) => this.addServico(e));
        document.getElementById('form-add-profissional').addEventListener('submit', (e) => this.addProfissional(e));
        document.getElementById('form-alterar-senha').addEventListener('submit', (e) => this.alterarSenha(e));
    }

    /**
     * Verificar autenticação
     */
    checkAuthentication() {
        const isAuthenticated = sessionStorage.getItem('admin_authenticated');
        
        if (isAuthenticated) {
            this.showDashboard();
            this.loadAllData();
        } else {
            this.showLogin();
        }
    }

    /**
     * Handle login
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        const originalText = btnSubmit.textContent;
        
        try {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<div class="spinner"></div> Verificando...';
            
            const isValid = await api.verificarLogin(usuario, senha);
            
            if (isValid) {
                sessionStorage.setItem('admin_authenticated', 'true');
                sessionStorage.setItem('admin_user', usuario);
                this.currentUser = usuario;
                
                showSuccess('Login realizado com sucesso!');
                
                setTimeout(() => {
                    this.showDashboard();
                    this.loadAllData();
                }, 1000);
            } else {
                showError('Usuário ou senha incorretos');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            showError('Erro ao fazer login. Tente novamente.');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
        }
    }

    /**
     * Logout
     */
    logout() {
        sessionStorage.removeItem('admin_authenticated');
        sessionStorage.removeItem('admin_user');
        this.currentUser = null;
        
        showInfo('Logout realizado com sucesso');
        
        setTimeout(() => {
            this.showLogin();
        }, 1000);
    }

    /**
     * Mostrar tela de login
     */
    showLogin() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('admin-dashboard').style.display = 'none';
        document.getElementById('login-form').reset();
    }

    /**
     * Mostrar dashboard
     */
    showDashboard() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        
        const userInfo = document.getElementById('user-info');
        userInfo.textContent = `Bem-vindo, ${this.currentUser || 'Admin'}!`;
    }

    /**
     * Carregar todos os dados
     */
    async loadAllData() {
        try {
            showLoading('Carregando dados do painel...');
            
            await Promise.all([
                this.loadAgendamentos(),
                this.loadServicos(),
                this.loadProfissionais(),
                this.loadHorarios()
            ]);
            
            this.updateOverview();
            this.createCharts();
            
            toast.remove(document.querySelector('.toast'));
            showSuccess('Dados carregados com sucesso!');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showError('Erro ao carregar dados do painel');
        }
    }

    /**
     * Carregar agendamentos
     */
    async loadAgendamentos() {
        try {
            this.data.agendamentos = await api.getAgendamentos();
            this.renderAgendamentos();
            this.updateOverview();
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            showError('Erro ao carregar agendamentos');
        }
    }

    /**
     * Carregar serviços
     */
    async loadServicos() {
        try {
            this.data.servicos = await api.getServicos();
            this.renderServicos();
            this.updateFiltroProfissional();
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            showError('Erro ao carregar serviços');
        }
    }

    /**
     * Carregar profissionais
     */
    async loadProfissionais() {
        try {
            this.data.profissionais = await api.getProfissionais();
            this.renderProfissionais();
        } catch (error) {
            console.error('Erro ao carregar profissionais:', error);
            showError('Erro ao carregar profissionais');
        }
    }

    /**
     * Carregar horários
     */
    async loadHorarios() {
        try {
            this.data.horarios = await api.getHorarios();
            this.renderHorarios();
        } catch (error) {
            console.error('Erro ao carregar horários:', error);
            showError('Erro ao carregar horários');
        }
    }

    /**
     * Trocar seção
     */
    switchSection(section) {
        // Atualizar navegação
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Atualizar conteúdo
        document.querySelectorAll('.dashboard-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`section-${section}`).classList.add('active');

        this.currentSection = section;

        // Carregar dados específicos da seção se necessário
        if (section === 'relatorios') {
            this.setupRelatorios();
        }
    }

    /**
     * Atualizar visão geral
     */
    updateOverview() {
        const hoje = new Date().toISOString().split('T')[0];
        const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        
        // Agendamentos de hoje
        const agendamentosHoje = this.data.agendamentos.filter(a => a.data === hoje);
        document.getElementById('total-agendamentos').textContent = agendamentosHoje.length;

        // Receita de hoje
        const receitaHoje = agendamentosHoje.reduce((total, a) => total + parseFloat(a.valor || 0), 0);
        document.getElementById('receita-hoje').textContent = Utils.formatarValor(receitaHoje);

        // Receita do mês
        const agendamentosMes = this.data.agendamentos.filter(a => a.data >= inicioMes);
        const receitaMes = agendamentosMes.reduce((total, a) => total + parseFloat(a.valor || 0), 0);
        document.getElementById('receita-mes').textContent = Utils.formatarValor(receitaMes);

        // Clientes únicos
        const clientesUnicos = new Set(this.data.agendamentos.map(a => a.telefone)).size;
        document.getElementById('clientes-ativos').textContent = clientesUnicos;

        // Próximos agendamentos
        this.renderProximosAgendamentos();
    }

    /**
     * Renderizar próximos agendamentos
     */
    renderProximosAgendamentos() {
        const agora = new Date();
        const proximosAgendamentos = this.data.agendamentos
            .filter(a => {
                const dataHora = new Date(`${a.data}T${a.hora}`);
                return dataHora > agora;
            })
            .sort((a, b) => {
                const dataA = new Date(`${a.data}T${a.hora}`);
                const dataB = new Date(`${b.data}T${b.hora}`);
                return dataA - dataB;
            })
            .slice(0, 5);

        const lista = document.getElementById('lista-proximos-agendamentos');
        
        if (proximosAgendamentos.length === 0) {
            lista.innerHTML = '<p style="color: #6b7280; text-align: center;">Nenhum agendamento futuro</p>';
            return;
        }

        lista.innerHTML = proximosAgendamentos.map(agendamento => `
            <div class="appointment-item">
                <div class="appointment-info">
                    <h4>${agendamento.nome} - ${agendamento.servico}</h4>
                    <p>📞 ${Utils.formatTelefone(agendamento.telefone)} | 👨‍💼 ${agendamento.profissional}</p>
                </div>
                <div class="appointment-time">
                    ${Utils.formatarData(agendamento.data)} ${agendamento.hora}
                </div>
            </div>
        `).join('');
    }

    /**
     * Criar gráficos
     */
    createCharts() {
        this.createServicosChart();
        this.createHorariosChart();
    }

    /**
     * Gráfico de serviços
     */
    createServicosChart() {
        const ctx = document.getElementById('chart-servicos');
        if (!ctx) return;

        // Contar agendamentos por serviço
        const servicosCount = {};
        this.data.agendamentos.forEach(a => {
            servicosCount[a.servico] = (servicosCount[a.servico] || 0) + 1;
        });

        const labels = Object.keys(servicosCount);
        const data = Object.values(servicosCount);

        if (this.charts.servicos) {
            this.charts.servicos.destroy();
        }

        this.charts.servicos = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Gráfico de horários
     */
    createHorariosChart() {
        const ctx = document.getElementById('chart-horarios');
        if (!ctx) return;

        // Contar agendamentos por horário
        const horariosCount = {};
        this.data.agendamentos.forEach(a => {
            horariosCount[a.hora] = (horariosCount[a.hora] || 0) + 1;
        });

        const labels = Object.keys(horariosCount).sort();
        const data = labels.map(hora => horariosCount[hora]);

        if (this.charts.horarios) {
            this.charts.horarios.destroy();
        }

        this.charts.horarios = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Agendamentos',
                    data: data,
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * Renderizar agendamentos
     */
    renderAgendamentos() {
        const tbody = document.querySelector('#tabela-agendamentos tbody');
        
        if (this.data.agendamentos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #6b7280;">Nenhum agendamento encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.agendamentos
            .sort((a, b) => {
                const dataA = new Date(`${a.data}T${a.hora}`);
                const dataB = new Date(`${b.data}T${b.hora}`);
                return dataB - dataA;
            })
            .map(agendamento => `
                <tr>
                    <td>${Utils.formatarData(agendamento.data)}</td>
                    <td>${agendamento.hora}</td>
                    <td>${agendamento.nome}</td>
                    <td>${Utils.formatTelefone(agendamento.telefone)}</td>
                    <td>${agendamento.servico}</td>
                    <td>${agendamento.profissional}</td>
                    <td>${Utils.formatarValor(agendamento.valor)}</td>
                    <td class="actions">
                        <button class="btn-small btn-edit" onclick="adminManager.editAgendamento(${agendamento.id})">✏️</button>
                        <button class="btn-small btn-delete" onclick="adminManager.deleteAgendamento(${agendamento.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
    }

    /**
     * Renderizar serviços
     */
    renderServicos() {
        const tbody = document.querySelector('#tabela-servicos tbody');
        
        if (this.data.servicos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #6b7280;">Nenhum serviço encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.servicos.map(servico => `
            <tr>
                <td>${servico.servico}</td>
                <td>${Utils.formatarDuracao(servico.duracao)}</td>
                <td>${Utils.formatarValor(servico.valor)}</td>
                <td class="actions">
                    <button class="btn-small btn-edit" onclick="adminManager.editServico(${servico.id})">✏️</button>
                    <button class="btn-small btn-delete" onclick="adminManager.deleteServico(${servico.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Renderizar profissionais
     */
    renderProfissionais() {
        const tbody = document.querySelector('#tabela-profissionais tbody');
        
        if (this.data.profissionais.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6b7280;">Nenhum profissional encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.profissionais.map(prof => {
            const status = this.getProfissionalStatus(prof);
            return `
                <tr>
                    <td>${prof.profissional}</td>
                    <td>${prof.de ? Utils.formatarData(prof.de) : '-'}</td>
                    <td>${prof.ate ? Utils.formatarData(prof.ate) : '-'}</td>
                    <td><span class="status ${status.class}">${status.text}</span></td>
                    <td class="actions">
                        <button class="btn-small btn-edit" onclick="adminManager.editProfissional(${prof.id})">✏️</button>
                        <button class="btn-small btn-delete" onclick="adminManager.deleteProfissional(${prof.id})">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Obter status do profissional
     */
    getProfissionalStatus(prof) {
        const hoje = new Date();
        const dataInicio = prof.de ? new Date(prof.de) : null;
        const dataFim = prof.ate ? new Date(prof.ate) : null;

        if (dataInicio && hoje < dataInicio) {
            return { text: 'Futuro', class: 'status-warning' };
        }
        
        if (dataFim && hoje > dataFim) {
            return { text: 'Inativo', class: 'status-error' };
        }
        
        return { text: 'Ativo', class: 'status-success' };
    }

    /**
     * Renderizar horários
     */
    renderHorarios() {
        const container = document.querySelector('.horarios-grid');
        const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
        
        container.innerHTML = diasSemana.map(dia => {
            const horariosDay = this.data.horarios.filter(h => h.diasemana.toLowerCase() === dia);
            
            return `
                <div class="dia-horarios">
                    <h3>${Utils.capitalize(dia)}</h3>
                    <div class="horarios-list">
                        ${horariosDay.map(horario => `
                            <div class="horario-item">
                                <span>${horario.hora}</span>
                                <div class="horario-toggle ${horario.ativo ? 'active' : ''}" 
                                     onclick="adminManager.toggleHorario(${horario.id})">
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-small btn-primary" onclick="adminManager.addHorario('${dia}')">+ Adicionar</button>
                </div>
            `;
        }).join('');
    }

    /**
     * Atualizar filtro de profissional
     */
    updateFiltroProfissional() {
        const select = document.getElementById('filtro-profissional');
        select.innerHTML = '<option value="">Todos os profissionais</option>';
        
        this.data.profissionais.forEach(prof => {
            const option = document.createElement('option');
            option.value = prof.profissional;
            option.textContent = prof.profissional;
            select.appendChild(option);
        });
    }

    /**
     * Filtrar agendamentos
     */
    filtrarAgendamentos() {
        const data = document.getElementById('filtro-data').value;
        const profissional = document.getElementById('filtro-profissional').value;
        
        let agendamentosFiltrados = [...this.data.agendamentos];
        
        if (data) {
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.data === data);
        }
        
        if (profissional) {
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.profissional === profissional);
        }
        
        // Renderizar agendamentos filtrados
        const tbody = document.querySelector('#tabela-agendamentos tbody');
        tbody.innerHTML = agendamentosFiltrados.map(agendamento => `
            <tr>
                <td>${Utils.formatarData(agendamento.data)}</td>
                <td>${agendamento.hora}</td>
                <td>${agendamento.nome}</td>
                <td>${Utils.formatTelefone(agendamento.telefone)}</td>
                <td>${agendamento.servico}</td>
                <td>${agendamento.profissional}</td>
                <td>${Utils.formatarValor(agendamento.valor)}</td>
                <td class="actions">
                    <button class="btn-small btn-edit" onclick="adminManager.editAgendamento(${agendamento.id})">✏️</button>
                    <button class="btn-small btn-delete" onclick="adminManager.deleteAgendamento(${agendamento.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Adicionar serviço
     */
    async addServico(e) {
        e.preventDefault();
        
        const nome = document.getElementById('add-servico-nome').value;
        const duracao = parseInt(document.getElementById('add-servico-duracao').value);
        const valor = parseFloat(document.getElementById('add-servico-valor').value);
        
        try {
            await api.createServico({
                servico: nome,
                duracao: duracao,
                valor: valor
            });
            
            showSuccess('Serviço adicionado com sucesso!');
            this.closeModal('modal-add-servico');
            this.loadServicos();
            
            document.getElementById('form-add-servico').reset();
        } catch (error) {
            console.error('Erro ao adicionar serviço:', error);
            showError('Erro ao adicionar serviço');
        }
    }

    /**
     * Adicionar profissional
     */
    async addProfissional(e) {
        e.preventDefault();
        
        const nome = document.getElementById('add-prof-nome').value;
        const de = document.getElementById('add-prof-de').value || null;
        const ate = document.getElementById('add-prof-ate').value || null;
        
        try {
            await api.createProfissional({
                profissional: nome,
                de: de,
                ate: ate
            });
            
            showSuccess('Profissional adicionado com sucesso!');
            this.closeModal('modal-add-profissional');
            this.loadProfissionais();
            
            document.getElementById('form-add-profissional').reset();
        } catch (error) {
            console.error('Erro ao adicionar profissional:', error);
            showError('Erro ao adicionar profissional');
        }
    }

    /**
     * Deletar agendamento
     */
    async deleteAgendamento(id) {
        if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
        
        try {
            await api.deleteAgendamento(id);
            showSuccess('Agendamento excluído com sucesso!');
            this.loadAgendamentos();
        } catch (error) {
            console.error('Erro ao excluir agendamento:', error);
            showError('Erro ao excluir agendamento');
        }
    }

    /**
     * Deletar serviço
     */
    async deleteServico(id) {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        
        try {
            await api.deleteServico(id);
            showSuccess('Serviço excluído com sucesso!');
            this.loadServicos();
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
            showError('Erro ao excluir serviço');
        }
    }

    /**
     * Deletar profissional
     */
    async deleteProfissional(id) {
        if (!confirm('Tem certeza que deseja excluir este profissional?')) return;
        
        try {
            await api.deleteProfissional(id);
            showSuccess('Profissional excluído com sucesso!');
            this.loadProfissionais();
        } catch (error) {
            console.error('Erro ao excluir profissional:', error);
            showError('Erro ao excluir profissional');
        }
    }

    /**
     * Gerar relatório
     */
    async gerarRelatorio() {
        const periodo = document.getElementById('filtro-periodo').value;
        let dataInicio, dataFim;
        
        const hoje = new Date();
        
        switch (periodo) {
            case 'hoje':
                dataInicio = dataFim = hoje.toISOString().split('T')[0];
                break;
            case 'semana':
                const inicioSemana = new Date(hoje);
                inicioSemana.setDate(hoje.getDate() - hoje.getDay());
                dataInicio = inicioSemana.toISOString().split('T')[0];
                dataFim = hoje.toISOString().split('T')[0];
                break;
            case 'mes':
                dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
                dataFim = hoje.toISOString().split('T')[0];
                break;
            case 'personalizado':
                dataInicio = document.getElementById('data-inicio').value;
                dataFim = document.getElementById('data-fim').value;
                break;
        }
        
        if (!dataInicio || !dataFim) {
            showError('Selecione um período válido');
            return;
        }
        
        const agendamentosPeriodo = this.data.agendamentos.filter(a => 
            a.data >= dataInicio && a.data <= dataFim
        );
        
        this.renderRelatorio(agendamentosPeriodo, dataInicio, dataFim);
    }

    /**
     * Renderizar relatório
     */
    renderRelatorio(agendamentos, dataInicio, dataFim) {
        const container = document.getElementById('relatorio-resultado');
        
        // Calcular estatísticas
        const totalAgendamentos = agendamentos.length;
        const receitaTotal = agendamentos.reduce((total, a) => total + parseFloat(a.valor || 0), 0);
        const ticketMedio = totalAgendamentos > 0 ? receitaTotal / totalAgendamentos : 0;
        
        // Clientes mais recorrentes
        const clientesCount = {};
        agendamentos.forEach(a => {
            clientesCount[a.telefone] = (clientesCount[a.telefone] || 0) + 1;
        });
        
        const clientesRecorrentes = Object.entries(clientesCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([telefone, count]) => {
                const agendamento = agendamentos.find(a => a.telefone === telefone);
                return { nome: agendamento.nome, telefone, count };
            });
        
        container.innerHTML = `
            <div class="relatorio-stats">
                <div class="relatorio-stat">
                    <h4>${totalAgendamentos}</h4>
                    <p>Total de Agendamentos</p>
                </div>
                <div class="relatorio-stat">
                    <h4>${Utils.formatarValor(receitaTotal)}</h4>
                    <p>Receita Total</p>
                </div>
                <div class="relatorio-stat">
                    <h4>${Utils.formatarValor(ticketMedio)}</h4>
                    <p>Ticket Médio</p>
                </div>
            </div>
            
            <h4>Período: ${Utils.formatarData(dataInicio)} a ${Utils.formatarData(dataFim)}</h4>
            
            <h4>Clientes Mais Recorrentes:</h4>
            <div class="clientes-recorrentes">
                ${clientesRecorrentes.map(cliente => `
                    <div class="cliente-item">
                        <strong>${cliente.nome}</strong> - ${Utils.formatTelefone(cliente.telefone)} 
                        (${cliente.count} agendamentos)
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Alterar senha
     */
    async alterarSenha(e) {
        e.preventDefault();
        
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
        
        if (novaSenha !== confirmarSenha) {
            showError('As senhas não coincidem');
            return;
        }
        
        if (novaSenha.length < 6) {
            showError('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        try {
            // Assumindo que existe apenas um registro de login com ID 1
            await api.updateLogin(1, this.currentUser, novaSenha);
            showSuccess('Senha alterada com sucesso!');
            document.getElementById('form-alterar-senha').reset();
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            showError('Erro ao alterar senha');
        }
    }

    /**
     * Abrir modal
     */
    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Fechar modal
     */
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Função global para fechar modais
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});

// Adicionar estilos para status
const statusStyles = `
<style>
.status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.status-success {
    background: #dcfce7;
    color: #166534;
}

.status-warning {
    background: #fef3c7;
    color: #92400e;
}

.status-error {
    background: #fee2e2;
    color: #991b1b;
}

.cliente-item {
    padding: 8px;
    background: #f8fafc;
    border-radius: 6px;
    margin-bottom: 8px;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', statusStyles);

