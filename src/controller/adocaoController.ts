import { Request, Response } from "express";
import { AdocaoBusiness } from "../business/adocaoBusiness";
import { FilterUtilsAdocao } from '../utils/filterUtilsAdocao';
import { ErrorUtils } from '../utils/errorUtils';
import { ApiResponse } from '../types/apiResponse';

export class AdocaoController {
    private adocaoBusiness = new AdocaoBusiness();

    public getAll = async (req: Request, res: Response) => {
        try {
            const filter = FilterUtilsAdocao.applyDefaults(req.query);

            const adocoes = await this.adocaoBusiness.getAllAdocoes(filter);

            res.status(200).send(adocoes);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    }

    public getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID da adoção é obrigatório e deve ser um número' });
            }

            const idNumber = Number(id);

            const adocao = await this.adocaoBusiness.getAdocaoById(idNumber);

            if (!adocao) {
                return res.status(404).json({ error: 'Adoção não encontrada' });
            }

            res.status(200).send(adocao);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    }

    public create = async (req: Request, res: Response) => {
        const errorUtils = new ErrorUtils();
        try {
            const { animal_id, usuario_id, ong_id, status } = req.body;

            // Validações explícitas
          if (!animal_id || isNaN(Number(animal_id))) errorUtils.addError("O ID do animal é obrigatório e deve ser um número.");
            if (!usuario_id || isNaN(Number(usuario_id))) errorUtils.addError("O ID do usuário é obrigatório e deve ser um número.");
            if (!status) errorUtils.addError("O status da solicitação é obrigatório.");
            
            errorUtils.throwIfHasErrors("Dados de criação inválidos");

           await this.adocaoBusiness.createAdocao({
                animal_id: Number(animal_id),
                usuario_id: Number(usuario_id),
                status: status,
            });

            res.status(201).send({ message: "Solicitação de adoção registrada com sucesso!" });
        } catch (error: any) {
            if (error.message.includes("Dados de criação inválidos")) {
                const errorDetails = error.message.split(": ")[1];
                return res.status(400).send({ success: false, message: "Erro de validação", errors: errorDetails ? errorDetails.split("|").filter((e: string) => e.trim().length > 0) : [error.message] });
            }

            if (error.message.includes("não encontrado") || error.message.includes("Usuário com ID")) {
                return res.status(400).send({ success: false, message: "Erro de regra de negócio", errors: [error.message] });
            }
            res.status(500).send({ error: error.message });
        }
    };
    public updateStatus = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const { status } = req.body;
            const errorUtils = new ErrorUtils();

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID da adoção é obrigatório e deve ser um número' });
            }
            if (!status) errorUtils.addError('O novo status é obrigatório.');
            errorUtils.throwIfHasErrors("Dados de atualização inválidos");

            const idNumber = Number(id);

            await this.adocaoBusiness.updateAdocaoStatus(idNumber, status);

            const response: ApiResponse<null> = {
                success: true,
                message: 'Status da solicitação de adoção atualizado com sucesso!'
            };
            res.status(200).send(response);

        } catch (error: any) {
            if (error.message.includes("não encontrada")) {
                return res.status(404).send({ success: false, message: error.message, errors: [error.message] });
            }
            if (error.message.includes("inválido") || error.message.includes("Dados de atualização inválidos")) {
                return res.status(400).send({ success: false, message: error.message, errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };

    public delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID da adoção é obrigatório e deve ser um número' });
            }

            const idNumber = Number(id);
            await this.adocaoBusiness.deleteAdocao(idNumber);

            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes("não encontrada")) {
                return res.status(404).send({ success: false, message: error.message, errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };
}
