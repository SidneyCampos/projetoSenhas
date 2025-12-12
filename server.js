const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- MEMÓRIA DO SISTEMA ---
let estado = {
    numeroAtual: 0,
    historico: [], // Agora guardará objetos { numero: 1, hora: "14:30" }
    timestamp: Date.now()
};

// --- ROTAS ---
app.get('/api/status', (req, res) => {
    res.json(estado);
});

app.post('/api/comando', (req, res) => {
    const { acao, valorManual } = req.body;

    if (acao === 'proximo') {
        adicionarAoHistorico(); // Salva o anterior antes de mudar
        estado.numeroAtual++;
        estado.timestamp = Date.now();
    } 
    else if (acao === 'anterior') {
        if (estado.numeroAtual > 0) {
            estado.numeroAtual--;
            estado.timestamp = Date.now();
        }
    }
    else if (acao === 'definir') {
        adicionarAoHistorico();
        estado.numeroAtual = parseInt(valorManual);
        estado.timestamp = Date.now();
    }
    else if (acao === 'reset') {
        estado.historico = [];
        estado.numeroAtual = 0;
        estado.timestamp = Date.now();
    }

    res.json(estado);
});

// Função auxiliar para pegar hora atual formatada e salvar no histórico
function adicionarAoHistorico() {
    if (estado.numeroAtual > 0) {
        // Pega a hora atual do servidor
        const agora = new Date();
        const horaFormatada = 
            String(agora.getHours()).padStart(2, '0') + ':' + 
            String(agora.getMinutes()).padStart(2, '0');

        // Adiciona no topo da lista o objeto com NÚMERO e HORA
        estado.historico.unshift({ 
            numero: estado.numeroAtual, 
            hora: horaFormatada 
        });
    }
    // Mantém apenas os últimos 5
    if (estado.historico.length > 5) {
        estado.historico.pop();
    }
}

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});