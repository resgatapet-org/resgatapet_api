import { OngData } from "../../src/data/ongData";
import mockConnection from "../mocks/dbConnection.mock";

jest.mock("../../src/dbConnection", () => ({
    __esModule: true,
    default: mockConnection
}));

describe("OngData", () => {

    let ongData: OngData;

    beforeEach(() => {
        jest.clearAllMocks();
        ongData = new OngData();
    });

    test("deve retornar ongs paginadas", async () => {

        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 2 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();

        const fakeOngs = [
            {
                id_ong: 1,
                nome: "Ong Amor Animal",
                email: "contato@ong.com",
                endereco: "Rua 1",
                telefone: "123456",
                usuario_id: 5
            }
        ];
        
        mockConnection.then.mockImplementation((cb: any) => cb(fakeOngs));

        const filter = {
            nome: "",
            cidade: "",
            page: 1,
            limit: 10,
            sortBy: "id_ong",
            sortOrder: "asc"
        };

        const result = await ongData.getAllOngs(filter as any);

        expect(result.data).toHaveLength(1);
        expect(result.pageInfo.total).toBe(2);
        expect(mockConnection.select).toHaveBeenCalled();
    });

    test("deve retornar ONG pelo ID", async () => {
        const fakeOng = {
            id_ong: 1,
            nome: "Ong Animal",
            email: "email@ong.com",
            endereco: "Rua 1",
            telefone: "123",
            usuario_id: 2
        };

        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValue(fakeOng);

        const result = await ongData.getOngById(1);

        expect(result).toEqual(fakeOng);
    });

    test("deve retornar ONG pelo email", async () => {
        const fakeOng = {
            id_ong: 2,
            nome: "Carinho Animal",
            email: "c@ong.com",
            endereco: "Rua 2",
            telefone: "999",
            usuario_id: 3
        };

        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValue(fakeOng);

        const result = await ongData.getOngByEmail("c@ong.com");

        expect(result).toEqual(fakeOng);
    });

    test("deve criar ONG e retornar ID", async () => {
        mockConnection.insert.mockResolvedValue([1]);

        const input = {
            nome: "Nova ONG",
            email: "nova@ong.com",
            endereco: "Rua XPTO",
            telefone: "777",
            usuario_id: 9
        };

        const result = await ongData.createOng(input);

        expect(result).toBe(1);
        expect(mockConnection.insert).toHaveBeenCalledWith(input, "id_ong");
    });

    test("deve atualizar ONG", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.update.mockResolvedValue(undefined);

        const updateData = { telefone: "888888" };

        await ongData.updateOng(1, updateData as any);

        expect(mockConnection.where).toHaveBeenCalledWith({ id_ong: 1 });
        expect(mockConnection.update).toHaveBeenCalledWith(updateData);
    });

    test("deve deletar ONG", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.del.mockResolvedValue(undefined);

        await ongData.deleteOng(5);

        expect(mockConnection.where).toHaveBeenCalledWith({ id_ong: 5 });
        expect(mockConnection.del).toHaveBeenCalled();
    });

    test("deve retornar ONG pelo ID do usuario", async () => {
        const fakeOng = {
            id_ong: 10,
            nome: "Ong Fiel",
            email: "fiel@ong.com",
            endereco: "Rua B",
            telefone: "555",
            usuario_id: 50
        };

        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValue(fakeOng);

        const result = await ongData.getOngByUserId(50);

        expect(result).toEqual(fakeOng);
    });
});
