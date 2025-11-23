import { UserData } from "../../src/data/usuarioData";
import mockConnection from "../mocks/dbConnection.mock";

jest.mock("../../src/dbConnection", () => ({
    __esModule: true,
    default: mockConnection
}));

describe("UserData", () => {

    let userData: UserData;

    beforeEach(() => {
        jest.clearAllMocks();
        userData = new UserData();
    });

    test("deve retornar usuarios paginados", async () => {
        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 1 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();

        const fakeUsers = [{
            id_usuario: 1,
            nome: "Gustavo",
            email: "g@teste.com",
            senha: "123",
            tipo: "usuario",
            data_criacao: new Date()
        }];

        mockConnection.then = jest.fn((cb) => cb(fakeUsers));

        const filter = {
            name: "",
            email: "",
            page: 1,
            limit: 10,
            sortBy: "nome",
            sortOrder: "asc"
        };

        const result = await userData.getAllUsers(filter as any);

        expect(result.data).toHaveLength(1);
        expect(result.pageInfo.total).toBe(1);
        expect(mockConnection.select).toHaveBeenCalled();
    });

    test("deve aplicar filtro para name", async () => {
        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 0 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();
        mockConnection.then = jest.fn(cb => cb([]));

        const filter = {
            name: "Ana",
            email: "",
            page: 1,
            limit: 10,
            sortBy: "nome",
            sortOrder: "asc"
        };

        await userData.getAllUsers(filter as any);

        expect(mockConnection.where).toHaveBeenCalledWith("nome", "like", "%Ana%");
    });

    test("deve aplicar filtro para email", async () => {
        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 0 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();
        mockConnection.then = jest.fn(cb => cb([]));

        const filter = {
            name: "",
            email: "gmail",
            page: 1,
            limit: 10,
            sortBy: "nome",
            sortOrder: "asc"
        };

        await userData.getAllUsers(filter as any);

        expect(mockConnection.where).toHaveBeenCalledWith("email", "like", "%gmail%");
    });

    test("deve lancar erro se o banco falhar no getAllUsers", async () => {
        mockConnection.select.mockImplementation(() => {
            throw new Error("falha banco");
        });

        const filter = {
            name: "",
            email: "",
            page: 1,
            limit: 10,
            sortBy: "nome",
            sortOrder: "asc"
        };

        await expect(userData.getAllUsers(filter as any))
            .rejects
            .toThrow("falha banco");
    });

    test("deve retornar usuario pelo ID", async () => {
        const fake = {
            id_usuario: 1,
            nome: "Ana",
            email: "ana@teste.com",
            senha: "123",
            tipo: "usuario",
            data_criacao: new Date()
        };

        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValue(fake);

        const result = await userData.getUserById(1);

        expect(result).toEqual(fake);
    });

    test("deve lancar erro no getUserById quando DB falhar", async () => {
        mockConnection.where.mockImplementation(() => { throw new Error("erro DB"); });

        await expect(userData.getUserById(10))
            .rejects
            .toThrow("erro DB");
    });

    test("deve buscar usuario por email", async () => {
        const fake = {
            id_usuario: 1,
            nome: "Gustavo",
            email: "g@teste.com",
            senha: "123",
            tipo: "usuario",
            data_criacao: new Date()
        };

        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValue(fake);

        const result = await userData.getUserByEmail("g@teste.com");

        expect(result).toEqual(fake);
    });

    test("deve criar usuario", async () => {
        mockConnection.insert.mockResolvedValue([5]);

        const input = {
            nome: "Joao",
            email: "joao@teste.com",
            senha: "123",
            tipo: "usuario"
        };

        const result = await userData.createUser(input as any);

        expect(result).toBe(5);
        expect(mockConnection.insert).toHaveBeenCalled();
    });

    test("deve atualizar usuario", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.update.mockResolvedValue();

        await userData.updateUser(1, { nome: "Novo" } as any);

        expect(mockConnection.update).toHaveBeenCalledWith({ nome: "Novo" });
    });

    test("deve deletar usuario", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.del.mockResolvedValue();

        await userData.deleteUser(1);

        expect(mockConnection.del).toHaveBeenCalled();
    });

});
