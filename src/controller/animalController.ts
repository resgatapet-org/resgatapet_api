import { Request, Response } from "express";
import { AnimalBusiness } from "../business/animalBusiness";
import { FilterUtilsAnimal } from '../utils/filterUtilsAnimal';
import { ErrorUtils } from "../utils/errorUtils";
import { ApiResponse } from '../types/apiResponse';
import { Animal } from '../types/animal'; 

export class AnimalController {
    private animalBusiness = new AnimalBusiness();

    public getAll = async (req: Request, res: Response) => {
        try {
            const filter = FilterUtilsAnimal.parseAnimalFilter(req.query);
            
            const animals = await this.animalBusiness.getAllAnimals(filter);
            
            res.status(200).send(animals);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    }

    public getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID do animal é obrigatório e deve ser um número' });
            }

            const idNumber = Number(id);

            const animal = await this.animalBusiness.getAnimalById(idNumber);

            if (!animal) {
                return res.status(404).json({ error: 'Animal não encontrado' });
            }

            res.status(200).send(animal); 
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    }
    
    public create = async (req: Request, res: Response) => {
        const errorUtils = new ErrorUtils(); 

        try {
            const { nome, especie, status, localizacao, ong_id, descricao } = req.body;

            if (!nome) errorUtils.addError('O nome do animal é obrigatório.');
            if (!especie) errorUtils.addError('A espécie do animal é obrigatória.');
            if (!status) errorUtils.addError('O status do animal é obrigatório.');
            if (!ong_id || isNaN(Number(ong_id))) errorUtils.addError('O ID da ONG (ong_id) é obrigatório e deve ser um número.');

            errorUtils.throwIfHasErrors("Dados de criação inválidos"); 

            const newAnimal = await this.animalBusiness.createAnimal({
                nome,
                especie,
                status,
                localizacao,
                ong_id: Number(ong_id),
                descricao 
            });
            const response: ApiResponse<Animal> = {
                success: true,
                message: "Animal cadastrado com sucesso!",
                data: newAnimal,
            };

            res.status(201).send(response);
        } catch (error: any) {
            if (error.message.includes("obrigatórios")) {
                 return res.status(400).send({ success: false, message: "Erro de validação", errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };
    
    public update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID do animal é obrigatório e deve ser um número' });
            }

            const idNumber = Number(id);
            const { nome, especie, status, localizacao, ong_id, descricao } = req.body;
            if (!nome || !especie || !status || !ong_id) {
                return res.status(400).json({ error: 'Todos os campos obrigatórios (nome, especie, status, ong_id) devem ser fornecidos para atualização completa (PUT)' });
            }

            const animalUpdate: Partial<Animal> = {
                nome,
                especie,
                status,
                localizacao,
                ong_id: Number(ong_id),
                descricao
            }

            await this.animalBusiness.updateAnimal(idNumber, animalUpdate);
            const updatedAnimal = await this.animalBusiness.getAnimalById(idNumber);

            const response: ApiResponse<Animal> = {
                success: true,
                message: 'Animal atualizado com sucesso!',
                data: updatedAnimal,
            };

            res.status(200).send(response);
        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).send({ success: false, message: error.message, errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };
    
    public delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID do animal é obrigatório e deve ser um número' });
            }

            const idNumber = Number(id);
            await this.animalBusiness.deleteAnimal(idNumber);

            res.status(204).send(); 
        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).send({ success: false, message: error.message, errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };
    
    public setPrioridade = async (req: Request, res: Response) => {
        const errorUtils = new ErrorUtils();
        try {
            const id = req.params.id;
            const { nivel, descricao } = req.body;
            
            if (!id || isNaN(Number(id))) {
                errorUtils.addError('ID do animal é obrigatório e deve ser um número');
            }
            if (!nivel) errorUtils.addError('O nível da prioridade é obrigatório.');
            if (!descricao) errorUtils.addError('A descrição da prioridade é obrigatória.');

            errorUtils.throwIfHasErrors("Dados de prioridade inválidos"); 

            const idNumber = Number(id);
            
            await this.animalBusiness.setPrioridade(idNumber, nivel, descricao); 
            
            res.status(200).send({ success: true, message: 'Prioridade definida ou criação delegada para a rota /prioridades.'});

        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).send({ success: false, message: error.message, errors: [error.message] });
            }
             if (error.message.includes("Dados de prioridade inválidos") || error.message.includes("endpoint de Prioridade")) {
                 return res.status(400).send({ success: false, message: "Erro de validação ou de regra de negócio", errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };
}