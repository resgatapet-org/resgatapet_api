import { PrioridadeController } from "../../src/controller/prioridadesController";
import { PrioridadeBusiness } from "../../src/business/prioridadesBusiness";
import { Prioridade } from "../../src/types/prioridades";

jest.mock("../../src/business/prioridadesBusiness");

const PrioridadeBusinessMock = PrioridadeBusiness as jest.MockedClass<typeof PrioridadeBusiness>;

const mockPrioridade: Prioridade = {
    id_prioridade: 1,
    nivel: "ALTA",
    descricao: "Risco de vida",
};

describe("PrioridadeController", () => {
    let prioridadeController: PrioridadeController;
    const mockRequest = {} as any;
    const mockResponse = {
        status: jest.fn().mockReturnThis(), 
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        prioridadeController = new PrioridadeController();
    });

    describe("POST /prioridades", () => {
        const createInput = {
            nivel: "MEDIA",
            descricao: "Precisa de vacinas",
        };

        test("Deve retornar 201 Created em caso de sucesso", async () => {
            PrioridadeBusinessMock.prototype.createPrioridade.mockResolvedValue({ id_prioridade: 2 } as any);
            mockRequest.body = createInput;

            await prioridadeController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });

        test("Deve retornar 400 Bad Request se faltar nivel", async () => {
            mockRequest.body = { ...createInput, nivel: undefined }; 

            await prioridadeController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ errors: ["O nivel da prioridade e obrigatorio."] })
            );
        });
    });

    describe("DELETE /prioridades/:id", () => {
        test("Deve retornar 204 No Content ao deletar com sucesso", async () => {
            PrioridadeBusinessMock.prototype.deletePrioridade.mockResolvedValue();
            mockRequest.params = { id: "1" };

            await prioridadeController.delete(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(204);
        });
        
        test("Deve retornar 404 Not Found se a prioridade nao existir", async () => {
            const errorMessage = "Prioridade nao encontrada.";
            PrioridadeBusinessMock.prototype.deletePrioridade.mockRejectedValue(new Error(errorMessage));
            mockRequest.params = { id: "999" };

            await prioridadeController.delete(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
        });
    });
});