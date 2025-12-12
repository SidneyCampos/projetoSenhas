// Importamos as bibliotecas que baixamos
const express = require('express');
const cors = require('cors');
const app = express();

// Definimos a porta (localmente usaremos 3000)
const port = 3000;

// Configurações básicas para aceitar JSON e liberar acesso
app.use(cors());
app.use(express.json());

// Dizemos ao servidor: "Se alguém acessar a raiz, mostre os arquivos da pasta 'public'"
app.use(express.static('public'));

// --- BANCO DE DADOS NA MEMÓRIA ---
// Como queremos algo simples, usaremos uma variável global.
// Se o servidor reiniciar, volta para o zero (ou podemos configurar um valor inicial).
let estado = {
    numeroAtual: 0,
    historico: [],         // Lista para guardar as últimas senhas (ex: [4, 3, 2])
    timestamp: Date.now()  // Carimbo de tempo da última mudança (para saber quando tocar o som)
};

// --- ROTAS (Endpoints) ---

// ROTA 1: Consultar (GET)
// A TV vai chamar isso a cada 1 segundo para saber o que mostrar.
app.get('/api/status', (req, res) => {
    res.json(estado);
});

// ROTA 2: Atualizar (POST)
// O Celular vai chamar isso para mandar mudar a senha.
app.post('/api/comando', (req, res) => {
    const { acao, valorManual } = req.body; // Recebe o que foi enviado pelo celular

    // Lógica principal
    if (acao === 'proximo') {
        atualizarHistorico();
        estado.numeroAtual++;
        estado.timestamp = Date.now();
    } 
    else if (acao === 'anterior') {
        // Só volta se for maior que 0
        if (estado.numeroAtual > 0) {
            // Nota: Geralmente voltar não gera histórico, apenas corrige o erro,
            // mas atualizamos o timestamp para a TV atualizar a tela rápido.
            estado.numeroAtual--;
            estado.timestamp = Date.now();
        }
    }
    else if (acao === 'definir') {
        atualizarHistorico();
        estado.numeroAtual = parseInt(valorManual);
        estado.timestamp = Date.now();
    }
    else if (acao === 'reset') {
        estado.historico = [];
        estado.numeroAtual = 0;
        estado.timestamp = Date.now();
    }

    // Retorna o novo estado para o celular confirmar que deu certo
    res.json(estado);
});

// Função auxiliar para cuidar do histórico (FIFO - First In, First Out)
function atualizarHistorico() {
    // Se o número atual não for zero, adiciona no início da lista
    if (estado.numeroAtual > 0) {
        estado.historico.unshift(estado.numeroAtual);
    }
    // Se a lista ficar maior que 5 itens, remove o último (o mais antigo)
    if (estado.historico.length > 5) {
        estado.historico.pop();
    }
}

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando! Acesse http://localhost:${port}`);
});