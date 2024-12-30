require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Configurar middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Servir arquivos estáticos

// Conectar ao MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado ao banco de dados MongoDB com sucesso.'))
    .catch((err) => {
        console.error('Erro ao conectar ao MongoDB:', err.message);
        process.exit(1); // Fecha o servidor se o banco de dados não estiver disponível
    });

// Criar Schemas do Mongoose
const funcionarioSchema = new mongoose.Schema({
    Nome: { type: String, required: true },
    Dt_contratacao: { type: Date, required: true },
    Anos_contribuicao: { type: Number, required: true, min: 0 },
});

const salarioSchema = new mongoose.Schema({
    funcionario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Funcionario', required: true },
    Valor_Bruto: { type: Number, required: true, min: 0 },
    Dt_ajuste: { type: Date, default: Date.now },
});

const aposentadoriaSchema = new mongoose.Schema({
    funcionario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Funcionario', required: true },
    Valor_estimado: { type: Number, required: true, min: 0 },
    Dt_calculo: { type: Date, default: Date.now },
});

// Criar modelos
const Funcionario = mongoose.model('Funcionario', funcionarioSchema);
const Salario = mongoose.model('Salario', salarioSchema);
const Aposentadoria = mongoose.model('Aposentadoria', aposentadoriaSchema);

// Rota inicial para exibir o formulário
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para processar os dados enviados pelo formulário
app.post('/enviar', async (req, res) => {
    try {
        const { name, dataContratacao, tempoContribuicao, salario } = req.body;

        // Validação básica dos dados
        if (!name || !dataContratacao || !tempoContribuicao || !salario) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        if (isNaN(salario) || salario <= 0 || isNaN(tempoContribuicao) || tempoContribuicao <= 0) {
            return res.status(400).json({ error: 'Salário e tempo de contribuição devem ser números positivos.' });
        }

        const fator = 0.08; // cálculo da aposentadoria
        const valorEstimado = (salario * fator) * tempoContribuicao;

        // Criar o novo funcionário
        const novoFuncionario = new Funcionario({
            Nome: name,
            Dt_contratacao: new Date(dataContratacao),
            Anos_contribuicao: tempoContribuicao,
        });

        const funcionario = await novoFuncionario.save();

        // Inserir o salário do funcionário
        const novoSalario = new Salario({
            funcionario_id: funcionario._id,
            Valor_Bruto: salario,
        });
        await novoSalario.save();

        // Inserir os dados de aposentadoria
        const novaAposentadoria = new Aposentadoria({
            funcionario_id: funcionario._id,
            Valor_estimado: valorEstimado,
        });
        await novaAposentadoria.save();

        res.json({ valorEstimado: parseFloat(valorEstimado.toFixed(2)) });
    } catch (err) {
        console.error('Erro ao processar os dados:', err.message);
        res.status(500).json({ error: 'Erro ao salvar os dados.' });
    }
});

// Inicializa o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
