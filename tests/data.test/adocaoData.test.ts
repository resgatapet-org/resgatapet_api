import { AdocaoData } from "../../src/data/adocaoData";
import mockConnection from "../mocks/dbConnection.mock";

jest.mock("../../src/dbConnection", () => ({
    __esModule: true,
    default: mockConnection
}));

describe("AdocaoData", () => {

    let adocaoData: AdocaoData;

    beforeEach(() => {
        jest.clearAllMocks();
        adocaoData = new AdocaoData();
    });

    test("deve retornar adocoes paginadas", async () => {

        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 1 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();

        const fakeAdocoes = [{
            id_adocao: 1,
            data_solicitacao: new Date(),
            ong_id: 10,
            usuario_id: 20,
            animal_id: 30,
            status: "pendente"
        }];

        mockConnection.then = jest.fn((cb) => cb(fakeAdocoes));

        const filter = {
            status: "",
            ong_id: 0,
            usuario_id: 0,
            animal_id: 0,
            page: 1,
            limit: 10,
            sortBy: "id_adocao",
            sortOrder: "asc"
        };

        const result = await adocaoData.getAllAdocoes(filter as any);

        expect(result.data).toHaveLength(1);
        expect(result.pageInfo.total).toBe(1);
        expect(mockConnection.select).toHaveBeenCalled();
    });

    test("deve aplicar filtro de status", async () => {
        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 0 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();
        mockConnection.then = jest.fn(cb => cb([]));

        const filter = {
            status: "pendente",
            ong_id: 0,
            usuario_id: 0,
            animal_id: 0,
            page: 1,
            limit: 10,
            sortBy: "id_adocao",
            sortOrder: "asc"
        };

        await adocaoData.getAllAdocoes(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith("status", "like", "%pendente%");
    });

    test("deve aplicar filtro ong_id > 0", async () => {
        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 0 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();
        mockConnection.then = jest.fn(cb => cb([]));

        const filter = {
            status: "",
            ong_id: 7,
            usuario_id: 0,
            animal_id: 0,
            page: 1,
            limit: 10,
            sortBy: "id_adocao",
            sortOrder: "asc"
        };

        await adocaoData.getAllAdocoes(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith("ong_id", 7);
    });

    test("deve aplicar filtro usuario_id > 0", async () => {
        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 0 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();
        mockConnection.then = jest.fn(cb => cb([]));

        const filter = {
            status: "",
            ong_id: 0,
            usuario_id: 15,
            animal_id: 0,
            page: 1,
            limit: 10,
            sortBy: "id_adocao",
            sortOrder: "asc"
        };

        await adocaoData.getAllAdocoes(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith("usuario_id", 15);
    });

    test("deve aplicar filtro animal_id > 0", async () => {
        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 0 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();
        mockConnection.then = jest.fn(cb => cb([]));

        const filter = {
            status: "",
            ong_id: 0,
            usuario_id: 0,
            animal_id: 12,
            page: 1,
            limit: 10,
            sortBy: "id_adocao",
            sortOrder: "asc"
        };

        await adocaoData.getAllAdocoes(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith("animal_id", 12);
    });

    test("deve lancar erro quando o banco falhar no getAllAdocoes", async () => {
        mockConnection.select.mockImplementation(() => {
            throw new Error("falha banco");
        });

        const filter = {
            status: "",
            ong_id: 0,
            usuario_id: 0,
            animal_id: 0,
            page: 1,
            limit: 10,
            sortBy: "id_adocao",
            sortOrder: "asc"
        };

        await expect(adocaoData.getAllAdocoes(filter as any))
            .rejects
            .toThrow("falha banco");
    });

    test("deve retornar adocao pelo ID", async () => {
        const fake = { id_adocao: 1 };

        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValue(fake);

        const result = await adocaoData.getAdocaoById(1);

        expect(result).toEqual(fake);
    });

    test("deve lancar erro no getAdocaoById quando DB falhar", async () => {
        mockConnection.where.mockImplementation(() => {
            throw new Error("erro DB");
        });

        await expect(adocaoData.getAdocaoById(10))
            .rejects
            .toThrow("erro DB");
    });

    test("deve criar adocao", async () => {
        mockConnection.insert.mockResolvedValue();

        const input = {
            data_solicitacao: new Date(),
            ong_id: 5,
            usuario_id: 8,
            animal_id: 12,
            status: "pendente"
        };

        await adocaoData.createAdocao(input as any);

        expect(mockConnection.insert).toHaveBeenCalledWith(input);
    });

    test("deve atualizar status da adocao", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.update.mockResolvedValue();

        await adocaoData.updateAdocaoStatus(1, "aprovada");

        expect(mockConnection.update).toHaveBeenCalledWith({ status: "aprovada" });
    });

    test("deve deletar adocao", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.del.mockResolvedValue();

        await adocaoData.deleteAdocao(20);

        expect(mockConnection.del).toHaveBeenCalled();
    });
});
