import { AnimalController } from "../../src/controller/animalController";
import { AnimalBusiness } from "../../src/business/animalBusiness";

jest.mock("../../src/business/animalBusiness");

const AnimalBusinessMock = AnimalBusiness as jest.MockedClass<typeof AnimalBusiness>;

describe("AnimalController", () => {
    let animalController: AnimalController;
    const mockRequest = {} as any;
    const mockResponse = {
        status: jest.fn().mockReturnThis(), 
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        animalController = new AnimalController();
    });

    describe("GET /animais/:id", () => {
        test("Deve retornar 404 se o animal nao for encontrado", async () => {
            AnimalBusinessMock.prototype.getAnimalById.mockResolvedValue(undefined);
            mockRequest.params = { id: "999" };

            await animalController.getById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
        });
    });

    describe("POST /animais", () => {
        const createInput = {
            nome: "Animal Teste", especie: "Cao", status: "disponivel", ong_id: 1, descricao: "Docil"
        };

        test("Deve retornar 201 Created em caso de sucesso", async () => {
            AnimalBusinessMock.prototype.createAnimal.mockResolvedValue({ id_animal: 2 } as any);
            mockRequest.body = createInput;

            await animalController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });

        test("Deve retornar 400 Bad Request se faltar campo obrigatorio", async () => {
            mockRequest.body = { nome: "Nome", especie: "Cao", status: "disponivel" }; 

            await animalController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: "Erro de validação" })
            );
        });
    });

    describe("POST /animais/:id/prioridade", () => {
        test("Deve retornar 200 ao definir prioridade com sucesso", async () => {
            AnimalBusinessMock.prototype.setPrioridade.mockResolvedValue();
            mockRequest.params = { id: "1" };
            mockRequest.body = { nivel: "Alta", descricao: "Urgente" };

            await animalController.setPrioridade(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(AnimalBusinessMock.prototype.setPrioridade).toHaveBeenCalled();
        });

        test("Deve retornar 404 se o animal nao for encontrado", async () => {
            const errorMessage = "Animal não encontrado.";
            AnimalBusinessMock.prototype.setPrioridade.mockRejectedValue(new Error(errorMessage));
            mockRequest.params = { id: "999" };
            mockRequest.body = { nivel: "Alta", descricao: "Urgente" };

            await animalController.setPrioridade(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
        });
    });
});