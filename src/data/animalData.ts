import connection from "../dbConnection";
import { PaginatedResponse } from "../dto/paginationDto";
import { AnimalFilterDTO, AnimalInputForDB } from "../dto/animalFilterDto";
import { Animal } from "../types/animal";


export class AnimalData {

    public async getAllAnimals(filter: Required<AnimalFilterDTO>): Promise<PaginatedResponse<Animal>> {
        try {
            const { nome, especie, status, ong_id, page, limit, sortBy, sortOrder } = filter;

            let query = connection('Animal').select();

            if (nome) {
                query = query.where('nome', 'like', `\%${nome}\%`);
            }
            if (especie) {
                query = query.where({ especie });
            }
            if (status) {
                query = query.where({ status });
            }
            if (ong_id && ong_id !== 0) {
                query = query.where({ ong_id });
            }

            const countQuery = query.clone();
            const [{ total }] = await countQuery.count('* as total');

            query = query.orderBy(sortBy, sortOrder);

            const offset = (page - 1) * limit;
            query = query.limit(limit).offset(offset);

            const data = await query;

            const totalPages = Math.ceil(Number(total) / limit);
            const pagination: PaginatedResponse<Animal> = {
                pageInfo: {
                    total: Number(total),
                    limit: limit,
                    page: page,
                    totalPages: totalPages
                },
                data: data as Animal[]
            };

            return pagination;
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    // Método para buscar um animal por ID
    public async getAnimalById(id_animal: number): Promise<Animal | undefined> {
        try {
            const animal = await connection('Animal').where({ id_animal }).first();
            return animal as Animal | undefined;
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    public async createAnimal(animal: AnimalInputForDB): Promise<number> {
        try {
            const [id_animal] = await connection('Animal').insert(animal, 'id_animal');
            return id_animal;
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    public async updateAnimal(id_animal: number, animal: Partial<AnimalInputForDB>): Promise<void> {
        try {
            await connection('Animal').where({ id_animal }).update(animal);
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }

    public async deleteAnimal(id_animal: number): Promise<void> {
        try {
            await connection('Animal').where({ id_animal }).del();
        } catch (error: any) {
            throw new Error(error.sqlMessage || error.message);
        }
    }
}