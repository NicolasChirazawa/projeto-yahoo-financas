const { extrairInformacoes } = require('../main.js');

const express = require('express');
const app = express();
const port = 3000;

// const rotas = require('./rotas');

app.get('/extracao', async function(req, res){
    res.send(await extrairInformacoes());
});

app.listen(port, () => {
    console.log(`App está rodando na porta ${port}`)
});