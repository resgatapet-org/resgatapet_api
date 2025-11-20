import { PrioridadeBusiness } from "../../src/business/prioridadesBusiness";
import { PrioridadeData } from "../../src/data/prioridadesData";
import { FilterUtilsPrioridades } from "../../src/utils/filterUtilsPrioridades";
import { PrioridadeInput } from "../../src/dto/prioridadeDto";
import { PrioridadeFilterDTO } from "../../src/dto/prioridadeFilterDto";
import { Prioridade } from "../../src/types/prioridades";

jest.mock("../src/data/prioridadesData");
jest.mock("../src/utils/filterUtilsPrioridades");

const mockPrioridade: Prioridade = {
    id_prioridade: 1,
    descricao: "Alta prioridade",
    nivel: "ALTA",
    animal_id: 1,
};

const mockPrioridadeInput: PrioridadeInput = {
    descricao: "Alta prioridade",
    nivel: "ALTA",
    animal_id: 1,
};

describe("Testando a classe PrioridadeBusiness", () => {
    let prioridadeBusiness: PrioridadeBusiness;
    let prioridadeDataMock: jest.Mocked<PrioridadeData>;
    let filterUtilsMock: jest.Mocked<typeof FilterUtilsPrioridades>;

    beforeEach(() => {
        prioridadeBusiness = new PrioridadeBusiness();
        prioridadeDataMock = (prioridadeBusiness as any).prioridadeData;
        filterUtilsMock = FilterUtilsPrioridades as any;

        jest.clearAllMocks();
    });

    // ==============================================================  
    // GET ALL PRIORIDADES  
    // ==============================================================  

    describe("Testando getAllPrioridades", () => {
        test("Deve retornar lista de prioridades com filtros aplicados", async () => {
            const mockFilter: PrioridadeFilterDTO = { page: 1, limit: 10 };

            const mockCompleteFilter = {
                ...mockFilter,
                descricao: "",
                nivel: "",
                sortBy: "id_prioridade",
                sortOrder: "asc",
            };

            const mockResponse = {
                data: [mockPrioridade],
                pageInfo: {
                    total: 1,
                    limit: 10,
                    page: 1,
                    totalPages: 1,
                },
            };

            filterUtilsMock.applyDefaults.mockReturnValue(mockCompleteFilter as any);
            prioridadeDataMock.getAllPrioridades.mockResolvedValue(mockResponse as any);

            const result = await prioridadeBusiness.getAllPrioridades(mockFilter);

            expect(filterUtilsMock.applyDefaults).toHaveBeenCalledWith(mockFilter);
            expect(prioridadeDataMock.getAllPrioridades).toHaveBeenCalledWith(mockCompleteFilter);
            expect(result).toEqual(mockResponse);
        });

        test("Deve lançar erro quando getAllPrioridades falhar", async () => {
            expect.assertions(1);

            const errorMessage = "Erro ao buscar prioridades";

            filterUtilsMock.applyDefaults.mockReturnValue({} as any);
            prioridadeDataMock.getAllPrioridades.mockRejectedValue(new Error(errorMessage));

            try {
                await prioridadeBusiness.getAllPrioridades({ page: 1, limit: 10 });
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });

    // ==============================================================  
    // GET PRIORIDADE BY ID  
    // ==============================================================  

    describe("Testando getPrioridadeById", () => {
        test("Deve retornar uma prioridade pelo ID", async () => {
            prioridadeDataMock.getPrioridadeById.mockResolvedValue(mockPrioridade);

            const result = await prioridadeBusiness.getPrioridadeById(1);

            expect(prioridadeDataMock.getPrioridadeById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockPrioridade);
        });

        test("Deve retornar undefined quando prioridade não existir", async () => {
            prioridadeDataMock.getPrioridadeById.mockResolvedValue(undefined);

            const result = await prioridadeBusiness.getPrioridadeById(999);

            expect(prioridadeDataMock.getPrioridadeById).toHaveBeenCalledWith(999);
            expect(result).toBeUndefined();
        });

        test("Deve lançar erro quando getPrioridadeById falhar", async () => {
            expect.assertions(1);

            const errorMessage = "Erro ao buscar prioridade";
            prioridadeDataMock.getPrioridadeById.mockRejectedValue(new Error(errorMessage));

            try {
                await prioridadeBusiness.getPrioridadeById(1);
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });

    // ==============================================================  
    // CREATE PRIORIDADE  
    // ==============================================================  

    describe("Testando createPrioridade", () => {
        beforeEach(() => {
            prioridadeDataMock.createPrioridade.mockResolvedValue(1);
        });

        test("Deve criar prioridade com sucesso", async () => {
            const result = await prioridadeBusiness.createPrioridade(mockPrioridadeInput);

            expect(prioridadeDataMock.createPrioridade).toHaveBeenCalledWith(mockPrioridadeInput);
            expect(result).toEqual({
                ...mockPrioridadeInput,
                id_prioridade: 1,
            });
        });

        test("Deve lançar erro quando faltar campos obrigatórios", async () => {
            expect.assertions(1);

            const invalidInput: any = { descricao: "Teste" };

            try {
                await prioridadeBusiness.createPrioridade(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatorios ausentes: nivel e descricao.");
            }
        });

        test("Deve lançar erro quando createPrioridade falhar", async () => {
            expect.assertions(1);

            const errorMessage = "Erro ao criar prioridade";
            prioridadeDataMock.createPrioridade.mockRejectedValue(new Error(errorMessage));

            try {
                await prioridadeBusiness.createPrioridade(mockPrioridadeInput);
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });

    // ==============================================================  
    // UPDATE PRIORIDADE  
    // ==============================================================  

    describe("Testando updatePrioridade", () => {
        beforeEach(() => {
            prioridadeDataMock.getPrioridadeById.mockResolvedValue(mockPrioridade);
            prioridadeDataMock.updatePrioridade.mockResolvedValue();
        });

        test("Deve atualizar prioridade com sucesso", async () => {
            await prioridadeBusiness.updatePrioridade(1, mockPrioridadeInput);

            expect(prioridadeDataMock.getPrioridadeById).toHaveBeenCalledWith(1);
            expect(prioridadeDataMock.updatePrioridade).toHaveBeenCalledWith(1, mockPrioridadeInput);
        });

        test("Deve lançar erro quando prioridade não existir", async () => {
            expect.assertions(1);

            prioridadeDataMock.getPrioridadeById.mockResolvedValue(undefined);

            try {
                await prioridadeBusiness.updatePrioridade(999, mockPrioridadeInput);
            } catch (error: any) {
                expect(error.message).toEqual("Prioridade nao encontrada.");
            }
        });

        test("Deve lançar erro quando faltar campos obrigatórios", async () => {
            expect.assertions(1);

            const invalidInput: any = { descricao: "" };

            try {
                await prioridadeBusiness.updatePrioridade(1, invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatorios ausentes: nivel e descricao.");
            }
        });

        test("Deve lançar erro quando updatePrioridade falhar", async () => {
            expect.assertions(1);

            const errorMessage = "Erro ao atualizar prioridade";
            prioridadeDataMock.updatePrioridade.mockRejectedValue(new Error(errorMessage));

            try {
                await prioridadeBusiness.updatePrioridade(1, mockPrioridadeInput);
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });

    describe("Testando deletePrioridade", () => {
        test("Deve deletar prioridade com sucesso", async () => {
            prioridadeDataMock.getPrioridadeById.mockResolvedValue(mockPrioridade);
            prioridadeDataMock.deletePrioridade.mockResolvedValue();

            await prioridadeBusiness.deletePrioridade(1);

            expect(prioridadeDataMock.getPrioridadeById).toHaveBeenCalledWith(1);
            expect(prioridadeDataMock.deletePrioridade).toHaveBeenCalledWith(1);
        });

        test("Deve lançar erro quando prioridade não existir", async () => {
            expect.assertions(1);

            prioridadeDataMock.getPrioridadeById.mockResolvedValue(undefined);

            try {
                await prioridadeBusiness.deletePrioridade(999);
            } catch (error: any) {
                expect(error.message).toEqual("Prioridade nao encontrada.");
            }
        });

        test("Deve lançar erro quando deletePrioridade falhar", async () => {
            expect.assertions(1);

            const errorMessage = "Erro ao deletar prioridade";

            prioridadeDataMock.getPrioridadeById.mockResolvedValue(mockPrioridade);
            prioridadeDataMock.deletePrioridade.mockRejectedValue(new Error(errorMessage));

            try {
                await prioridadeBusiness.deletePrioridade(1);
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });
});
