import { PaginationParams } from './paginationDto'; 

export interface OcorrenciaFilterDTO extends PaginationParams {
    status?: string; 
    localizacao?: string;
    usuario_id?: number;
    ong_id?: number;
    sortBy?: 'id_ocorrencia' | 'data_registro' | 'status' | 'localizacao'; 
    sortOrder?: 'asc' | 'desc'; 
}

export interface OcorrenciaInputDTO{
    descricao: string;
    localizacao: string;
    foto_url: string;
    usuario_id?: number; 
}

export interface OcorrenciaUpdateStatusDTO {
    status: string;
}

export interface OcorrenciaParaBanco {
    status: string;
    data_registro: Date;
    ong_id?: number | null; 
    animal_id?: number | null;
}