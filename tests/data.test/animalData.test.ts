import { AnimalData } from "../../src/data/animalData";
import mockConnection from "../mocks/dbConnection.mock";

jest.mock("../../src/dbConnection", () => ({
    __esModule: true,
    default: mockConnection
}));

describe("AnimalData", () => {

    let animalData: AnimalData;

    beforeEach(() => {
        jest.clearAllMocks();
        animalData = new AnimalData();
    });

    test("deve retornar lista paginada", async () => {

        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 1 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();

        const fakeAnimals = [
            {
                id_animal: 1,
                nome: "Belinha",
                especie: "cao",
                descricao: "animal teste",
                status: "disponivel",
                localizacao: "rua 10",
                data_registro: new Date(),
                ong_id: 2
            }
        ];

        mockConnection.then = jest.fn(cb => cb(fakeAnimals));

        const filter = {
            nome: "belinha",
            especie: "cao",
            status: "disponivel",
            ong_id: 2,
            page: 1,
            limit: 10,
            sortBy: "nome",
            sortOrder: "asc"
        };

        const result = await animalData.getAllAnimals(filter as any);

        expect(result.data).toHaveLength(1);
        expect(result.pageInfo.total).toBe(1);
        expect(result.pageInfo.page).toBe(1);
        expect(result.pageInfo.limit).toBe(10);
    });

    test("deve aplicar filtro nome", async () => {
        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 0 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();
        mockConnection.then = jest.fn(cb => cb([]));

        const filter = {
            nome: "pop",
            especie: "",
            status: "",
            ong_id: 0,
            page: 1,
            limit: 10,
            sortBy: "nome",
            sortOrder: "asc"
        };

        await animalData.getAllAnimals(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith("nome", "like", "%pop%");
    });

    test("deve aplicar filtro especie", async () => {
        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 0 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();
        mockConnection.then = jest.fn(cb => cb([]));

        const filter = {
            nome: "",
            especie: "gato",
            status: "",
            ong_id: 0,
            page: 1,
            limit: 10,
            sortBy: "nome",
            sortOrder: "asc"
        };

        await animalData.getAllAnimals(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith("especie", "like", "%gato%");
    });

    test("deve aplicar filtro status", async () => {
        mockConnection.select.mockReturnThis();
        mockConnection.where.mockReturnThis();
        mockConnection.clone.mockReturnThis();
        mockConnection.count.mockResolvedValue([{ total: 0 }]);
        mockConnection.orderBy.mockReturnThis();
        mockConnection.limit.mockReturnThis();
        mockConnection.offset.mockReturnThis();
        mockConnection.then = jest.fn(cb => cb([]));

        const filter = {
            nome: "",
            especie: "",
            status: "disponivel",
            ong_id: 0,
            page: 1,
            limit: 10,
            sortBy: "nome",
            sortOrder: "asc"
        };

        await animalData.getAllAnimals(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith("status", "like", "%disponivel%");
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
            nome: "",
            especie: "",
            status: "",
            ong_id: 3,
            page: 1,
            limit: 10,
            sortBy: "nome",
            sortOrder: "asc"
        };

        await animalData.getAllAnimals(filter as any);
        expect(mockConnection.where).toHaveBeenCalledWith("ong_id", 3);
    });

    test("deve lancar erro no getAllAnimals quando DB falhar", async () => {
        mockConnection.select.mockImplementation(() => {
            throw new Error("erro DB");
        });

        const filter = {
            nome: "",
            especie: "",
            status: "",
            ong_id: 0,
            page: 1,
            limit: 10,
            sortBy: "nome",
            sortOrder: "asc"
        };

        await expect(animalData.getAllAnimals(filter as any))
            .rejects
            .toThrow("erro DB");
    });

    test("deve retornar animal pelo ID", async () => {
        const fake = { id_animal: 5 };

        mockConnection.where.mockReturnThis();
        mockConnection.first.mockResolvedValue(fake);

        const result = await animalData.getAnimalById(5);

        expect(result).toEqual(fake);
    });

    test("deve lancar erro no getAnimalById quando DB falhar", async () => {
        mockConnection.where.mockImplementation(() => {
            throw new Error("erro DB");
        });

        await expect(animalData.getAnimalById(99))
            .rejects
            .toThrow("erro DB");
    });

    test("deve criar animal", async () => {
        mockConnection.insert.mockResolvedValue([10]);

        const input = {
            nome: "Belinha",
            especie: "gato",
            descricao: "cinza",
            status: "disponivel",
            localizacao: "centro",
            data_registro: new Date(),
            ong_id: 1
        };

        const result = await animalData.createAnimal(input as any);

        expect(result).toBe(10);
    });

    test("deve atualizar animal", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.update.mockResolvedValue();

        await animalData.updateAnimal(7, { nome: "Pop" });

        expect(mockConnection.update).toHaveBeenCalledWith({ nome: "Pop" });
    });

    test("deve deletar animal", async () => {
        mockConnection.where.mockReturnThis();
        mockConnection.del.mockResolvedValue();

        await animalData.deleteAnimal(3);

        expect(mockConnection.del).toHaveBeenCalled();
    });
});
