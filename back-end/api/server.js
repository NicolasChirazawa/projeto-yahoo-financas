const { bancoLocal, extrairDados, desenvolveCabecalho, desesnvolveGrafico, analisarDados } = require('../main.js');
const cors = require('cors');

const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

// const rotas = require('./rotas');

app.use(cors());

app.get('/enviarNomeAcoes', function(req, res){
    res.send(bancoLocal());
})

app.get('/extrairDados/', async function(req, res){
    const sigla = req.query.sigla;
    const data_inicial = req.query.data_inicial;
    const data_final = req.query.data_final;

    const requisicao = await extrairDados(sigla, data_inicial, data_final);

    if(typeof requisicao == 'string') { 
        res.status(400).send({statusText: requisicao})
    } else {
        res.send(requisicao);
    }
});

app.get('/criarCabecalho/', function(req, res) {
    const sigla = req.query.sigla;

    const cabecalho = desenvolveCabecalho(sigla);

    if(typeof cabecalho == 'string'){
        res.status(404);
        res.send({statusText: cabecalho})
    } else {
        res.send(JSON.stringify(cabecalho.acao));
    }
});

// Transformar o JSON num 'req body'
app.use(express.json())

app.post('/criarGrafico/', async function(req, res){
    const dados_acoes = req.body;
    res.send(await desesnvolveGrafico(dados_acoes));
});

app.post('/criarTabela/', function(req, res){
    const dados_acoes = req.body;
    res.send(analisarDados(dados_acoes));
});

app.get('/buscarLogo/', function(req, res) {
    const sigla = req.query.sigla;
    res.sendFile(path.join(__dirname, `../../public/logo/${sigla}.png`));
});

app.listen(port, () => {
    console.log(`App está rodando na porta ${port}`)
});