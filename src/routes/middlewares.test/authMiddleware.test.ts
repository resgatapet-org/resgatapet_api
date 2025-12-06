import { AuthMiddleware } from "../../../src/middlewares/authMiddleware";
import { AuthUtils } from "../../../src/utils/authUtils";

jest.mock("../../src/utils/authUtils");

const AuthUtilsMock = AuthUtils as jest.MockedClass<typeof AuthUtils>;

describe("AuthMiddleware", () => {
    

    const mockRequest = {} as any;
    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
    } as any;
    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("authenticate", () => {
        
        test("Deve chamar next() e popular req.user com token valido", () => {
            const mockPayload = { userId: 1, email: "gus@ta.com", tipo: "ADMIN" };

            mockRequest.headers = { authorization: "Bearer FAKE_TOKEN" };

            AuthUtils.verifyToken = jest.fn().mockReturnValue(mockPayload);
            
            AuthMiddleware.authenticate(mockRequest, mockResponse, mockNext);

            expect(mockNext).toHaveBeenCalled();
            
            expect(mockRequest.user).toEqual(mockPayload);
            
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        test("Deve retornar 401 se o token nao for fornecido", () => {
            mockRequest.headers = {};

            AuthMiddleware.authenticate(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Token nao fornecido' });
            
            expect(mockNext).not.toHaveBeenCalled();
        });
        
        test("Deve retornar 401 se o token for invalido ou expirado", () => {
            mockRequest.headers = { authorization: "Bearer INVALID_TOKEN" };
            
            AuthUtils.verifyToken = jest.fn().mockImplementation(() => {
                throw new Error("Token invalido ou expirado");
            });

            AuthMiddleware.authenticate(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalledWith({ error: 'Token invalido ou expirado' });
            
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});