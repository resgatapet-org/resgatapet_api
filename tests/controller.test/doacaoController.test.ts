import { DoacaoController } from "../../src/controller/doacaoController";
import { DoacaoBusiness } from "../../src/business/doacaoBusiness";

jest.mock("../../src/business/doacaoBusiness");

const DoacaoBusinessMock = DoacaoBusiness as jest.MockedClass<typeof DoacaoBusiness>;

describe("DoacaoController", () => {
    let doacaoController: DoacaoController;
    const mockRequest = {} as any;
    const mockResponse = {
        status: jest.fn().mockReturnThis(), 
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        doacaoController = new DoacaoController();
    });

    describe("POST /doacoes", () => {
        const createInput = {
            tipo: "PIX",
            ong_id: 1,
            valor: 50.00,
            descricao: "Doacao financeira",
        };

        test("Deve retornar 201 Created em caso de sucesso (com ong_id no body)", async () => {
            DoacaoBusinessMock.prototype.createDoacao.mockResolvedValue({ id_doacao: 10 } as any);
            mockRequest.body = createInput;

            await doacaoController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(DoacaoBusinessMock.prototype.createDoacao).toHaveBeenCalled();
        });

        test("Deve retornar 400 Bad Request se faltar ong_id", async () => {
            mockRequest.body = { ...createInput, ong_id: undefined }; 

            await doacaoController.create(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({ errors: ["O ID da ONG (ong_id) e obrigatorio e deve ser um número."] })
            );
        });
    });
});