import { AdocaoController } from "../../src/controller/adocaoController";
import { AdocaoBusiness } from "../../src/business/adocaoBusiness";

jest.mock("../../src/business/adocaoBusiness");

const AdocaoBusinessMock = AdocaoBusiness as jest.MockedClass<typeof AdocaoBusiness>;

describe("AdocaoController", () => {
    let adocaoController: AdocaoController;
    const mockRequest = {} as any;
    const mockResponse = {
        status: jest.fn().mockReturnThis(), 
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        adocaoController = new AdocaoController();
    });

    describe("POST /adocoes", () => {
        const createInput = {
            animal_id: 1,
            usuario_id: 5,
            status: "em analise",
        };

        test("Deve retornar 201 Created em caso de sucesso", async () => {
            AdocaoBusinessMock.prototype.createAdocao.mockResolvedValue();
            mockRequest.body = createInput;

            await adocaoController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: "Solicitacao de adocao registrada com sucesso!" })
            );
        });

        test("Deve retornar 400 Bad Request se faltar ID do animal (Controller Validation)", async () => {
            mockRequest.body = { ...createInput, animal_id: undefined }; 

            await adocaoController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(AdocaoBusinessMock.prototype.createAdocao).not.toHaveBeenCalled();
        });

        test("Deve retornar 400 Bad Request se o animal/usuario nao existir (Business Error)", async () => {
            const errorMessage = "Animal com ID 1 nao encontrado.";
            AdocaoBusinessMock.prototype.createAdocao.mockRejectedValue(new Error(errorMessage));
            mockRequest.body = createInput;

            await adocaoController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: "Erro de regra de negócio" })
            );
        });
    });

    describe("PUT /adocoes/:id/status", () => {
        test("Deve retornar 200 OK ao atualizar status com sucesso", async () => {
            AdocaoBusinessMock.prototype.updateAdocaoStatus.mockResolvedValue();
            mockRequest.params = { id: "1" };
            mockRequest.body = { status: "aprovado" };

            await adocaoController.updateStatus(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });

        test("Deve retornar 400 Bad Request se o status for invalido (Business Erro)", async () => {
            const errorMessage = "Status de adocao invalido.";
            AdocaoBusinessMock.prototype.updateAdocaoStatus.mockRejectedValue(new Error(errorMessage));
            mockRequest.params = { id: "1" };
            mockRequest.body = { status: "invalido" };

            await adocaoController.updateStatus(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: errorMessage })
            );
        });
    });
});