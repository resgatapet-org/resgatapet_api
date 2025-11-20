import bcrypt from "bcryptjs";
import { AuthBusiness } from "../../src/business/authBusiness";
import { AuthData } from "../../src/data/authData";
import { AuthUtils } from "../../src/utils/authUtils";

jest.mock("../src/data/authData");
jest.mock("../src/utils/authUtils");

describe("AuthBusiness - login", () => {
    let authBusiness: any;
    let authDataMock: any;

    beforeEach(() => {
        authDataMock = new AuthData();
        authBusiness = new AuthBusiness();
        authBusiness.authData = authDataMock;
    });

    test("deve realizar login com sucesso id_usuario", async () => {
        const input = { email: "teste@teste.com", senha: "123456" };

        const mockUser = {
            id_usuario: 10,
            nome: "Usuario Teste",
            email: "teste@teste.com",
            senha: "hashedsenha",
            tipo: "usuario"
        };

        authDataMock.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
        jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);
        AuthUtils.generateToken = jest.fn().mockReturnValue("tokenfake");

        const result = await authBusiness.login(input);

        expect(result).toEqual({
            token: "tokenfake",
            user: {
                id: 10,
                nome: "Usuario Teste",
                email: "teste@teste.com",
                tipo: "usuario"
            }
        });
    });

    test("deve realizar login usando id_ong", async () => {
        const input = { email: "ong@teste.com", senha: "123456" };

        const mockUser = {
            id_ong: 55,
            nome: "Ong Teste",
            email: "ong@teste.com",
            senha: "hashong",
            tipo: "ONG"
        };

        authDataMock.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
        jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);
        AuthUtils.generateToken = jest.fn().mockReturnValue("token123");

        const result = await authBusiness.login(input);

        expect(result.user.id).toBe(55);
        expect(result.user.tipo).toBe("ONG");
    });

    test("erro quando email ou senha faltam", async () => {
        await expect(
            authBusiness.login({ email: "", senha: "" })
        ).rejects.toThrow("Email e senha sao obrigatorios");
    });

    test("erro quando usuario nao existe", async () => {
        authDataMock.getUserByEmail = jest.fn().mockResolvedValue(null);

        await expect(
            authBusiness.login({ email: "x@x.com", senha: "123" })
        ).rejects.toThrow("Credenciais invalidas");
    });

    test("erro quando senha esta incorreta", async () => {
        const mockUser = {
            id: 99,
            email: "teste@teste.com",
            senha: "hash",
            nome: "User",
            tipo: "usuario"
        };

        authDataMock.getUserByEmail = jest.fn().mockResolvedValue(mockUser);
        jest.spyOn(bcrypt, "compare").mockImplementation(async () => false);


        await expect(
            authBusiness.login({ email: "teste@teste.com", senha: "errada" })
        ).rejects.toThrow("Credenciais invalidas");
    });
});
