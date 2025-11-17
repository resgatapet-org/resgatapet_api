export interface UsuarioCreateDTO {
    nome: string;
    email: string;
    senha: string;
    tipo: string;
}

export interface UsuarioUpdateDTO {
    nome: string;
    email: string;
    senha: string;
    tipo: string;
}

export interface UsuarioInputForDB  {
    nome: string;
    email: string;
    senha: string; 
    tipo: string;
    data_criacao: Date;
}

export interface UsuarioInputParaBanco {
    data_criacao: Date;
}