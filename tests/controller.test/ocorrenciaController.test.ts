import { OcorrenciaController } from "../../src/controller/ocorrenciaController";
import { OcorrenciaBusiness } from "../../src/business/ocorrenciaBusiness";
import { Ocorrencia } from "../../src/types/ocorrencia";

jest.mock("../../src/business/ocorrenciaBusiness");

const OcorrenciaBusinessMock = OcorrenciaBusiness as jest.MockedClass<typeof OcorrenciaBusiness>;

const mockOcorrencia: Ocorrencia = {
    id_ocorrencia: 1,
    descricao: "Filhote abandonado",
    localizacao: "Praça",
    foto_url: "foto.jpg",
    status: "encontrado",
    usuario_id: 5,
    data_registro: new Date(),
};

describe("OcorrenciaController", () => {
    let ocorrenciaController: OcorrenciaController;
    const mockRequest = {} as any;
    const mockResponse = {
        status: jest.fn().mockReturnThis(), 
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        ocorrenciaController = new OcorrenciaController();
    });

    describe("POST /ocorrencias", () => {
        const createInput = {
            descricao: "Gato na rua",
            localizacao: "Rua X",
            foto_url: "url.jpg",
        };

        test("Deve retornar 201 Created para ocorrencia anonima", async () => {
            OcorrenciaBusinessMock.prototype.createOcorrencia.mockResolvedValue();
            mockRequest.body = createInput;

            await ocorrenciaController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: "Ocorrência registrada com sucesso! A comunidade e ONGs serão notificadas." })
            );
        });

        test("Deve retornar 400 Bad Request se faltar campo obrigatorio", async () => {
            mockRequest.body = { localizacao: "Rua X", foto_url: "url.jpg" }; 

            await ocorrenciaController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(OcorrenciaBusinessMock.prototype.createOcorrencia).not.toHaveBeenCalled();
        });
    });

    describe("PUT /ocorrencias/:id/status", () => {
        const updateInput = { status: "em andamento" };
        
        test("Deve retornar 200 OK ao atualizar status com sucesso", async () => {
            OcorrenciaBusinessMock.prototype.updateOcorrenciaStatus.mockResolvedValue();
            mockRequest.params = { id: "1" };
            mockRequest.body = updateInput;
            mockRequest.user = { userId: 1, tipo: 'ADMIN' }; 

            await ocorrenciaController.updateStatus(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });

        test("Deve retornar 400 Bad Request se o status for invalido (Business Error)", async () => {
            const errorMessage = "Status de ocorrência inválido.";
            OcorrenciaBusinessMock.prototype.updateOcorrenciaStatus.mockRejectedValue(new Error(errorMessage));
            mockRequest.params = { id: "1" };
            mockRequest.body = { status: "status_invalido" };
            mockRequest.user = { userId: 1, tipo: 'ADMIN' }; 

            await ocorrenciaController.updateStatus(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: errorMessage })
            );
        });
    });

    describe("DELETE /ocorrencias/:id", () => {
        test("Deve retornar 404 Not Found se a ocorrencia nao existir", async () => {
            const errorMessage = "Ocorrência não encontrada.";
            OcorrenciaBusinessMock.prototype.deleteOcorrencia.mockRejectedValue(new Error(errorMessage));
            mockRequest.params = { id: "999" };

            await ocorrenciaController.delete(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
        });
    });
});