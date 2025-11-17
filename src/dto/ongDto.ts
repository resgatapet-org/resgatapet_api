export interface OngInputDTO {
    nome: string;
    email: string;
    endereco: string;
    telefone: string;
    usuario_id: number; 
}

export interface OngUpdateDTO {
    nome: string;
    email: string;
    endereco: string;
    telefone: string;
    usuario_id: number; 
}

export interface OngInputForDB {
    nome: string;
    email: string;
    endereco: string;
    telefone: string;
    usuario_id: number; 
}