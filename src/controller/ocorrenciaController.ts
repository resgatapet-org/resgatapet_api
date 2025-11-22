import { Request, Response } from "express";
import { OcorrenciaBusiness } from "../business/ocorrenciaBusiness";
import { FilterUtilsOcorrencia } from '../utils/filterUtilsOcorrencia';
import { ErrorUtils } from '../utils/errorUtils';
import { ApiResponse } from '../types/apiResponse';
import { Ocorrencia } from '../types/ocorrencia';
import { OcorrenciaInputDTO, OcorrenciaUpdateStatusDTO } from "../dto/ocorrenciaFilterDto";

export class OcorrenciaController {
    private ocorrenciaBusiness = new OcorrenciaBusiness();
    public getAll = async (req: Request, res: Response) => {
        try {
            const filter = FilterUtilsOcorrencia.parseOcorrenciaFilter(req.query);
            const ocorrencias = await this.ocorrenciaBusiness.getAllOcorrencias(filter);
            res.status(200).send(ocorrencias);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    }
    public getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID da ocorrência é obrigatório e deve ser um número' });
            }

            const idNumber = Number(id);
            const ocorrencia = await this.ocorrenciaBusiness.getOcorrenciaById(idNumber);
            if (!ocorrencia) {
                return res.status(404).json({ error: 'Ocorrência não encontrada' });
            }
            res.status(200).send(ocorrencia);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    }
    public create = async (req: Request, res: Response) => {
        try {
            // O usuário pode ser anônimo, por isso o ID vem do body e não do token.
            const {
                descricao,
                localizacao,
                foto_url,
                usuario_id
            } = req.body;

            const ocorrenciaInput: OcorrenciaInputDTO = {
                descricao,
                localizacao,
                foto_url,
                usuario_id: usuario_id ? Number(usuario_id) : undefined
            };

            if (!ocorrenciaInput.descricao || !ocorrenciaInput.localizacao || !ocorrenciaInput.foto_url) {
                return res.status(400).send({ error: "Campos obrigatórios ausentes: descricao, localizacao e foto_url." });
            }

            await this.ocorrenciaBusiness.createOcorrencia(ocorrenciaInput);

            res.status(201).send({ message: "Ocorrência registrada com sucesso! A comunidade e ONGs serão notificadas." });
        } catch (error: any) {
            if (error.message.includes("obrigatórios") || error.message.includes("Usuário ID inválido")) {
                return res.status(400).send({ error: error.message });
            }
            res.status(500).send({ error: error.message });
        }
    }

    public updateStatus = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const { status } = req.body; // Apenas o status vem do body
            const errorUtils = new ErrorUtils();

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID da ocorrência é obrigatório e deve ser um número' });
            }

            const statusInput: OcorrenciaUpdateStatusDTO = { status };
            if (!statusInput.status) errorUtils.addError('O novo status é obrigatório.');

            errorUtils.throwIfHasErrors("Dados de atualização inválidos");

            const idNumber = Number(id);
            const authenticatedUserId = req.user?.userId;
            //  tipo de usuário (ONG/ ADMIN) para o Business
            const authenticatedUserType = req.user?.tipo.toUpperCase();

            await this.ocorrenciaBusiness.updateOcorrenciaStatus(
                idNumber,
                statusInput,
                authenticatedUserId,
                authenticatedUserType
            );

            const response: ApiResponse<null> = {
                success: true,
                message: 'Status da ocorrência atualizado com sucesso!'
            };
            res.status(200).send(response);

        } catch (error: any) {
            if (error.message.includes("não encontrada")) {
                return res.status(404).send({ success: false, message: error.message, errors: [error.message] });
            }
            if (error.message.includes("inválido") || error.message.includes("Regra de negócio") || error.message.includes("Dados de atualização inválidos") || error.message.includes("Apenas uma conta ONG")) {
                return res.status(400).send({ success: false, message: error.message, errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };

    public delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID da ocorrência é obrigatório e deve ser um número' });
            }

            const idNumber = Number(id);
            await this.ocorrenciaBusiness.deleteOcorrencia(idNumber);

            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes("não encontrada")) {
                return res.status(404).send({ success: false, message: error.message, errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };
}
