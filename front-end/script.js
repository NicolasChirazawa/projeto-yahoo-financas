// Carregamento dos dados das ações na datalist  
window.addEventListener("load", async () => {
    const dados_acoes = await fetch('http://localhost:3000/enviarNomeAcoes').then((res) => res.json());

    const lista_acoes = document.getElementById("lista_acoes");

    for(let i = 0; i < dados_acoes.length; i++){
        const acao = document.createElement("option");
        acao.setAttribute("value", dados_acoes[i]["sigla"])
        acao.innerText = dados_acoes[i]["empresa"];

        lista_acoes.appendChild(acao);
    }
})

function descobrirDiaHoje(){
    let hoje = new Date();

    let dia = hoje.getDate();
    let mes = hoje.getMonth() + 1; 

    if (dia < 10){
        dia = '0' + '' + dia; 
    }
    if (mes < 10){
        mes = '0' + '' + mes; 
    }

    hoje = hoje.getFullYear() + '-' + mes + '-' + dia;
    return hoje;
}

function atribuirInputMax() {
    data_hoje = descobrirDiaHoje();

    document.getElementById("data_inicio").setAttribute('max', data_hoje);
    document.getElementById("data_final").setAttribute('max', data_hoje);
}

function descobrirDiaHoje(){
    let hoje = new Date();

    let dia = hoje.getDate();
    let mes = hoje.getMonth() + 1; 

    if (dia < 10){
        dia = '0' + '' + dia; 
    }
    if (mes < 10){
        mes = '0' + '' + mes; 
    }

    hoje = hoje.getFullYear() + '-' + mes + '-' + dia;
    return hoje;
}

function deletarDivErro(){
    const divisao_erros = document.getElementById("erro_mensagem") ?? undefined;

    if(divisao_erros != undefined){
        const main = document.getElementsByTagName("main")[0];
        main.removeChild(divisao_erros);
    }
}

function deletarDivAcao(){
    const div_acao = document.getElementById("acoes") ?? undefined;

    if(div_acao != undefined){
        const main = document.getElementsByTagName("main")[0];
        main.removeChild(div_acao);
    }
}

function validarCampos(acao, data_inicio, data_final, moeda) {
    let data_hoje = descobrirDiaHoje();
    let mensagem_erro = '';

    // Verificações
    if(data_inicio > data_hoje) {
        mensagem_erro += 'A data inícial não pode ser maior que a data atual \n';
    }

    if(data_final > data_hoje) {
        mensagem_erro += 'A data final não pode ser maior que a data atual \n';
    }

    if(data_inicio > data_final) {
        mensagem_erro += 'A data inicial não pode ser maior que a data final \n';
    }

    if(data_inicio == '') {
        mensagem_erro += 'A data inicial não pode estar vazia \n';
    }

    if(data_final == '') {
        mensagem_erro += 'A data final não pode estar vazia \n';
    }

    if(acao == ''){
        mensagem_erro += 'A ação não pode estar vazia \n';
    } 

    if(moeda == undefined){
        mensagem_erro += 'Selecione uma moeda \n';
    } 

    if(mensagem_erro == '') { 
        return undefined;
    } else {    
        return mensagem_erro; 
    }
}

function criarErro(mensagem_erro){
    let form = document.getElementsByTagName("form")[0];

    let div_erro = document.createElement("div");
    div_erro.setAttribute("id", "erro_mensagem");

    let texto_erro = document.createElement("p");
    texto_erro.textContent = mensagem_erro;

    div_erro.appendChild(texto_erro)
    form.parentNode.insertBefore(div_erro, form.nextSibling);
}

async function estruturaCabecalho(div_acao, acao){
    const div_cabecalho = document.createElement("div");
    div_cabecalho.setAttribute("id", "div_cabecalho");
    div_acao.appendChild(div_cabecalho);

    const div_imagem_cabecalho = document.createElement("div");
    div_imagem_cabecalho.setAttribute("id", "imagem");
    const imagem_cabecalho = document.createElement("img");
    
    let imagem_sigla;

    try{
        imagem_sigla = await fetch(`http://localhost:3000/buscarLogo?sigla=${acao.sigla}`)
        .then((response) => response.blob());
    } catch {
        return;
    }

    const imagem_URL = URL.createObjectURL(imagem_sigla);
    imagem_cabecalho.src = imagem_URL;

    div_cabecalho.appendChild(div_imagem_cabecalho);
    div_imagem_cabecalho.appendChild(imagem_cabecalho);

    const div_nomes_cabecalho = document.createElement("div");
    div_nomes_cabecalho.setAttribute("id", "acao_nomes");
    const titulo_acao = document.createElement("p");
    titulo_acao.setAttribute("id", "acao_titulo");
    titulo_acao.innerText = `${acao.acao_nome}`;
    const sigla_acao = document.createElement("p");
    sigla_acao.setAttribute("id", "acao_sigla")
    sigla_acao.innerText = `(${acao.sigla})`;

    div_cabecalho.appendChild(div_nomes_cabecalho);
    div_nomes_cabecalho.appendChild(titulo_acao);
    div_nomes_cabecalho.appendChild(sigla_acao);
}

function estruturarGrafico(div_acao){
    // Estruturar o visual do gráfico no front
    const div_grafico = document.createElement("div");
    div_grafico.setAttribute("id", "grafico");
    div_acao.appendChild(div_grafico);
}

function estruturarTabela(div_acao, objeto_dados){
    let tabela_dados = [
        "menorAcao",
        "media",
        "maiorAcao" 
    ];

    let tabela_nomes = [
        'Menor ação:',
        'Média:',
        'Maior ação:'
    ]

    // Estruturar o visual da tabela no front
    const div_tabela = document.createElement("div");
    div_tabela.setAttribute("id", "tabela");
    div_acao.appendChild(div_tabela)

    const COLUNAS = 3
    for(let i = 0; i < COLUNAS; i++){
        const div = document.createElement("div");
        const paragrafo_titulo = document.createElement("p");
        const paragrafo_texto = document.createElement("p");

        paragrafo_titulo.innerText = tabela_nomes[i];
        paragrafo_texto.innerText = objeto_dados[`${tabela_dados[i]}`];

        paragrafo_titulo.setAttribute("class", "titulo-tabela");
        paragrafo_texto.setAttribute("class", "texto-tabela");

        div_tabela.appendChild(div);
        div.appendChild(paragrafo_titulo);
        div.appendChild(paragrafo_texto);
    }
}

async function requisitarDados(url, option) {
    let extrair_dados;

    try {
        if(option == undefined) { 
            extrair_dados = await fetch(url); 
        } else {
            extrair_dados = await fetch(url, option);
        }

        if(extrair_dados.ok) {
            return extrair_dados.json();
        } else {
            throw new Error(extrair_dados.status);
        }
    } catch (error) {
        console.log('Cliente side: ' + error);

        // Ter ocorrido a requisição, neste caso, mal sucedida;
        if(extrair_dados?.ok == false){
            criarErro((await extrair_dados.json()).statusText)
            return undefined;
        } else {
            criarErro('Erro na conexão com a API');
        }
    }
}

// Funções principais;
async function processoRequisicao(){
    
    // Bloqueia o botão até primeira pesquisa da API, não permitindo um spam;
    const extrairBotao = document.getElementById("extrator");
    extrairBotao.setAttribute("disabled", true);

    deletarDivErro();
    deletarDivAcao();

    const acao = document.getElementById("acao").value.toUpperCase();
    const data_inicio = document.getElementById("data_inicio").value;
    const data_final = document.getElementById("data_final").value;

    // Obter valor do 'radio button'
    let moeda = document.getElementsByName("moeda");
    for(let i = 0; i < moeda.length; i++){   
        if(moeda[i].checked) {
            moeda = moeda[i].value;
            break;
        } else if (i + 1 == moeda.length) {
            moeda = undefined;
            break;
        }
    }

    const mensagem_erro = validarCampos(acao, data_inicio, data_final, moeda);

    if(mensagem_erro != undefined) {         
        criarErro(mensagem_erro);
        extrairBotao.removeAttribute("disabled");
        return  
    }

    const url_acoes = `http://localhost:3000/extrairDados/?sigla=${acao}&data_inicial=${data_inicio}&data_final=${data_final}&moeda=${moeda}`;
    const dados_acoes = await requisitarDados(url_acoes);

    extrairBotao.removeAttribute("disabled");

    if(dados_acoes == undefined) { return }
    if(dados_acoes.length == 0) { 
        criarErro('Não há ações com essa empresa nesse período indicado');
        return;
    }

    const url_cabecalho = `http://localhost:3000/criarCabecalho?sigla=${acao}`
    const dados_cabecalho = await requisitarDados(url_cabecalho);

    // Adicionar 'div' geral que recebe todos as seções: cabeçalho, gráfico e tabela
    const main = document.getElementsByTagName("main")[0];
    const div_acao = document.createElement("div");
    div_acao.setAttribute("id", "acoes")
    main.appendChild(div_acao);

    if(dados_cabecalho != undefined) { 
        await estruturaCabecalho(div_acao, dados_cabecalho);
    }

    const url_grafico = 'http://localhost:3000/criarGrafico/';
    const option_grafico = {
        headers: { 'Content-Type': 'application/json'},
        method: "POST",
        body: JSON.stringify(dados_acoes),
    };

    const grafico_dados = await requisitarDados(url_grafico, option_grafico);

    if(grafico_dados == undefined){ return }

    estruturarGrafico(div_acao);

    const grafico_front = new ApexCharts(document.querySelector("#grafico"), grafico_dados);
    grafico_front.render();

    const url_objeto = 'http://localhost:3000/criarTabela/';
    const option_objeto = {
        headers: { 'Content-Type': 'application/json'},
        method: "POST",
        body: JSON.stringify(dados_acoes),
    };
    
    let objeto_dados = await requisitarDados(url_objeto, option_objeto);

    estruturarTabela(div_acao, objeto_dados)
}