import { OngBusiness } from '../../src/business/ongBusiness';
import { OngData } from '../../src/data/ongData';
import { FilterUtilsOng } from '../../src/utils/filterUtilsOng';
import { OngInputDTO, OngUpdateDTO } from '../../src/dto/ongDto';
import { OngFilterDTO } from '../../src/dto/ongFilterDto';
import { Ong } from '../../src/types/ong';

jest.mock('../src/data/ongData');
jest.mock('../src/utils/filterUtilsOng');


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
        ongDataMock = (ongBusiness as any).ongData;
        filterUtilsMock = FilterUtilsOng as any;

        jest.clearAllMocks();
    });

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

        
            const mockResponse = {
                data: [mockOng],
                pageInfo: { 
                    total: 1,
                    limit: 10,
                    page: 1,
                    totalPages: 1,
                },
            };

          
            filterUtilsMock.applyOngDefaults.mockReturnValue(mockCompleteFilter as any);
            ongDataMock.getAllOngs.mockResolvedValue(mockResponse as any);

            const result = await ongBusiness.getAllOngs(mockFilter);

         
            expect(filterUtilsMock.applyOngDefaults).toHaveBeenCalledWith(mockFilter);
            expect(ongDataMock.getAllOngs).toHaveBeenCalledWith(mockCompleteFilter);
            expect(result).toEqual(mockResponse);
        });

        test("Deve lancar erro quando getAllOngs falhar", async () => {
            expect.assertions(1); 

            const mockFilter: OngFilterDTO = { page: 1, limit: 10 };
            const errorMessage = "Erro ao buscar ONGs";

            filterUtilsMock.applyOngDefaults.mockReturnValue(mockFilter as any);
           
            ongDataMock.getAllOngs.mockRejectedValue(new Error(errorMessage));

            try {
                await ongBusiness.getAllOngs(mockFilter);
            } catch (error: any) {
                expect(error.message).toEqual(errorMessage);
            }
        });
    });

    describe("Testando getOngById", () => {
        test("Deve retornar uma ONG pelo ID", async () => {
            ongDataMock.getOngById.mockResolvedValue(mockOng);

            const result = await ongBusiness.getOngById(1);

            expect(ongDataMock.getOngById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockOng);
        });

        test("Deve retornar undefined quando ONG nao existir", async () => {
            ongDataMock.getOngById.mockResolvedValue(undefined);

            const result = await ongBusiness.getOngById(999);

            expect(ongDataMock.getOngById).toHaveBeenCalledWith(999);
            expect(result).toBeUndefined();
        });

        test("Deve lancar erro quando getOngById falhar", async () => {
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

       
        test("Deve lancar erro quando falta o campo 'nome'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
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

        test("Deve lancar erro quando falta o campo 'email'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                nome: "ONG Teste",
                endereco: "Rua Teste, 123",
                usuario_id: 1,
            };

            try {
                await ongBusiness.createOng(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatorios ausentes: nome, email, endereco, usuario_id.");
            }
        });

        test("Deve lancar erro quando falta o campo 'endereco'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                nome: "ONG Teste",
                email: "ong@teste.com",
                usuario_id: 1,
            };

            try {
                await ongBusiness.createOng(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatorios ausentes: nome, email, endereco, usuario_id.");
            }
        });

        test("Deve lancar erro quando falta o campo 'usuario_id'", async () => {
            expect.assertions(1);

            const invalidInput: any = {
                nome: "ONG Teste",
                email: "ong@teste.com",
                endereco: "Rua Teste, 123",
               
            };

            try {
                await ongBusiness.createOng(invalidInput);
            } catch (error: any) {
                expect(error.message).toEqual("Campos obrigatorios ausentes: nome, email, endereco, usuario_id.");
            }
        });

        test("Deve lancar erro quando email ja esta cadastrado", async () => {
            expect.assertions(1);

           
            ongDataMock.getOngByEmail.mockResolvedValue(mockOng);

            try {
                await ongBusiness.createOng(mockOngInput);
            } catch (error: any) {
                expect(error.message).toEqual("Este email ja esta registrado para outra ONG.");
            }
        });

        test("Deve lancar erro quando createOng falhar", async () => {
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

    
    describe("Testando updateOng", () => {
        beforeEach(() => {
            ongDataMock.getOngById.mockResolvedValue(mockOng);
            ongDataMock.getOngByEmail.mockResolvedValue(undefined);
            ongDataMock.updateOng.mockResolvedValue();
        });

        test("Deve atualizar uma ONG com sucesso quando usuario e ADMIN", async () => {
            
            await ongBusiness.updateOng(1, mockOngUpdate, 2, 'ADMIN');

            expect(ongDataMock.getOngById).toHaveBeenCalledWith(1);
            expect(ongDataMock.getOngByEmail).toHaveBeenCalledWith(mockOngUpdate.email);
            expect(ongDataMock.updateOng).toHaveBeenCalledWith(1, mockOngUpdate);
        });

        test("Deve atualizar uma ONG com sucesso quando usuario e o dono", async () => {
            await ongBusiness.updateOng(1, mockOngUpdate, 1, 'COMUM');

            expect(ongDataMock.getOngById).toHaveBeenCalledWith(1);
            expect(ongDataMock.getOngByEmail).toHaveBeenCalledWith(mockOngUpdate.email);
            expect(ongDataMock.updateOng).toHaveBeenCalledWith(1, mockOngUpdate);
        });

        test("Deve lancar erro quando usuario nao tem permissao para atualizar", async () => {
            expect.assertions(1);

            try {
             
                await ongBusiness.updateOng(1, mockOngUpdate, 999, 'COMUM');
            } catch (error: any) {
              
                expect(error.message).toEqual(`Voce nao tem permissao para atualizar esta ONG. Apenas o Administrador do sistema ou o Admin vinculado (usuario_id: ${mockOng.usuario_id}) pode fazer isso.`);
            }
        });

        test("Deve lancar erro quando ONG nao existir", async () => {
            expect.assertions(1);

            ongDataMock.getOngById.mockResolvedValue(undefined);

            try {
                await ongBusiness.updateOng(999, mockOngUpdate, 1, 'ADMIN');
            } catch (error: any) {
                expect(error.message).toEqual("ONG nao encontrada.");
            }
        });

        test("Deve lancar erro quando email ja esta cadastrado para outra ONG", async () => {
            expect.assertions(1);

            const outraOng = { ...mockOng, id_ong: 2, email: mockOngUpdate.email };
            ongDataMock.getOngByEmail.mockResolvedValue(outraOng);

            try {
                await ongBusiness.updateOng(1, mockOngUpdate, 1, 'ADMIN');
            } catch (error: any) {
                expect(error.message).toEqual("Este email ja esta registrado para outra ONG.");
            }
        });

        test("Deve permitir atualizar com o mesmo email da propria ONG", async () => {
         
            const updateComMesmoEmail: OngUpdateDTO = {
                ...mockOngUpdate,
                email: mockOng.email,
            };

            ongDataMock.getOngByEmail.mockResolvedValue(mockOng); 

            await ongBusiness.updateOng(1, updateComMesmoEmail, 1, 'ADMIN');

            expect(ongDataMock.updateOng).toHaveBeenCalledWith(1, updateComMesmoEmail);
        });

        test("Deve lancar erro quando updateOng falhar", async () => {
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

   
    describe("Testando deleteOng", () => {
        test("Deve deletar uma ONG com sucesso", async () => {
            ongDataMock.getOngById.mockResolvedValue(mockOng);
            ongDataMock.deleteOng.mockResolvedValue();

            await ongBusiness.deleteOng(1);

            expect(ongDataMock.getOngById).toHaveBeenCalledWith(1);
            expect(ongDataMock.deleteOng).toHaveBeenCalledWith(1);
        });

        test("Deve lancar erro quando ONG nao existir", async () => {
            expect.assertions(1);

            ongDataMock.getOngById.mockResolvedValue(undefined);

            try {
                await ongBusiness.deleteOng(999);
            } catch (error: any) {
                expect(error.message).toEqual("ONG nao encontrada.");
            }
        });

        test("Deve lancar erro quando deleteOng falhar", async () => {
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