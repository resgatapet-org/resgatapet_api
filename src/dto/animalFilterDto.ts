import { PaginationParams } from "./paginationDto";

export interface AnimalFilterDTO extends PaginationParams {
    nome?: string; 
    especie?: string; 
    status?: string; 
    ong_id?: number; 
    sortBy?: 'id_animal' | 'nome' | 'data_registro' | 'status'; 
    sortOrder?: 'asc' | 'desc'; 
}

// atributos necessários para criar um Animal no banco sem o id_animal e o data que é gerada automaticamente
export type AnimalInputForDB = {
    nome: string;
    especie: string;
    descricao: string;
    status: string;
    localizacao: string;
    ong_id: number;
}