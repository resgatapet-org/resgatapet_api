export interface LoginInput {
    email: string;
    senha: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id?: number;
        nome: string;
        email: string;
        tipo: string;
    };
}