import { PaginationParams } from './paginationDto'; 

export interface DoacaoFilterDTO extends PaginationParams {
    tipo?: string; 
    ong_id?: number; 
    usuario_id?: number; 
    sortBy?: 'id_doacao' | 'data_doacao' | 'valor'; 
    sortOrder?: 'asc' | 'desc'; 
}

export interface DoacaoInputForDB {
    tipo: string;
    data_doacao: Date; 
    usuario_id?: number; 
    ong_id: number;
    valor?: number;
    descricao?: string;
};
