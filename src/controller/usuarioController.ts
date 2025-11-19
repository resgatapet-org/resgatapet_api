import { Request, Response } from "express";
import { UserBusiness } from "../business/usuarioBusiness";
import { FilterUtilsUsuario } from "../utils/filterUtilsUsuario";
import { ErrorUtils } from "../utils/ErrorUtils";
import { ApiResponse } from "../types/ApiResponse";
import { User } from "../types/usuario";

export class UserController {
    private userBusiness = new UserBusiness();

    public getAll = async (req: Request, res: Response) => {
        try {
            const filter = FilterUtilsUsuario.parseUserFilter(req.query);
            const users = await this.userBusiness.getAllUsers(filter);
            res.status(200).send(users);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    };

    public getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    error: "ID do usuário é obrigatório e deve ser um número",
                });
            }

            const idNumber = Number(id);
            const user = await this.userBusiness.getUserById(idNumber);

            if (!user) {
                return res.status(404).json({ error: "Usuário não encontrado" });
            }

            res.status(200).send(user);
        } catch (error: any) {
            res.status(500).send({ error: error.message });
        }
    };

    public create = async (req: Request, res: Response) => {
        const errorUtils = new ErrorUtils();

        try {
            const { nome, email, senha, tipo } = req.body;


            if (!nome) errorUtils.addError("O nome do usuário é obrigatório.");
            if (!email) errorUtils.addError("O email é obrigatório.");
            if (!senha) errorUtils.addError("A senha é obrigatória.");
            if (!["COMUM", "ONG", "ADMIN"].includes(tipo.toUpperCase())) {
                errorUtils.addError("O tipo de usuário deve ser COMUM, ONG ou ADMIN.");
            }

            if (!email) errorUtils.addError("O email é obrigatório.");

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                errorUtils.addError("O formato do email é inválido.");
            }

            errorUtils.throwIfHasErrors("Dados de criação inválidos");

            errorUtils.throwIfHasErrors("Dados de criação inválidos");


            const newUser = await this.userBusiness.createUser({
                nome,
                email,
                senha,
                tipo: tipo.toUpperCase(),
            });


            const response: ApiResponse<User> = {
                success: true,
                message: "Usuário cadastrado com sucesso!",
                data: newUser,
            };

            res.status(201).send(response);
        } catch (error: any) {

            if (error.message.includes("já cadastrado")) {
                return res.status(409).send({
                    success: false,
                    message: "Erro de cadastro",
                    errors: [error.message],
                });
            }

            if (error.message.includes("Dados de criação inválidos")) {
                const errorDetails = error.message.split(": ")[1];
                return res.status(400).send({
                    success: false,
                    message: "Erro de validação",
                    errors: errorDetails ? errorDetails.split("|").filter((e: string) => e.trim().length > 0) : [error.message]
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
                    error: "ID do usuário é obrigatório e deve ser um número",
                });
            }

            const idNumber = Number(id);
            const { nome, email, senha, tipo } = req.body;

            if (!nome) errorUtils.addError("O nome do usuário é obrigatório.");
            if (!email) errorUtils.addError("O email é obrigatório.");
            if (!senha) errorUtils.addError("A senha é obrigatória.");
            if (!tipo || !["COMUM", "ONG", "ADMIN"].includes(tipo.toUpperCase())) {
                errorUtils.addError("O tipo de usuário deve ser COMUM, ONG ou ADMIN.");
            }

            errorUtils.throwIfHasErrors("Dados de atualização inválidos");

            await this.userBusiness.updateUser(idNumber, {
                nome,
                email,
                senha,
                tipo: tipo.toUpperCase(),
            });

            const updatedUser = await this.userBusiness.getUserById(idNumber);

            const response: ApiResponse<User> = {
                success: true,
                message: "Usuário atualizado com sucesso!",
                data: updatedUser,
            };

            res.status(200).send(response);
        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).send({
                    success: false,
                    message: error.message,
                    errors: [error.message],
                });
            }

            if (error.message.includes("já cadastrado")) {
                return res.status(409).send({
                    success: false,
                    message: error.message,
                    errors: [error.message],
                });
            }

            if (error.message.includes("Dados de atualização inválidos")) {
                const errorDetails = error.message.split(": ")[1];
                return res.status(400).send({
                    success: false,
                    message: "Erro de validação",
                    errors: errorDetails ? errorDetails.split("|").filter((e: string) => e.trim().length > 0) : [error.message]
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
                    error: "ID do usuário é obrigatório e deve ser um número",
                });
            }

            const idNumber = Number(id);
            await this.userBusiness.deleteUser(idNumber);

            res.status(204).send();
        } catch (error: any) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).send({
                    success: false,
                    message: error.message,
                    errors: [error.message],
                });
            }

            if (error.message.includes("Não é permitido deletar")) {
                return res.status(403).send({
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
