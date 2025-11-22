import { OcorrenciaData } from "../../src/data/ocorrenciaData";
import mockConnection from "../mocks/dbConnection.mock";

jest.mock("../../src/dbConnection", () => ({
    __esModule: true,
    default: mockConnection
}));

describe("OcorrenciaData", () => {

    let ocorrenciaData: OcorrenciaData;

    beforeEach(() => {
        jest.clearAllMocks();
        ocorrenciaData = new OcorrenciaData();
    });

    test("deve retornar ocorrencias paginadas", async () => {

        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 1 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();

        const fakeOcorrencias = [{
            id_ocorrencia: 1,
            descricao: "Animal ferido",
            localizacao: "Centro",
            foto_url: "foto.png",
            status: "aberta",
            usuario_id: 2,
            ong_id: null,
            animal_id: null,
            data_registro: new Date()
        }];

        mockConnection.then = jest.fn((cb) => cb(fakeOcorrencias));

        const filter = {
            status: "",
            localizacao: "",
            usuario_id: 0,
            ong_id: 0,
            page: 1,
            limit: 10,
            sortBy: "id_ocorrencia",
            sortOrder: "asc"
        };

        const result = await ocorrenciaData.getAllOcorrencias(filter as any);

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
            status: "aberta",
            localizacao: "",
            usuario_id: 0,
            ong_id: 0,
            page: 1,
            limit: 10,
            sortBy: "id_ocorrencia",
            sortOrder: "asc"
        };

        await ocorrenciaData.getAllOcorrencias(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith({ status: "aberta" });
    });

    test("deve aplicar filtro de localização", async () => {
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
            localizacao: "Centro",
            usuario_id: 0,
            ong_id: 0,
            page: 1,
            limit: 10,
            sortBy: "id_ocorrencia",
            sortOrder: "asc"
        };

        await ocorrenciaData.getAllOcorrencias(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith("localizacao", "like", "%Centro%");
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
            localizacao: "",
            usuario_id: 10,
            ong_id: 0,
            page: 1,
            limit: 10,
            sortBy: "id_ocorrencia",
            sortOrder: "asc"
        };

        await ocorrenciaData.getAllOcorrencias(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith({ usuario_id: 10 });
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
            localizacao: "",
            usuario_id: 0,
            ong_id: 5,
            page: 1,
            limit: 10,
            sortBy: "id_ocorrencia",
            sortOrder: "asc"
        };

        await ocorrenciaData.getAllOcorrencias(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith({ ong_id: 5 });
    });

    test("deve lançar erro se o banco falhar no getAllOcorrencias", async () => {
        mockConnection.select.mockImplementation(() => { throw new Error("falha banco"); });

        const filter = {
            status: "",
            localizacao: "",
            usuario_id: 0,
            ong_id: 0,
            page: 1,
            limit: 10,
            sortBy: "id_ocorrencia",
            sortOrder: "asc"
        };

        await expect(ocorrenciaData.getAllOcorrencias(filter as any))
            .rejects
            .toThrow("falha banco");
    });


    test("deve retornar ocorrencia pelo ID", async () => {
        const fake = { id_ocorrencia: 1 };

        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValue(fake);

        const result = await ocorrenciaData.getOcorrenciaById(1);

        expect(result).toEqual(fake);
    });

    test("deve lançar erro no getOcorrenciaById quando DB falhar", async () => {
        mockConnection.where.mockImplementation(() => { throw new Error("erro DB"); });

        await expect(ocorrenciaData.getOcorrenciaById(10))
            .rejects
            .toThrow("erro DB");
    });


    test("deve criar ocorrência", async () => {
        mockConnection.insert.mockResolvedValue();

        const input = {
            descricao: "teste",
            localizacao: "rua x",
            foto_url: "foto.png",
            status: "aberta",
            usuario_id: 2
        };

        await ocorrenciaData.createOcorrencia(input as any);

        expect(mockConnection.insert).toHaveBeenCalledWith(input);
    });

  
    test("deve atualizar status da ocorrência", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.update.mockResolvedValue();

        await ocorrenciaData.updateOcorrenciaStatus(1, "fechada");

        expect(mockConnection.update).toHaveBeenCalledWith({ status: "fechada" });
    });

    test("deve atualizar status + ong_id quando status = 'em andamento'", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.update.mockResolvedValue();

        await ocorrenciaData.updateOcorrenciaStatus(1, "em andamento", 99);

        expect(mockConnection.update).toHaveBeenCalledWith({ status: "em andamento", ong_id: 99 });
    });

    
    test("deve deletar ocorrência", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.del.mockResolvedValue();

        await ocorrenciaData.deleteOcorrencia(50);

        expect(mockConnection.del).toHaveBeenCalled();
    });

});
