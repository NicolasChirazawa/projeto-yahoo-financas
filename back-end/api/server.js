const { extrairDados, desesnvolveGrafico } = require('../main.js');
const cors = require('cors');

const express = require('express');
const app = express();
const port = 3000;

// const rotas = require('./rotas');

app.use(cors());

app.get('/extrairDados/', async function(req, res){
    const teste = req.query.teste
    console.log(teste);

    res.send(await extrairDados());
});

// Transformar o JSON num 'req body'
app.use(express.json())

app.post('/criarGrafico/', async function(req, res){
    const dados_acoes = req.body;
    res.send(await desesnvolveGrafico(dados_acoes));
});

app.listen(port, () => {
    console.log(`App está rodando na porta ${port}`)
});