import { OngController } from "../../src/controller/ongController";
import { OngBusiness } from "../../src/business/ongBusiness";
import { Ong } from "../../src/types/ong";
import { PaginatedResponse } from "../../src/dto/paginationDto";

jest.mock("../../src/business/ongBusiness");

const OngBusinessMock = OngBusiness as jest.MockedClass<typeof OngBusiness>;

const mockOng: Ong = {
    id_ong: 1,
    nome: "Ong Teste",
    email: "ong@mail.com",
    endereco: "Rua primeiro de maio, 10",
    telefone: "984190505",
    usuario_id: 10,
};

const mockPaginatedResponse: PaginatedResponse<Ong> = {
    data: [mockOng],
    pageInfo: {
        total: 1,
        limit: 10,
        page: 1,
        totalPages: 1,
    },
};

describe("OngController", () => {
    let ongController: OngController;
    
    const mockRequest = {} as any;
    const mockResponse = {
        status: jest.fn().mockReturnThis(), 
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        ongController = new OngController();
    });

    describe("GET /ongs", () => {
        test("Deve retornar 200 e a lista paginada de ONGs", async () => {
            OngBusinessMock.prototype.getAllOngs.mockResolvedValue(mockPaginatedResponse);
            await ongController.getAll(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith(mockPaginatedResponse);
        });
    });

    describe("GET /ongs/:id", () => {
        test("Deve retornar 200 e a ONG se o ID for valido", async () => {
            OngBusinessMock.prototype.getOngById.mockResolvedValue(mockOng);
            mockRequest.params = { id: "1" }; 

            await ongController.getById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith(mockOng);
        });

        test("Deve retornar 404 se a ONG não for encontrada", async () => {
            OngBusinessMock.prototype.getOngById.mockResolvedValue(undefined);
            mockRequest.params = { id: "999" };

            await ongController.getById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "ONG nao encontrada" });
        });
    });

    describe("POST /ongs", () => {
        const createInput = {
            nome: "Nova ONG",
            email: "nova@ong.com",
            endereco: "Rua",
            usuario_id: 5,
            telefone: "999",
        };

        test("Deve retornar 201 Created e a ONG criada em caso de sucesso", async () => {
            OngBusinessMock.prototype.createOng.mockResolvedValue({ ...createInput, id_ong: 2 } as any);
            mockRequest.body = createInput;

            await ongController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, message: "ONG cadastrada com sucesso!" })
            );
        });

        test("Deve retornar 400 Bad Request se faltar campo obrigatorio (Controller Validation)", async () => {
            mockRequest.body = { ...createInput, nome: "" }; 

            await ongController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: "Erro de validação" })
            );
        });

        test("Deve retornar 409 Conflict se o email ja estiver registrado (Business Error)", async () => {
            const errorMessage = "Este email ja esta registrado para outra ONG.";
            OngBusinessMock.prototype.createOng.mockRejectedValue(new Error(errorMessage));
            mockRequest.body = createInput;

            await ongController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(409);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: errorMessage })
            );
        });
    });

    describe("PUT /ongs/:id", () => {
        const updateInput = {
            nome: "ONG Atualizada",
            email: "atualizada@ong.com",
            endereco: "Rua Nova",
            usuario_id: 10,
            telefone: "98765",
        };
        
        test("Deve retornar 200 OK e a ONG atualizada", async () => {
            OngBusinessMock.prototype.getOngById.mockResolvedValue(mockOng); 
            OngBusinessMock.prototype.updateOng.mockResolvedValue();
            
            mockRequest.params = { id: "1" };
            mockRequest.body = updateInput;
            mockRequest.user = { userId: 1, tipo: 'ADMIN' }; 

            await ongController.update(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            
            expect(OngBusinessMock.prototype.updateOng).toHaveBeenCalledWith(
                1, 
                updateInput, 
                1, 
                'ADMIN'
            );
        });

        test("Deve retornar 403 Forbidden se o usuário não tiver permissão (Business Error)", async () => {
            const errorMessage = "Você não tem permissão para atualizar esta ONG.";
            OngBusinessMock.prototype.updateOng.mockRejectedValue(new Error(errorMessage));

            mockRequest.params = { id: "1" };
            mockRequest.body = updateInput;
            mockRequest.user = { userId: 999, tipo: 'COMUM' }; 

            await ongController.update(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: errorMessage })
            );
        });
        
        test("Deve retornar 404 Not Found se a ONG nao existir (Business Error)", async () => {
            const errorMessage = "ONG nao encontrada.";
            OngBusinessMock.prototype.updateOng.mockRejectedValue(new Error(errorMessage));

            mockRequest.params = { id: "999" };
            mockRequest.body = updateInput;
            mockRequest.user = { userId: 1, tipo: 'ADMIN' };

            await ongController.update(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: errorMessage })
            );
        });
    });

    describe("DELETE /ongs/:id", () => {
        test("Deve retornar 204 No Content se a ONG for deletada com sucesso", async () => {
            OngBusinessMock.prototype.deleteOng.mockResolvedValue();
            mockRequest.params = { id: "5" };

            await ongController.delete(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalled(); 
        });

        test("Deve retornar 404 Not Found se a ONG nao existir", async () => {
            const errorMessage = "ONG nao encontrada.";
            OngBusinessMock.prototype.deleteOng.mockRejectedValue(new Error(errorMessage));
            mockRequest.params = { id: "999" };

            await ongController.delete(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: errorMessage })
            );
        });
    });
});