import { DoacaoData } from "../../src/data/doacaoData";
import mockConnection from "../mocks/dbConnection.mock";

jest.mock("../../src/dbConnection", () => ({
    __esModule: true,
    default: mockConnection
}));

describe("DoacaoData", () => {

    let doacaoData: DoacaoData;

    beforeEach(() => {
        jest.clearAllMocks();
        doacaoData = new DoacaoData();
    });

    test("deve retornar doacoes paginadas", async () => {

        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 1 }]);

        const fake = [
            {
                id_doacao: 1,
                tipo: "racao",
                data_doacao: new Date(),
                usuario_id: 2,
                ong_id: 1,
                valor: 20
            }
        ];

        mockConnection.then = jest.fn((cb) => cb(fake));

        const filter = {
            tipo: "",
            ong_id: 1,
            usuario_id: 2,
            page: 1,
            limit: 10,
            sortBy: "id_doacao",
            sortOrder: "asc"
        };

        const result = await doacaoData.getAllDoacoes(filter as any);

        expect(result.pageInfo.total).toBe(1);
        expect(result.data.length).toBe(1);
        expect(mockConnection.where).toHaveBeenCalled();
    });

    test("deve retornar doacao por id", async () => {

        const fake = {
            id_doacao: 1,
            tipo: "racao",
            data_doacao: new Date(),
            usuario_id: 2,
            ong_id: 1,
            valor: 50
        };

        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValue(fake);

        const result = await doacaoData.getDoacaoById(1);

        expect(mockConnection.where).toHaveBeenCalledWith({ id_doacao: 1 });
        expect(result).toEqual(fake);
    });

    test("deve lancar erro no getDoacaoById quando DB falhar", async () => {
        mockConnection.where.mockImplementation(() => { throw new Error("erro DB"); });

        await expect(doacaoData.getDoacaoById(99))
            .rejects
            .toThrow("erro DB");
    });

    test("deve criar doacao e retornar o id criado", async () => {

        mockConnection.insert.mockResolvedValue([50]);

        const input = {
            tipo: "racao",
            data_doacao: new Date(),
            usuario_id: 2,
            ong_id: 1,
            valor: 100
        };

        const result = await doacaoData.createDoacao(input as any);

        expect(mockConnection.insert).toHaveBeenCalledWith(input);
        expect(result).toBe(50);
    });

    test("deve atualizar uma doacao", async () => {

        mockConnection.where.mockReturnThis();
        mockConnection.update.mockResolvedValue(undefined);

        const id = 1;
        const update = { valor: 200 };

        await doacaoData.updateDoacao(id, update);

        expect(mockConnection.where).toHaveBeenCalledWith({ id_doacao: 1 });
        expect(mockConnection.update).toHaveBeenCalledWith(update);
    });

    test("deve deletar uma doacao", async () => {

        mockConnection.where.mockReturnThis();
        mockConnection.del.mockResolvedValue(undefined);

        const id = 1;

        await doacaoData.deleteDoacao(id);

        expect(mockConnection.where).toHaveBeenCalledWith({ id_doacao: 1 });
        expect(mockConnection.del).toHaveBeenCalled();
    });

});
