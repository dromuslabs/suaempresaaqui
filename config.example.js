/**
 * Arquivo de Configuração - EXEMPLO
 * 
 * Copie este arquivo para config.js e configure suas credenciais
 */

// ⚠️ IMPORTANTE: Substitua pelos seus dados reais

const CONFIG_EXAMPLE = {
    // URL base da sua API Sheety
    // Obtenha em: https://sheety.co/
    SHEETY_BASE_URL: 'https://api.sheety.co/SEU_ID_AQUI/agendabeta',
    
    // Número do WhatsApp para envio de confirmações
    // Formato: Código do país + DDD + Número (sem espaços ou símbolos)
    WHATSAPP_NUMBER: '5577999757808',
    
    // Configurações do sistema
    SYSTEM: {
        // Nome do estabelecimento
        BUSINESS_NAME: 'Seu Estabelecimento',
        
        // Máximo de agendamentos futuros por cliente
        MAX_FUTURE_APPOINTMENTS: 5,
        
        // Duração padrão dos serviços (em minutos)
        DEFAULT_SERVICE_DURATION: 60,
        
        // Intervalo de atualização automática (em milissegundos)
        AUTO_REFRESH_INTERVAL: 30000,
        
        // Modo debug (true/false)
        DEBUG_MODE: false
    },
    
    // Configurações de horário
    SCHEDULE: {
        // Quantos meses à frente permitir agendamentos
        MONTHS_AHEAD: 3,
        
        // Dias da semana que funcionam (0 = domingo, 6 = sábado)
        WORKING_DAYS: [1, 2, 3, 4, 5, 6], // Segunda a sábado
        
        // Horário de funcionamento padrão
        DEFAULT_HOURS: {
            start: '08:00',
            end: '18:00',
            interval: 60 // minutos
        }
    },
    
    // Configurações de notificação
    NOTIFICATIONS: {
        // Duração padrão dos toasts (em milissegundos)
        DEFAULT_DURATION: 4000,
        
        // Duração para erros
        ERROR_DURATION: 6000,
        
        // Máximo de toasts simultâneos
        MAX_TOASTS: 5
    },
    
    // Configurações de validação
    VALIDATION: {
        // Tamanho mínimo do nome
        MIN_NAME_LENGTH: 2,
        
        // Tamanho mínimo da senha
        MIN_PASSWORD_LENGTH: 6,
        
        // Regex para validação de telefone brasileiro
        PHONE_REGEX: /^(\d{10,11})$/,
        
        // Regex para validação de email
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
};

// ========================================
// INSTRUÇÕES DE CONFIGURAÇÃO
// ========================================

/*
1. CONFIGURAR SHEETY:
   - Acesse https://sheety.co/
   - Conecte sua planilha Google Sheets
   - Copie a URL da API
   - Substitua 'SEU_ID_AQUI' na SHEETY_BASE_URL

2. CONFIGURAR WHATSAPP:
   - Substitua o número pelo seu WhatsApp comercial
   - Formato: 55 (Brasil) + DDD + Número
   - Exemplo: 5511999887766

3. ESTRUTURA DA PLANILHA:
   Sua planilha deve ter as seguintes abas:
   
   📊 agendabeta (Agendamentos):
   nome | data | hora | email | servico | valor | telefone | profissional
   
   ⏰ horabeta (Horários):
   diasemana | hora | ativo
   
   💼 servicobeta (Serviços):
   servico | duracao | valor
   
   👥 profissional (Profissionais):
   profissional | de | ate
   
   🔐 login (Login):
   user | senha

4. DADOS DE EXEMPLO:
   
   horabeta:
   segunda | 09:00 | TRUE
   segunda | 10:00 | TRUE
   segunda | 11:00 | TRUE
   terça   | 09:00 | TRUE
   
   servicobeta:
   Corte | 60 | 50.00
   Manicure | 45 | 30.00
   
   profissional:
   Ana | 2024-01-01 | 2024-12-31
   Carla | 2024-01-01 | 2024-12-31
   
   login:
   admin | 123456

5. APLICAR CONFIGURAÇÕES:
   - Copie este arquivo para config.js
   - Edite os valores conforme suas necessidades
   - Importe no início dos seus arquivos JS:
     import CONFIG from './config.js';

6. TESTAR:
   - Abra o sistema no navegador
   - Teste o formulário de agendamento
   - Teste o login administrativo
   - Verifique se os dados estão sendo salvos na planilha
*/

// Exportar configuração (descomente se usar módulos ES6)
// export default CONFIG_EXAMPLE;

