//tipo de input esperado do controller, sem o id_doacao e data_doacao
export interface DoacaoInputFromController {
    tipo: string;
    usuario_id?: number;
    ong_id: number;
    valor?: number;
    descricao?: string;
};