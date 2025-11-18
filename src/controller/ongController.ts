import { Request, Response } from "express";
import { OngBusiness } from "../business/ongBusiness";
import { FilterUtilsOng } from "../utils/filterUtilsOng";
import { ErrorUtils } from "../utils/ErrorUtils";
import { ApiResponse } from "../types/ApiResponse";
import { Ong } from "../types/ong";
import { OngUpdateDTO } from "../dto/ongDto";

export class OngController {
    private ongBusiness = new OngBusiness();

    public getAll = async (req: Request, res: Response) => {
        try {
            const filter = FilterUtilsOng.parseOngFilter(req.query);


            const ongs = await this.ongBusiness.getAllOngs(filter);

            res.status(200).send(ongs);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    };


    public getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: "ID da ONG é obrigatório e deve ser um número",
                });
            }

            const idNumber = Number(id);
            const ong = await this.ongBusiness.getOngById(idNumber);

            if (!ong) {
                return res.status(404).json({ error: "ONG não encontrada" });
            }

            res.status(200).send(ong);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    };

    public create = async (req: Request, res: Response) => {
        const errorUtils = new ErrorUtils();

        try {
            const { nome, email, endereco, telefone, usuario_id } = req.body;

            if (!nome) errorUtils.addError("O nome da ONG é obrigatório.");
            if (!email) errorUtils.addError("O email da ONG é obrigatório.");
            if (!endereco) errorUtils.addError("O endereço é obrigatório.");
            if (!usuario_id || isNaN(Number(usuario_id))) {
                errorUtils.addError(
                    "O ID do Admin (usuario_id) é obrigatório e deve ser um número."
                );
            }

            errorUtils.throwIfHasErrors("Dados de criação inválidos");

            const newOng = await this.ongBusiness.createOng({
                nome,
                email,
                endereco,
                telefone,
                usuario_id: Number(usuario_id),
            });

            const response: ApiResponse<Ong> = {
                success: true,
                message: "ONG cadastrada com sucesso!",
                data: newOng,
            };

            res.status(201).send(response);
        } catch (error: any) {

            if (error.message.includes("Dados de criação inválidos")) {
                return res.status(400).send({
                    success: false,
                    message: "Erro de validação",
                    errors: error.message.split(": ")[1].split("|").filter((e: string) => e.trim().length > 0)  // split divide a mensagem 
                });
            }

            if (error.message.includes("já registrado")) {
                return res.status(409).send({
                    success: false,
                    message: error.message,
                    errors: [error.message],
                });
            }

            res.status(500).send({
                success: false,
                message: "Erro interno do servidor",
                errors: [error.message],
            });
        }
    };


    public update = async (req: Request, res: Response) => {
        const errorUtils = new ErrorUtils();
        try {
            const id = req.params.id;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: "ID da ONG é obrigatório e deve ser um número",
                });
            }

            const idNumber = Number(id);
            const authenticatedUserId = req.user?.userId;
            const authenticatedUserType = req.user?.tipo.toUpperCase(); //  Pega o tipo de usuário
            const { nome, email, endereco, telefone, usuario_id } = req.body;


            if (!nome) errorUtils.addError("O nome da ONG é obrigatório.");
            if (!email) errorUtils.addError("O email da ONG é obrigatório.");
            if (!endereco) errorUtils.addError("O endereço é obrigatório.");
            if (!usuario_id || isNaN(Number(usuario_id))) {
                errorUtils.addError("O ID do Admin (usuario_id) é obrigatório e deve ser um número.");
            }
            errorUtils.throwIfHasErrors("Dados de atualização inválidos");

            const updateInput: OngUpdateDTO = { nome, email, endereco, telefone, usuario_id: Number(usuario_id) };

            await this.ongBusiness.updateOng(
                idNumber,
                updateInput,
                authenticatedUserId,
                authenticatedUserType // envia tipo de usuário para o Business
            );

            const updatedOng = await this.ongBusiness.getOngById(idNumber);

            const response: ApiResponse<Ong> = {
                success: true,
                message: "ONG atualizada com sucesso!",
                data: updatedOng,
            };

            res.status(200).send(response);
        } catch (error: any) {
            if (error.message.includes("não encontrada")) {
                return res.status(404).send({
                    success: false,
                    message: error.message,
                    errors: [error.message],
                });
            }
            if (error.message.includes("permissão para atualizar esta ONG")) {
                return res.status(403).send({
                    success: false,
                    message: error.message,
                    errors: [error.message],
                });
            }
            if (error.message.includes("já registrado")) {
                return res.status(409).send({
                    success: false,
                    message: error.message,
                    errors: [error.message],
                });
            }

            if (error.message.includes("Dados de atualização inválidos")) { // <-- Novo tratamento de erro 400
                return res.status(400).send({
                    success: false,
                    message: "Erro de validação",
                    errors: error.message.split(": ")[1].split("|").filter((e: string) => e.trim().length > 0)
                });
            }

            res.status(500).send({
                success: false,
                message: "Erro interno do servidor",
                errors: [error.message],
            });
        }
    };


    public delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: "ID da ONG é obrigatório e deve ser um número",
                });
            }

            const idNumber = Number(id);
            await this.ongBusiness.deleteOng(idNumber);

            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes("não encontrada")) {
                return res.status(404).send({
                    success: false,
                    message: error.message,
                    errors: [error.message],
                });
            }

            res.status(500).send({
                success: false,
                message: "Erro interno do servidor",
                errors: [error.message],
            });
        }
    };
}
