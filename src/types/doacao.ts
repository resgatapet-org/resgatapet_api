export interface Doacao {
    id_doacao: number;
    tipo: string;
    data_doacao: Date;
    usuario_id: number;
    ong_id: number;
    valor?: number;
    descricao?: string;
}
