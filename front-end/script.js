let data_hoje;

function atribuirMaxCalendario() {
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

function validarCampos(acao, data_inicio, data_final) {
    let mensagem_erro = '';

    // Verificações
    if(data_inicio > data_hoje) {
        mensagem_erro += 'A data inícial não pode ser maior que a data atual' + '\n';
    }
    if(data_final > data_hoje) {
        mensagem_erro += 'A data final não pode ser maior que a data atual' + '\n';
    }
    if(data_inicio > data_final) {
        mensagem_erro += 'A data inicial não pode ser maior que a data final' + '\n';
    }
    if(data_inicio == '') {
        mensagem_erro += 'A data inicial não pode estar vazia' + '\n';
    }
    if(data_final == '') {
        mensagem_erro += 'A data final não pode estar vazia' + '\n';
    }
    if(acao == ''){
        mensagem_erro += 'A ação não pode estar vazia' + '\n';
    } 

    if(mensagem_erro == '') { 
        return undefined 
    } else {    
        return mensagem_erro; 
    }
}

async function processoRequisicao(){
    const acao = document.getElementById("acao").value;
    const data_inicio = document.getElementById("data_inicio").value;
    const data_final = document.getElementById("data_final").value;

    const mensagem_erro = validarCampos(acao, data_inicio, data_final);

    if(mensagem_erro != undefined) { 
        console.log(mensagem_erro);
        
        // Enviar para o front o(s) erro(s)
        return  
    }
    
    const requisicao_back = await fetch('http://localhost:3000/extracao?teste=Nick');
    
    let dados =  await requisicao_back.json();
    console.log(dados);
}