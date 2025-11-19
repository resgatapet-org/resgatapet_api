import { OngBusiness } from '../src/business/ongBusiness';
import { OngData } from '../src/data/ongData';
import { FilterUtilsOng } from '../src/utils/filterUtilsOng';
import { OngInputDTO, OngUpdateDTO } from '../src/dto/ongDto';
import { OngFilterDTO } from '../src/dto/ongFilterDto';
import { Ong } from '../src/types/ong';

// 1. Mocks
// Usamos jest.mock para simular a camada de Dados e de Utilitários.
// Isso garante que estamos testando APENAS a lógica do Business (teste unitário).
jest.mock('../src/data/ongData');
jest.mock('../src/utils/filterUtilsOng');

// Mocks de Dados para reuso
const mockOngInput: OngInputDTO = {
    nome: "ONG Teste",
    email: "ong@teste.com",
    endereco: "Rua Teste, 123",
    usuario_id: 1,
    telefone: "(11) 98765-4321",
};

const mockOng: Ong = {
    id_ong: 1,
    nome: "ONG Teste",
    email: "ong@teste.com",
    endereco: "Rua Teste, 123",
    usuario_id: 1,
    telefone: "(11) 98765-4321",
};

const mockOngUpdate: OngUpdateDTO = {
    nome: "ONG Atualizada",
    email: "ong_atualizada@teste.com",
    endereco: "Rua Nova, 456",
    usuario_id: 1,
    telefone: "(11) 91234-5678",
};

describe("Testando a classe OngBusiness", () => {
    let ongBusiness: OngBusiness;
    let ongDataMock: jest.Mocked<OngData>;
    let filterUtilsMock: jest.Mocked<typeof FilterUtilsOng>;

    beforeEach(() => {
        ongBusiness = new OngBusiness();
        // Acesso às instâncias mockadas (Injeção de Dependências)
        ongDataMock = (ongBusiness as any).ongData;
        filterUtilsMock = FilterUtilsOng as any;

        jest.clearAllMocks();
    });

    // 2. Testes de getAllOngs (com Paginação)
    describe("Testando getAllOngs", () => {
        test("Deve retornar lista de ONGs com filtros aplicados", async () => {
            const mockFilter: OngFilterDTO = {
                page: 1,
                limit: 10,
            };

            const mockCompleteFilter = {
                ...mockFilter,
                nome: "", 
                cidade: "",
                sortBy: 'id_ong',
                sortOrder: 'asc'
            };

            // CORREÇÃO: O mock agora segue o contrato PaginatedResponse<Ong>
            // Ele precisa da propriedade 'pageInfo' que contém as informações da paginação.
            const mockResponse = {
                data: [mockOng],
                pageInfo: { // <--- CORREÇÃO AQUI!
                    total: 1,
                    limit: 10,
                    page: 1,
                    totalPages: 1,
                },
            };

            // Mocks de comportamento:
            filterUtilsMock.applyOngDefaults.mockReturnValue(mockCompleteFilter as any);
            ongDataMock.getAllOngs.mockResolvedValue(mockResponse as any);

            const result = await ongBusiness.getAllOngs(mockFilter);

            // Verificações de mock (Mocks com Jest)
            expect(filterUtilsMock.applyOngDefaults).toHaveBeenCalledWith(mockFilter);
            expect(ongDataMock.getAllOngs).toHaveBeenCalledWith(mockCompleteFilter);
            expect(result).toEqual(mockResponse);
        });

        // Testando erros assíncronos com try/catch e expect.assertions
        test("Deve lançar erro quando getAllOngs falhar", async () => {
            expect.assertions(1); // Indica que 1 expect DEVE ser rodado [cite: 263]

            const mockFilter: OngFilterDTO = { page: 1, limit: 10 };
            const errorMessage = "Erro ao buscar ONGs";

            filterUtilsMock.applyOngDefaults.mockReturnValue(mockFilter as any);
            // Simula a falha (Promise rejeitada)
            ongDataMock.getAllOngs.mockRejectedValue(new Error(errorMessage));

            try {
                await ongBusiness.getAllOngs(mockFilter);
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });

    // 3. Testes de getOngById
    describe("Testando getOngById", () => {
        // ... (Testes getOngById mantidos, pois estavam corretos) ...
        test("Deve retornar uma ONG pelo ID", async () => {
            ongDataMock.getOngById.mockResolvedValue(mockOng);

            const result = await ongBusiness.getOngById(1);

            expect(ongDataMock.getOngById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockOng);
        });

        test("Deve retornar undefined quando ONG não existir", async () => {
            ongDataMock.getOngById.mockResolvedValue(undefined);

            const result = await ongBusiness.getOngById(999);

            expect(ongDataMock.getOngById).toHaveBeenCalledWith(999);
            expect(result).toBeUndefined();
        });

        test("Deve lançar erro quando getOngById falhar", async () => {
            expect.assertions(1);

            const errorMessage = "Erro ao buscar ONG";
            ongDataMock.getOngById.mockRejectedValue(new Error(errorMessage));

            try {
                await ongBusiness.getOngById(1);
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });

    // 4. Testes de createOng
    describe("Testando createOng", () => {
        beforeEach(() => {
            ongDataMock.getOngByEmail.mockResolvedValue(undefined);
            ongDataMock.createOng.mockResolvedValue(1);
        });

        test("Deve criar uma ONG com sucesso", async () => {
            const result = await ongBusiness.createOng(mockOngInput);

            expect(ongDataMock.getOngByEmail).toHaveBeenCalledWith(mockOngInput.email);
            expect(ongDataMock.createOng).toHaveBeenCalledWith(mockOngInput);
            expect(result).toEqual({
                ...mockOngInput,
                id_ong: 1,
            });
        });

        // Testes de campos obrigatórios
        test("Deve lançar erro quando falta o campo 'nome'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                // nome: ausente
                email: "ong@teste.com",
                endereco: "Rua Teste, 123",
                usuario_id: 1,
            };

            try {
                await ongBusiness.createOng(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatorios ausentes: nome, email, endereco, usuario_id.");
            }
        });

        test("Deve lançar erro quando falta o campo 'email'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                nome: "ONG Teste",
                // email: ausente
                endereco: "Rua Teste, 123",
                usuario_id: 1,
            };

            try {
                await ongBusiness.createOng(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatorios ausentes: nome, email, endereco, usuario_id.");
            }
        });

        test("Deve lançar erro quando falta o campo 'endereco'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                nome: "ONG Teste",
                email: "ong@teste.com",
                // endereco: ausente
                usuario_id: 1,
            };

            try {
                await ongBusiness.createOng(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatorios ausentes: nome, email, endereco, usuario_id.");
            }
        });

        test("Deve lançar erro quando falta o campo 'usuario_id'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                nome: "ONG Teste",
                email: "ong@teste.com",
                endereco: "Rua Teste, 123",
                // usuario_id: ausente
            };

            try {
                await ongBusiness.createOng(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatorios ausentes: nome, email, endereco, usuario_id.");
            }
        });

        test("Deve lançar erro quando email já está cadastrado", async () => {
            expect.assertions(1);

            // Simula que a ONG já existe
            ongDataMock.getOngByEmail.mockResolvedValue(mockOng);

            try {
                await ongBusiness.createOng(mockOngInput);
            } catch (error: any) {
                expect(error.message).toEqual("Este email ja esta registrado para outra ONG.");
            }
        });

        test("Deve lançar erro quando createOng falhar", async () => {
            expect.assertions(1);

            const errorMessage = "Erro ao criar ONG";
            ongDataMock.createOng.mockRejectedValue(new Error(errorMessage));

            try {
                await ongBusiness.createOng(mockOngInput);
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });

    // 5. Testes de updateOng (com Autorização)
    describe("Testando updateOng", () => {
        beforeEach(() => {
            ongDataMock.getOngById.mockResolvedValue(mockOng);
            ongDataMock.getOngByEmail.mockResolvedValue(undefined);
            ongDataMock.updateOng.mockResolvedValue();
        });

        test("Deve atualizar uma ONG com sucesso quando usuário é ADMIN", async () => {
            // userId: 2 (diferente do dono), userType: 'ADMIN'
            await ongBusiness.updateOng(1, mockOngUpdate, 2, 'ADMIN');

            expect(ongDataMock.getOngById).toHaveBeenCalledWith(1);
            expect(ongDataMock.getOngByEmail).toHaveBeenCalledWith(mockOngUpdate.email);
            expect(ongDataMock.updateOng).toHaveBeenCalledWith(1, mockOngUpdate);
        });

        test("Deve atualizar uma ONG com sucesso quando usuário é o dono", async () => {
            // userId: 1 (igual ao dono: mockOng.usuario_id), userType: 'COMUM' (tipo do token, mas a lógica prioriza o ID)
            await ongBusiness.updateOng(1, mockOngUpdate, 1, 'COMUM');

            expect(ongDataMock.getOngById).toHaveBeenCalledWith(1);
            expect(ongDataMock.getOngByEmail).toHaveBeenCalledWith(mockOngUpdate.email);
            expect(ongDataMock.updateOng).toHaveBeenCalledWith(1, mockOngUpdate);
        });

        test("Deve lançar erro quando usuário não tem permissão para atualizar", async () => {
            expect.assertions(1);

            try {
                // userId: 999 (não é ADMIN e não é o dono)
                await ongBusiness.updateOng(1, mockOngUpdate, 999, 'COMUM');
            } catch (error: any) {
                // CORREÇÃO: Usando template literal (backticks `) corretamente
                expect(error.message).toEqual(`Você não tem permissão para atualizar esta ONG. Apenas o Administrador do sistema ou o Admin vinculado (usuario_id: ${mockOng.usuario_id}) pode fazer isso.`);
            }
        });

        test("Deve lançar erro quando ONG não existir", async () => {
            expect.assertions(1);

            ongDataMock.getOngById.mockResolvedValue(undefined);

            try {
                await ongBusiness.updateOng(999, mockOngUpdate, 1, 'ADMIN');
            } catch (error: any) {
                expect(error.message).toEqual("ONG nao encontrada.");
            }
        });

        test("Deve lançar erro quando email já está cadastrado para outra ONG", async () => {
            expect.assertions(1);

            // Outra ONG, com ID diferente, mas mesmo email do update
            const outraOng = { ...mockOng, id_ong: 2, email: mockOngUpdate.email };
            ongDataMock.getOngByEmail.mockResolvedValue(outraOng);

            try {
                await ongBusiness.updateOng(1, mockOngUpdate, 1, 'ADMIN');
            } catch (error: any) {
                expect(error.message).toEqual("Este email ja esta registrado para outra ONG.");
            }
        });

        test("Deve permitir atualizar com o mesmo email da própria ONG", async () => {
            // A ONG atualizada tem o mesmo email que a ONG original (mockOng)
            const updateComMesmoEmail: OngUpdateDTO = {
                ...mockOngUpdate,
                email: mockOng.email,
            };

            // O mock retorna a PRÓPRIA ONG ao buscar por email (ou seja, não há conflito)
            ongDataMock.getOngByEmail.mockResolvedValue(mockOng); 

            await ongBusiness.updateOng(1, updateComMesmoEmail, 1, 'ADMIN');

            expect(ongDataMock.updateOng).toHaveBeenCalledWith(1, updateComMesmoEmail);
        });

        test("Deve lançar erro quando updateOng falhar", async () => {
            expect.assertions(1);

            const errorMessage = "Erro ao atualizar ONG";
            ongDataMock.updateOng.mockRejectedValue(new Error(errorMessage));

            try {
                await ongBusiness.updateOng(1, mockOngUpdate, 1, 'ADMIN');
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });

    // 6. Testes de deleteOng
    describe("Testando deleteOng", () => {
        test("Deve deletar uma ONG com sucesso", async () => {
            ongDataMock.getOngById.mockResolvedValue(mockOng);
            ongDataMock.deleteOng.mockResolvedValue();

            await ongBusiness.deleteOng(1);

            expect(ongDataMock.getOngById).toHaveBeenCalledWith(1);
            expect(ongDataMock.deleteOng).toHaveBeenCalledWith(1);
        });

        test("Deve lançar erro quando ONG não existir", async () => {
            expect.assertions(1);

            ongDataMock.getOngById.mockResolvedValue(undefined);

            try {
                await ongBusiness.deleteOng(999);
            } catch (error: any) {
                expect(error.message).toEqual("ONG nao encontrada.");
            }
        });

        test("Deve lançar erro quando deleteOng falhar", async () => {
            expect.assertions(1);

            ongDataMock.getOngById.mockResolvedValue(mockOng);
            
            const errorMessage = "Erro ao deletar ONG";
            ongDataMock.deleteOng.mockRejectedValue(new Error(errorMessage));

            try {
                await ongBusiness.deleteOng(1);
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });
});