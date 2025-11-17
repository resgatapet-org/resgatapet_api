import connection from "../dbConnection";
import { Doacao } from "../types/doacao";
import { PaginatedResponse } from "../dto/paginationDto";
import { DoacaoFilterDTO, DoacaoInputForDB } from "../dto/doacaoFilterDto";

export class DoacaoData {

    public async getAllDoacoes(filter: Required<DoacaoFilterDTO>): Promise<PaginatedResponse<Doacao>> { 
        try {
            const { tipo, ong_id, usuario_id, page, limit, sortBy, sortOrder } = filter;

            let query = connection('doacao').select(); 

            if (tipo) {
                query = query.where('tipo', 'like', `%${tipo}%`); 
            }
            if (ong_id && ong_id > 0) {
                query = query.where('ong_id', ong_id); 
            }
            if (usuario_id && usuario_id > 0) {
                query = query.where('usuario_id', usuario_id); 
            }

            const countQuery = query.clone();
            const [{ total }] = await countQuery.count('* as total'); 

            query = query.orderBy(sortBy, sortOrder);

            const offset = (page - 1) * limit; 
            query = query.limit(limit).offset(offset);

            const data = await query;

            const totalPages = Math.ceil(Number(total) / limit); 
            const pagination: PaginatedResponse<Doacao> = {
                pageInfo: {
                    total: Number(total),
                    limit: limit,
                    page: page,
                    totalPages: totalPages
                },
                data: data as Doacao[]
            };

            return pagination; 
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    public async getDoacaoById(id_doacao: number): Promise<Doacao | undefined> {
        try {
            const doacao = await connection('doacao').where({ id_doacao }).first();
            return doacao as Doacao | undefined;
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    public async createDoacao(doacao: DoacaoInputForDB): Promise<number> {
        try {
            const [id_doacao] = await connection('doacao').insert(doacao);
            return id_doacao;
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }
}