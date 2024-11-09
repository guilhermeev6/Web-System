const express = require('express'); // Importa o framework Express para criar o servidor web
const { MongoClient, ObjectId } = require('mongodb'); // Importa o MongoClient e ObjectId do MongoDB para conexão e manipulação do banco
const path = require('path'); // Importa o módulo path para manipulação de caminhos de diretórios

const app = express(); // Inicializa a aplicação Express
const port = 3000; // Define a porta onde o servidor será executado

const uri = 'mongodb://localhost:27017'; // URL de conexão com o MongoDB
const client = new MongoClient(uri); // Cria um cliente do MongoDB com a URI fornecida

app.use(express.json()); // Middleware para interpretar requisições com JSON
app.use(express.urlencoded({ extended: true })); // Middleware para interpretar requisições codificadas no padrão URL

// Rota para renderizar o arquivo HTML de cadastro
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'cadastro.html'));
});

// Função assíncrona para conectar ao MongoDB
async function connectToMongo() {
    try {
        await client.connect(); // Tenta conectar ao MongoDB
        console.log('Conectado ao MongoDB'); // Log de sucesso
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err); // Log de erro, se falhar
    }
}

// Rota para cadastrar um novo veículo
app.post('/cadastrar', async (req, res) => {
    try {
        const db = client.db('cadastro'); // Seleciona o banco de dados "cadastro"
        const collection = db.collection('veiculos'); // Seleciona a coleção "veiculos"

        console.log('Dados recebidos para cadastro:', req.body); // Log dos dados recebidos

        const result = await collection.insertOne(req.body); // Insere o documento no banco
        console.log('Veículo cadastrado com sucesso:', result.insertedId); // Log de sucesso
        res.send('Veículo cadastrado com sucesso!'); // Responde ao cliente
    } catch (err) {
        console.error('Erro ao cadastrar veículo:', err); // Log de erro
        res.status(500).send('Erro ao cadastrar veículo: ' + err); // Responde ao cliente com erro
    }
});

// Rota para renderizar o arquivo HTML da página de veículos
app.get('/veiculos-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'veiculos.html'));
});

// Rota para listar todos os veículos
app.get('/veiculos', async (req, res) => {
    try {
        const db = client.db('cadastro'); // Seleciona o banco
        const collection = db.collection('veiculos'); // Seleciona a coleção

        const veiculos = await collection.find().toArray(); // Busca todos os documentos na coleção
        res.json(veiculos); // Retorna os veículos como JSON
    } catch (err) {
        console.error('Erro ao buscar veículos:', err); // Log de erro
        res.status(500).send('Erro ao buscar veículos: ' + err); // Responde com erro
    }
});

// Rota para deletar um veículo por ID
app.delete('/veiculos/:id', async (req, res) => {
    const id = req.params.id; // Obtém o ID da URL
    try {
        const db = client.db('cadastro');
        const collection = db.collection('veiculos');

        // Converte o ID para ObjectId e exclui o veículo
        const resultado = await collection.deleteOne({ _id: new ObjectId(id) });

        if (resultado.deletedCount > 0) {
            res.status(200).json({ message: 'Veículo excluído com sucesso' });
        } else {
            res.status(404).json({ message: 'Veículo não encontrado' });
        }
    } catch (erro) {
        console.error('Erro ao excluir veículo:', erro); // Log de erro
        res.status(500).json({ message: 'Erro ao excluir o veículo' }); // Responde com erro
    }
});

// Rota para atualizar um veículo por ID
app.put('/veiculos/:id', async (req, res) => {
    const id = req.params.id; // Obtém o ID da URL
    const veiculoAtualizado = req.body; // Dados atualizados do veículo

    try {
        const db = client.db('cadastro');
        const collection = db.collection('veiculos');

        const resultado = await collection.updateOne(
            { _id: new ObjectId(id) }, // Filtro para encontrar o veículo
            { $set: veiculoAtualizado } // Atualização a ser feita
        );

        if (resultado.modifiedCount > 0) {
            res.status(200).json({ message: 'Veículo atualizado com sucesso' });
        } else {
            res.status(404).json({ message: 'Veículo não encontrado' });
        }
    } catch (erro) {
        console.error('Erro ao atualizar veículo:', erro); // Log de erro
        res.status(500).json({ message: 'Erro ao atualizar o veículo' }); // Responde com erro
    }
});

// Rota para buscar um veículo específico por ID
app.get('/veiculos/:id', async (req, res) => {
    const id = req.params.id; // Obtém o ID da URL
    try {
        const db = client.db('cadastro');
        const collection = db.collection('veiculos');

        const veiculo = await collection.findOne({ _id: new ObjectId(id) }); // Busca o veículo
        if (veiculo) {
            res.json(veiculo); // Retorna o veículo como JSON
        } else {
            res.status(404).json({ message: 'Veículo não encontrado' }); // Responde com erro
        }
    } catch (error) {
        console.error('Erro ao buscar veículo:', error); // Log de erro
        res.status(500).json({ message: 'Erro ao buscar veículo' }); // Responde com erro
    }
});

// Conecta ao MongoDB e inicia o servidor na porta especificada
connectToMongo().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
});
