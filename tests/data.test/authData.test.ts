import { AuthData } from "../../src/data/authData";
import mockConnection from "../mocks/dbConnection.mock";

jest.mock("../../src/dbConnection", () => ({
    __esModule: true,
    default: mockConnection
}));

describe("AuthData", () => {

    let authData: AuthData;

    beforeEach(() => {
        jest.clearAllMocks();
        authData = new AuthData();
    });

    test("deve retornar usuario quando encontrado na tabela Usuario", async () => {
        const fakeUser = {
            id: 10,
            email: "teste@mail.com",
            senha: "123",
            tipo: "usuario",
            nome: "Joao"
        };

        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValueOnce(fakeUser);

        const result = await authData.getUserByEmail("teste@mail.com");

        expect(mockConnection.where).toHaveBeenCalledWith({ email: "teste@mail.com" });
        expect(result).toEqual(fakeUser);
    });

    test("deve retornar ong quando nao estiver na tabela Usuario mas estiver na tabela ONG", async () => {
        mockConnection.where.mockReturnThis();

        mockConnection.first
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id_ong: 5,
                email: "ong@mail.com",
                nome: "Ong X",
                senha: "abc"
            });

        const result = await authData.getUserByEmail("ong@mail.com");

        expect(result).toEqual({
            id_ong: 5,
            email: "ong@mail.com",
            nome: "Ong X",
            senha: "abc",
            tipo: "ong",
            id: 5,
            name: "Ong X"
        });
    });

    test("deve retornar null quando nao encontrar usuario nem ong", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValueOnce(null);
        mockConnection.first.mockResolvedValueOnce(null);

        const result = await authData.getUserByEmail("naoexiste@mail.com");

        expect(result).toBeNull();
    });

    test("deve lancar erro quando o banco falhar", async () => {
        mockConnection.where.mockImplementation(() => {
            throw new Error("erro DB");
        });

        await expect(authData.getUserByEmail("x@mail.com"))
            .rejects
            .toThrow("erro DB");
    });

});
