const { extrairInformacoes } = require('../main.js');
const cors = require('cors');

const express = require('express');
const app = express();
const port = 3000;

// const rotas = require('./rotas');

app.use(cors());

app.get('/extracao/', async function(req, res){
    const teste = req.query.teste
    console.log(teste);

    res.send(await extrairInformacoes());
});

app.listen(port, () => {
    console.log(`App está rodando na porta ${port}`)
});