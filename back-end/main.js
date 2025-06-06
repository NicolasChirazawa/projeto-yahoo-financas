const { converterDolar } = require('./funcoes_opcionais.js');
const { cotacaoDia, Erro } =  require('./classes.js')
const yahooFinance = require('yahoo-finance2').default;

function bancoLocal(){
    // Banco em memória com algumas ações
    const acoes = [
        {
            empresa: 'NVIDIA Corporation',
            sigla: 'NVDA'
        },
        {
            empresa: 'Ford Motor Company',
            sigla: 'F'
        },
        {
            empresa: 'Palantir Technologies Inc.',
            sigla: 'PLTR'
        },
        {
            empresa: 'Tesla Inc.',
            sigla: 'TSLA'
        },
        {
            empresa: 'Lucid Group Inc.',
            sigla: 'LCID'
        }
    ]
    return acoes;
}

function verificacaoData(data) {
    let codigo_erro;
    let erro;

    try{
        if(data.data_inicial == '') {
            codigo_erro = '001';

            erro = new Erro(codigo_erro);
            throw new Error(erro);
        } 
    
        if(data.data_final == ''){
            codigo_erro = '002';

            erro = new Erro(codigo_erro);
            throw new Error(erro);
        }
    
        // Pega o dia de hoje
        let dia_atual = new Date().toLocaleString();
    
        // Transcrever a data comum dd/mm/yyyy -> yyyy/mm/dd
        dia_atual = dia_atual.split(',')[0].split('/');
        dia_atual = Number(dia_atual[2] + dia_atual[1] + dia_atual[0]);
    
        let primeira_data = Number(data.data_inicial.split('-').join(''));
        let segunda_data = Number(data.data_final.split('-').join(''));
    
        if(dia_atual < primeira_data) { codigo_erro = '003' } 
        
        if(dia_atual < segunda_data) { codigo_erro = '004' } 
        
        if(primeira_data > segunda_data) { codigo_erro = '005' }

        if(codigo_erro != undefined){
            erro = new Erro(codigo_erro);
            throw new Error(erro);
        }

        return {
            message: '',
            status: false
        };
    } catch {
        console.log(erro.lancarMensagem());
        return {
            message: erro.lancarMensagem(),
            status: true
        };
    }
}

function calcularProximoDia(data){
    
    // Ano, mês e dia
    const dataSeparada = data.data_final.split
    ('-').map((res) => Number(res));

    const diaFinalMeses = {
        1: 31,
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31
    }

    // Caso não seja fevereiro
    if(diaFinalMeses[dataSeparada[1]] != undefined){

        // Dia não é o último do seu mês
        if(diaFinalMeses[dataSeparada[1]] != dataSeparada[2]){
            dataSeparada[2]++;
        }

        // Mudar de mês
        if(diaFinalMeses[dataSeparada[1]] == dataSeparada[2]){
            dataSeparada[2] = 1;
            dataSeparada[1]++;
        }

        // Mudar ano
        if(dataSeparada[1] > 12){
            dataSeparada[1] = 1;
            dataSeparada[0]++;
        }

    } else {
        // Não é o último de um ano comum
        if(dataSeparada[2] != '28'){
            dataSeparada[2]++;
        } else if (dataSeparada[2] == '29'){
            // Obrigatoriamente é ano bissexto
            dataSeparada[2] = '1';
            dataSeparada[1]++;
        } else {
            
            // Verificação ano bissexto
            /* Regra
                Divisível por 4: É bissexto
                Divisível por 100: Não é bissexto
                Divisível por 400: É bissexto
            */

            let eBissexto = false;

            if(dataSeparada[0] % 4 == 0){
                eBissexto = true;
                if(dataSeparada[0] % 100 == 0){
                    eBissexto = false;
                    if(dataSeparada[0] % 400 == 0){
                        eBissexto = true;
                    }
                }
            }

            if(eBissexto) {
                dataSeparada[2]++;
            } else {
                dataSeparada[2] = '1';
                dataSeparada[1]++;
            }
        }
    }

    // Retornar leading '0'
    if(dataSeparada[1] < 10){
        dataSeparada[1] = '0' + dataSeparada[1]
    }

    if(dataSeparada[2] < 10){
        dataSeparada[2] = '0' + dataSeparada[2];
    }

    data.data_final = dataSeparada[0] + '-' + dataSeparada[1] + '-' + dataSeparada[2];
    return data.data_final;
}

function verificacaoAcaoResultado(dados_brutos_acoes) {
    let codigo_erro;
    let erro;

    try{
        if(dados_brutos_acoes.quotes.length == 0){
            codigo_erro = '011';
            erro = new Erro(codigo_erro)
            throw new Error(erro);
        }

        return {
            status: false,
            message: ''
        }
    } catch {
        console.log(erro.lancarMensagem());
        return {
            status: true,
            message: erro
        }
    }
}

function tratarDados(dados_brutos_acoes){
    const QUANTIDADE_OPERACOES = 4; 
    let dados_tratados_acoes = [];

    for(let i = 0; i < dados_brutos_acoes.quotes.length; i++){

        const dados_estruturados = [
            dados_brutos_acoes.quotes[i].date,
            String(dados_brutos_acoes.quotes[i].high), 
            String(dados_brutos_acoes.quotes[i].low), 
            String(dados_brutos_acoes.quotes[i].open),
            String(dados_brutos_acoes.quotes[i].close),
            String(dados_brutos_acoes.quotes[i].volume),
            String(dados_brutos_acoes.quotes[i].sigla)
        ];
        
        // Tratar números com decimais, começa no 1 pois não mexe em data.
        for(let i = 1; i < (QUANTIDADE_OPERACOES + 1); i++){
            let numeroDecimal = false
    
            // Descobrir se o número é decimal
            for(let j = 0; j < dados_estruturados[i]; j++){
                if(dados_estruturados[i][j] == '.'){
                    numeroDecimal = true;
                    break;
                } else if (j == (dados_estruturados[i].length - 1)){
                    // Caso ele não seja decimal, acrescenta as casas decimais 
                    dados_estruturados[i] = dados_estruturados[i] + '.00';
                }
            }
    
            // Tratar números para voltar apenas duas casas decimais
            if(numeroDecimal == true){
                let tratamento = dados_estruturados[i].split('.');
                tratamento[1] = tratamento[1].slice(0, 2);
                dados_estruturados[i] = tratamento.join('.');
            }
        }

        // Tratar a data
        let dia = dados_estruturados[0].getDate();
        let mes = (dados_estruturados[0].getMonth() + 1);
        let ano = dados_estruturados[0].getFullYear();

        // Acrescenta o leading zero
        if(dia < 10) {
            dia = '0' + dia;
        }
        if(mes < 10){
            mes = '0' + mes;
        }

        dados_estruturados[0] = dia + '-' + mes + '-' + ano;

        // Define como dólar
        dados_estruturados[dados_estruturados.length - 1] = '$'

        dados_tratados_acoes.push(new cotacaoDia(dados_estruturados[0], dados_estruturados[1], dados_estruturados[2], dados_estruturados[3], dados_estruturados[4], dados_estruturados[5], dados_estruturados[6]));
    }
    return dados_tratados_acoes;
}

async function extrairDados(sigla, data_inicial_requisicao, data_final_requisicao, moeda){

    const codigo_acao = sigla;

    const data = {
        // Ano, mês, dia
        data_inicial: data_inicial_requisicao,
        data_final: data_final_requisicao
    }

    // Verifica se as datas inseridas são válidas
    let dataInvalida = verificacaoData(data);
    if(dataInvalida.status == true) { 
        return dataInvalida.message;
    }

    if(moeda == "undefined") {
        return new Erro('008').lancarMensagem();
    }

    // De acordo com a documentação da API, o dia inicial e final não podem ser iguais. Por conta disso, é necessário pular um dia;
    // Condição mais intuitiva para o usuário;
    if(data.data_inicial == data.data_final){
        data.data_final = calcularProximoDia(data);
    }

    let periodo = {period1: data.data_inicial, period2: data.data_final};

    let dados_brutos_acoes;
    try {
        dados_brutos_acoes = await yahooFinance.chart(codigo_acao, periodo);
    } catch {
        return new Erro('006').lancarMensagem();
    }

    let naoEncontrouAcoes = verificacaoAcaoResultado(dados_brutos_acoes);
    if(naoEncontrouAcoes.status == true) { 
        return naoEncontrouAcoes.message;
    }

    let dados_tratados_acoes = tratarDados(dados_brutos_acoes);

    // Caso queira converter para dólar
    const convercao_real = (moeda == 'real') ? true : false;

    if(convercao_real){
        dados_tratados_acoes = await converterDolar(dados_tratados_acoes, data);
    }

    return dados_tratados_acoes;
}

function desenvolveCabecalho(sigla) {
    // Funciona usando o banco também

    const acoes = {
        NVDA: {sigla: 'NVDA', acao_nome: 'NVIDIA Corporation'},
        F: {sigla: 'F', acao_nome: 'Ford Motor Company'},
        PLTR: {sigla: 'PLTR', acao_nome: 'Palantir Technologies Inc.'},
        TSLA: {sigla: 'TSLA', acao_nome: 'Tesla, Inc.'},
        LCID: {sigla: 'LCID', acao_nome: 'Lucid Group, Inc.'},
    }

    if(acoes[sigla] == undefined) { 
        return new Erro('013').lancarMensagem(); 
    } else {
        return { acao: acoes[sigla] };
    }
}

async function desesnvolveGrafico(dados_tratados_acoes){
    // { Descobrir se há como acrescentar uma descrição no ApexCharts }

    // Conteúdo do gráfico
    let data = [];

    for(let i = 0; i < dados_tratados_acoes.length; i++){

        let formatacao_data_grafico = dados_tratados_acoes[i].data.split('-');
        
        // Mês, dia, ano
        formatacao_data_grafico = formatacao_data_grafico[1] + '-' + formatacao_data_grafico[0] + '-' + formatacao_data_grafico[2];

        data[i] = {
            x: formatacao_data_grafico,
            y: dados_tratados_acoes[i].fechamento
        }
    } 

    let grafico = {
        chart: {
          type: 'line'
        },
        series: [
          {
            name: "Fechamento",
            data: data
          }
        ],
        xaxis: {
          type: 'datetime',
          title: {
            text: 'Dia(s)'
           }
        },
        yaxis: {
            type: 'number',
            title: {
              text: `(${dados_tratados_acoes[0].sigla}) Dinheiro`
             }
        },
    }

    return grafico;
}

function analisarDados(dados_tratados_acoes) {
    // Maior ação, menor ação, media
    let maiorAcao;
    let menorAcao;
    let media = 0;

    for(let i = 0; i < dados_tratados_acoes.length; i++){
        if(maiorAcao == undefined || maiorAcao < Number(dados_tratados_acoes[i].fechamento)){
            maiorAcao = Number(dados_tratados_acoes[i].fechamento);
        }

        if(menorAcao == undefined || menorAcao > Number(dados_tratados_acoes[i].fechamento)){
            menorAcao = Number(dados_tratados_acoes[i].fechamento);
        }

        media += Number(dados_tratados_acoes[i].fechamento);
    }

    media = media / dados_tratados_acoes.length;
    // Tratar o número para o formato (...,xx). Apenas dois números após a vírgula.
    media = String(media).split('.')[0] + '.' + String(media).split('.')[1].slice(0, 2);

    let dados_analisados = {
        maiorAcao: dados_tratados_acoes[0].sigla + Number(maiorAcao).toFixed(2),
        menorAcao: dados_tratados_acoes[0].sigla + Number(menorAcao).toFixed(2),
        media: dados_tratados_acoes[0].sigla + Number(media).toFixed(2)
    };

    return dados_analisados;
}

module.exports = { bancoLocal, extrairDados, desenvolveCabecalho, desesnvolveGrafico, analisarDados }; 