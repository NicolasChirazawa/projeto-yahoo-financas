let data_hoje;

window.addEventListener("load", async () => {
    const dados_acoes = await fetch('http://localhost:3000/enviarNomeAcoes').then((res) => res.json());
    console.log(dados_acoes);

    const lista_acoes = document.getElementById("lista_acoes");

    for(let i = 0; i < dados_acoes.length; i++){
        const acao = document.createElement("option");
        acao.setAttribute("value", dados_acoes[i]["empresa"])
        acao.innerText = dados_acoes[i]["sigla"];

        lista_acoes.appendChild(acao);
    }
})

function atribuirInputMax() {
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

    document.getElementById("data_inicio").setAttribute('max', hoje);
    document.getElementById("data_final").setAttribute('max', hoje);

    data_hoje = hoje;
}

function deletarDivisaoErro(){
    let divisao_erros = document.getElementById("erro_mensagem") ?? undefined;

    if(divisao_erros != undefined){
        let main = document.getElementsByTagName("main")[0];

        main.removeChild(divisao_erros);
    }
}

function validarCampos(acao, data_inicio, data_final) {
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

async function requisitarDadosExtraidos(acao, data_inicio, data_final){
    try {
        const extrair_dados_acoes = await fetch('http://localhost:3000/extrairDados?teste=Nick');

        if(extrair_dados_acoes.ok) {
            return extrair_dados_acoes.json();
        } else {
            throw new Error(extrair_dados_acoes.status)
        }
    } catch (error) {
        console.error('Fetch', error)
        
        return undefined;
    }
}

async function requisitarDadosGrafico(dados_acoes){
    try {
        const grafico_dados = await fetch(`http://localhost:3000/criarGrafico/`, {
            headers: { 'Content-Type': 'application/json'},
            method: "POST",
            body: JSON.stringify(dados_acoes),
        });

        if(grafico_dados.ok) {
            return grafico_dados.json();
        } else {
            throw new Error(grafico_dados.status)
        }
    } catch (error) {
        console.error('Fetch', error)
        
        return undefined;
    }
}

async function requisitarDadosTabela(dados_acoes){
    try{
        let tabela_dados = await fetch(`http://localhost:3000/criarTabela/`, {
            headers: { 'Content-Type': 'application/json'},
            method: "POST",
            body: JSON.stringify(dados_acoes),
        });

        if(tabela_dados.ok){
            return tabela_dados.json();
        } else {
            throw new Error(tabela_dados.status);
        }
    } catch(error) {
        console.error('Fetch', error);

        return undefined;
    }
}

async function processoRequisicao(){
    deletarDivisaoErro();

    const acao = document.getElementById("acao").value;
    const data_inicio = document.getElementById("data_inicio").value;
    const data_final = document.getElementById("data_final").value;

    /*
    const mensagem_erro = validarCampos(acao, data_inicio, data_final);

    if(mensagem_erro != undefined) {         
        criarErro(mensagem_erro)
        return  
    }
    */

    // Requisição API Yahoo
    const dados_acoes = await requisitarDadosExtraidos(acao, data_inicio, data_final);

    if(dados_acoes == undefined){
        criarErro('Erro de conexão com a API');
        return;
    }

    const grafico = await requisitarDadosGrafico(dados_acoes);

    if(grafico == undefined){
        criarErro('Erro de conexão com a API');
        return;
    }

    // Adicionar 'div' geral que recebe todos as seções: cabeçalho, gráfico e tabela
    const main = document.getElementsByTagName("main")[0];
    const div_acoes = document.createElement("div");
    div_acoes.setAttribute("id", "acoes")
    main.appendChild(div_acoes);

    // Estruturar o visual do gráfico no front
    const div_grafico = document.createElement("div");
    div_grafico.setAttribute("id", "grafico");
    div_acoes.appendChild(div_grafico)

    const grafico_front = new ApexCharts(document.querySelector("#grafico"), grafico);
    grafico_front.render();

    let objeto_dados = await requisitarDadosTabela(dados_acoes);

    let tabela_dados = [
        "maiorAcao", 
        "menorAcao", 
        "media"
    ];

    let tabela_nomes = [
        'Maior ação:',
        'Menor ação:',
        'Média:'
    ]

    // Estruturar o visual da tabela no front
    const div_tabela = document.createElement("div");
    div_tabela.setAttribute("id", "tabela");
    div_acoes.appendChild(div_tabela)

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