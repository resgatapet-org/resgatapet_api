import { Request, Response } from "express";
import { PrioridadeBusiness } from "../business/prioridadesBusiness";
import { FilterUtilsPrioridades } from '../utils/filterUtilsPrioridades'; 
import { ErrorUtils } from '../utils/errorUtils';
import { ApiResponse } from '../types/apiResponse';
import { Prioridade } from '../types/prioridades';

export class PrioridadeController {
    private prioridadeBusiness = new PrioridadeBusiness();

    public getAll = async (req: Request, res: Response) => {
        try {
            const filter = FilterUtilsPrioridades.applyDefaults(req.query);
        
            const prioridades = await this.prioridadeBusiness.getAllPrioridades(filter);
            
            res.status(200).send(prioridades);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    }

    public getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID da prioridade é obrigatório e deve ser um número' });
            }

            const idNumber = Number(id);

            const prioridade = await this.prioridadeBusiness.getPrioridadeById(idNumber);

            if (!prioridade) {
                return res.status(404).json({ error: 'Prioridade não encontrada' });
            }

            res.status(200).send(prioridade); 
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    }
    public create = async (req: Request, res: Response) => {
        const errorUtils = new ErrorUtils();

        try {
            const { nivel, descricao, animal_id } = req.body;
            if (!nivel) errorUtils.addError('O nível da prioridade é obrigatório.');
            if (!descricao) errorUtils.addError('A descrição da prioridade é obrigatória.');
            if (animal_id && isNaN(Number(animal_id))) errorUtils.addError('O ID do animal (animal_id), se fornecido, deve ser um número.');

            errorUtils.throwIfHasErrors("Dados de criação inválidos");
            const newPrioridade = await this.prioridadeBusiness.createPrioridade({
                nivel,
                descricao,
                animal_id: animal_id ? Number(animal_id) : undefined,
            });
            const response: ApiResponse<Prioridade> = {
                success: true,
                message: "Categoria de prioridade cadastrada com sucesso!",
                data: newPrioridade,
            };

            res.status(201).send(response);
        } catch (error: any) {
            if (error.message.includes("obrigatórios") || error.message.includes("Dados de criação inválidos")) {
                 return res.status(400).send({ success: false, message: "Erro de validação", errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };
    public update = async (req: Request, res: Response) => {
        const errorUtils = new ErrorUtils();
        try {
            const id = req.params.id;
            const { nivel, descricao, animal_id } = req.body;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID da prioridade é obrigatório e deve ser um número' });
            }
            if (!nivel) errorUtils.addError('O nível da prioridade é obrigatório.');
            if (!descricao) errorUtils.addError('A descrição da prioridade é obrigatória.');
            if (animal_id && isNaN(Number(animal_id))) errorUtils.addError('O ID do animal (animal_id), se fornecido, deve ser um número.');
            errorUtils.throwIfHasErrors("Dados de atualização inválidos");

            const idNumber = Number(id);
            await this.prioridadeBusiness.updatePrioridade(idNumber, {
                nivel,
                descricao,
                animal_id: animal_id ? Number(animal_id) : undefined,
            });
            const updatedPrioridade = await this.prioridadeBusiness.getPrioridadeById(idNumber);

            const response: ApiResponse<Prioridade> = {
                success: true,
                message: 'Categoria de prioridade atualizada com sucesso!',
                data: updatedPrioridade,
            };

            res.status(200).send(response);
        } catch (error: any) {
            if (error.message.includes("não encontrada")) {
                return res.status(404).send({ success: false, message: error.message, errors: [error.message] });
            }
            if (error.message.includes("Dados de atualização inválidos")) {
                return res.status(400).send({ success: false, message: "Erro de validação", errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };
    public delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID da prioridade é obrigatório e deve ser um número' });
            }

            const idNumber = Number(id);
            await this.prioridadeBusiness.deletePrioridade(idNumber);
            res.status(204).send(); 
        } catch (error: any) {
            if (error.message.includes("não encontrada")) {
                return res.status(404).send({ success: false, message: error.message, errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };
}
