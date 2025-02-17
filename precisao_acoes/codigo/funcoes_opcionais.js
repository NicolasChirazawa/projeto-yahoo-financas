const { Erro } =  require('./classes.js')

function ajustarDataCotacaoAPI(data){
    // É necessário ajustar o formato da data
    let data_api = {
        data_inicial: data.data_inicial.split('-'),
        data_final: data.data_final.split('-')
    }

    // Transição: yyyy/mm/dd -> mm/dd/yyyy
    data_api.data_inicial = data_api.data_inicial[1] + '/' + data_api.data_inicial[2] + '/' + data_api.data_inicial[0];
    data_api.data_final = data_api.data_final[1] + '/' + data_api.data_final[2] + '/' + data_api.data_final[0];

    return data_api;
}

function verificacaoCotacaoResultado(dados_brutos_cotacao) {
    let erro_codigo = '012';
    let erro;

    try{
        if (dados_brutos_cotacao.value.length == 0){        
            erro = new Erro(erro_codigo);
            throw new Error(erro);
        }
        return false;

    } catch {
        console.log(erro.lancarMensagem());
        return true;
    }
}

function tratarDadosConversaoDolar(dados_brutos_cotacao, dados_tratados_cotacao, codigo_data_cotacao){ 

    for(let i = 0; i < dados_brutos_cotacao.value.length; i++){   

        // yyyy/mm/dd horário -> dd/mm/yyyy
        let data_tratada = String(dados_brutos_cotacao.value[i].dataHoraCotacao).split(' ')[0].split('-');
        data_tratada = data_tratada[2] + '-' +  data_tratada[1] + '-' + data_tratada[0];

        cotacao_unidade = {
            dolar: String(dados_brutos_cotacao.value[i].cotacaoCompra),
            data: data_tratada
        }

        dados_tratados_cotacao[cotacao_unidade.data] = cotacao_unidade;
        codigo_data_cotacao.push(cotacao_unidade.data);
    }
}

function encontrarDataDolar(dados_tratados_cotacao, codigo_data_cotacao, dados_acoes){
    let data_cotacao = '';

    for(let i = 0; i < codigo_data_cotacao.length; i++){

        if(dados_tratados_cotacao[dados_acoes[i].data] != undefined){
            data_cotacao = dados_tratados_cotacao[dados_acoes[i].data];
            break;
        }
    }
    return data_cotacao;
}

function converterAcaoReal(dados_acoes, data_cotacao){
    for(let i = 0; i < dados_acoes.length; i++) {

        // Obtem o resultado convertido
        dados_acoes[i].alta = (Number(dados_acoes[i].alta) * Number(data_cotacao.dolar));
        dados_acoes[i].baixa = (Number(dados_acoes[i].baixa) * Number(data_cotacao.dolar));
        dados_acoes[i].abertura = (Number(dados_acoes[i].abertura) * Number(data_cotacao.dolar));
        dados_acoes[i].fechamento = (Number(dados_acoes[i].fechamento) * Number(data_cotacao.dolar));

        // Tratar cadas decimais
        let dado_alta_nao_tratado = String(dados_acoes[i].alta).split('.');
        let dado_baixa_nao_tratado = String(dados_acoes[i].baixa).split('.');
        let dado_abertura_nao_tratado = String(dados_acoes[i].abertura).split('.');
        let dado_fechamento_nao_tratado = String(dados_acoes[i].fechamento).split('.');

        dados_acoes[i].alta = dado_alta_nao_tratado[0] + '.' + dado_alta_nao_tratado[1].slice(0, 2);
        dados_acoes[i].baixa = dado_baixa_nao_tratado[0] + '.' + dado_baixa_nao_tratado[1].slice(0, 2);
        dados_acoes[i].abertura = dado_abertura_nao_tratado[0] + '.' + dado_abertura_nao_tratado[1].slice(0, 2);
        dados_acoes[i].fechamento = dado_fechamento_nao_tratado[0] + '.' + dado_fechamento_nao_tratado[1].slice(0, 2);
        dados_acoes[i].sigla = 'R$';
    }
}

async function converterDolar(dados_acoes, data) {

    let data_api = ajustarDataCotacaoAPI(data);

    // Pesquisa API
    let pesquisa_cotacao_api = await fetch(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${data_api.data_inicial}'&@dataFinalCotacao='${data_api.data_final}'&$top=100&$format=json&$select=cotacaoCompra,dataHoraCotacao`);

    let dados_brutos_cotacao = await pesquisa_cotacao_api.json();

    let naoEncontrouCotacao = verificacaoCotacaoResultado(dados_brutos_cotacao);
    if(naoEncontrouCotacao == true) { return }

    let dados_tratados_cotacao = {};
    let codigo_data_cotacao = [];

    tratarDadosConversaoDolar(dados_brutos_cotacao, dados_tratados_cotacao, codigo_data_cotacao);

    let data_cotacao = encontrarDataDolar(dados_tratados_cotacao, codigo_data_cotacao, dados_acoes);

    // Pega o primeiro resultado disponível (sempre haverá, foi feito o teste 'verificacaoCotacaoResultado()' para confirmar).
    if(data_cotacao == '') { data_cotacao = dados_brutos_cotacao.value[0].cotacaoCompra }

    converterAcaoReal(dados_acoes, data_cotacao);
}

module.exports = { converterDolar }