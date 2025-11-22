import { Request, Response } from "express";
import { DoacaoBusiness } from "../business/doacaoBusiness";
import { FilterUtilsDoacao } from '../utils/filterUtilsDoacao'; 
import { ErrorUtils } from '../utils/errorUtils';
import { ApiResponse } from '../types/apiResponse';
import { Doacao } from '../types/doacao';

export class DoacaoController {
    private doacaoBusiness = new DoacaoBusiness();

    public getAll = async (req: Request, res: Response) => {
        try {
            // Prioriza o ong_id do params sobre o do query
            const ongIdFromParams = req.params.id ? Number(req.params.id) : undefined;
            
            //garante que o ong_id do params sobrescreva o do query
            const rawFilter = { 
                ...req.query,
                ong_id: ongIdFromParams || req.query.ong_id, // Se veio do params, usa ele.
            };

            const filter = FilterUtilsDoacao.parseDoacaoFilter(rawFilter);
            
            const doacoes = await this.doacaoBusiness.getAllDoacoes(filter);
            
            res.status(200).send(doacoes);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    }

    public getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'ID da doação é obrigatório e deve ser um número' });
            }

            const idNumber = Number(id);

            const doacao = await this.doacaoBusiness.getDoacaoById(idNumber);

            if (!doacao) {
                return res.status(404).json({ error: 'Doação não encontrada' });
            }

            res.status(200).send(doacao); 
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    }

    public create = async (req: Request, res: Response) => {
        const errorUtils = new ErrorUtils();

        try {
            // ID da ONG vem no parametro se for /ongs/:id/doacoes
            const ongIdFromParams = req.params.id ? Number(req.params.id) : undefined;
            
            // ID da ONG pode vir do body ou params mas vai manter o do params.
            const ong_id = ongIdFromParams || req.body.ong_id; 
            
            const { tipo, usuario_id, valor, descricao } = req.body;

            if (!tipo) errorUtils.addError('O tipo da doação é obrigatório.');
            
            if (!ong_id || isNaN(Number(ong_id))) {
                errorUtils.addError('O ID da ONG (ong_id) é obrigatório e deve ser um número.');
            }
            
            if (!valor && !descricao) errorUtils.addError('O valor (para doação financeira) ou a descrição (para doação material) é obrigatório.');

            errorUtils.throwIfHasErrors("Dados de criação inválidos");
            
            const newDoacao = await this.doacaoBusiness.createDoacao({
                tipo,
                ong_id: Number(ong_id), 
                usuario_id: usuario_id ? Number(usuario_id) : undefined, 
                valor: valor ? Number(valor) : 0,
                descricao: descricao || ""
            });

            const response: ApiResponse<Doacao> = {
                success: true,
                message: "Doação registrada com sucesso!",
                data: newDoacao,
            };

            res.status(201).send(response);
        } catch (error: any) {
            if (error.message.includes("obrigatórios") || error.message.includes("Dados de criação inválidos")) {
                 return res.status(400).send({ success: false, message: "Erro de validação", errors: [error.message] });
            }
            res.status(500).send({ success: false, message: 'Erro interno do servidor', errors: [error.message] });
        }
    };
}
