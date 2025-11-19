import { AdocaoBusiness } from "../../src/business/adocaoBusiness";
import { AdocaoData } from "../../src/data/adocaoData";
import { AnimalData } from "../../src/data/animalData";
import { UserData } from "../../src/data/usuarioData";
import { FilterUtilsAdocao } from "../../src/utils/filterUtilsAdocao";

import { Adocao } from "../../src/types/adocao";
import { PaginatedResponse } from "../../src/dto/paginationDto";
import { AdocaoInputFromController } from "../../src/dto/adocaoDto";

jest.mock("../src/data/adocaoData");
jest.mock("../src/data/animalData");
jest.mock("../src/data/usuarioData");
jest.mock("../src/utils/filterUtilsAdocao");

const mockData = new Date("2025-11-18T10:00:00.000Z");

const mockAdocao: Adocao = {
    id_adocao: 1,
    animal_id: 10,
    usuario_id: 3,
    ong_id: 5,
    status: "em analise",
    data_solicitacao: mockData
};

const mockAnimal = {
    id_animal: 10,
    nome: "Bob",
    status: "disponivel",
    ong_id: 5
};

const mockUsuario = {
    id_usuario: 3,
    nome: "Joao",
    tipo: "COMUM",
    email: "joao@email.com"
};

describe("Testando a classe AdocaoBusiness", () => {
    let adocaoBusiness: AdocaoBusiness;
    let adocaoDataMock: jest.Mocked<AdocaoData>;
    let animalDataMock: jest.Mocked<AnimalData>;
    let userDataMock: jest.Mocked<UserData>;
    let filterUtilsMock: jest.Mocked<typeof FilterUtilsAdocao>;

    beforeEach(() => {
        adocaoBusiness = new AdocaoBusiness();
        adocaoDataMock = (adocaoBusiness as any).adocaoData;
        animalDataMock = (adocaoBusiness as any).animalData;
        userDataMock = (adocaoBusiness as any).userData;
        filterUtilsMock = FilterUtilsAdocao as any;

        jest.clearAllMocks();
    });

    describe("Testando getAllAdocoes", () => {
        test("Deve retornar lista de adocoes com filtros aplicados", async () => {
            const mockFilter = { page: 1, limit: 10 };
            const mockCompleteFilter = {
                ...mockFilter,
                status: "",
                usuario_id: 0,
                animal_id: 0,
                sortBy: "id_adocao",
                sortOrder: "desc"
            };

            const mockResponse: PaginatedResponse<Adocao> = {
                data: [mockAdocao],
                pageInfo: {
                    total: 1,
                    limit: 10,
                    page: 1,
                    totalPages: 1
                }
            };

            filterUtilsMock.applyDefaults.mockReturnValue(mockCompleteFilter as any);
            adocaoDataMock.getAllAdocoes.mockResolvedValue(mockResponse);

            const result = await adocaoBusiness.getAllAdocoes(mockFilter);

            expect(result).toEqual(mockResponse);
        });

        test("Deve lancar erro se a camada de dados falhar", async () => {
            expect.assertions(1);
            adocaoDataMock.getAllAdocoes.mockRejectedValue(new Error("Erro no banco"));
            try {
                await adocaoBusiness.getAllAdocoes({});
            } catch (error: any) {
                expect(error.message).toEqual("Erro no banco");
            }
        });
    });

    describe("Testando getAdocaoById", () => {
        test("Deve retornar adocao por ID", async () => {
            adocaoDataMock.getAdocaoById.mockResolvedValue(mockAdocao);

            const result = await adocaoBusiness.getAdocaoById(1);

            expect(result).toEqual(mockAdocao);
        });

        test("Deve lancar erro se banco falhar", async () => {
            expect.assertions(1);
            adocaoDataMock.getAdocaoById.mockRejectedValue(new Error("Erro ao buscar"));
            try {
                await adocaoBusiness.getAdocaoById(1);
            } catch (error: any) {
                expect(error.message).toEqual("Erro ao buscar");
            }
        });
    });

    describe("Testando createAdocao", () => {
        const input: AdocaoInputFromController = {
            animal_id: 10,
            usuario_id: 3,
            status: "em analise"
        };

        beforeEach(() => {
            animalDataMock.getAnimalById.mockResolvedValue(mockAnimal as any);
            userDataMock.getUserById.mockResolvedValue(mockUsuario as any);
            adocaoDataMock.createAdocao.mockResolvedValue();
        });

        test("Deve criar adocao com sucesso", async () => {
            await adocaoBusiness.createAdocao(input);

            expect(adocaoDataMock.createAdocao).toHaveBeenCalled();
        });

        test("Deve lancar erro se faltar campos obrigatorios", async () => {
            expect.assertions(1);
            const invalid: any = { animal_id: 10 };

            try {
                await adocaoBusiness.createAdocao(invalid);
            } catch (error: any) {
                expect(error.message).toEqual(
                    "Campos obrigatorios ausentes (animal_id, usuario_id, status)."
                );
            }
        });

        test("Deve lancar erro se animal nao existe", async () => {
            expect.assertions(1);
            animalDataMock.getAnimalById.mockResolvedValue(undefined);

            try {
                await adocaoBusiness.createAdocao(input);
            } catch (error: any) {
                expect(error.message).toEqual("Animal com ID 10 nao encontrado.");
            }
        });

        test("Deve lancar erro se usuario nao for COMUM", async () => {
            expect.assertions(1);
            userDataMock.getUserById.mockResolvedValue({ ...mockUsuario, tipo: "ADMIN" } as any);

            try {
                await adocaoBusiness.createAdocao(input);
            } catch (error: any) {
                expect(error.message).toEqual(
                    "Usuario com ID 3 nao encontrado ou nao e um Usuario Comum."
                );
            }
        });
    });

    describe("Testando updateAdocaoStatus", () => {
        beforeEach(() => {
            adocaoDataMock.getAdocaoById.mockResolvedValue(mockAdocao);
            animalDataMock.getAnimalById.mockResolvedValue(mockAnimal as any);
            adocaoDataMock.updateAdocaoStatus.mockResolvedValue();
            animalDataMock.updateAnimal.mockResolvedValue();
        });

        test("Deve atualizar status com sucesso", async () => {
            await adocaoBusiness.updateAdocaoStatus(1, "aprovado");

            expect(adocaoDataMock.updateAdocaoStatus).toHaveBeenCalledWith(1, "aprovado");
        });

        test("Deve lancar erro para status invalido", async () => {
            expect.assertions(1);
            try {
                await adocaoBusiness.updateAdocaoStatus(1, "invalido");
            } catch (error: any) {
                expect(error.message).toEqual("Status de adocao invalido.");
            }
        });

        test("Deve marcar animal como adotado se adocao aprovada", async () => {
            await adocaoBusiness.updateAdocaoStatus(1, "aprovado");

            expect(animalDataMock.updateAnimal).toHaveBeenCalledWith(10, { status: "adotado" });
        });

        test("Deve lancar erro se adocao nao encontrada", async () => {
            expect.assertions(1);
            adocaoDataMock.getAdocaoById.mockResolvedValue(undefined);

            try {
                await adocaoBusiness.updateAdocaoStatus(999, "aprovado");
            } catch (error: any) {
                expect(error.message).toEqual("Solicitacao de adocao nao encontrada.");
            }
        });
    });

    describe("Testando deleteAdocao", () => {
        test("Deve deletar adocao com sucesso", async () => {
            adocaoDataMock.getAdocaoById.mockResolvedValue(mockAdocao);

            await adocaoBusiness.deleteAdocao(1);

            expect(adocaoDataMock.deleteAdocao).toHaveBeenCalledWith(1);
        });

        test("Deve lancar erro se adocao nao existir", async () => {
            expect.assertions(1);
            adocaoDataMock.getAdocaoById.mockResolvedValue(undefined);

            try {
                await adocaoBusiness.deleteAdocao(999);
            } catch (error: any) {
                expect(error.message).toEqual("Solicitacao de adocao nao encontrada.");
            }
        });
    });
});
