import { OcorrenciaBusiness } from '../../src/business/ocorrenciaBusiness';
import { OcorrenciaData } from '../../src/data/ocorrenciaData';
import { UserData } from '../../src/data/usuarioData';
import { OngData } from '../../src/data/ongData';
import { FilterUtilsOcorrencia } from '../../src/utils/filterUtilsOcorrencia';
import { OcorrenciaInputDTO, OcorrenciaUpdateStatusDTO } from '../../src/dto/ocorrenciaFilterDto';
import { PaginatedResponse } from '../../src/dto/paginationDto';
import { Ocorrencia } from '../../src/types/ocorrencia';
import { User } from '../../src/types/usuario';
import { Ong } from '../../src/types/ong';

jest.mock('../src/data/ocorrenciaData');
jest.mock('../src/data/usuarioData');
jest.mock('../src/data/ongData');
jest.mock('../src/utils/filterUtilsOcorrencia');

const mockDataRegistro = new Date('2025-11-18T10:00:00.000Z');

const mockOcorrenciaInput: OcorrenciaInputDTO = {
    descricao: "Animal abandonado na rua X",
    localizacao: "Rua Principal, 100",
    foto_url: "http://foto.com/animal.jpg",
    usuario_id: 3,
};

const mockOcorrencia: Ocorrencia = {
    id_ocorrencia: 1,
    descricao: mockOcorrenciaInput.descricao,
    localizacao: mockOcorrenciaInput.localizacao,
    foto_url: mockOcorrenciaInput.foto_url,
    status: "encontrado",
    usuario_id: mockOcorrenciaInput.usuario_id!,
    data_registro: mockDataRegistro,
    ong_id: undefined,
};

const mockUserComum: User = {
    id_usuario: 3,
    nome: "Joao Cidadao",
    email: "joao@email.com",
    senha: "hash",
    tipo: "COMUM",
    data_criacao: mockDataRegistro,
};

const mockUserOng: User = {
    id_usuario: 2,
    nome: "ONG User",
    email: "ong@email.com",
    senha: "hash",
    tipo: "ONG",
    data_criacao: mockDataRegistro,
};

const mockOng: Ong = {
    id_ong: 5,
    nome: "Abrigo Feliz",
    email: "contato@abrigofeliz.com",
    endereco: "Rua ONG, 456",
    telefone: "12345678",
    usuario_id: 2,
};

describe("Testando a classe OcorrenciaBusiness", () => {
    let ocorrenciaBusiness: OcorrenciaBusiness;
    let ocorrenciaDataMock: jest.Mocked<OcorrenciaData>;
    let userDataMock: jest.Mocked<UserData>;
    let ongDataMock: jest.Mocked<OngData>;
    let filterUtilsMock: jest.Mocked<typeof FilterUtilsOcorrencia>;

    beforeEach(() => {
        ocorrenciaBusiness = new OcorrenciaBusiness();
        ocorrenciaDataMock = (ocorrenciaBusiness as any).ocorrenciaData;
        userDataMock = (ocorrenciaBusiness as any).userData;
        ongDataMock = (ocorrenciaBusiness as any).ongData;
        filterUtilsMock = FilterUtilsOcorrencia as any;

        jest.clearAllMocks();
    });

    describe("Testando getAllOcorrencias", () => {
        test("Deve retornar lista de ocorrencias com filtros aplicados", async () => {
            const mockFilter = { page: 1, limit: 10 };
            const mockCompleteFilter = {
                ...mockFilter,
                status: "",
                localizacao: "",
                usuario_id: 0,
                ong_id: 0,
                sortBy: 'id_ocorrencia',
                sortOrder: 'desc'
            };

            const mockResponse: PaginatedResponse<Ocorrencia> = {
                data: [mockOcorrencia],
                pageInfo: {
                    total: 1,
                    limit: 10,
                    page: 1,
                    totalPages: 1,
                },
            };

            filterUtilsMock.applyOcorrenciaDefaults.mockReturnValue(mockCompleteFilter as any);
            ocorrenciaDataMock.getAllOcorrencias.mockResolvedValue(mockResponse);

            const result = await ocorrenciaBusiness.getAllOcorrencias(mockFilter);

            expect(result).toEqual(mockResponse);
        });

        test("Deve lancar erro quando a camada de dados falhar", async () => {
            expect.assertions(1);
            ocorrenciaDataMock.getAllOcorrencias.mockRejectedValue(new Error("Erro no banco de dados"));
            try {
                await ocorrenciaBusiness.getAllOcorrencias({});
            } catch (error: any) {
                expect(error.message).toEqual("Erro no banco de dados");
            }
        });
    });

    describe("Testando createOcorrencia", () => {
        beforeEach(() => {
            userDataMock.getUserById.mockResolvedValue(mockUserComum as any);
            (ocorrenciaDataMock.createOcorrencia as jest.Mock).mockResolvedValue(1);
        });

        test("Deve criar uma ocorrencia com usuario autenticado (COMUM)", async () => {
            const result = await ocorrenciaBusiness.createOcorrencia(mockOcorrenciaInput);

            expect(ocorrenciaDataMock.createOcorrencia).toHaveBeenCalledWith(expect.objectContaining({
                status: "encontrado",
            }));

            expect(result).toEqual(expect.objectContaining({
                id_ocorrencia: 1,
                status: "encontrado",
            }));
        });

        test("Deve criar uma ocorrencia sem usuario (anonimo)", async () => {
            const inputAnonimo: OcorrenciaInputDTO = { ...mockOcorrenciaInput, usuario_id: undefined };

            await ocorrenciaBusiness.createOcorrencia(inputAnonimo);
            expect(userDataMock.getUserById).not.toHaveBeenCalled();
        });

        test("Deve lancar erro se campos obrigatorios estiverem ausentes", async () => {
            expect.assertions(1);
            const invalidInput: any = { localizacao: "Local", foto_url: "foto" };
            try {
                await ocorrenciaBusiness.createOcorrencia(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatorios ausentes: descricao, localizacao e foto_url.");
            }
        });

        test("Deve lancar erro se usuario autenticado nao for COMUM", async () => {
            expect.assertions(1);
            userDataMock.getUserById.mockResolvedValue({ ...mockUserComum, tipo: "ADMIN" } as any);
            try {
                await ocorrenciaBusiness.createOcorrencia(mockOcorrenciaInput);
            } catch (error: any) {
                expect(error.message).toEqual("Usuario ID invalido ou nao e um Usuario Comum.");
            }
        });
    });

    describe("Testando updateOcorrenciaStatus", () => {
        const id = 1;

        beforeEach(() => {
            ocorrenciaDataMock.getOcorrenciaById.mockResolvedValue(mockOcorrencia);
            ocorrenciaDataMock.updateOcorrenciaStatus.mockResolvedValue();
            ongDataMock.getOngByUserId.mockResolvedValue(mockOng);
        });

        test("Deve atualizar para 'em andamento' se for ADMIN", async () => {
            const statusInput: OcorrenciaUpdateStatusDTO = { status: "em andamento" };
            await ocorrenciaBusiness.updateOcorrenciaStatus(id, statusInput, 1, 'ADMIN');
            expect(ocorrenciaDataMock.updateOcorrenciaStatus).toHaveBeenCalledWith(id, "em andamento");
        });

        test("Deve atualizar para 'em andamento' e associar ong_id se for ONG", async () => {
            const statusInput: OcorrenciaUpdateStatusDTO = { status: "em andamento" };
            const userId = mockUserOng.id_usuario;

            await ocorrenciaBusiness.updateOcorrenciaStatus(id, statusInput, userId, 'ONG');

            expect(ocorrenciaDataMock.updateOcorrenciaStatus).toHaveBeenCalledWith(id, "em andamento", mockOng.id_ong);
        });

        test("Deve lancar erro se ONG nao estiver associada", async () => {
            expect.assertions(1);
            const statusInput: OcorrenciaUpdateStatusDTO = { status: "em andamento" };
            ongDataMock.getOngByUserId.mockResolvedValue(undefined);

            try {
                await ocorrenciaBusiness.updateOcorrenciaStatus(id, statusInput, 999, 'ONG');
            } catch (error: any) {
                expect(error.message).toEqual("Sua conta nao esta associada a nenhuma ONG cadastrada.");
            }
        });
    });

    describe("Testando deleteOcorrencia", () => {
        test("Deve deletar uma ocorrencia com sucesso", async () => {
            ocorrenciaDataMock.getOcorrenciaById.mockResolvedValue(mockOcorrencia);
            await ocorrenciaBusiness.deleteOcorrencia(1);
            expect(ocorrenciaDataMock.deleteOcorrencia).toHaveBeenCalledWith(1);
        });

        test("Deve lancar erro quando ocorrencia nao existir", async () => {
            expect.assertions(1);
            ocorrenciaDataMock.getOcorrenciaById.mockResolvedValue(undefined);
            try {
                await ocorrenciaBusiness.deleteOcorrencia(999);
            } catch (error: any) {
                expect(error.message).toEqual("Ocorrencia nao encontrada.");
            }
        });
    });
});
