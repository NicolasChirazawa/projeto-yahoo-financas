async function processoRequisicao(){
    const requisicao_back = await fetch('http://localhost:3000/extracao?teste=Nick');
    
    let dados =  await requisicao_back.json();
    console.log(dados);
}