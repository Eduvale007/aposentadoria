require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); 


mongoose.connect(process.env.DB_URI)
    .then(() => console.log('Conectado ao banco de dados MongoDB com sucesso.'))
    .catch((err) => {
        console.error('Erro ao conectar ao MongoDB:', err.message);
        process.exit(1); 
    });

const funcionarioSchema = new mongoose.Schema({
    Nome: String,
    Dt_contratacao: Date,
    Anos_contribuicao: Number,
});

const salarioSchema = new mongoose.Schema({
    funcionario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Funcionario' },
    Valor_Bruto: Number,
    Dt_ajuste: { type: Date, default: Date.now },
});

const aposentadoriaSchema = new mongoose.Schema({
    funcionario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Funcionario' },
    Valor_estimado: Number,
    Dt_calculo: { type: Date, default: Date.now },
});


const Funcionario = mongoose.model('Funcionario', funcionarioSchema);
const Salario = mongoose.model('Salario', salarioSchema);
const Aposentadoria = mongoose.model('Aposentadoria', aposentadoriaSchema);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/enviar', (req, res) => {
    const { name, dataContratacao, tempoContribuicao, salario } = req.body;


    if (!name || !dataContratacao || !tempoContribuicao || !salario) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const fator = 0.08; 
    const valorEstimado = (salario * fator) * tempoContribuicao;


    const novoFuncionario = new Funcionario({
        Nome: name,
        Dt_contratacao: new Date(dataContratacao),
        Anos_contribuicao: tempoContribuicao,
    });

    novoFuncionario.save()
        .then((funcionario) => {
      
            const novoSalario = new Salario({
                funcionario_id: funcionario._id,
                Valor_Bruto: salario,
            });

            return novoSalario.save();
        })
        .then((salario) => {
   
            const novaAposentadoria = new Aposentadoria({
                funcionario_id: salario.funcionario_id,
                Valor_estimado: valorEstimado,
            });

            return novaAposentadoria.save();
        })
        .then(() => {
            res.json({ valorEstimado: parseFloat(valorEstimado.toFixed(2)) });
        })
        .catch((err) => {
            console.error('Erro ao processar os dados:', err.message);
            res.status(500).json({ error: 'Erro ao salvar os dados.' });
        });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`); 
});
