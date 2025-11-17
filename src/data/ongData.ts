import connection from "../dbConnection";
import { Ong } from "../types/ong";
import { PaginatedResponse } from "../dto/paginationDto";
import { OngFilterDTO } from "../dto/ongFilterDto";
import { OngInputDTO, OngUpdateDTO, OngInputForDB } from "../dto/ongDto";

export class OngData {

    public async getAllOngs(filter: Required<OngFilterDTO>): Promise<PaginatedResponse<Ong>> {
        try {
            const { nome, cidade, page, limit, sortBy, sortOrder } = filter;

            let query = connection('ONG').select();

            if (nome) {
                query = query.where('nome', 'like', `\%${nome}\%`);
            }
            if (cidade) {
                query = query.where('cidade', 'like', `\%${cidade}\%`);
            }

            // Contagem Total 
            const countQuery = query.clone();
            const [{ total }] = await countQuery.count('* as total');

            query = query.orderBy(sortBy, sortOrder);

            const offset = (page - 1) * limit;
            query = query.limit(limit).offset(offset);

            const data = await query;

            // Montar o objeto de resposta paginada
            const totalPages = Math.ceil(Number(total) / limit);
            const pagination: PaginatedResponse<Ong> = {
                pageInfo: {
                    total: Number(total),
                    limit: limit,
                    page: page,
                    totalPages: totalPages
                },
                data: data as Ong[]
            };

            return pagination;
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    // Busca uma ONG por ID
    public async getOngById(id_ong: number): Promise<Ong | undefined> {
        try {
            const ong = await connection('ONG').where({ id_ong }).first();
            return ong as Ong | undefined;
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    public async getOngByEmail(email: string): Promise<Ong | undefined> {
        try {
            const ong = await connection('ONG').where({ email }).first();
            return ong as Ong | undefined;
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    public async createOng(ong: OngInputForDB): Promise<number> {
        try {
            const [id_ong] = await connection('ONG').insert(ong, 'id_ong');
            return id_ong;
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    public async updateOng(id_ong: number, ong: OngUpdateDTO): Promise<void> {
        try {
            await connection('ONG').where({ id_ong }).update(ong);
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    public async deleteOng(id_ong: number): Promise<void> {
        try {
            await connection('ONG').where({ id_ong }).del();
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    //busca ONG pelo ID do Usuário (Admin da ONG)
    public async getOngByUserId(usuario_id: number): Promise<Ong | undefined> {
        try {
            const ong = await connection('ONG').where({ usuario_id }).first();
            return ong as Ong | undefined;
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }
}