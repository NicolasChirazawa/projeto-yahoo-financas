class cotacaoDia {
    constructor(data, alta, baixa, abertura, fechamento, volume, sigla){
        this.data = data;
        this.alta = alta;
        this.baixa = baixa;
        this.abertura = abertura;
        this.fechamento = fechamento;
        this.volume = volume;
        this.sigla = sigla;
    }
}

class Erro {
    constructor(codigo){
        this.codigo = codigo;
        this.mensagem = {
            // 00x: Inputs inválidos
            '001': 'Não foi inserido a data inicial.',
            '002': 'Não foi inserido a data final',
            '003': 'A data inicial é maior que a data atual.',
            '004': 'A data final é maior que a data atual.',
            '005': 'A data inicial é maior a data final.',
            '006': 'Erro desconhecido na extração',
            '007': 'Não foi achado nenhuma ação dentro do código e período inserido',
            // 01x: Dados impossíveis de serem retornados
            '011': 'Não foi encontrado ações dentro do período indicado',
            '012': 'Não foi possível converter a moeda para real',
            '013': 'Não foi encontrado uma imagem'
        }
    }

    lancarMensagem() {
        return this.mensagem[this.codigo];
    }
}

module.exports = { cotacaoDia, Erro };