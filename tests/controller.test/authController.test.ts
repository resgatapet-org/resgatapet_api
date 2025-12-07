import { AuthController } from "../../src/controller/authController";
import { AuthBusiness } from "../../src/business/authBusiness";

jest.mock("../../src/business/authBusiness");

const AuthBusinessMock = AuthBusiness as jest.MockedClass<typeof AuthBusiness>;

describe("AuthController", () => {
    let authController: AuthController;
    
    const mockRequest = {} as any;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        authController = new AuthController();
    });

    describe("POST /auth/login", () => {
        const input = { email: "teste@email.com", senha: "123" };
        
        test("Deve retornar 200 e o token em caso de sucesso no login", async () => {
            
            AuthBusinessMock.prototype.login = jest.fn().mockResolvedValue({
                token: "FAKE_TOKEN_JWT",
                user: { id: 1, nome: "Teste", email: input.email, tipo: "COMUM" },
            });

            mockRequest.body = input;

            await authController.login(mockRequest, mockResponse);

            expect(AuthBusinessMock.prototype.login).toHaveBeenCalledWith(input);
            
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            
            expect(mockResponse.send).toHaveBeenCalledWith({
                token: "FAKE_TOKEN_JWT",
                user: { id: 1, nome: "Teste", email: input.email, tipo: "COMUM" },
            });
        });

        test("Deve retornar 400 em caso de falha de credenciais", async () => {
            const errorMessage = "Credenciais inválidas";

            // esta Configurando o mock do Business para lançar o erro de negócio
            AuthBusinessMock.prototype.login = jest.fn().mockRejectedValue(new Error(errorMessage));

            mockRequest.body = input;

            await authController.login(mockRequest, mockResponse);

            expect(AuthBusinessMock.prototype.login).toHaveBeenCalled();
     
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            
            expect(mockResponse.send).toHaveBeenCalledWith({ error: errorMessage });
        });
    });
});