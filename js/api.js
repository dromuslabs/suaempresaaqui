/**
 * Módulo de API para integração com Google Sheets via Sheety
 * Base URL: https://api.sheety.co/08e6cbbffee520029dcb64480d35d1a8/agendabeta/
 */

class SheetsAPI {
    constructor() {
        this.baseURL = 'https://api.sheety.co/08e6cbbffee520029dcb64480d35d1a8/agendabeta';
        this.endpoints = {
            agendamentos: `${this.baseURL}/agendabeta`,
            horarios: `${this.baseURL}/horabeta`,
            servicos: `${this.baseURL}/servicobeta`,
            profissionais: `${this.baseURL}/profissional`,
            login: `${this.baseURL}/login`
        };
    }

    /**
     * Método genérico para fazer requisições HTTP
     */
    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // ==================== AGENDAMENTOS ====================

    /**
     * Listar todos os agendamentos
     */
    async getAgendamentos() {
        try {
            const data = await this.makeRequest(this.endpoints.agendamentos);
            return data.agendabeta || [];
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            return [];
        }
    }

    /**
     * Criar novo agendamento
     */
    async createAgendamento(agendamento) {
        try {
            const data = await this.makeRequest(this.endpoints.agendamentos, {
                method: 'POST',
                body: JSON.stringify({
                    agendabeta: agendamento
                })
            });
            return data.agendabeta;
        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            throw error;
        }
    }

    /**
     * Atualizar agendamento existente
     */
    async updateAgendamento(id, agendamento) {
        try {
            const data = await this.makeRequest(`${this.endpoints.agendamentos}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    agendabeta: agendamento
                })
            });
            return data.agendabeta;
        } catch (error) {
            console.error('Erro ao atualizar agendamento:', error);
            throw error;
        }
    }

    /**
     * Excluir agendamento
     */
    async deleteAgendamento(id) {
        try {
            await this.makeRequest(`${this.endpoints.agendamentos}/${id}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('Erro ao excluir agendamento:', error);
            throw error;
        }
    }

    /**
     * Buscar agendamentos por telefone
     */
    async getAgendamentosByTelefone(telefone) {
        try {
            const agendamentos = await this.getAgendamentos();
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            return agendamentos.filter(agendamento => {
                const dataAgendamento = new Date(agendamento.data);
                return agendamento.telefone === telefone && dataAgendamento >= hoje;
            });
        } catch (error) {
            console.error('Erro ao buscar agendamentos por telefone:', error);
            return [];
        }
    }

    /**
     * Verificar disponibilidade de horário
     */
    async verificarDisponibilidade(data, hora, profissional, duracaoMinutos = 60) {
        try {
            const agendamentos = await this.getAgendamentos();
            const dataFormatada = new Date(data).toISOString().split('T')[0];
            
            // Calcular quantos blocos de 60 minutos são necessários
            const blocosNecessarios = Math.ceil(duracaoMinutos / 60);
            
            // Converter hora para minutos para facilitar cálculos
            const [horaInicio, minutoInicio] = hora.split(':').map(Number);
            const minutosTotaisInicio = horaInicio * 60 + minutoInicio;
            
            // Verificar cada bloco necessário
            for (let i = 0; i < blocosNecessarios; i++) {
                const minutosBloco = minutosTotaisInicio + (i * 60);
                const horaBloco = Math.floor(minutosBloco / 60);
                const minutoBloco = minutosBloco % 60;
                const horaFormatada = `${horaBloco.toString().padStart(2, '0')}:${minutoBloco.toString().padStart(2, '0')}`;
                
                // Verificar se este bloco está ocupado
                const ocupado = agendamentos.some(agendamento => 
                    agendamento.data === dataFormatada && 
                    agendamento.hora === horaFormatada && 
                    agendamento.profissional === profissional
                );
                
                if (ocupado) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao verificar disponibilidade:', error);
            return false;
        }
    }

    // ==================== HORÁRIOS ====================

    /**
     * Listar horários padrão
     */
    async getHorarios() {
        try {
            const data = await this.makeRequest(this.endpoints.horarios);
            return data.horabeta || [];
        } catch (error) {
            console.error('Erro ao buscar horários:', error);
            return [];
        }
    }

    /**
     * Criar novo horário
     */
    async createHorario(horario) {
        try {
            const data = await this.makeRequest(this.endpoints.horarios, {
                method: 'POST',
                body: JSON.stringify({
                    horabeta: horario
                })
            });
            return data.horabeta;
        } catch (error) {
            console.error('Erro ao criar horário:', error);
            throw error;
        }
    }

    /**
     * Atualizar horário
     */
    async updateHorario(id, horario) {
        try {
            const data = await this.makeRequest(`${this.endpoints.horarios}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    horabeta: horario
                })
            });
            return data.horabeta;
        } catch (error) {
            console.error('Erro ao atualizar horário:', error);
            throw error;
        }
    }

    /**
     * Excluir horário
     */
    async deleteHorario(id) {
        try {
            await this.makeRequest(`${this.endpoints.horarios}/${id}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('Erro ao excluir horário:', error);
            throw error;
        }
    }

    /**
     * Obter horários disponíveis para uma data e profissional
     */
    async getHorariosDisponiveis(data, profissional, duracaoMinutos = 60) {
        try {
            const dataObj = new Date(data);
            const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
            const diaSemana = diasSemana[dataObj.getDay()];
            
            // Buscar horários padrão para o dia da semana
            const horariosBase = await this.getHorarios();
            const horariosAtivos = horariosBase.filter(h => 
                h.diasemana.toLowerCase() === diaSemana && h.ativo === true
            );
            
            // Verificar disponibilidade de cada horário
            const horariosDisponiveis = [];
            
            for (const horario of horariosAtivos) {
                const disponivel = await this.verificarDisponibilidade(
                    data, 
                    horario.hora, 
                    profissional, 
                    duracaoMinutos
                );
                
                if (disponivel) {
                    horariosDisponiveis.push(horario.hora);
                }
            }
            
            return horariosDisponiveis.sort();
        } catch (error) {
            console.error('Erro ao buscar horários disponíveis:', error);
            return [];
        }
    }

    // ==================== SERVIÇOS ====================

    /**
     * Listar todos os serviços
     */
    async getServicos() {
        try {
            const data = await this.makeRequest(this.endpoints.servicos);
            return data.servicobeta || [];
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            return [];
        }
    }

    /**
     * Criar novo serviço
     */
    async createServico(servico) {
        try {
            const data = await this.makeRequest(this.endpoints.servicos, {
                method: 'POST',
                body: JSON.stringify({
                    servicobeta: servico
                })
            });
            return data.servicobeta;
        } catch (error) {
            console.error('Erro ao criar serviço:', error);
            throw error;
        }
    }

    /**
     * Atualizar serviço
     */
    async updateServico(id, servico) {
        try {
            const data = await this.makeRequest(`${this.endpoints.servicos}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    servicobeta: servico
                })
            });
            return data.servicobeta;
        } catch (error) {
            console.error('Erro ao atualizar serviço:', error);
            throw error;
        }
    }

    /**
     * Excluir serviço
     */
    async deleteServico(id) {
        try {
            await this.makeRequest(`${this.endpoints.servicos}/${id}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
            throw error;
        }
    }

    // ==================== PROFISSIONAIS ====================

    /**
     * Listar todos os profissionais
     */
    async getProfissionais() {
        try {
            const data = await this.makeRequest(this.endpoints.profissionais);
            return data.profissional || [];
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            return [];
        }
    }

    /**
     * Criar novo profissional
     */
    async createProfissional(profissional) {
        try {
            const data = await this.makeRequest(this.endpoints.profissionais, {
                method: 'POST',
                body: JSON.stringify({
                    profissional: profissional
                })
            });
            return data.profissional;
        } catch (error) {
            console.error('Erro ao criar profissional:', error);
            throw error;
        }
    }

    /**
     * Atualizar profissional
     */
    async updateProfissional(id, profissional) {
        try {
            const data = await this.makeRequest(`${this.endpoints.profissionais}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    profissional: profissional
                })
            });
            return data.profissional;
        } catch (error) {
            console.error('Erro ao atualizar profissional:', error);
            throw error;
        }
    }

    /**
     * Excluir profissional
     */
    async deleteProfissional(id) {
        try {
            await this.makeRequest(`${this.endpoints.profissionais}/${id}`, {
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('Erro ao excluir profissional:', error);
            throw error;
        }
    }

    /**
     * Verificar se profissional está disponível em uma data
     */
    async isProfissionalDisponivel(profissional, data) {
        try {
            const profissionais = await this.getProfissionais();
            const prof = profissionais.find(p => p.profissional === profissional);
            
            if (!prof) return false;
            
            const dataVerificacao = new Date(data);
            const dataInicio = prof.de ? new Date(prof.de) : null;
            const dataFim = prof.ate ? new Date(prof.ate) : null;
            
            // Se não há restrições de data, está disponível
            if (!dataInicio && !dataFim) return true;
            
            // Verificar se está dentro do período de disponibilidade
            if (dataInicio && dataVerificacao < dataInicio) return false;
            if (dataFim && dataVerificacao > dataFim) return false;
            
            return true;
        } catch (error) {
            console.error('Erro ao verificar disponibilidade do profissional:', error);
            return false;
        }
    }

    // ==================== LOGIN ====================

    /**
     * Verificar credenciais de login
     */
    async verificarLogin(usuario, senha) {
        try {
            const data = await this.makeRequest(this.endpoints.login);
            const credenciais = data.login || [];
            
            return credenciais.some(cred => 
                cred.user === usuario && cred.senha === senha
            );
        } catch (error) {
            console.error('Erro ao verificar login:', error);
            return false;
        }
    }

    /**
     * Atualizar credenciais de login
     */
    async updateLogin(id, usuario, senha) {
        try {
            const data = await this.makeRequest(`${this.endpoints.login}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    login: {
                        user: usuario,
                        senha: senha
                    }
                })
            });
            return data.login;
        } catch (error) {
            console.error('Erro ao atualizar login:', error);
            throw error;
        }
    }
}

// Instância global da API
const api = new SheetsAPI();

